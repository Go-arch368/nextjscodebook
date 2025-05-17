import { Schema, model, models, Document, Model } from 'mongoose';

export interface IBusiness extends Document {
  WebsiteIdentifier: string;
  Category: string;
  Subcategory: string;
  business: {
    name: string;
    rating: number;
    total_ratings: number;
    badges: string[];
    location: string;
    hours: {
      status: string;
    };
    years_in_business: string;
    booking_info: string;
    information: string[];
    contact: {
      phone: string;
    };
    image: string;
    businessId: string;
    services: string[];
  };
  photos: {
    source?: string;
    description: string;
    image: string;
  }[];
  price_list?: {
    service: string;
    description: string;
    price: string;
    details_link?: string;
    button: string;
  }[];
  Quick_Information: {
    Qname: string;
    Qdescription: string;
    Qestablished: string;
    Qestablished_year: string;
  }[];
  Services: {
    sname: string;
    sdata1: string;
    sdata2: string;
    sdata3?: string;
  }[];
  general_contact: {
    phone: string;
  };
  address: string;
  actions: {
    label: string;
    icon: string;
  }[];
  customer_reviews: {
    source: string;
    name: string;
    feedback: string;
    time: string;
  }[];
  key_insights: {
    section_title: string;
    what_users_liked: {
      title: string;
      points: string[];
    };
    what_can_be_improved: {
      title: string;
      points: string[];
    };
    disclaimer: string;
    metadata: {
      source: string;
      version: string;
      last_updated: string;
    };
  };
  reviews_ratings: {
    title: string;
    rating: number;
    total_ratings: number;
    description: string;
    button_text: string;
  };
  review: {
    title: string;
    ratings: number[];
  };
  userReviews: {
    title: string;
    sortOrder: string[];
    reviewHighlightstitle: string;
    reviewHighlights: {
      highlight: string;
      rating: number;
    }[];
  };
  reviewPeople: {
    user: {
      name: string;
      review_count: number;
      follower_count: number;
    };
    date: string;
    location: string;
    title: string;
    tags: string[];
    content: string;
    actions: string[];
    sentiment: string;
    rating: number;
  }[];
  listingCategories: string[];
  createdAt: Date;
  updatedAt: Date;
}

