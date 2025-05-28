import dbConnect from '@/lib/dbConnect';
import BusinessListing from '../../models/BusinessListing';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { category, sort, sortByVerified, sortByTrusted, sortByRating } = req.query;
    const query = {};
    if (category) {
      query.category = { $regex: `^${category}$`, $options: 'i' };
    }

    // Build sort options
    const sortOptions = {};
    if (sortByVerified === 'true') {
      sortOptions.isVerified = -1; // True first
    }
    if (sortByTrusted === 'true') {
      sortOptions.isTrusted = -1; // True first
    }
    if (sort === 'rating') {
      sortOptions.rating = -1; // Descending
    } else if (sort === 'totalRatings-desc') {
      sortOptions.totalRatings = -1; // Descending
    } else if (sort === 'totalRatings-asc') {
      sortOptions.totalRatings = 1; // Ascending
    }

    let listings = await BusinessListing.find(query).lean();

    // Handle rating-based sorting
    if (sortByRating) {
      const ratingThreshold = parseFloat(sortByRating);
      if (!isNaN(ratingThreshold)) {
        listings = listings.sort((a, b) => {
          // Compute priority: 1 if rating >= threshold, 0 otherwise
          const aPriority = a.rating >= ratingThreshold ? 1 : 0;
          const bPriority = b.rating >= ratingThreshold ? 1 : 0;
          if (aPriority !== bPriority) {
            return bPriority - aPriority; // Higher priority (1) first
          }
          // Within same priority, apply other sorts
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
          return 0; // Maintain order
        });
      }
    } else {
      // Apply sortOptions if no rating sort
      listings = await BusinessListing.find(query).sort(sortOptions).lean();
    }

    console.log(
      `Fetched ${listings.length} listings for category: ${category || 'All'}, sort: ${sort || 'Default'}, sortBy: `,
      { sortByVerified: sortByVerified === 'true', sortByTrusted: sortByTrusted === 'true', sortByRating }
    );

    if (listings.length === 0) {
      return res.status(200).json({
        success: false,
        message: `No listings found for category: ${category || 'all'}`,
        data: [],
        category: category || 'Services',
      });
    }

    return res.status(200).json({
      success: true,
      data: listings,
      category: category || 'Services',
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