// src/app/api/uploadfile/route.js
import { NextResponse } from 'next/server';
import { importCsv } from '../../../../scripts/importCsv';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (file.type !== 'text/csv') {
      return NextResponse.json({ error: 'Only CSV files are allowed' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await importCsv(buffer);

    return NextResponse.json({
      message: `Successfully imported ${result.insertedCount} records`,
      failedCount: result.failedCount,
    });
  } catch (error) {
    console.error('Error in uploadfile API:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}