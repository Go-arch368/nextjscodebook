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
    let addresses = [];

    // Try text search if index exists
    try {
      // Boost name field in text search for better relevance
      dbQuery.$text = { $search: `\"${query}\" name:${query}` };
      const results = await BusinessListing.find(dbQuery, { score: { $meta: "textScore" } })
        .select('name category tags city address pincode')
        .sort({ score: { $meta: "textScore" } })
        .limit(10)
        .lean();

      console.log(`Text search found ${results.length} results`);

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
      addresses = [...new Set(results.map((doc) => doc.address).filter(Boolean))].map((name) => ({
        id: name,
        name,
        type: 'address',
        pincode,
      }));
    } catch (textError) {
      console.error('Text search error, falling back to regex:', textError.message);
      // Fallback to regex search with partial matching for name
      dbQuery.$or = [
        { name: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } },
        { city: { $regex: query, $options: 'i' } },
        { address: { $regex: query, $options: 'i' } },
      ];

      const results = await BusinessListing.find(dbQuery)
        .select('name category tags city address pincode')
        .limit(10)
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
      addresses = [...new Set(results.map((doc) => doc.address).filter(Boolean))].map((name) => ({
        id: name,
        name,
        type: 'address',
        pincode,
      }));
    }

    return res.status(200).json({
      success: true,
      data: {
        businesses,
        categories,
        tags,
        cities,
        addresses,
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