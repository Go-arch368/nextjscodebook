import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import DistrictBusiness, { IDistrictBusiness } from '../../models/DistrictBusiness';

// Extend the IDistrictBusiness type to reflect multilingual fields
type MultilingualString = { [key: string]: string };
type MultilingualArray = { [key: string]: string[] };

interface IDistrictBusinessTyped extends Omit<IDistrictBusiness, 'name' | 'category' | 'tags' | 'city'> {
  name?: MultilingualString;
  category?: MultilingualString;
  tags?: MultilingualArray;
  city?: MultilingualString;
}

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

  const { pincode, lang = 'en' } = req.query as { pincode?: string; lang?: string };

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
    // Use 'any' for results to avoid type incompatibility, or map to the expected type
    const results = await DistrictBusiness.find(dbQuery)
      .select(`name category tags city pincode`)
      .limit(20)
      .lean();

    console.log(`Search found ${results.length} results for pincode ${pincode}`);

    businesses = results.map((doc: any) => ({
      id: doc._id.toString(),
      name: (doc.name && typeof doc.name === 'object' ? doc.name[lang] || doc.name['en'] : '') || '',
      category: (doc.category && typeof doc.category === 'object' ? doc.category['en'] : '') || '',
      type: 'business' as const,
      pincode: doc.pincode,
    }));

    categories = [
      ...new Set(
        results
          .map((doc: any) => (doc.category && typeof doc.category === 'object' ? doc.category['en'] : null))
          .filter((name: any): name is string => Boolean(name))
      ),
    ].map((name: string) => ({
      id: name,
      name,
      type: 'category' as const,
      pincode,
    }));

    tags = [
      ...new Set(
        results
          .flatMap((doc: any) =>
            doc.tags && typeof doc.tags === 'object' && Array.isArray(doc.tags[lang])
              ? doc.tags[lang]
              : []
          )
          .filter((name: any): name is string => Boolean(name))
      ),
    ].map((name: string) => ({
      id: name,
      name,
      type: 'tag' as const,
      pincode,
    }));

    cities = [
      ...new Set(
        results
          .map((doc: any) => (doc.city && typeof doc.city === 'object' ? doc.city[lang] : null))
          .filter((name: any): name is string => Boolean(name))
      ),
    ].map((name: string) => ({
      id: name,
      name,
      type: 'city' as const,
      pincode,
    }));

    names = [
      ...new Set(
        results
          .map((doc: any) => (doc.name && typeof doc.name === 'object' ? doc.name[lang] : null))
          .filter((name: any): name is string => Boolean(name))
      ),
    ].map((name: string) => ({
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