// models/DistrictBusiness.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

// Define the interface for the DistrictBusiness document
export interface IDistrictBusiness extends Document {
  _id: mongoose.Types.ObjectId;
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
  subcategory: string;
  pincode: string;
  city: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema
const districtBusinessSchema: Schema<IDistrictBusiness> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
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
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
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
      type: String,
      required: true,
      trim: true,
    },
    subcategory: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'districtbusiness',
  }
);

// Define text index for searchability
districtBusinessSchema.index({
  name: 'text',
  category: 'text',
  subcategory: 'text',
  tags: 'text',
  address: 'text',
  pincode: 'text',
  city: 'text',
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