// pages/api/getListings.js
import dbConnect from '@/lib/dbConnect';
import BusinessListing from '../../models/BusinessListing';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Connect to MongoDB
    await dbConnect();

    // Fetch all listings from the businesslisting collection
    const listings = await BusinessListing.find({}).lean();
    console.log(`Fetched ${listings.length} listings from businesslisting collection`);

    return res.status(200).json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    console.error('Error fetching listings:', error.message);
    return res.status(500).json({
      error: 'Failed to fetch listings',
      message: error.message,
    });
  }
}