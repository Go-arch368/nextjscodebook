import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import DistrictBusiness, { IDistrictBusiness } from '../../models/DistrictBusiness';

interface FormattedListing {
  _id: string;
  name: string;
  address: string;
  city: string;
  category: string;
  subcategory?: string;
  tags: string[];
  rating: number;
  totalRatings: number;
  phone: string;
  hasWhatsApp: boolean;
  hasEnquiry: boolean;
  isTrusted: boolean;
  isVerified: boolean;
  isPopular: boolean;
  pincode: string;
  imageUrl?: string;
  distance?: number;
  timestamp?: Date;
}

interface ResponseData {
  success: boolean;
  data?: FormattedListing[];
  error?: string;
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const {
      query,
      category,
      tag,
      name,
      address,
      city,
      pincode,
      lang = 'en',
    } = req.query as Record<string, string | undefined>;

    if (!pincode) {
      return res.status(400).json({ success: false, error: 'Pincode is required' });
    }

    const dbQuery: Record<string, any> = { pincode };

    if (query) {
      dbQuery.$or = [
        { [`name.${lang}`]: { $regex: query, $options: 'i' } },
        { [`category.${"en"}`]: { $regex: query, $options: 'i' } },
        { [`tags.${lang}`]: { $regex: query, $options: 'i' } },
        { [`address.${lang}`]: { $regex: query, $options: 'i' } },
        { [`city.${lang}`]: { $regex: query, $options: 'i' } },
      ];
    }

    if (category) dbQuery[`category.${"en"}`] = { $regex: category, $options: 'i' };
    if (tag) dbQuery[`tags.${lang}`] = { $regex: tag, $options: 'i' };
    if (name) dbQuery[`name.${lang}`] = { $regex: name, $options: 'i' };
    if (address) dbQuery[`address.${lang}`] = { $regex: address, $options: 'i' };
    if (city) dbQuery[`city.${lang}`] = { $regex: city, $options: 'i' };

    const listings = await DistrictBusiness.find(dbQuery).lean();

    const data: FormattedListing[] = listings.map((listing) => ({
      _id: String(listing._id),
      name: listing.name?.[lang] || listing.name?.en || '',
      address: listing.address?.[lang] || listing.address?.en || '',
      city: listing.city?.[lang] || listing.city?.en || '',
      category: listing.category?.["en"] || listing.category?.en || '',
      subcategory: listing.subcategory?.[lang] || listing.subcategory?.en || '',
      tags: listing.tags?.[lang] || listing.tags?.en || [],
      rating: listing.rating,
      totalRatings: listing.totalRatings,
      phone: listing.phone,
      hasWhatsApp: listing.hasWhatsApp,
      hasEnquiry: listing.hasEnquiry,
      isTrusted: listing.isTrusted,
      isVerified: listing.isVerified,
      isPopular: listing.isPopular,
      pincode: listing.pincode,
      timestamp: listing.timestamp,
    }));

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message || 'Unknown error',
    });
  }
}
