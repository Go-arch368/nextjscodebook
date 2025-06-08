import mongoose from 'mongoose';

const districtBusinessSchema = new mongoose.Schema(
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
districtBusinessSchema.on('index', (error) => {
  if (error) {
    console.error('Error creating indexes:', error.message);
  } else {
    console.log('Text index created successfully');
  }
});

export default mongoose.models.DistrictBusiness || mongoose.model('DistrictBusiness', districtBusinessSchema);