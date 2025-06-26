import fs from 'fs';
import { parse } from 'csv-parse';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';
import dbConnect from '@/lib/dbConnect';
import DistrictBusiness from '../models/DistrictBusiness';

// Debugging: Log paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbConnectPath = path.resolve(__dirname, '../src/lib/dbConnect.js');
const districtBusinessPath = path.resolve(__dirname, '../models/DistrictBusiness.js');
const envPath = path.resolve(__dirname, '../.env.local');

console.log('Script directory:', __dirname);
console.log('dbConnect.js exists:', fs.existsSync(dbConnectPath));
console.log('DistrictBusiness.js exists:', fs.existsSync(districtBusinessPath));
console.log('.env.local exists:', fs.existsSync(envPath));

// Load environment variables
if (fs.existsSync(envPath)) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf8').trim();
    console.log('Raw .env.local content:', envContent);
    const dotenvResult = dotenv.config({ path: envPath });
    if (dotenvResult.error) throw dotenvResult.error;
    console.log('Parsed .env.local:', dotenvResult.parsed);
  } catch (error) {
    console.error('Error reading .env.local:', error instanceof Error ? error.message : error);
  }
} else {
  console.log('No .env.local file found, relying on process.env');
}

// Verify MONGODB_URI
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI not set');
  throw new Error('MONGODB_URI is required');
}
console.log('MONGODB_URI present:', !!process.env.MONGODB_URI);

// Types
interface MultilingualString {
  en: string;
  ta: string;
  hi: string;
  ka: string;
}

interface MultilingualTags {
  en: string[];
  ta: string[];
  hi: string[];
  ka: string[];
}

interface BusinessRecord {
  name: MultilingualString;
  address: MultilingualString;
  phone: string;
  tags: MultilingualTags;
  hasWhatsApp: boolean;
  hasEnquiry: boolean;
  isTrusted: boolean;
  isVerified: boolean;
  isPopular: boolean;
  category: MultilingualString;
  subcategory: MultilingualString;
  pincode: string;
  city: MultilingualString;
  rating: number;
  totalRatings: number;
}

interface FailedRecord {
  record: Record<string, unknown>;
  reason: string;
}

// Helpers
const parseBoolean = (value: unknown): boolean => {
  if (typeof value === 'string') {
    value = value.toLowerCase().trim();
    return value === 'true' || value === '1' || value === 'yes';
  }
  return !!value;
};

const parseNumber = (value: unknown, defaultValue: number, min: number, max?: number): number => {
  try {
    const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : Number(value);
    if (isNaN(num)) return defaultValue;
    if (num < min) return min;
    if (max !== undefined && num > max) return max;
    return num;
  } catch (error) {
    console.error(`Error parsing number:`, value, error instanceof Error ? error.message : error);
    return defaultValue;
  }
};

const parseTags = (tags: unknown): string[] => {
  try {
    if (!tags || typeof tags !== 'string') return [];
    if (tags.startsWith('[')) {
      return (JSON.parse(tags) as string[]).map((tag) => tag.trim()).filter((tag) => tag.length > 0);
    }
    return tags.split(/[;,]/).map((tag) => tag.trim()).filter((tag) => tag.length > 0);
  } catch (error) {
    console.error('Error parsing tags:', tags, error instanceof Error ? error.message : error);
    return [];
  }
};

const parseField = (field: unknown, fieldName: string): MultilingualString => {
  try {
    if (typeof field === 'string' && field.trim() !== '') {
      if (field.startsWith('{')) {
        const parsed = JSON.parse(field);
        return {
          en: parsed.en || '',
          ta: parsed.ta || '',
          hi: parsed.hi || '',
          ka: parsed.ka || '',
        };
      }
      return { en: field.trim(), ta: '', hi: '', ka: '' };
    }
    return { en: '', ta: '', hi: '', ka: '' };
  } catch (error) {
    console.error(`Error parsing ${fieldName}:`, field, error instanceof Error ? error.message : error);
    return { en: typeof field === 'string' ? field : '', ta: '', hi: '', ka: '' };
  }
};

