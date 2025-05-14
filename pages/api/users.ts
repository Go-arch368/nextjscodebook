import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';

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
      const { name, email, age } = req.body;
      const user = await User.create({ name, email, age });
      return res.status(201).json({ success: true, data: user });
    }

    if (req.method === 'GET') {
      const users = await User.find();
      return res.status(200).json({ success: true, data: users });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Server error' });
  }
}
