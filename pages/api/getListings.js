// pages/api/getListings.js
import dbConnect from '@/lib/dbConnect';
import BusinessListing from '../../models/BusinessListing';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const {
      q,
      category,
      tag,
      name,
      address,
      city,
      sort,
      sortByVerified,
      sortByTrusted,
      sortByRating,
    } = req.query;

    // Build the query
    const query = {};

    // Unified search across multiple fields
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
        { address: { $regex: q, $options: 'i' } },
        { city: { $regex: q, $options: 'i' } },
      ];
    }

    // Specific field filters
    if (category) query.category = { $regex: `^${category}$`, $options: 'i' };
    if (tag) query.tags = { $regex: tag, $options: 'i' };
    if (name) query.name = { $regex: `^${name}$`, $options: 'i' };
    if (address) query.address = { $regex: address, $options: 'i' };
    if (city) query.city = { $regex: `^${city}$`, $options: 'i' };
    if (sortByVerified === 'true') query.isVerified = true;
    if (sortByTrusted === 'true') query.isTrusted = true;
    if (sortByRating) {
      const ratingValue = parseFloat(sortByRating);
      if (!isNaN(ratingValue)) {
        query.rating = { $gte: ratingValue.toString() }; 
      }
    }

    // Sorting
    let sortOptions = {};
    if (sort) {
      if (sort === 'rating') {
       
        sortOptions = { rating: -1 };
      } else if (sort === 'totalRatings-desc') {
       
        sortOptions = { totalRatings: -1 };
      } else if (sort === 'totalRatings-asc') {
        
        sortOptions = { totalRatings: 1 };
      } else {
        sortOptions.createdAt = -1; 
      }
    } else {
      sortOptions.createdAt = -1; 
    }

   
    const listings = await BusinessListing.find(query)
      .sort(sortOptions)
      .limit(50) 
      .lean();

    if (!listings.length) {
      return res.status(200).json({
        success: false,
        message: `No listings found for query: q=${q || 'none'}, name=${name || 'none'}, category=${category || 'none'}, tag=${tag || 'none'}, address=${address || 'none'}, city=${city || 'none'}`,
        data: [],
        categories: [],
        subcategories: [], // Empty since schema lacks subcategory
        tags: [],
        addresses: [],
        cities: [],
      });
    }

    // Extract unique fields
    const uniqueCategories = [...new Set(listings.map((listing) => listing.category).filter(Boolean))];
    const uniqueTags = [...new Set(listings.flatMap((listing) => listing.tags || []).filter(Boolean))];
    const uniqueAddresses = [...new Set(listings.map((listing) => listing.address).filter(Boolean))];
    const uniqueCities = [...new Set(listings.map((listing) => listing.city).filter(Boolean))];

    // Format response
    const formattedListings = listings.map((listing) => ({
      _id: listing._id.toString(),
      name: listing.name,
      initial: listing.initial,
      imageUrl: listing.imageUrl,
      rating: listing.rating,
      totalRatings: listing.totalRatings,
      address: listing.address,
      distance: listing.distance,
      phone: listing.phone,
      tags: listing.tags,
      hasWhatsApp: listing.hasWhatsApp,
      hasEnquiry: listing.hasEnquiry,
      isTrusted: listing.isTrusted,
      isVerified: listing.isVerified,
      isPopular: listing.isPopular,
      category: listing.category,
      city: listing.city,
      timestamp: listing.timestamp,
    }));

    return res.status(200).json({
      success: true,
      data: formattedListings,
      categories: uniqueCategories,
      subcategories: [], // Empty since schema lacks subcategory
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