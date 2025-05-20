"use client";
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ThumbsUp,
  Star,
  Phone,
  MessageSquare,
  MessageCircle,
} from 'lucide-react';

export default function CategoryPage() {
  const [listings, setListings] = useState([]);
  const [category, setCategory] = useState('Services');
  const [city, setCity] = useState('Your City');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/getListings'); // Changed from /api/scrape
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const result = await response.json();
      console.log('API Response:', result);
      if (result.success && result.data.length > 0) {
        setListings(result.data);
        setCategory(result.data[0]?.category || 'Services');
        setCity(result.data[0]?.city || 'Your City');
      } else {
        throw new Error(result.message || 'No listings found');
      }
    } catch (err) {
      console.error('Fetch error:', err.message);
      setError(err.message);
      setListings([]);
      setCategory('Services');
      setCity('Your City');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      assistance: formData.get('assistance'),
      name: formData.get('name'),
      mobile: formData.get('mobile'),
    };
    console.log('Form Submission:', data);
    alert('Enquiry submitted successfully!');
    e.target.reset();
  };

  if (loading) return <div className="text-center text-gray-600 dark:text-gray-300">Loading...</div>;
  if (error) return (
    <div className="text-center text-red-500 dark:text-red-400">
      Error: {error}
      <Button
        onClick={fetchListings}
        className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
      >
        Retry
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-3 pl-4">
          {category} in {city}
        </h1>
        <Button
          onClick={fetchListings}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          Refresh Listings
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/3 w-full pr-5">
          {listings.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">No listings found.</p>
          ) : (
            listings.map((listing, index) => {
              const business = {
                services: Array.isArray(listing.tags) ? listing.tags : [],
                image: listing.imageUrl || 'https://via.placeholder.com/80x80.png?text=Business+Logo',
                name: listing.name || 'Unknown Business',
                rating: listing.rating || 'N/A',
                total_ratings: listing.totalRatings || '0 Ratings',
                badges: [
                  listing.isTrusted && 'Trust',
                  listing.isVerified && 'Verified',
                  listing.isPopular && 'Claimed',
                ].filter(Boolean),
                location: `${listing.address || ''}${listing.city ? `, ${listing.city}` : ''}` || 'Unknown Location',
                contact: { phone: listing.phone || 'Not Available' },
                hasWhatsApp: listing.hasWhatsApp || false,
                hasEnquiry: listing.hasEnquiry || false,
                category: listing.category || 'Unknown Category',
                city: listing.city || 'Unknown City',
              };

              return (
                <div
                  key={index}
                  className="border rounded-xl p-6 bg-white dark:bg-gray-800 shadow-sm mb-6 py-8"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start gap-4">
                      <img
                        src={business.image}
                        alt={`${business.name} logo`}
                        className="w-40 h-40 rounded-md object-cover border"
                      />
                      <div className="flex-1">
                        <h3 className="text-2xl font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                          <ThumbsUp className="w-5 h-5 !text-white !bg-black p-1 rounded-md dark:!bg-gray-700 dark:!text-gray-200" />
                          {business.name}
                        </h3>

                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge className="!bg-green-600 !text-white px-2 py-0.5 text-sm flex items-center gap-1 dark:!bg-green-700 dark:!text-gray-100">
                            {business.rating}
                            <Star className="w-3 h-3 !text-yellow-300 !bg-yellow-600 dark:!text-yellow-200 dark:!bg-yellow-700" />
                          </Badge>

                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {business.total_ratings}
                          </span>

                          {business.badges.includes('Trust') && (
                            <Badge className="!bg-yellow-400 !text-black text-xs dark:!bg-yellow-500 dark:!text-gray-900">
                              Trust
                            </Badge>
                          )}
                          {business.badges.includes('Verified') && (
                            <Badge className="!bg-blue-500 !text-white text-xs dark:!bg-blue-600 dark:!text-gray-100">
                              Verified
                            </Badge>
                          )}
                          {business.badges.includes('Claimed') && (
                            <Badge className="!bg-black !text-white text-xs dark:!bg-gray-900 dark:!text-gray-100">
                              Claimed
                            </Badge>
                          )}
                        </div>

                        <div className="mt-4 flex gap-1 flex-wrap">
                          {business.services.map((service, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs !bg-gray-100 !text-gray-800 dark:!bg-gray-700 dark:!text-gray-200"
                            >
                              {service}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex flex-wrap gap-4 mt-4">
                          <Button
                            variant="default"
                            className="!bg-green-600 hover:!bg-green-700 !text-white px-4 py-3 flex items-center gap-2 text-sm dark:!bg-green-700 dark:hover:!bg-green-800"
                          >
                            <Phone className="w-5 h-5 animate-shake" />
                            <span>{business.contact.phone}</span>
                          </Button>

                          {business.hasEnquiry && (
                            <Button
                              variant="outline"
                              className="border !border-blue-600 !bg-blue-600 hover:!bg-blue-400 hover:!text-white !text-white px-4 py-3 flex items-center gap-2 text-sm dark:!border-blue-700 dark:!bg-blue-700 dark:hover:!bg-blue-500"
                            >
                              <MessageSquare className="w-5 h-5" />
                              <span>Enquire Now</span>
                            </Button>
                          )}

                          {business.hasWhatsApp && (
                            <Button
                              variant="outline"
                              className="border !border-green-600 !text-green-600 hover:!bg-green-50 px-4 py-3 flex items-center gap-2 text-sm dark:!border-green-700 dark:!text-green-400 dark:hover:!bg-green-900"
                            >
                              <MessageCircle className="w-5 h-5" />
                              <span>WhatsApp</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="lg:w-1/3 w-full fixed top-6 right-0 pr-4 mt-20">
          <div className="p-4 border rounded-lg shadow-md bg-white dark:bg-gray-800 max-w-sm mx-auto lg:mx-0">
            <h2 className="text-2xl font-bold mb-4">
              Get the List of <span className="text-blue-600">{category}</span>
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              We'll send you contact details in seconds <span className="font-semibold">for free</span>
            </p>
            <form className="space-y-4" onSubmit={handleFormSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  What kind of Assistance do you need?
                </label>
                <input
                  type="text"
                  name="assistance"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  placeholder="Enter assistance needed"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mobile Number
                </label>
                <input
                  type="text"
                  name="mobile"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  placeholder="Enter your mobile number"
                  required
                />
              </div>
              <div className="mt-4">
                <button
                  type="submit"
                  className="w-full bg-blue-700 hover:bg-blue-600 text-white py-1 rounded-lg dark:bg-blue-600 dark:hover:bg-blue-500"
                >
                  Send Enquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}