import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import Business from '@/models/Business';

type ResponseData = {
  success: boolean;
  data?: any;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  await dbConnect();

  try {
    if (req.method === 'POST') {
      const businessData = req.body;
      const business = await Business.create(businessData);
      return res.status(201).json({ success: true, data: business });
    }

    if (req.method === 'GET') {
      const businesses = await Business.find();
      return res.status(200).json({ success: true, data: businesses });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in API handler:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
}