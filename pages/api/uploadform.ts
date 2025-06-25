import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import DistrictBusiness from '../../models/DistrictBusiness';

interface BusinessData {
  name: string;
  rating: string;
  totalRatings: string;
  address: string;
  phone: string;
  tags: string[];
  hasWhatsApp: boolean;
  hasEnquiry: boolean;
  isTrusted: boolean;
  isVerified: boolean;
  isPopular: boolean;
  category: string;
  subcategory: string;
  pincode: string;
  city: string;
}

// Helper function to validate phone number (supports single or comma-separated Indian phone numbers)
const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}(,\s*[6-9]\d{9})*$/;
  return phoneRegex.test(phone.trim().replace(/\s+/g, ''));
};

// Helper function to validate pincode (6-digit number)
const validatePincode = (pincode: string): boolean => {
  const pincodeRegex = /^\d{6}$/;
  return pincodeRegex.test(pincode.trim());
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    await dbConnect();
    console.log('Connected to MongoDB');

    const data: BusinessData = req.body;

    // Validate required fields
    if (!data.name || !data.address || !data.phone || !data.category || !data.subcategory || !data.pincode) {
      console.log('Missing required fields:', {
        name: !!data.name,
        address: !!data.address,
        phone: !!data.phone,
        category: !!data.category,
        subcategory: !!data.subcategory,
        pincode: !!data.pincode,
      });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate phone number
    if (!validatePhoneNumber(data.phone)) {
      console.log('Invalid phone number:', data.phone);
      return res.status(400).json({
        error: 'Invalid phone number. Must be 10-digit Indian numbers starting with 6-9, optionally separated by commas.',
      });
    }

    // Validate pincode
    if (!validatePincode(data.pincode)) {
      console.log('Invalid pincode:', data.pincode);
      return res.status(400).json({ error: 'Invalid pincode. Must be a 6-digit number.' });
    }

    // Check if phone number already exists
    const existingBusiness = await DistrictBusiness.findOne({ phone: data.phone });
    if (existingBusiness) {
      console.log('Phone number already exists:', data.phone);
      return res.status(400).json({ error: 'A business with this phone number already exists' });
    }

    // Prepare business data in multilingual format
    const business = {
      name: {
        en: data.name.trim(),
        ta: '',
        hi: '',
        ka: '',
      },
      rating: parseFloat(data.rating) || 0,
      totalRatings: parseInt(data.totalRatings) || 0,
      address: {
        en: data.address.trim(),
        ta: '',
        hi: '',
        ka: '',
      },
      phone: data.phone.trim(),
      tags: {
        en: Array.isArray(data.tags) ? data.tags.map((tag) => tag.trim()) : [],
        ta: [],
        hi: [],
        ka: [],
      },
      hasWhatsApp: !!data.hasWhatsApp,
      hasEnquiry: !!data.hasEnquiry,
      isTrusted: !!data.isTrusted,
      isVerified: !!data.isVerified,
      isPopular: !!data.isPopular,
      category: {
        en: data.category.trim(),
        ta: '',
        hi: '',
        ka: '',
      },
      subcategory: {
        en: data.subcategory.trim(),
        ta: '',
        hi: '',
        ka: '',
      },
      pincode: data.pincode.trim(),
      city: {
        en: data.city ? data.city.trim() : '',
        ta: '',
        hi: '',
        ka: '',
      },
    };

    console.log('Prepared business record:', JSON.stringify(business, null, 2));

    // Insert into database
    const inserted = await DistrictBusiness.create(business);

    console.log('Inserted business:', inserted._id);

    return res.status(200).json({
      message: 'Business data saved successfully',
      data: inserted,
    });
  } catch (error: any) {
    console.error('Error in uploadform API:', error.message);
    return res.status(500).json({ error: 'Server error occurred while saving the data' });
  }
}