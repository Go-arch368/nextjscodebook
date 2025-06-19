import { NextResponse } from 'next/server';
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

export async function POST(request: Request) {
  try {
    await dbConnect();

    const data: BusinessData = await request.json();

    // Validate required fields
    if (!data.name || !data.address || !data.phone || !data.category || !data.subcategory || !data.pincode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate phone number
    if (!validatePhoneNumber(data.phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number. Must be a 10-digit Indian phone number starting with 6-9.' },
        { status: 400 }
      );
    }

    // Validate pincode
    if (!validatePincode(data.pincode)) {
      return NextResponse.json({ error: 'Invalid pincode. Must be a 6-digit number.' }, { status: 400 });
    }

    // Check if phone number already exists
    const existingBusiness = await DistrictBusiness.findOne({ phone: data.phone });
    if (existingBusiness) {
      return NextResponse.json({ error: 'A business with this phone number already exists' }, { status: 400 });
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

    return NextResponse.json({
      message: 'Business data saved successfully',
      data: inserted,
    });
  } catch (error: any) {
    console.error('Error in uploadform API:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}