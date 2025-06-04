// pages/api/getListings.js
import dbConnect from '@/lib/dbConnect';
import BusinessListing from '../../models/BusinessListing';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const {
      q,
      pincode,
      category,
      subcategory,
      tag,
      name,
      address,
      city,
      sort,
      sortByVerified,
      sortByTrusted,
      sortByRating,
    } = req.query;
    const query = {};

    // Unified search across multiple fields
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { subcategory: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
        { address: { $regex: q, $options: 'i' } },
        { city: { $regex: q, $options: 'i' } },
      ];
    }

    // Specific field filters
    if (category) query.category = { $regex: category, $options: 'i' };
    if (subcategory) query.subcategory = { $regex: subcategory, $options: 'i' };
    if (tag) query.tags = { $regex: tag, $options: 'i' };
    if (name) query.name = { $regex: `^${name}$`, $options: 'i' }; // Exact match for name
    if (address) query.address = { $regex: address, $options: 'i' };
    if (city) query.city = { $regex: city, $options: 'i' };
    if (pincode) query.pincode = { $regex: `^${pincode}`, $options: 'i' };
    if (sortByVerified === 'true') query.isVerified = true;
    if (sortByTrusted === 'true') query.isTrusted = true;
    if (sortByRating) query.rating = { $gte: parseFloat(sortByRating) };

    // Sorting
    let sortOptions = {};
    if (sort) {
      if (sort === 'totalRatings-desc') sortOptions.totalRatings = -1;
      if (sort === 'totalRatings-asc') sortOptions.totalRatings = 1;
      if (sort === 'rating') sortOptions.rating = -1;
    }

    // Fetch all matching listings
    const listings = await BusinessListing.find(query)
      .sort(sortOptions)
      .lean();

    if (!listings.length) {
      return res.status(200).json({
        success: false,
        message: `No listings found for query: q=${q || 'none'}, name=${name || 'none'}, pincode=${pincode || 'none'}`,
        data: [],
        categories: [],
        subcategories: [],
        tags: [],
        addresses: [],
        cities: [],
      });
    }

    // Extract unique fields
    const uniqueCategories = [...new Set(listings.map((listing) => listing.category).filter(Boolean))];
    const uniqueSubcategories = [...new Set(listings.map((listing) => listing.subcategory).filter(Boolean))];
    const uniqueTags = [...new Set(listings.flatMap((listing) => listing.tags || []).filter(Boolean))];
    const uniqueAddresses = [...new Set(listings.map((listing) => listing.address).filter(Boolean))];
    const uniqueCities = [...new Set(listings.map((listing) => listing.city).filter(Boolean))];

    return res.status(200).json({
      success: true,
      data: listings,
      categories: uniqueCategories,
      subcategories: uniqueSubcategories,
      tags: uniqueTags,
      addresses: uniqueAddresses,
      cities: uniqueCities,
    });
  } catch (error) {
    console.error('Error fetching listings:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch listings',
      message: error.message,
    });
  }
}