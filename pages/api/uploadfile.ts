// pages/api/uploadfile.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { importCsv } from '../../scripts/importCsv';
import formidable, { IncomingForm } from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false, // Disable body parsing to handle multipart form data
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new IncomingForm();
    const [fields, files] = await form.parse(req);

    const file = files.file?.[0]; // Get the first file from the 'file' field
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (file.mimetype !== 'text/csv' && !file.originalFilename?.endsWith('.csv')) {
      return res.status(400).json({ error: 'Only CSV files are allowed' });
    }

    // Read the file into a Buffer
    const buffer = fs.readFileSync(file.filepath);

    // Process the CSV file
    const result = await importCsv(buffer) as { insertedCount: number; failedCount: number };

    return res.status(200).json({
      message: `Successfully imported ${result.insertedCount} records`,
      failedCount: result.failedCount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to process CSV file' });
  }
}