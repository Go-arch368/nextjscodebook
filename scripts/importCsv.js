// scripts/importCsv.js
import fs from 'fs';
import { parse } from 'csv-parse';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';
import dbConnect from '../src/lib/dbConnect.ts';
import DistrictBusiness from '../models/DistrictBusiness.ts';

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
    if (dotenvResult.error) {
      console.error('Error parsing .env.local:', dotenvResult.error.message);
      throw dotenvResult.error;
    }
    console.log('Parsed .env.local:', dotenvResult.parsed);
  } catch (error) {
    console.error('Error reading .env.local:', error.message);
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

// Import modules


// Function to parse boolean values
const parseBoolean = (value) => {
  if (typeof value === 'string') {
    value = value.toLowerCase().trim();
    return value === 'true' || value === '1' || value === 'yes';
  }
  return !!value;
};

// Function to parse tags
const parseTags = (tags) => {
  try {
    if (!tags || typeof tags !== 'string') return [];
    if (tags.startsWith('[')) {
      return JSON.parse(tags).map((tag) => tag.trim()).filter((tag) => tag.length > 0);
    }
    return tags.split(/[;,]/).map((tag) => tag.trim()).filter((tag) => tag.length > 0);
  } catch (error) {
    console.error('Error parsing tags:', tags, error.message);
    return [];
  }
};

// Function to parse field values
const parseField = (field, fieldName) => {
  try {
    if (typeof field === 'string' && field.trim() !== '') {
      if (field.startsWith('{')) {
        const parsed = JSON.parse(field);
        console.log(`Parsed JSON ${fieldName}:`, parsed);
        return {
          en: parsed.en || '',
          ta: parsed.ta || '',
          hi: parsed.hi || '',
          ka: parsed.ka || '',
        };
      }
      console.log(`Treating ${fieldName} as plain string:`, field);
      return { en: field.trim(), ta: '', hi: '', ka: '' };
    }
    console.warn(`Empty or invalid ${fieldName}:`, field);
    return { en: '', ta: '', hi: '', ka: '' };
  } catch (error) {
    console.error(`Error parsing ${fieldName}:`, field, error.message);
    return { en: field || '', ta: '', hi: '', ka: '' };
  }
};

// Function to parse tags field
const parseTagsField = (tags) => {
  try {
    if (typeof tags === 'string' && tags.trim() !== '') {
      if (tags.startsWith('{')) {
        const parsed = JSON.parse(tags);
        console.log('Parsed JSON tags:', parsed);
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
    console.error('Error parsing tags:', tags, error.message);
    return { en: parseTags(tags), ta: [], hi: [], ka: [] };
  }
};

// Function to ensure directory exists
const ensureDirectoryExists = (dirPath) => {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created directory: ${dirPath}`);
    }
  } catch (error) {
    console.error(`Error creating directory ${dirPath}:`, error.message);
    throw error;
  }
};

// Function to import CSV
export const importCsv = async (input) => {
  try {
    await dbConnect();
    console.log('Connected to MongoDB Atlas');

    const records = [];
    const failedRecords = [];

    // Determine if input is a file path or buffer
    const stream = typeof input === 'string' ? fs.createReadStream(input) : Readable.from(input);

    return new Promise((resolve, reject) => {
      stream
        .pipe(
          parse({
            columns: true,
            skip_empty_lines: true,
            trim: true,
          })
        )
        .on('data', (record) => {
          console.log('Raw CSV record:', record);
          try {
            // Parse fields
            const nameObj = parseField(record.name, 'name');
            const addressObj = parseField(record.address, 'address');
            const tagsObj = parseTagsField(record.tags);
            const categoryObj = parseField(record.category, 'category');
            const cityObj = parseField(record.city, 'city');

            // Validate required fields
            if (!record.phone || record.phone.trim() === '') {
              failedRecords.push({
                record,
                reason: 'Empty or missing phone number',
              });
              console.log('Record rejected: Missing phone number');
              return;
            }

            if (!nameObj.en || !addressObj.en || !categoryObj.en || !cityObj.en) {
              failedRecords.push({
                record,
                reason: 'Missing required English fields',
              });
              console.log('Record rejected: Missing English fields', {
                name: nameObj.en,
                address: addressObj.en,
                category: categoryObj.en,
                city: cityObj.en,
              });
              return;
            }

            // Parse totalRatings
            const totalRatings = parseInt(record.totalRatings.replace(/[^0-9]/g, '')) || 0;

            const business = {
              name: { en: nameObj.en, ta: '', hi: '', ka: '' },
              rating: parseFloat(record.rating) || 0,
              totalRatings,
              address: { en: addressObj.en, ta: '', hi: '', ka: '' },
              phone: record.phone.trim(),
              tags: { en: tagsObj.en, ta: [], hi: [], ka: [] },
              hasWhatsApp: parseBoolean(record.hasWhatsApp),
              hasEnquiry: parseBoolean(record.hasEnquiry),
              isTrusted: parseBoolean(record.isTrusted),
              isVerified: parseBoolean(record.isVerified),
              isPopular: parseBoolean(record.isPopular),
              category: { en: categoryObj.en, ta: '', hi: '', ka: '' },
              subcategory: { en: categoryObj.en, ta: '', hi: '', ka: '' }, // Use category as subcategory
              pincode: record.pincode || '573201',
              city: { en: cityObj.en, ta: '', hi: '', ka: '' },
            };

            console.log('Processed business record:', JSON.stringify(business, null, 2));
            records.push(business);
          } catch (error) {
            console.error('Error processing record:', record, error.message);
            failedRecords.push({
              record,
              reason: `Error processing record: ${error.message}`,
            });
          }
        })
        .on('end', async () => {
          console.log(`Total records processed: ${records.length}`);
          console.log(`Total failed records: ${failedRecords.length}`);
          try {
            let insertedCount = 0;
            if (records.length > 0) {
              const inserted = await DistrictBusiness.insertMany(records, { ordered: false });
              insertedCount = inserted.length;
              console.log(`Successfully inserted ${insertedCount} records`);
            } else {
              console.log('No valid records to insert');
            }

            if (failedRecords.length > 0) {
              console.log('Failed records:', JSON.stringify(failedRecords, null, 2));
              const outputDir = process.env.VERCEL ? '/tmp' : path.resolve(__dirname, '../src/data');
              if (!process.env.VERCEL) {
                ensureDirectoryExists(outputDir);
              }
              const failedPath = path.join(outputDir, 'failed_records.json');
              try {
                fs.writeFileSync(failedPath, JSON.stringify(failedRecords, null, 2));
                console.log(`Failed records saved to ${failedPath}`);
              } catch (writeError) {
                console.error(`Error writing failed records to ${failedPath}:`, writeError.message);
              }
            }

            resolve({
              insertedCount,
              failedCount: failedRecords.length,
              failedRecords,
            });
          } catch (error) {
            console.error('Error inserting records:', error.message);
            reject(error);
          }
        })
        .on('error', (error) => {
          console.error('Error parsing CSV:', error.message);
          reject(error);
        });
    });
  } catch (error) {
    console.error('Error in importCsv:', error.message);
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