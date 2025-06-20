import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import DistrictBusiness, { IDistrictBusiness } from '../../models/DistrictBusiness';

// Define the shape of the response data
interface SearchResult {
  id: string;
  name: string;
  type: 'business' | 'category' | 'tag' | 'city' | 'name';
  pincode: string;
  category?: string;
}

interface ResponseData {
  success: boolean;
  data?: {
    businesses: SearchResult[];
    categories: SearchResult[];
    tags: SearchResult[];
    cities: SearchResult[];
    names: SearchResult[];
  };
  error?: string;
  message?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { q: query, pincode, lang = 'en' } = req.query as { q?: string; pincode?: string; lang?: string };

  // Require pincode for search
  if (!pincode) {
    return res.status(400).json({ success: false, error: 'Pincode parameter is required' });
  }

  try {
    await dbConnect();
    console.log('MongoDB connected for search');

    // Check if pincode exists in the database
    const pincodeExists: IDistrictBusiness | null = await DistrictBusiness.findOne({ pincode }).lean();
    if (!pincodeExists) {
      return res.status(404).json({ success: false, error: `Pincode ${pincode} not found in the database` });
    }

    const dbQuery: { pincode: string; $or?: Array<{ [key: string]: any }> } = { pincode }; // Base query on pincode
    let businesses: SearchResult[] = [];
    let categories: SearchResult[] = [];
    let tags: SearchResult[] = [];
    let cities: SearchResult[] = [];
    let names: SearchResult[] = [];

    // Add query conditions if search term is provided
    if (query) {
      dbQuery.$or = [
        { [`name.${lang}`]: { $regex: query, $options: 'i' } }, // Case-insensitive
        { [`category.en`]: { $regex: query, $options: 'i' } }, // Case-insensitive
        { [`tags.${lang}`]: { $regex: query, $options: 'i' } }, // Case-insensitive
        { [`city.${lang}`]: { $regex: query, $options: 'i' } }, // Case-insensitive
      ];
    }

    const results: IDistrictBusiness[] = await DistrictBusiness.find(dbQuery)
      .select(`name.${lang} category.en tags.${lang} city.${lang} pincode`)
      .limit(20)
      .lean();

    console.log(`Search found ${results.length} results for pincode ${pincode}`);

    businesses = results.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name?.[lang] || doc.name?.en || '',
      category: doc.category?.en || '',
      type: 'business' as const,
      pincode: doc.pincode,
    }));

    categories = [...new Set(results.map((doc) => doc.category?.en).filter(Boolean))].map((name) => ({
      id: name,
      name,
      type: 'category' as const,
      pincode,
    }));
    tags = [...new Set(results.flatMap((doc) => doc.tags?.[lang] || []).filter(Boolean))].map((name) => ({
      id: name,
      name,
      type: 'tag' as const,
      pincode,
    }));
    cities = [...new Set(results.map((doc) => doc.city?.[lang]).filter(Boolean))].map((name) => ({
      id: name,
      name,
      type: 'city' as const,
      pincode,
    }));
    names = [...new Set(results.map((doc) => doc.name?.[lang]).filter(Boolean))].map((name) => ({
      id: name,
      name,
      type: 'name' as const,
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Search error:', errorMessage);
    return res.status(500).json({
      success: false,
      error: 'Failed to perform search',
      message: errorMessage,
    });
  }
}