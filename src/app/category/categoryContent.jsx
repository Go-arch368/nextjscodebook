'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThumbsUp, Star, Phone, MessageSquare, MessageCircle, MapPin, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import FilterBar from './FilterBar';

function debounce(func, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

function generateRandomPhone() {
  const firstDigit = Math.floor(Math.random() * 4) + 6;
  const randomNum = Math.floor(Math.random() * 900000000) + 100000000;
  return `+91${firstDigit}${randomNum}`;
}

export default function CategoryContent() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndices, setSelectedImageIndices] = useState({});

  // Sorting and filtering states
  const [sortOption, setSortOption] = useState('default');
  const [topRatedSort, setTopRatedSort] = useState(null);
  const [sortByVerified, setSortByVerified] = useState(false);
  const [sortByTrusted, setSortByTrusted] = useState(false);
  const [ratingSort, setRatingSort] = useState(null);

  // Get query parameters
  const query = searchParams.get('query');
  const selectedCategory = searchParams.get('category');
  const selectedTag = searchParams.get('tag');
  const selectedName = searchParams.get('name');
  const selectedAddress = searchParams.get('address');
  const selectedCity = searchParams.get('city');
  const selectedPincode = searchParams.get('pincode') || '560062';

  const fetchListings = useCallback(
    debounce(async (params, sort, sortFields) => {
      try {
        setLoading(true);

        const queryParams = new URLSearchParams();
        if (params.query) queryParams.append('query', params.query);
        if (params.category) queryParams.append('category', params.category);
        if (params.tag) queryParams.append('tag', params.tag);
        if (params.name) queryParams.append('name', params.name);
        if (params.address) queryParams.append('address', params.address);
        if (params.city) queryParams.append('city', params.city);
        queryParams.append('pincode', params.pincode);

        if (sort) queryParams.append('sort', sort);
        if (sortFields.sortByVerified) queryParams.append('sortByVerified', 'true');
        if (sortFields.sortByTrusted) queryParams.append('sortByTrusted', 'true');
        if (sortFields.ratingSort) queryParams.append('sortByRating', sortFields.ratingSort);

        console.log('Fetching listings with URL:', `/api/getListings?${queryParams.toString()}`);
        const response = await fetch(`/api/getListings?${queryParams.toString()}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          console.error(`HTTP error: ${response.status}`);
          setListings([]);
          return;
        }

        const result = await response.json();
        console.log('API response:', result);

        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          const imagePromises = result.data.map((listing) =>
            fetch(`/api/getImagesByCategory?category=${encodeURIComponent(listing.category)}`, {
              cache: 'no-store',
            })
              .then((res) => res.json().then((data) => {
                console.log(`Image API response for ${listing.category}:`, data);
                return { category: listing.category, data };
              }))
              .catch((error) => {
                console.error(`Failed to fetch images for ${listing.category}: ${error.message}`);
                return { category: listing.category, data: { images: [], searchedPaths: [] } };
              })
          );

          const imageResults = await Promise.all(imagePromises);
          const imageMap = Object.fromEntries(
            imageResults.map(({ category, data }) => [category, data])
          );

          const listingsWithImages = result.data.map((listing) => ({
            ...listing,
            images: imageMap[listing.category]?.images || [],
            imageError: imageMap[listing.category]?.images?.length
              ? null
              : `No images found for ${listing.category}. Searched paths: ${imageMap[listing.category]?.searchedPaths?.join(', ') || 'Unknown'}`,
          }));

          setListings(listingsWithImages);
          const initialSelectedIndices = {};
          listingsWithImages.forEach((_, index) => {
            initialSelectedIndices[index] = 0;
          });
          setSelectedImageIndices(initialSelectedIndices);
        } else {
          setListings([]);
        }
      } catch (err) {
        console.error('Fetch error:', err.message);
        setListings([]);
      } finally {
        setLoading(false);
      }
    }, 1000),
    []
  );

  useEffect(() => {
    let sort = null;
    if (topRatedSort === 'desc') {
      sort = 'totalRatings-desc';
    } else if (topRatedSort === 'asc') {
      sort = 'totalRatings-asc';
    } else if (sortOption === 'rating') {
      sort = 'rating';
    }
    const sortFields = { sortByVerified, sortByTrusted, ratingSort };
    const params = {
      query,
      category: selectedCategory,
      tag: selectedTag,
      name: selectedName,
      address: selectedAddress,
      city: selectedCity,
      pincode: selectedPincode,
    };
    fetchListings(params, sort, sortFields);
  }, [
    fetchListings,
    query,
    selectedCategory,
    selectedTag,
    selectedName,
    selectedAddress,
    selectedCity,
    selectedPincode,
    sortOption,
    topRatedSort,
    sortByVerified,
    sortByTrusted,
    ratingSort,
  ]);

  useEffect(() => {
    const handlePageShow = (event) => {
      if (event.persisted) {
        console.log('Page restored from cache, refetching listings');
        let sort = null;
        if (topRatedSort === 'desc') {
          sort = 'totalRatings-desc';
        } else if (topRatedSort === 'asc') {
          sort = 'totalRatings-asc';
        } else if (sortOption === 'rating') {
          sort = 'rating';
        }
        const sortFields = { sortByVerified, sortByTrusted, ratingSort };
        const params = {
          query,
          category: selectedCategory,
          tag: selectedTag,
          name: selectedName,
          address: selectedAddress,
          city: selectedCity,
          pincode: selectedPincode,
        };
        fetchListings(params, sort, sortFields);
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [
    fetchListings,
    query,
    selectedCategory,
    selectedTag,
    selectedName,
    selectedAddress,
    selectedCity,
    selectedPincode,
    sortOption,
    topRatedSort,
    sortByVerified,
    sortByTrusted,
    ratingSort,
  ]);

  const handleSelectImage = (listingIndex, imageIndex) => {
    setSelectedImageIndices((prev) => ({
      ...prev,
      [listingIndex]: imageIndex,
    }));
  };

  const handleEnquireNow = (businessName) => {
    alert(`Enquiry sent for ${businessName}! Our team will contact you soon.`);
  };

  const handleVisit = (businessName, category) => {
    try {
      localStorage.setItem('lastVisitedCategory', category);
      localStorage.setItem('lastVisitedBusiness', businessName);
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }

    const categoryRoutes = {
      'Best Hospitals': '/template?websiteIdentifier=Health%26Medical-Hospital-560038',
      'Best Clinics': '/template?websiteIdentifier=Health%26Medical-Clinics-560038',
      'Best Dentists': '/template?websiteIdentifier=Health%26Medical-Dentists-560062',
      Chemists: '/template?websiteIdentifier=Health%26Medical-Pharmacies-560098',
      'Best Veterinarians': '/template?websiteIdentifier=Health%26Medical-Veterinary-560076',
      'Car Repair': '/template?websiteIdentifier=Automobile-CarRepair-560062',
      'Car Showrooms': '/template?websiteIdentifier=Automobile-CarSales-560062',
      'Tyre Dealers': '/template?websiteIdentifier=Automobile-Tires-560064',
      Autospares: '/template?websiteIdentifier=Automobile-AutoParts-560062',
      'Best Physiotherapists': '/template?websiteIdentifier=Health&Medical-Physiotherapy-560025',
    };

    const url = categoryRoutes[category] || '/category';
    window.location.href = url;
  };

  const clearAllFilters = () => {
    setSortOption('default');
    setTopRatedSort(null);
    setSortByVerified(false);
    setSortByTrusted(false);
    setRatingSort(null);
    const params = {
      query,
      category: selectedCategory,
      tag: selectedTag,
      name: selectedName,
      address: selectedAddress,
      city: selectedCity,
      pincode: selectedPincode,
    };
    fetchListings(params, null, {});
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-600 dark:text-gray-300">
        Loading listings, please wait...
      </div>
    );
  }

  return (
    <div className="relative flex justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-6xl px-4 py-6">
        {/* Conditionally render FilterBar only when listings exist */}
        {listings.length > 0 && (
          <FilterBar
            sortOption={sortOption}
            setSortOption={setSortOption}
            topRatedSort={topRatedSort}
            setTopRatedSort={setTopRatedSort}
            sortByVerified={sortByVerified}
            setSortByVerified={setSortByVerified}
            sortByTrusted={sortByTrusted}
            setSortByTrusted={setSortByTrusted}
            ratingSort={ratingSort}
            setRatingSort={setRatingSort}
            selectedPincode={selectedPincode}
            selectedCity={selectedCity}
            clearAllFilters={clearAllFilters}
          />
        )}

        {(query || selectedPincode !== '560062' || selectedCity || selectedCategory || selectedTag || selectedName || selectedAddress) && (
          <div className="mb-6 text-sm text-gray-600 dark:text-gray-300 pt-20 flex justify-center">
            Showing results for:{' '}
            {query && <span>Search: "{query}"</span>}
            {(query && (selectedPincode !== '560062' || selectedCity || selectedCategory || selectedTag || selectedName || selectedAddress)) && ', '}
            {selectedCategory && <span>Category: {selectedCategory}</span>}
            {(query || selectedCategory) && (selectedPincode !== '560062' || selectedCity || selectedTag || selectedName || selectedAddress) && ', '}
            {selectedTag && <span>Tag: {selectedTag}</span>}
            {(query || selectedCategory || selectedTag) && (selectedPincode !== '560062' || selectedCity || selectedName || selectedAddress) && ', '}
            {selectedName && <span>Name: {selectedName}</span>}
            {(query || selectedCategory || selectedTag || selectedName) && (selectedPincode !== '560062' || selectedCity || selectedAddress) && ', '}
            {selectedAddress && <span>Address: {selectedAddress}</span>}
            {(query || selectedCategory || selectedTag || selectedName || selectedAddress) && (selectedPincode !== '560062' || selectedCity) && ', '}
            {selectedCity && <span>City: {selectedCity}</span>}
            {(query || selectedCategory || selectedTag || selectedName || selectedAddress || selectedCity) && selectedPincode !== '560062' && ', '}
            {selectedPincode !== '560062' && <span>Pincode: {selectedPincode}</span>}
          </div>
        )}

        <div className="flex flex-col gap-6 pt-0">
          <div className="w-full flex justify-center">
            <div className="w-full max-w-4xl">
              {listings.length === 0 ? (
                <div className="text-center text-gray-600 dark:text-gray-300 py-10 mt-20">
                  No listings found for your query. Try adjusting your search or filters.
                </div>
              ) : (
                listings.map((listing, index) => {
                  const business = {
                    services: Array.isArray(listing?.tags) ? listing.tags : [],
                    images: Array.isArray(listing?.images) ? listing.images : [],
                    imageError: listing?.imageError || null,
                    name: listing?.name || 'Napc Airlines',
                    rating: listing?.rating ? parseFloat(listing.rating).toFixed(1) : '4.8',
                    totalRatings: listing?.totalRatings
                      ? `${parseInt(listing.totalRatings).toLocaleString()} Ratings`
                      : '10,885 Ratings',
                    badges: [
                      listing?.isTrusted && 'Trust',
                      listing?.isVerified && 'Verified',
                      listing?.isPopular && 'Claimed',
                    ].filter(Boolean),
                    address: listing?.address || 'Dickenson Road',
                    city: listing?.city || 'Bangalore, Konanakunte, Bangalore',
                    pincode: listing?.pincode || '560062',
                    contact: { phone: listing?.phone || generateRandomPhone() },
                    category: listing?.category || 'Airlines',
                  };

                  const selectedImageIndex = selectedImageIndices[index] || 0;
                  const totalImages = business.images.length;

                  return (
                    <div
                      key={index}
                      className="border rounded-md p-4 bg-white dark:bg-gray-800 shadow-md mb-6"
                    >
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row items-start gap-6">
                          {/* Image Section with Navigation Arrows */}
                          <div className="relative w-full md:w-1/3 max-w-[384px]">
                            {business.imageError ? (
                              <div className="w-64 h-64 rounded-lg bg-gray-100 dark:bg-gray-700 text-red-500 dark:text-red-400 flex items-center justify-center text-sm text-center p-2">
                                {business.imageError}
                              </div>
                            ) : business.images.length > 0 ? (
                              <>
                                {/* Display Selected Image */}
                                <img
                                  src={
                                    business.images[selectedImageIndex]?.url?.includes('/upload/')
                                      ? business.images[selectedImageIndex].url.replace(/\/upload\//, '/upload/w_384,h_256,c_fill/')
                                      : business.images[selectedImageIndex]?.url || '/placeholder-image.jpg'
                                  }
                                  alt={`${business.name} image ${selectedImageIndex + 1}`}
                                  className="w-96 h-64 rounded-lg object-cover border"
                                  loading="lazy"
                                  onError={(e) => {
                                    e.target.src = '/placeholder-image.jpg';
                                    console.error(`Failed to load image ${business.images[selectedImageIndex]?.url}`);
                                  }}
                                />

                                {/* Navigation Arrows */}
                                {totalImages > 1 && (
                                  <>
                                    {/* Left Arrow (shown if not on the first image) */}
                                    {selectedImageIndex > 0 && (
                                      <button
                                        onClick={() => handleSelectImage(index, selectedImageIndex - 1)}
                                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-900 bg-opacity-70 dark:bg-gray-800 dark:bg-opacity-70 p-2 rounded-full shadow-md hover:bg-opacity-90 dark:hover:bg-opacity-90 transition-all duration-300 hover:scale-110"
                                        aria-label="Previous image"
                                      >
                                        <ChevronLeft className="w-4 h-4 text-white dark:text-gray-300" />
                                      </button>
                                    )}

                                    {/* Right Arrow (shown if not on the last image) */}
                                    {selectedImageIndex < totalImages - 1 && (
                                      <button
                                        onClick={() => handleSelectImage(index, selectedImageIndex + 1)}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-900 bg-opacity-70 dark:bg-gray-800 dark:bg-opacity-70 p-2 rounded-full shadow-md hover:bg-opacity-90 dark:hover:bg-opacity-90 transition-all duration-300 hover:scale-110"
                                        aria-label="Next image"
                                      >
                                        <ChevronRight className="w-4 h-4 text-white dark:text-gray-300" />
                                      </button>
                                    )}
                                  </>
                                )}
                              </>
                            ) : (
                              <div className="w-64 h-64 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center text-sm">
                                No images available
                              </div>
                            )}
                          </div>

                          {/* Content Section (Right) */}
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                              <ThumbsUp className="w-5 h-5 bg-blue-600 text-white p-1 rounded-full dark:bg-blue-500" />
                              {business.name}
                            </h3>

                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <Badge className="bg-green-600 text-white px-2 py-1 text-sm flex items-center gap-1 dark:bg-green-700">
                                {business.rating}
                                <Star className="ml-1 h-3 w-3 text-white fill-current" />
                              </Badge>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {business.totalRatings}
                              </span>
                              {business.badges.map((badge, idx) => (
                                <Badge
                                  key={idx}
                                  className={
                                    badge === 'Trust'
                                      ? 'bg-yellow-400 text-black text-xs dark:bg-yellow-500 dark:text-gray-900'
                                      : badge === 'Verified'
                                      ? 'bg-blue-500 text-white text-xs dark:bg-blue-600 dark:text-gray-100'
                                      : 'bg-gray-100 text-gray-800 text-xs dark:bg-gray-700 dark:text-gray-200'
                                  }
                                >
                                  {badge}
                                </Badge>
                              ))}
                            </div>

                            <div className="text-sm text-gray-600 dark:text-gray-300 mt-2 flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {business.address}, {business.city}
                              {business.pincode && `, ${business.pincode}`}
                            </div>

                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              Category: {business.category}
                            </div>

                            <div className="mt-4 flex gap-2 flex-wrap">
                              {business.services.map((service, idx) => (
                                <Badge
                                  key={idx}
                                  variant="secondary"
                                  className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                >
                                  {service}
                                </Badge>
                              ))}
                            </div>

                            <div className="mt-6">
                              <div className="flex flex-wrap gap-4">
                                <Button
                                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 flex items-center gap-2 text-sm dark:bg-green-700 dark:hover:bg-green-800 rounded-md"
                                >
                                  <Phone className="w-5 h-5" />
                                  <span>{business.contact.phone}</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 flex items-center gap-2 text-sm dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900 rounded-md"
                                  onClick={() => handleEnquireNow(business.name)}
                                >
                                  <MessageSquare className="w-5 h-5" />
                                  <span>Enquire Now</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  className="border border-green-600 text-green-600 hover:bg-green-50 px-4 py-2 flex items-center gap-2 text-sm dark:border-green-500 dark:text-green-400 dark:hover:bg-green-900 rounded-md"
                                >
                                  <MessageCircle className="w-5 h-5" />
                                  <span>WhatsApp</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 flex items-center gap-2 text-sm dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900 rounded-md"
                                  onClick={() => handleVisit(business.name, business.category)}
                                >
                                  <ExternalLink className="w-5 h-5" />
                                  <span>Visit</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}