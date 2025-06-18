// pages/api/businesssearch.ts
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

  const { pincode, category, subcategory, limit, page } = req.query as {
    pincode?: string;
    category?: string;
    subcategory?: string;
    limit?: string;
    page?: string;
  };


  if (!pincode) {
    return res.status(400).json({ success: false, error: 'Pincode parameter is required' });
  }

  try {
    await dbConnect();
    console.log('MongoDB connected for business search');

   
    const pincodeExists: IDistrictBusiness | null = await DistrictBusiness.findOne({ pincode }).lean();
    if (!pincodeExists) {
      return res.status(404).json({ success: false, error: `Pincode ${pincode} not found in the database` });
    }

   
    const dbQuery: { pincode: string; category?: any; subcategory?: any } = { pincode };

    if (category) {
      dbQuery.category = { $regex: `^${category}$`, $options: 'i' }; 
    }

    if (subcategory) {
      
      dbQuery.subcategory = {
        $regex: `(^|,\\s*)${subcategory}(\\s*,|$)`,
        $options: 'i',
      };
    }

   
    const pageNumber = parseInt(page || '1', 10);
    const pageSize = parseInt(limit || '0', 10); // 0 means no limit (return all records)
    const skip = pageSize > 0 ? (pageNumber - 1) * pageSize : 0;

    // Get total count of matching documents
    const totalCount = await DistrictBusiness.countDocuments(dbQuery);

    // Build the query for results
    let query = DistrictBusiness.find(dbQuery)
      .lean(); // Remove .select() to return all fields

    // Apply pagination if limit is specified
    if (pageSize > 0) {
      query = query.skip(skip).limit(pageSize);
    }

    const results: IDistrictBusiness[] = await query;

    console.log(
      `Search found ${results.length} results (out of ${totalCount}) for pincode ${pincode}, category ${
        category || 'any'
      }, subcategory ${subcategory || 'any'}`,
    );

    const businesses: SearchResult[] = results.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name || '',
      rating: doc.rating || 0,
      totalRatings: doc.totalRatings || 0,
      address: doc.address || '',
      phone: doc.phone || '',
      tags: doc.tags || [],
      hasWhatsApp: doc.hasWhatsApp || false,
      hasEnquiry: doc.hasEnquiry || false,
      isTrusted: doc.isTrusted || false,
      isVerified: doc.isVerified || false,
      isPopular: doc.isPopular || false,
      category: doc.category || '',
      subcategory: doc.subcategory || undefined,
      pincode: doc.pincode || '',
      city: doc.city || undefined,
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