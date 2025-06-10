// scripts/importCsv.js
import fs from 'fs';
import { parse } from 'csv-parse';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Readable } from 'stream';

// Debugging: Log paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbConnectPath = path.resolve(__dirname, '../src/lib/dbConnect.js');
const districtBusinessPath = path.resolve(__dirname, '../models/DistrictBusiness.js');
const csvFilePath = path.resolve(__dirname, '../src/data/hassan_photographers_listings new.csv');
const envPath = path.resolve(__dirname, '../.env.local');

console.log('Script directory:', __dirname);
console.log('dbConnect.js exists:', fs.existsSync(dbConnectPath));
console.log('DistrictBusiness.js exists:', fs.existsSync(districtBusinessPath));
console.log('CSV exists:', fs.existsSync(csvFilePath));
console.log('.env.local exists:', fs.existsSync(envPath));

// Load environment variables
if (fs.existsSync(envPath)) {
  try {
    const envContent = fs.readFileSync(envPath, 'utf8').trim();
    console.log('Raw .env.local content:', envContent);

    const dotenvResult = dotenv.config({ path: envPath });
    if (dotenvResult.error) {
      console.error('Error parsing .env.local with dotenv:', dotenvResult.error.message);
      throw dotenvResult.error;
    }
    console.log('Parsed .env.local:', dotenvResult.parsed);
  } catch (error) {
    console.error('Error reading .env.local:', error.message);
    // Continue if .env.local fails, as Vercel may provide env vars
  }
} else {
  console.log('No .env.local file found, relying on process.env (e.g., Vercel environment variables)');
}

// Verify MONGODB_URI
if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI not set in process.env');
  throw new Error('MONGODB_URI is required to connect to MongoDB');
}
console.log('MONGODB_URI present:', !!process.env.MONGODB_URI);

// Import modules
import dbConnect from '../src/lib/dbConnect.js';
import DistrictBusiness from '../models/DistrictBusiness.js';

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
  if (!tags || typeof tags !== 'string') return [];
  return tags.split(',').map((tag) => tag.trim()).filter((tag) => tag.length > 0);
};

// Function to extract city from address
const extractCityFromAddress = (address) => {
  if (!address || typeof address !== 'string' || address.trim() === '') {
    return '';
  }
  const parts = address.split(',').map(part => part.trim());
  return parts.length > 0 ? parts[parts.length - 1] : '';
};

// Function to import CSV
export const importCsv = async (input) => {
  try {
    await dbConnect();
    console.log('Connected to MongoDB Atlas');

    const records = [];
    const failedRecords = [];

    // Determine if input is a file path or buffer
    const stream = typeof input === 'string'
      ? fs.createReadStream(input)
      : Readable.from(input);

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
          if (!record.phone || record.phone.trim() === '') {
            failedRecords.push({
              record,
              reason: 'Empty or missing phone number',
            });
            return;
          }

          const business = {
            name: record.name || '',
            rating: parseFloat(record.rating) || 0,
            totalRatings: parseInt(record.totalRatings) || 0,
            address: record.address || '',
            phone: record.phone || '',
            tags: parseTags(record.tags),
            hasWhatsApp: parseBoolean(record.hasWhatsApp),
            hasEnquiry: parseBoolean(record.hasEnquiry),
            isTrusted: parseBoolean(record.isTrusted),
            isVerified: parseBoolean(record.isVerified),
            isPopular: parseBoolean(record.isPopular),
            category: record.category || '',
            subcategory: record.category || '', // Set subcategory to category
            pincode: '573201',
            city: extractCityFromAddress(record.address),
          };

          records.push(business);
        })
        .on('end', async () => {
          try {
            const inserted = await DistrictBusiness.insertMany(records, { ordered: false });
            console.log(`Successfully imported ${inserted.length} records`);

            if (failedRecords.length > 0) {
              console.log(`Failed to import ${failedRecords.length} records`);
              const failedPath = path.resolve(__dirname, '../src/data/failed_records.json');
              fs.writeFileSync(failedPath, JSON.stringify(failedRecords, null, 2));
              console.log(`Failed records saved to ${failedPath}`);
            }

            resolve({
              insertedCount: inserted.length,
              failedCount: failedRecords.length,
              failedRecords,
            });
          } catch (error) {
            console.error('Error importing records:', error.message);
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

// Run import only if called directly (for backward compatibility)
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  importCsv(csvFilePath)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}