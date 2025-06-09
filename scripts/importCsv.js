// importCsv.js
import fs from 'fs';
import { parse } from 'csv-parse';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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
try {
  // Read raw .env.local content
  const envContent = fs.readFileSync(envPath, 'utf8').trim();
  console.log('Raw .env.local content:', envContent);

  // Load .env.local with dotenv
  const dotenvResult = dotenv.config({ path: envPath });
  if (dotenvResult.error) {
    console.error('Error parsing .env.local with dotenv:', dotenvResult.error.message);
    process.exit(1);
  }
  console.log('Parsed .env.local:', dotenvResult.parsed);

  // Verify MONGODB_URI
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI not found in process.env');
    // Fallback: Manually parse .env.local
    const lines = envContent.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));
    for (const line of lines) {
      const [key, value] = line.split('=').map(part => part.trim());
      if (key === 'MONGODB_URI' && value) {
        process.env.MONGODB_URI = value;
        console.log('Manually set MONGODB_URI from .env.local');
        break;
      }
    }
  }

  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI still not set after manual parse');
    process.exit(1);
  }
  console.log('MONGODB_URI present:', !!process.env.MONGODB_URI);
} catch (error) {
  console.error('Error reading .env.local:', error.message);
  process.exit(1);
}

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

// Function to extract city from address (after last comma)
const extractCityFromAddress = (address) => {
  if (!address || typeof address !== 'string' || address.trim() === '') {
    return '';
  }
  const parts = address.split(',').map(part => part.trim());
  return parts.length > 0 ? parts[parts.length - 1] : '';
};

// Function to import CSV
const importCsv = async (filePath) => {
  try {
    // Connect to MongoDB
    await dbConnect();
    console.log('Connected to MongoDB Atlas');

    const records = [];
    const failedRecords = [];

    // Verify CSV file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`CSV file not found at: ${filePath}`);
    }

    // Parse CSV
    fs.createReadStream(filePath)
      .pipe(
        parse({
          columns: true,
          skip_empty_lines: true,
          trim: true,
        })
      )
      .on('data', (record) => {
        // Skip records with empty phone numbers
        if (!record.phone || record.phone.trim() === '') {
          failedRecords.push({
            record,
            reason: 'Empty or missing phone number',
          });
          return;
        }

        // Transform record
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
          subcategory: 'event management, photography',
          pincode: '573201',
          city: extractCityFromAddress(record.address),
        };

        records.push(business);
      })
      .on('end', async () => {
        try {
          // Insert records
          const inserted = await DistrictBusiness.insertMany(records, { ordered: false });
          console.log(`Successfully imported ${inserted.length} records`);

          // Log failed records
          if (failedRecords.length > 0) {
            console.log(`Failed to import ${failedRecords.length} records`);
            const failedPath = path.resolve(__dirname, '../src/data/failed_records.json');
            fs.writeFileSync(failedPath, JSON.stringify(failedRecords, null, 2));
            console.log(`Failed records saved to ${failedPath}`);
          }

          process.exit(0);
        } catch (error) {
          console.error('Error importing records:', error.message);
          process.exit(1);
        }
      })
      .on('error', (error) => {
        console.error('Error parsing CSV:', error.message);
        process.exit(1);
      });
  } catch (error) {
    console.error('Error in importCsv:', error.message);
    process.exit(1);
  }
};

// Run import
importCsv(csvFilePath);