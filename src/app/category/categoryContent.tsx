// src/components/CategoryContent.tsx
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Share2, MapPin, Phone, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import FilterBar from './FilterBar';

// Define interfaces
interface BusinessContact {
  phone: string;
}

interface BusinessListing {
  name: string;
  rating: string;
  totalRatings: string;
  badges: string[];
  address: string;
  city: string;
  pincode: string;
  contact: BusinessContact;
  category: string;
  services: string[];
  tags?: string[];
  images: { url: string }[];
  imageError: string | null;
  isTrusted?: boolean;
  isVerified?: boolean;
  isPopular?: boolean;
}

interface ListingsApiResponse {
  success: boolean;
  data?: BusinessListing[];
  error?: string;
}

interface ImagesApiResponse {
  success: boolean;
  images?: { url: string }[];
  total?: number;
  searchedPaths?: string[];
  cacheHit?: boolean;
  error?: string;
  details?: string;
}

const debounce = <T extends (...args: unknown[]) => void>(func: T, delay: number) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

const generateRandomPhone = (): string => {
  const firstDigit = Math.floor(Math.random() * 4) + 6;
  const randomNum = Math.floor(Math.random() * 900000000) + 100000000;
  return `+91${firstDigit}${randomNum}`;
};

const CategoryContent: React.FC = () => {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<BusinessListing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentImageIndices, setCurrentImageIndices] = useState<Record<number, number>>({});

  // Sorting and filtering states
  const [sortOption, setSortOption] = useState<string>('default');
  const [topRatedSort, setTopRatedSort] = useState<string | null>(null);
  const [sortByVerified, setSortByVerified] = useState<boolean>(false);
  const [sortByTrusted, setSortByTrusted] = useState<boolean>(false);
  const [ratingSort, setRatingSort] = useState<number | null>(null);

  // Get query parameters with null checks
  const query = searchParams ? searchParams.get('query') : null;
  const selectedCategory = searchParams ? searchParams.get('category') : null;
  const selectedTag = searchParams ? searchParams.get('tag') : null;
  const selectedName = searchParams ? searchParams.get('name') : null;
  const selectedAddress = searchParams ? searchParams.get('address') : null;
  const selectedCity = searchParams ? searchParams.get('city') : null;
  const selectedPincode = searchParams ? searchParams.get('pincode') || '560062' : '560062';

  const fetchListings = useCallback(
    (
      params: {
        query: string | null;
        category: string | null;
        tag: string | null;
        name: string | null;
        address: string | null;
        city: string | null;
        pincode: string;
      },
      sort: string | null,
      sortFields: { sortByVerified: boolean; sortByTrusted: boolean; ratingSort: number | null }
    ) => {
      const debouncedFetch = debounce(async () => {
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
          if (sortFields.ratingSort !== null) queryParams.append('sortByRating', sortFields.ratingSort.toString());

          const response = await fetch(`/api/getListings?${queryParams.toString()}`, { cache: 'no-store' });
          if (!response.ok) {
            console.error(`HTTP error: ${response.status}`);
            setListings([]);
            return;
          }

          const result: ListingsApiResponse = await response.json();
          if (result.success && Array.isArray(result.data) && result.data.length > 0) {
            const imagePromises = result.data.map((listing) =>
              fetch(`/api/getImagesByCategory?category=${encodeURIComponent(listing.category)}`, { cache: 'no-store' })
                .then((res) => res.json().then((data: ImagesApiResponse) => ({ category: listing.category, data })))
                .catch(() => ({
                  category: listing.category,
                  data: { success: false, images: [], searchedPaths: [] } as ImagesApiResponse,
                }))
            );

            const imageResults = await Promise.all(imagePromises);
            const imageMap = Object.fromEntries(imageResults.map(({ category, data }) => [category, data]));
            const listingsWithImages = result.data.map((listing) => ({
              ...listing,
              images: imageMap[listing.category]?.images || [],
              imageError: imageMap[listing.category]?.images?.length
                ? null
                : `No images found for ${listing.category}. Searched paths: ${imageMap[listing.category]?.searchedPaths?.join(', ') || 'Unknown'}`,
            }));

            setListings(listingsWithImages);
            setCurrentImageIndices({}); // Reset image indices on new fetch
          } else {
            setListings([]);
          }
        } catch (err: unknown) {
          if (err instanceof Error) {
            console.error('Fetch error:', err.message);
          } else {
            console.error('Fetch error:', err);
          }
          setListings([]);
        } finally {
          setLoading(false);
        }
      }, 1000);
      debouncedFetch();
    },
    []
  );

  useEffect(() => {
    let sort: string | null = null;
    if (topRatedSort === 'desc') sort = 'totalRatings-desc';
    else if (topRatedSort === 'asc') sort = 'totalRatings-asc';
    else if (sortOption === 'rating') sort = 'rating';
    const sortFields = { sortByVerified, sortByTrusted, ratingSort };
    const params = { query, category: selectedCategory, tag: selectedTag, name: selectedName, address: selectedAddress, city: selectedCity, pincode: selectedPincode };
    fetchListings(params, sort, sortFields);
  }, [fetchListings, query, selectedCategory, selectedTag, selectedName, selectedAddress, selectedCity, selectedPincode, sortOption, topRatedSort, sortByVerified, sortByTrusted, ratingSort]);

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        let sort: string | null = null;
        if (topRatedSort === 'desc') sort = 'totalRatings-desc';
        else if (topRatedSort === 'asc') sort = 'totalRatings-asc';
        else if (sortOption === 'rating') sort = 'rating';
        const sortFields = { sortByVerified, sortByTrusted, ratingSort };
        const params = { query, category: selectedCategory, tag: selectedTag, name: selectedName, address: selectedAddress, city: selectedCity, pincode: selectedPincode };
        fetchListings(params, sort, sortFields);
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [fetchListings, query, selectedCategory, selectedTag, selectedName, selectedAddress, selectedCity, selectedPincode, sortOption, topRatedSort, sortByVerified, sortByTrusted, ratingSort]);

  const clearAllFilters = () => {
    setSortOption('default');
    setTopRatedSort(null);
    setSortByVerified(false);
    setSortByTrusted(false);
    setRatingSort(null);
    const params = { query, category: selectedCategory, tag: selectedTag, name: selectedName, address: selectedAddress, city: selectedCity, pincode: selectedPincode };
    fetchListings(params, null, { sortByVerified: false, sortByTrusted: false, ratingSort: null });
  };

  const handlePrevImage = (listingIndex: number, imageCount: number) => {
    setCurrentImageIndices((prev) => ({
      ...prev,
      [listingIndex]: ((prev[listingIndex] || 0) - 1 + imageCount) % imageCount,
    }));
  };

  const handleNextImage = (listingIndex: number, imageCount: number) => {
    setCurrentImageIndices((prev) => ({
      ...prev,
      [listingIndex]: ((prev[listingIndex] || 0) + 1) % imageCount,
    }));
  };

  if (loading) {
    return <div className="p-6 text-gray-600 dark:text-gray-300">Loading...</div>;
  }

  return (
    <div className="h-full p-5 bg-gray-100 dark:bg-black">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        {selectedCategory || 'Businesses'} in {selectedCity || 'Your Area'}
      </h1>
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
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
          Showing results for:{' '}
          {query && <span>Search: "{query}"</span>}
          {query && (selectedPincode !== '560062' || selectedCity || selectedCategory || selectedTag || selectedName || selectedAddress) && ', '}
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
        </p>
      )}
      {listings.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">No businesses found for your query.</p>
      ) : (
        <div className="space-y-6">
          {listings.map((listing, index) => {
            const business: BusinessListing = {
              services: Array.isArray(listing?.tags) ? listing.tags : [],
              images: Array.isArray(listing?.images) ? listing.images : [],
              imageError: listing?.imageError || null,
              name: listing?.name || 'Unknown Business',
              rating: listing?.rating ? parseFloat(listing.rating).toFixed(1) : '4.0',
              totalRatings: listing?.totalRatings ? `${parseInt(listing.totalRatings).toLocaleString()}` : '0',
              badges: [listing?.isTrusted && 'Trust', listing?.isVerified && 'Verified', listing?.isPopular && 'Claimed'].filter(Boolean) as string[],
              address: listing?.address || 'Unknown Address',
              city: listing?.city || 'Unknown City',
              pincode: listing?.pincode || '560062',
              contact: { phone: listing?.contact?.phone || generateRandomPhone() },
              category: listing?.category || 'Unknown Category',
            };

            const currentImageIndex = currentImageIndices[index] || 0;
            const imageCount = business.images.length;

            return (
              <div
                key={index}
                className="relative flex flex-col sm:flex-row bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Floating Action Buttons */}
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                  <button
                    aria-label="Share"
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
                    onClick={() => alert('Share functionality not implemented')}
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button
                    aria-label="Like"
                    className="text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors"
                    onClick={() => alert('Like functionality not implemented')}
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                </div>

                {/* Image Section */}
                <div className="sm:w-1/3 w-full h-56 sm:h-auto relative">
                  {business.imageError ? (
                    <div className="w-full h-full rounded-t-xl sm:rounded-l-xl bg-gray-100 dark:bg-gray-700 text-red-500 dark:text-red-400 flex items-center justify-center text-sm text-center p-2">
                      {business.imageError}
                    </div>
                  ) : business.images.length > 0 ? (
                    <>
                      <Image
                        src={business.images[currentImageIndex]?.url || '/placeholder-image.jpg'}
                        alt={`${business.name} image ${currentImageIndex + 1}`}
                        className="object-cover w-full h-full rounded-t-xl sm:rounded-l-xl"
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-image.jpg';
                          console.error(`Failed to load image ${business.images[currentImageIndex]?.url}`);
                        }}
                      />
                      {imageCount > 1 && (
                        <>
                          {/* Navigation Buttons */}
                          <button
                            aria-label="Previous image"
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition"
                            onClick={() => handlePrevImage(index, imageCount)}
                          >
                            <ChevronLeft className="w-5 h-5" />
                          </button>
                          <button
                            aria-label="Next image"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition"
                            onClick={() => handleNextImage(index, imageCount)}
                          >
                            <ChevronRight className="w-5 h-5" />
                          </button>
                          {/* Image Counter */}
                          <div className="absolute bottom-2 right-2 bg-gray-800 bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                            {currentImageIndex + 1}/{imageCount}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full rounded-t-xl sm:rounded-l-xl bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center text-sm">
                      No images available
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{business.name}</h2>
                    <div className="flex items-center gap-2 mt-2">
                      {/* Inline StarRating */}
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < Math.floor(parseFloat(business.rating)) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-gray-800 dark:text-gray-300 text-sm">({business.totalRatings})</span>
                    </div>
                    <p className="mt-3 text-gray-700 dark:text-gray-300">Top-rated {business.category.toLowerCase()} services in {business.city}.</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {business.services.map((service, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 text-sm px-2 py-1 rounded-full"
                        >
                          {service}
                        </span>
                      ))}
                      {business.badges.map((badge, idx) => (
                        <span
                          key={idx}
                          className={
                            badge === 'Trust'
                              ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-300 text-sm px-2 py-1 rounded-full'
                              : badge === 'Verified'
                              ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 text-sm px-2 py-1 rounded-full'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm px-2 py-1 rounded-full'
                          }
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-end mt-6 flex-wrap gap-4">
                    <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-300">
                      <a href={`tel:${business.contact.phone}`} aria-label="Call" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                        <Phone className="w-4 h-4" />
                        {business.contact.phone}
                      </a>
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(`${business.address}, ${business.city}, ${business.pincode}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Directions"
                        className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                      >
                        <MapPin className="w-4 h-4" />
                        Directions
                      </a>
                      <Link
                        href={`/category?category=${encodeURIComponent(business.category)}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                      >
                        Visit
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategoryContent;