export interface Business {
  business: {
    name: string;
    rating: number;
    total_ratings: number;
    badges: string[];
    location: string;
    hours: string;
    years_in_business: string;
    booking_info: string;
    contact: {
      phone: string;
      actions: {
        label: string;
        type: 'primary' | 'secondary';
        icon?: string;
      }[];
    };
    image?: string;
    businessId?: string;
    services: string[];
    reviews?: {
      author: string;
      rating: number;
      comment: string;
    }[];
  };
}