const BusinessSchema = new Schema<IBusiness>(
  {
    WebsiteIdentifier: {
      type: String,
      required: [true, 'WebsiteIdentifier is required'],
      trim: true,
      unique: true,
    },
    Category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    Subcategory: {
      type: String,
      required: [true, 'Subcategory is required'],
      trim: true,
    },
    business: {
      name: {
        type: String,
        required: [true, 'Business name is required'],
        trim: true,
        maxlength: [100, 'Business name cannot exceed 100 characters'],
      },
      rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot exceed 5'],
      },
      total_ratings: {
        type: Number,
        required: [true, 'Total ratings are required'],
        min: [0, 'Total ratings cannot be negative'],
      },
      badges: {
        type: [String],
        default: [],
      },
      location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true,
      },
      hours: {
        status: {
          type: String,
          required: [true, 'Hours status is required'],
          trim: true,
        },
      },
      years_in_business: {
        type: String,
        required: [true, 'Years in business is required'],
        trim: true,
      },
      booking_info: {
        type: String,
        required: [true, 'Booking info is required'],
        trim: true,
      },
      information: {
        type: [String],
        default: [],
      },
      contact: {
        phone: {
          type: String,
          required: [true, 'Contact phone is required'],
          trim: true,
          match: [/^\d{10,12}$/, 'Please use a valid 10-12 digit phone number'],
        },
      },
      image: {
        type: String,
        required: [true, 'Business image URL is required'],
        trim: true,
      },
      businessId: {
        type: String,
        required: [true, 'Business ID is required'],
        trim: true,
        unique: true,
      },
      services: {
        type: [String],
        default: [],
      },
    },
    photos: [
      {
        source: {
          type: String,
          trim: true,
        },
        description: {
          type: String,
          required: [true, 'Photo description is required'],
          trim: true,
        },
        image: {
          type: String,
          required: [true, 'Photo image URL is required'],
          trim: true,
        },
      },
    ],
    price_list: [
      {
        service: {
          type: String,
          required: [true, 'Service name is required'],
          trim: true,
        },
        description: {
          type: String,
          required: [true, 'Service description is required'],
          trim: true,
        },
        price: {
          type: String,
          required: [true, 'Service price is required'],
          trim: true,
        },
        details_link: {
          type: String,
          trim: true,
        },
        button: {
          type: String,
          required: [true, 'Button text is required'],
          trim: true,
        },
      },
    ],
    Quick_Information: [
      {
        Qname: {
          type: String,
          required: [true, 'Quick info name is required'],
          trim: true,
        },
        Qdescription: {
          type: String,
          required: [true, 'Quick info description is required'],
          trim: true,
        },
        Qestablished: {
          type: String,
          required: [true, 'Quick info established field is required'],
          trim: true,
        },
        Qestablished_year: {
          type: String,
          required: [true, 'Quick info established year is required'],
          trim: true,
        },
      },
    ],
    Services: [
      {
        sname: {
          type: String,
          required: [true, 'Service name is required'],
          trim: true,
        },
        sdata1: {
          type: String,
          required: [true, 'Service data 1 is required'],
          trim: true,
        },
        sdata2: {
          type: String,
          required: [true, 'Service data 2 is required'],
          trim: true,
        },
        sdata3: {
          type: String,
          trim: true,
        },
      },
    ],
    general_contact: {
      phone: {
        type: String,
        required: [true, 'General contact phone is required'],
        trim: true,
        match: [/^\d{10,12}$/, 'Please use a valid 10-12 digit phone number'],
      },
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    actions: [
      {
        label: {
          type: String,
          required: [true, 'Action label is required'],
          trim: true,
        },
        icon: {
          type: String,
          required: [true, 'Action icon is required'],
          trim: true,
        },
      },
    ],
    customer_reviews: [
      {
        source: {
          type: String,
          required: [true, 'Review source is required'],
          trim: true,
        },
        name: {
          type: String,
          required: [true, 'Reviewer name is required'],
          trim: true,
        },
        feedback: {
          type: String,
          required: [true, 'Review feedback is required'],
          trim: true,
        },
        time: {
          type: String,
          required: [true, 'Review time is required'],
          trim: true,
        },
      },
    ],
    key_insights: {
      section_title: {
        type: String,
        required: [true, 'Section title is required'],
        trim: true,
      },
      what_users_liked: {
        title: {
          type: String,
          required: [true, 'What users liked title is required'],
          trim: true,
        },
        points: {
          type: [String],
          required: [true, 'What users liked points are required'],
        },
      },
      what_can_be_improved: {
        title: {
          type: String,
          required: [true, 'What can be improved title is required'],
          trim: true,
        },
        points: {
          type: [String],
          required: [true, 'What can be improved points are required'],
        },
      },
      disclaimer: {
        type: String,
        required: [true, 'Disclaimer is required'],
        trim: true,
      },
      metadata: {
        source: {
          type: String,
          required: [true, 'Metadata source is required'],
          trim: true,
        },
        version: {
          type: String,
          required: [true, 'Metadata version is required'],
          trim: true,
        },
        last_updated: {
          type: String,
          required: [true, 'Metadata last updated is required'],
          trim: true,
        },
      },
    },
    reviews_ratings: {
      title: {
        type: String,
        required: [true, 'Reviews title is required'],
        trim: true,
      },
      rating: {
        type: Number,
        required: [true, 'Reviews rating is required'],
        min: [0, 'Rating cannot be less than 0'],
        max: [5, 'Rating cannot exceed 5'],
      },
      total_ratings: {
        type: Number,
        required: [true, 'Total ratings are required'],
        min: [0, 'Total ratings cannot be negative'],
      },
      description: {
        type: String,
        required: [true, 'Reviews description is required'],
        trim: true,
      },
      button_text: {
        type: String,
        required: [true, 'Button text is required'],
        trim: true,
      },
    },
    review: {
      title: {
        type: String,
        required: [true, 'Review title is required'],
        trim: true,
      },
      ratings: {
        type: [Number],
        required: [true, 'Review ratings are required'],
        validate: {
          validator: (ratings: number[]) => ratings.every((r) => r >= 0 && r <= 5),
          message: 'Ratings must be between 0 and 5',
        },
      },
    },
    userReviews: {
      title: {
        type: String,
        required: [true, 'User reviews title is required'],
        trim: true,
      },
      sortOrder: {
        type: [String],
        required: [true, 'Sort order is required'],
      },
      reviewHighlightstitle: {
        type: String,
        required: [true, 'Review highlights title is required'],
        trim: true,
      },
      reviewHighlights: [
        {
          highlight: {
            type: String,
            required: [true, 'Highlight is required'],
            trim: true,
          },
          rating: {
            type: Number,
            required: [true, 'Highlight rating is required'],
            min: [0, 'Rating cannot be less than 0'],
            max: [5, 'Rating cannot exceed 5'],
          },
        },
      ],
    },
    reviewPeople: [
      {
        user: {
          name: {
            type: String,
            required: [true, 'User name is required'],
            trim: true,
            maxlength: [50, 'User name cannot exceed 50 characters'],
          },
          review_count: {
            type: Number,
            required: [true, 'Review count is required'],
            min: [0, 'Review count cannot be negative'],
          },
          follower_count: {
            type: Number,
            required: [true, 'Follower count is required'],
            min: [0, 'Follower count cannot be negative'],
          },
        },
        date: {
          type: String,
          required: [true, 'Review date is required'],
          trim: true,
        },
        location: {
          type: String,
          required: [true, 'Review location is required'],
          trim: true,
        },
        title: {
          type: String,
          required: [true, 'Review title is required'],
          trim: true,
        },
        tags: {
          type: [String],
          default: [],
        },
        content: {
          type: String,
          required: [true, 'Review content is required'],
          trim: true,
        },
        actions: {
          type: [String],
          default: [],
        },
        sentiment: {
          type: String,
          required: [true, 'Sentiment is required'],
          trim: true,
          enum: ['positive', 'negative', 'neutral'],
        },
        rating: {
          type: Number,
          required: [true, 'Review rating is required'],
          min: [1, 'Rating must be at least 1'],
          max: [5, 'Rating cannot exceed 5'],
        },
      },
    ],
    listingCategories: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Business = (models.Business as Model<IBusiness>) || model<IBusiness>('Business', BusinessSchema);

export default Business;