// models/BusinessListing.js
import mongoose from 'mongoose';

const businessListingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    initial: {
      type: String,
      default: '',
      trim: true,
    },
    imageUrl: {
      type: String,
      default: '',
      trim: true,
    },
    rating: {
      type: String,
      default: '',
      trim: true,
    },
    totalRatings: {
      type: String,
      default: '',
      trim: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    distance: {
      type: String,
      default: '',
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
      default: '',
      trim: true,
    },
    city: {
      type: String,
      default: '',
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'businesslisting',
  }
);

// Define text index
businessListingSchema.index({
  name: 'text',
  category: 'text',
  tags: 'text',
  city: 'text',
  address: 'text',
});

// Ensure indexes are created
businessListingSchema.on('index', (error) => {
  if (error) {
    console.error('Error creating indexes:', error.message);
  } else {
    console.log('Text index created successfully');
  }
});

export default mongoose.models.BusinessListing || mongoose.model('BusinessListing', businessListingSchema);