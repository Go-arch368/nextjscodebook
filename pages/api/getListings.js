import dbConnect from '@/lib/dbConnect';
import BusinessListing from '../../models/BusinessListing';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { category, name, sort, sortByVerified, sortByTrusted, sortByRating } = req.query;
    const query = {};

    if (category || name) {
      query.$or = [];
      if (category) {
        query.$or.push({ category: { $regex: category, $options: 'i' } });
      }
      if (name) {
        query.$or.push({ name: { $regex: name, $options: 'i' } });
      }
    }

    const sortOptions = {};
    if (sortByVerified === 'true') {
      sortOptions.isVerified = -1;
    }
    if (sortByTrusted === 'true') {
      sortOptions.isTrusted = -1;
    }
    if (sort === 'rating') {
      sortOptions.rating = -1;
    } else if (sort === 'totalRatings-desc') {
      sortOptions.totalRatings = -1;
    } else if (sort === 'totalRatings-asc') {
      sortOptions.totalRatings = 1;
    }

    let listings = await BusinessListing.find(query).lean();

    if (sortByRating) {
      const ratingThreshold = parseFloat(sortByRating);
      if (!isNaN(ratingThreshold)) {
        listings = listings.sort((a, b) => {
          const aPriority = a.rating >= ratingThreshold ? 1 : 0;
          const bPriority = b.rating >= ratingThreshold ? 1 : 0;
          if (aPriority !== bPriority) {
            return bPriority - aPriority;
          }
          if (sortByVerified === 'true') {
            if (a.isVerified !== b.isVerified) return b.isVerified ? -1 : 1;
          }
          if (sortByTrusted === 'true') {
            if (a.isTrusted !== b.isTrusted) return b.isTrusted ? -1 : 1;
          }
          if (sort === 'rating') {
            return b.rating - a.rating;
          } else if (sort === 'totalRatings-desc') {
            return (b.totalRatings || 0) - (a.totalRatings || 0);
          } else if (sort === 'totalRatings-asc') {
            return (a.totalRatings || 0) - (b.totalRatings || 0);
          }
          return 0;
        });
      }
    } else {
      listings = await BusinessListing.find(query).sort(sortOptions).lean();
    }

    const uniqueCategories = [...new Set(listings.map((listing) => listing.category))];

    console.log(
      `Fetched ${listings.length} listings for query: category=${category || 'All'}, name=${name || 'None'}, sort=${sort || 'Default'}, sortBy: `,
      { sortByVerified: sortByVerified === 'true', sortByTrusted: sortByTrusted === 'true', sortByRating }
    );

    if (listings.length === 0) {
      return res.status(200).json({
        success: false,
        message: `No listings found for query: category=${category || 'all'}, name=${name || 'none'}`,
        data: [],
        categories: [],
      });
    }

    return res.status(200).json({
      success: true,
      data: listings,
      categories: uniqueCategories,
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