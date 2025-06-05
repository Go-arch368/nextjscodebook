// pages/api/getListings.js
import dbConnect from '@/lib/dbConnect';
import BusinessListing from '../../models/BusinessListing';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    console.log('Connecting to MongoDB...');
    await dbConnect();
    console.log('MongoDB connection established');

    const {
      query,
      category,
      tag,
      name,
      address,
      city,
      pincode = '560062',
      sort,
      sortByVerified,
      sortByTrusted,
      sortByRating,
    } = req.query;

    console.log('Query parameters:', { query, category, tag, name, address, city, pincode, sort, sortByVerified, sortByTrusted, sortByRating });

    // Build the query
    const dbQuery = {};

    if (query) {
      try {
        dbQuery.$text = { $search: query };
      } catch (error) {
        console.error('Text search error:', error.message);
        dbQuery.$or = [
          { name: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } },
          { tags: { $regex: query, $options: 'i' } },
          { city: { $regex: query, $options: 'i' } },
          { address: { $regex: query, $options: 'i' } },
        ];
      }
    }
    if (category) dbQuery.category = { $regex: `^${category}$`, $options: 'i' };
    if (tag) dbQuery.tags = { $regex: tag, $options: 'i' };
    if (name) dbQuery.name = { $regex: `^${name}$`, $options: 'i' };
    if (address) dbQuery.address = { $regex: address, $options: 'i' };
    if (city) dbQuery.city = { $regex: `^${city}$`, $options: 'i' };
    if (sortByVerified === 'true') dbQuery.isVerified = true;
    if (sortByTrusted === 'true') dbQuery.isTrusted = true;
    if (sortByRating) {
      const ratingValue = parseFloat(sortByRating);
      if (!isNaN(ratingValue)) {
        dbQuery.rating = { $gte: ratingValue.toString() };
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

    console.log('Executing MongoDB query:', JSON.stringify(dbQuery));
    const listings = await BusinessListing.find(dbQuery)
      .sort(sortOptions)
      .limit(50)
      .lean();

    console.log(`Found ${listings.length} listings`);

    if (!listings.length) {
      return res.status(200).json({
        success: false,
        message: 'No listings found',
        data: [],
      });
    }

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
      pincode,
      timestamp: listing.timestamp,
    }));

    return res.status(200).json({
      success: true,
      data: formattedListings,
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