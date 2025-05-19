// pages/listings.js
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Bookmark,
  ThumbsUp,
  Star,
  MapPin,
  Phone,
  MessageSquare,
  MessageCircle,
  Share2,
  Pencil,
} from 'lucide-react';

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoverIndex, setHoverIndex] = useState(-1);

  // Fetch data from API and store in localStorage
  useEffect(() => {
    async function fetchListings() {
      try {
        setLoading(true);
        const response = await fetch('/api/getListings');
        if (!response.ok) {
          throw new Error('Failed to fetch listings');
        }
        const result = await response.json();
        if (result.success) {
          // Store the data in localStorage
          localStorage.setItem('businessListings', JSON.stringify(result.data));
          console.log('Stored listings in localStorage:', result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch listings');
        }
      } catch (err) {
        console.error('Error fetching listings:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, []);

  // Retrieve data from localStorage and set to state
  useEffect(() => {
    const storedListings = localStorage.getItem('businessListings');
    if (storedListings) {
      try {
        const parsedListings = JSON.parse(storedListings);
        setListings(parsedListings);
        console.log('Retrieved listings from localStorage:', parsedListings);
      } catch (err) {
        console.error('Error parsing localStorage data:', err.message);
        setError('Failed to parse stored data');
      }
    }
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Business Listings</h1>
      {listings.length === 0 ? (
        <p>No listings found.</p>
      ) : (
        listings.map((listing) => {
          // Map database fields to the UI format
          const business = {
            services: listing.tags || [],
            image: listing.imageUrl || null, // Use null if imageUrl is missing
            name: listing.name,
            rating: listing.rating,
            total_ratings: listing.totalRatings,
            badges: [
              listing.isTrusted && 'Trust',
              listing.isVerified && 'Verified',
              listing.isPopular && 'Claimed',
            ].filter(Boolean),
            location: `${listing.address}${listing.city ? `, ${listing.city}` : ''}`,
            hours: { status: 'Status not available' }, // Placeholder
            years_in_business: 'N/A', // Placeholder
            booking_info: 'Booking not available', // Placeholder
            contact: { phone: listing.phone },
            hasWhatsApp: listing.hasWhatsApp,
            hasEnquiry: listing.hasEnquiry,
          };

          const businessId = listing._id;

          return (
            <div
              key={businessId}
              className="border rounded-xl p-4 bg-white shadow-sm relative mx-auto mb-6"
            >
              <div className="absolute right-4 top-4 flex gap-2">
                {business.services.map((service, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs bg-gray-100 text-gray-800"
                  >
                    {service}
                  </Badge>
                ))}
                <button className="border p-1 rounded-md text-gray-600 hover:bg-gray-100">
                  <Bookmark className="h-6 w-6" />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-start gap-4">
                  {business.image && (
                    <img
                      src={business.image}
                      alt={`${business.name} logo`}
                      className="w-20 h-20 rounded-md object-cover"
                    />
                  )}

                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold flex items-center gap-2">
                      <ThumbsUp className="w-5 h-5 text-white bg-black p-1 rounded-md" />
                      {business.name}
                    </h2>

                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-green-600 text-white px-2 py-0.5 text-sm flex items-center gap-1">
                        {business.rating}
                        <Star className="w-3 h-3 text-yellow-300 bg-yellow-600" />
                      </Badge>

                      <span className="text-sm text-gray-700">
                        {business.total_ratings}
                      </span>
                      {business.badges.includes('Trust') && (
                        <Badge className="bg-yellow-400 text-black text-xs">Trust</Badge>
                      )}
                      {business.badges.includes('Verified') && (
                        <Badge className="bg-blue-500 text-white text-xs">Verified</Badge>
                      )}
                      {business.badges.includes('Claimed') && (
                        <Badge className="bg-black text-white text-xs">Claimed</Badge>
                      )}
                    </div>

                    <div className="text-sm text-gray-700 mt-1 flex items-center gap-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-gray-600" />
                        {business.location}
                      </span>
                      <span className="text-gray-400">•</span>
                      <p>Status: {business?.hours?.status || 'Status not available'}</p>

                      <span className="text-gray-400">•</span>
                      <span>{business.years_in_business}</span>
                      <span className="text-gray-400">•</span>
                      <span>ID: {businessId}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-red-500 font-medium">
                        "{business.booking_info}"
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-black">5 Suggestions</span>
                    </div>

                    <div className="flex justify-start gap-3 mt-2 flex-wrap">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="default"
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 flex items-center gap-2 text-lg"
                        >
                          <Phone
                            className="w-5 h-5"
                            style={{ animation: 'shake 2.0s infinite' }}
                          />
                          <style>
                            {`
                              @keyframes shake {
                                0%, 100% { transform: translateX(0); }
                                20%, 60% { transform: translateX(-4px); }
                                40%, 80% { transform: translateX(4px); }
                              }
                            `}
                          </style>
                          <span>{business.contact.phone}</span>
                        </Button>

                        {business.hasEnquiry && (
                          <Button
                            variant="outline"
                            className="border border-blue-600 bg-blue-600 hover:bg-blue-400 hover:text-white text-white px-4 py-3 flex items-center gap-2 text-lg"
                          >
                            <MessageSquare className="w-5 h-5" />
                            <span>Enquire Now</span>
                          </Button>
                        )}

                        {business.hasWhatsApp && (
                          <Button
                            variant="outline"
                            className="border border-green-600 text-green-600 hover:bg-green-50 px-4 py-3 flex items-center gap-2 text-lg"
                          >
                            <MessageCircle className="w-5 h-5" />
                            <span>WhatsApp</span>
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          className="border border-gray-600 text-gray-600 hover:bg-gray-50 px-4 py-3 flex items-center gap-2 text-lg"
                        >
                          <Share2 className="w-5 h-5" />
                        </Button>

                        <Button
                          variant="outline"
                          className="border border-yellow-600 text-yellow-600 hover:bg-yellow-50 px-4 py-3 flex items-center gap-2 text-lg"
                        >
                          <Pencil className="w-5 h-5" />
                        </Button>

                        <div className="flex flex-end pl-90">
                          <h1 className="text-md mb-2 text-black -mt-10">Click to rate</h1>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center -mt-8 mb-3 gap-3">
                {[...Array(5)].map((_, idx) => (
                  <div
                    key={idx}
                    className={`p-1 rounded-md border transition-all duration-300 ${
                      idx <= hoverIndex ? 'border-yellow-400 bg-yellow-400' : 'border-gray-400'
                    }`}
                    onMouseEnter={() => setHoverIndex(idx)}
                    onMouseLeave={() => setHoverIndex(-1)}
                  >
                    <Star
                      className={`w-6 h-6 transition-colors duration-300 ${
                        idx <= hoverIndex
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'fill-gray-400 text-gray-400'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}