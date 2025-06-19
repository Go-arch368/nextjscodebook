// pages/api/listings.ts (or wherever your API route is located)
import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import DistrictBusiness, { IDistrictBusiness } from '../../models/DistrictBusiness';

// Extend the IDistrictBusiness interface to include optional fields not in the schema
interface IExtendedDistrictBusiness extends IDistrictBusiness {
  initial?: string;
  imageUrl?: string;
  distance?: number;
  timestamp?: Date;
}

// Define the shape of the formatted listing in the response
interface FormattedListing {
  _id: string;
  name: string;
  initial?: string;
  imageUrl?: string;
  rating: number;
  totalRatings: number;
  address: string;
  distance?: number;
  phone: string;
  tags: string[];
  hasWhatsApp: boolean;
  hasEnquiry: boolean;
  isTrusted: boolean;
  isVerified: boolean;
  isPopular: boolean;
  category: string;
  city: string;
  pincode: string;
  timestamp?: Date;
}

// Define the shape of the response data
interface ResponseData {
  success: boolean;
  data?: FormattedListing[];
  error?: string;
  message?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
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
      pincode,
      sort,
      sortByVerified,
      sortByTrusted,
      sortByRating,
    } = req.query as {
      query?: string;
      category?: string;
      tag?: string;
      name?: string;
      address?: string;
      city?: string;
      pincode?: string;
      sort?: string;
      sortByVerified?: string;
      sortByTrusted?: string;
      sortByRating?: string;
    };

    // Require pincode for listing retrieval
    if (!pincode) {
      return res.status(400).json({ success: false, error: 'Pincode parameter is required' });
    }

    // Check if pincode exists in the database
    const pincodeExists: IDistrictBusiness | null = await DistrictBusiness.findOne({ pincode }).lean();
    if (!pincodeExists) {
      return res.status(404).json({ success: false, error: `Pincode ${pincode} not found in the database` });
    }

    console.log('Query parameters:', {
      query,
      category,
      tag,
      name,
      address,
      city,
      pincode,
      sort,
      sortByVerified,
      sortByTrusted,
      sortByRating,
    });

    // Build the query with pincode as a base condition
    const dbQuery: { 
      pincode: string; 
      $text?: { $search: string }; 
      $or?: Array<{ [key: string]: any }>;
      [key: string]: any; // Allow additional dynamic properties
    } = { pincode };

    if (query) {
      try {
        dbQuery.$text = { $search: `\"${query}\" name:${query}` };
      } catch (error: unknown) {
        console.error('Text search error:', error instanceof Error ? error.message : 'Unknown error');
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
    if (name) dbQuery.name = { $regex: name, $options: 'i' };
    if (address) dbQuery.address = { $regex: address, $options: 'i' };
    if (city) dbQuery.city = { $regex: `^${city}$`, $options: 'i' };
    if (sortByVerified === 'true') dbQuery.isVerified = true;
    if (sortByTrusted === 'true') dbQuery.isTrusted = true;
    if (sortByRating) {
      const ratingValue = parseFloat(sortByRating);
      if (!isNaN(ratingValue)) {
        dbQuery.rating = { $gte: ratingValue };
      }
    }

    // Sorting
    const sortOptions: { [key: string]: 1 | -1 | { $meta: string } } = {};
    if (sort) {
      if (sort === 'rating') {
        sortOptions.rating = -1;
      } else if (sort === 'totalRatings-desc') {
        sortOptions.totalRatings = -1;
      } else if (sort === 'totalRatings-asc') {
        sortOptions.totalRatings = 1;
      } else {
        sortOptions.createdAt = -1;
      }
    } else if (query) {
      sortOptions.score = { $meta: 'textScore' };
    } else {
      sortOptions.createdAt = -1;
    }

    console.log('Executing MongoDB query:', JSON.stringify(dbQuery));
    const listings: IExtendedDistrictBusiness[] = await DistrictBusiness.find(dbQuery)
      .sort(sortOptions)
      .lean();

    console.log(`Found ${listings.length} listings for pincode ${pincode}`);

    if (!listings.length) {
      return res.status(200).json({
        success: false,
        message: `No listings found for pincode ${pincode}`,
        data: [],
      });
    }

    // Format response
    const formattedListings: FormattedListing[] = listings.map((listing) => ({
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
      pincode: listing.pincode,
      timestamp: listing.timestamp,
    }));

    return res.status(200).json({
      success: true,
      data: formattedListings,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching listings:', errorMessage);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch listings',
      message: errorMessage,
    });
  }
}