
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

// Helper function to validate phone number (basic regex for Indian phone numbers)
const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.trim());
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

    const data: BusinessData = req.body;

    // Validate required fields
    if (!data.name || !data.address || !data.phone || !data.category || !data.subcategory || !data.pincode) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate phone number
    if (!validatePhoneNumber(data.phone)) {
      return res.status(400).json({
        error: 'Invalid phone number. Must be a 10-digit Indian phone number starting with 6-9.',
      });
    }

    // Validate pincode
    if (!validatePincode(data.pincode)) {
      return res.status(400).json({ error: 'Invalid pincode. Must be a 6-digit number.' });
    }

    // Check if phone number already exists
    const existingBusiness = await DistrictBusiness.findOne({ phone: data.phone });
    if (existingBusiness) {
      return res.status(400).json({ error: 'A business with this phone number already exists' });
    }

    // Prepare business data
    const business = {
      name: data.name.trim(),
      rating: parseFloat(data.rating) || 0,
      totalRatings: parseInt(data.totalRatings) || 0,
      address: data.address.trim(),
      phone: data.phone.trim(),
      tags: Array.isArray(data.tags) ? data.tags : [],
      hasWhatsApp: !!data.hasWhatsApp,
      hasEnquiry: !!data.hasEnquiry,
      isTrusted: !!data.isTrusted,
      isVerified: !!data.isVerified,
      isPopular: !!data.isPopular,
      category: data.category.trim(),
      subcategory: data.subcategory.trim(),
      pincode: data.pincode.trim(),
      city: data.city ? data.city.trim() : '',
    };

    // Insert into database
    const inserted = await DistrictBusiness.create(business);

    return res.status(200).json({
      message: 'Business data saved successfully',
      data: inserted,
    });
  } catch (error: any) {
    console.error('Error in uploadform API:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
