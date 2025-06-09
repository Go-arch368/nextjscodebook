import dbConnect from '@/lib/dbConnect';
import DistrictBusiness from '../../models/DistrictBusiness';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { q: query, pincode } = req.query;

  // Require pincode for search
  if (!pincode) {
    return res.status(400).json({ success: false, error: 'Pincode parameter is required' });
  }

  try {
    await dbConnect();
    console.log('MongoDB connected for search');

    // Check if pincode exists in the database
    const pincodeExists = await DistrictBusiness.findOne({ pincode }).lean();
    if (!pincodeExists) {
      return res.status(404).json({ success: false, error: `Pincode ${pincode} not found in the database` });
    }

    const dbQuery = { pincode }; // Base query on pincode
    let businesses = [];
    let categories = [];
    let tags = [];
    let cities = [];
    let names = [];

    // Add query conditions if search term is provided
    if (query) {
      dbQuery.$or = [
        { name: { $regex: `^${query}` } }, // Case-sensitive, starts with query
        { category: { $regex: `^${query}`, $options: 'i' } }, // Case-insensitive
        { tags: { $regex: `^${query}`, $options: 'i' } }, // Case-insensitive
        { city: { $regex: `^${query}`, $options: 'i' } }, // Case-insensitive
      ];
    }

    const results = await DistrictBusiness.find(dbQuery)
      .select('name category tags city pincode')
      .limit(20)
      .lean();

    console.log(`Search found ${results.length} results for pincode ${pincode}`);

    businesses = results.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name,
      category: doc.category,
      type: 'business',
      pincode: doc.pincode,
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