const parseTagsField = (tags: unknown): MultilingualTags => {
  try {
    if (typeof tags === 'string' && tags.trim() !== '') {
      if (tags.startsWith('{')) {
        const parsed = JSON.parse(tags);
        return {
          en: parsed.en || [],
          ta: parsed.ta || [],
          hi: parsed.hi || [],
          ka: parsed.ka || [],
        };
      }
      const enTags = parseTags(tags);
      return { en: enTags, ta: [], hi: [], ka: [] };
    }
    return { en: [], ta: [], hi: [], ka: [] };
  } catch (error) {
    console.error('Error parsing tags:', tags, error instanceof Error ? error.message : error);
    return { en: parseTags(tags), ta: [], hi: [], ka: [] };
  }
};

// Main import function
export const importCsv = async (
  input: string | Buffer | Iterable<Buffer> | AsyncIterable<Buffer>
): Promise<{ insertedCount: number; failedCount: number; failedRecords: FailedRecord[] }> => {
  try {
    await dbConnect();
    console.log('Connected to MongoDB Atlas');

    const records: BusinessRecord[] = [];
    const failedRecords: FailedRecord[] = [];

    const stream = typeof input === 'string' ? fs.createReadStream(input) : Readable.from(input);

    return new Promise((resolve, reject) => {
      stream
        .pipe(parse({ columns: true, skip_empty_lines: true, trim: true }))
        .on('data', (record: Record<string, string>) => {
          try {
            const nameObj = parseField(record.name, 'name');
            const addressObj = parseField(record.address, 'address');
            const tagsObj = parseTagsField(record.tags);
            const categoryObj = parseField(record.category, 'category');
            const subcategoryObj = parseField(record.subcategory, 'subcategory');

            // Extract city from address (part after the last comma)
            let cityEn = '';
            if (addressObj.en) {
              const addressParts = addressObj.en.split(',').map(part => part.trim());
              cityEn = addressParts[addressParts.length - 1] || '';
            }
            const cityObj: MultilingualString = { en: cityEn, ta: '', hi: '', ka: '' };

            if (!record.phone || record.phone.trim() === '') {
              failedRecords.push({ record, reason: 'Empty or missing phone number' });
              return;
            }

            if (!nameObj.en || !addressObj.en || !categoryObj.en || !cityObj.en) {
              failedRecords.push({ record, reason: 'Missing required English fields' });
              return;
            }

            const rating = parseNumber(record.rating, 0, 0, 5);
            const totalRatings = parseNumber(record.totalRatings, 0, 0);

            const business: BusinessRecord = {
              name: nameObj,
              address: addressObj,
              phone: record.phone,
              tags: tagsObj,
              hasWhatsApp: parseBoolean(record.hasWhatsApp),
              hasEnquiry: parseBoolean(record.hasEnquiry),
              isTrusted: parseBoolean(record.isTrusted),
              isVerified: parseBoolean(record.isVerified),
              isPopular: parseBoolean(record.isPopular),
              category: categoryObj,
              subcategory: subcategoryObj,
              pincode: record.pincode || '573201',
              city: cityObj,
              rating,
              totalRatings,
            };

            records.push(business);
          } catch (error) {
            failedRecords.push({
              record,
              reason: error instanceof Error ? error.message : String(error),
            });
          }
        })
        .on('end', async () => {
          try {
            let insertedCount = 0;
            if (records.length > 0) {
              const inserted = await DistrictBusiness.insertMany(records, { ordered: false });
              insertedCount = inserted.length;
            }
            resolve({ insertedCount, failedCount: failedRecords.length, failedRecords });
          } catch (error) {
            console.error('Error inserting records:', error);
            reject(error);
          }
        })
        .on('error', (error: unknown) => {
          console.error('CSV parsing error:', error instanceof Error ? error.message : error);
          reject(error);
        });
    });
  } catch (error) {
    console.error('Error in importCsv:', error instanceof Error ? error.message : error);
    throw error;
  }
};

// Run import only if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const csvFilePath = path.resolve(__dirname, '../src/data/test.csv');
  importCsv(csvFilePath)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}