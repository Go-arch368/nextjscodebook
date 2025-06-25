// models/DistrictBusiness.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

// Define the interface for the DistrictBusiness document
export interface IDistrictBusiness extends Document {
  _id: mongoose.Types.ObjectId;
  name: { en: string; ta: string; hi: string; ka: string };
  rating: number;
  totalRatings: number;
  address: { en: string; ta: string; hi: string; ka: string };
  phone: string;
  tags: { en: string[]; ta: string[]; hi: string[]; ka: string[] };
  hasWhatsApp: boolean;
  hasEnquiry: boolean;
  isTrusted: boolean;
  isVerified: boolean;
  isPopular: boolean;
  category: { en: string; ta: string; hi: string; ka: string };
  subcategory: { en: string; ta: string; hi: string; ka: string };
  pincode: string;
  city: { en: string; ta: string; hi: string; ka: string };
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema
const districtBusinessSchema: Schema<IDistrictBusiness> = new Schema(
  {
    name: {
      en: { type: String, required: true, trim: true },
      ta: { type: String, default: '', trim: true },
      hi: { type: String, default: '', trim: true },
      ka: { type: String, default: '', trim: true },
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
      min: 0,
    },
    address: {
      en: { type: String, required: true, trim: true },
      ta: { type: String, default: '', trim: true },
      hi: { type: String, default: '', trim: true },
      ka: { type: String, default: '', trim: true },
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    tags: {
      en: { type: [String], default: [] },
      ta: { type: [String], default: [] },
      hi: { type: [String], default: [] },
      ka: { type: [String], default: [] },
    },
    hasWhatsApp: {
      type: Boolean,
      default: false,
    },
    hasEnquiry: {
      type: Boolean,
      default: false,
    },
    isTrusted: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isPopular: {
      type: Boolean,
      default: false,
    },
    category: {
      en: { type: String, required: true, trim: true },
      ta: { type: String, default: '', trim: true },
      hi: { type: String, default: '', trim: true },
      ka: { type: String, default: '', trim: true },
    },
    subcategory: {
      en: { type: String, required: true, trim: true },
      ta: { type: String, default: '', trim: true },
      hi: { type: String, default: '', trim: true },
      ka: { type: String, default: '', trim: true },
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      en: { type: String, default: '', trim: true },
      ta: { type: String, default: '', trim: true },
      hi: { type: String, default: '', trim: true },
      ka: { type: String, default: '', trim: true },
    },
  },
  {
    timestamps: true,
    collection: 'districtbusiness',
  }
);

// Define text index for searchability
districtBusinessSchema.index({
  'name.en': 'text',
  'category.en': 'text',
  'subcategory.en': 'text',
  'tags.en': 'text',
  'address.en': 'text',
  'pincode': 'text',
  'city.en': 'text',
});

// Ensure indexes are created
districtBusinessSchema.on('index', (error: Error | null) => {
  if (error) {
    console.error('Error creating indexes:', error.message);
  } else {
    console.log('Text index created successfully');
  }
});

// Define the model
const DistrictBusiness: Model<IDistrictBusiness> =
  mongoose.models.DistrictBusiness ||
  mongoose.model<IDistrictBusiness>('DistrictBusiness', districtBusinessSchema);

export default DistrictBusiness;