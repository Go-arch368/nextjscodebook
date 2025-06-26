import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import DistrictBusiness, { IDistrictBusiness } from '../../models/DistrictBusiness';

interface SearchResult {
  id: string;
  name: string;
  rating: number;
  totalRatings: number;
  address: string;
  phone: string;
  tags: string[];
  hasWhatsApp: boolean;
  hasEnquiry: boolean;
  isTrusted: boolean;
  isVerified: boolean;
  isPopular: boolean;
  category: string;
  subcategory?: string;
  pincode: string;
  city?: string;
}

interface ResponseData {
  success: boolean;
  data?: {
    businesses: SearchResult[];
    totalCount?: number;
  };
  error?: string;
  message?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { pincode, category, subcategory, limit, page, lang = 'en' } = req.query as {
    pincode?: string;
    category?: string;
    subcategory?: string;
    limit?: string;
    page?: string;
    lang?: string;
  };

  if (!pincode) {
    return res.status(400).json({ success: false, error: 'Pincode parameter is required' });
  }

  try {
    await dbConnect();
    console.log('MongoDB connected for business search');

    // Validate pincode existence
    const pincodeExists: IDistrictBusiness | null = await DistrictBusiness.findOne({ pincode }).lean();
    if (!pincodeExists) {
      return res.status(404).json({ success: false, error: `Pincode ${pincode} not found in the database` });
    }

    // Build query
    const dbQuery: Record<string, any> = { pincode };

    if (category) {
      dbQuery[`category.en`] = { $regex: `^${category}$`, $options: 'i' }; // Case-insensitive exact match for category
    }

    if (subcategory) {
      // Check if subcategory field exists for the language
      const subcategoryExists = await DistrictBusiness.findOne({
        pincode,
        [`subcategory.${lang}`]: { $exists: true, $ne: null },
      }).lean();

      if (!subcategoryExists) {
        console.log(`No documents found with subcategory.${lang} for pincode ${pincode}`);
        return res.status(200).json({
          success: true,
          data: { businesses: [], totalCount: 0 },
          message: `No businesses found with subcategory '${subcategory}' in language '${lang}'`,
        });
      }

      // Split subcategory string into array and search using $in
      dbQuery[`subcategory.${lang}`] = {
        $regex: `(^|,\\s*)${subcategory}(\\s*,|$)`,
        $options: 'i',
      };
    }

    // Pagination
    const pageNumber = parseInt(page || '1', 10);
    const pageSize = parseInt(limit || '0', 10); // 0 means no limit
    const skip = pageSize > 0 ? (pageNumber - 1) * pageSize : 0;

    // Get total count
    const totalCount = await DistrictBusiness.countDocuments(dbQuery);

    // Build query for results
    let query = DistrictBusiness.find(dbQuery).lean();

    // Apply pagination if limit is specified
    if (pageSize > 0) {
      query = query.skip(skip).limit(pageSize);
    }

    const results: IDistrictBusiness[] = await query;

    console.log(
      `Search found ${results.length} results (out of ${totalCount}) for pincode ${pincode}, category ${
        category || 'any'
      }, subcategory ${subcategory || 'any'}, language ${lang}`,
    );

    const businesses: SearchResult[] = results.map((doc: any) => ({
      id: doc._id.toString(),
      name: doc.name?.[lang] || doc.name?.en || '',
      rating: doc.rating || 0,
      totalRatings: doc.totalRatings || 0,
      address: doc.address?.[lang] || doc.address?.en || '',
      phone: doc.phone || '',
      tags: doc.tags?.[lang] || doc.tags?.en || [],
      hasWhatsApp: doc.hasWhatsApp || false,
      hasEnquiry: doc.hasEnquiry || false,
      isTrusted: doc.isTrusted || false,
      isVerified: doc.isVerified || false,
      isPopular: doc.isPopular || false,
      category: doc.category?.en || doc.category?.en || '',
      subcategory: doc.subcategory?.[lang] || doc.subcategory?.en || undefined,
      pincode: doc.pincode || '',
      city: doc.city?.[lang] || doc.city?.en || undefined,
    }));

    return res.status(200).json({
      success: true,
      data: {
        businesses,
        totalCount,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Business search error:', errorMessage);
    return res.status(500).json({
      success: false,
      error: 'Failed to perform business search',
      message: errorMessage,
    });
  }
}