// pages/api/uploadfile.js
import formidable from 'formidable';
import { importCsv } from '../../scripts/importCsv';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  // Create a new formidable form parser
  const form = formidable({ multiples: false });

  try {
    // Parse the incoming form data
    const [fields, files] = await form.parse(req);
    const file = files.file?.[0]; // Get the uploaded file

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Check if the file is a CSV
    if (file.mimetype !== 'text/csv' && !file.originalFilename.endsWith('.csv')) {
      return res.status(400).json({ error: 'Only CSV files are allowed' });
    }

    // Read the file buffer
    const buffer = require('fs').readFileSync(file.filepath);
    const result = await importCsv(buffer);

    return res.status(200).json({
      message: `Successfully imported ${result.insertedCount} records`,
      failedCount: result.failedCount,
    });
  } catch (error) {
    console.error('Error in uploadfile API:', error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Disable Next.js body parsing (required for formidable)
export const config = {
  api: {
    bodyParser: false,
  },
};