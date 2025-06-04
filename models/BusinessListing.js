// models/BusinessListing.js
import mongoose from 'mongoose';

const BusinessListingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  initial: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
  rating: { type: String, default: 'N/A' },
  totalRatings: { type: String, default: 'No Ratings' },
  address: { type: String, default: '' },
  distance: { type: String, default: '' },
  phone: { type: String, default: '' },
  tags: { type: [String], default: [] },
  hasWhatsApp: { type: Boolean, default: false },
  hasEnquiry: { type: Boolean, default: false },
  isTrusted: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  isPopular: { type: Boolean, default: false },
  category: { type: String, required: true },
  city: { type: String, default: '' },
  pincode: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

export default mongoose.models.BusinessListing || mongoose.model('BusinessListing', BusinessListingSchema);