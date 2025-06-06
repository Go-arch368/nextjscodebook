// pages/api/search.js
import dbConnect from '@/lib/dbConnect';
import BusinessListing from '../../models/BusinessListing';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { q: query, pincode = '560062' } = req.query;

  if (!query) {
    return res.status(400).json({ success: false, error: 'Query parameter is required' });
  }

  try {
    await dbConnect();
    console.log('MongoDB connected for search');

    const dbQuery = {};
    let businesses = [];
    let categories = [];
    let tags = [];
    let cities = [];
    let names = [];

    // Use regex search for start-of-string matching
    dbQuery.$or = [
      { name: { $regex: `^${query}` } }, // Case-sensitive, starts with query
      { category: { $regex: `^${query}`, $options: 'i' } }, // Case-insensitive, starts with query
      { tags: { $regex: `^${query}`, $options: 'i' } }, // Case-insensitive, starts with query
      { city: { $regex: `^${query}`, $options: 'i' } }, // Case-insensitive, starts with query
    ];

    const results = await BusinessListing.find(dbQuery)
      .select('name category tags city pincode')
      .limit(20) // Increased limit for broader results
      .lean();

    console.log(`Regex search found ${results.length} results`);

    businesses = results.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name,
      category: doc.category,
      type: 'business',
      pincode: doc.pincode || pincode,
    }));

    categories = [...new Set(results.map((doc) => doc.category).filter(Boolean))].map((name) => ({
      id: name,
      name,
      type: 'category',
      pincode,
    }));
    tags = [...new Set(results.flatMap((doc) => doc.tags || []).filter(Boolean))].map((name) => ({
      id: name,
      name,
      type: 'tag',
      pincode,
    }));
    cities = [...new Set(results.map((doc) => doc.city).filter(Boolean))].map((name) => ({
      id: name,
      name,
      type: 'city',
      pincode,
    }));
    names = [...new Set(results.map((doc) => doc.name).filter(Boolean))].map((name) => ({
      id: name,
      name,
      type: 'name',
      pincode,
    }));

    return res.status(200).json({
      success: true,
      data: {
        businesses,
        categories,
        tags,
        cities,
        names,
      },
    });
  } catch (error) {
    console.error('Search error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to perform search',
      message: error.message,
    });
  }
}