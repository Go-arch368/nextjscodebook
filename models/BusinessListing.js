
const mongoose = require('mongoose');

const businessListingSchema = new mongoose.Schema({
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
});


module.exports = mongoose.model('BusinessListing', businessListingSchema, 'businesslisting');