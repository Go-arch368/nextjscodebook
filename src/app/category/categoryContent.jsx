// components/CategoryContent.jsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThumbsUp, Star, Phone, MessageSquare, MessageCircle, MapPin, ExternalLink, ChevronDown, X, SlidersHorizontal } from 'lucide-react';

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
  const [error, setError] = useState(null);
  const [visibleImages, setVisibleImages] = useState({});

  // Sorting and filtering states
  const [sortOption, setSortOption] = useState('default');
  const [topRatedSort, setTopRatedSort] = useState(null);
  const [sortByVerified, setSortByVerified] = useState(false);
  const [sortByTrusted, setSortByTrusted] = useState(false);
  const [ratingSort, setRatingSort] = useState(null);

  // Staged states for filter modal
  const [stagedSortOption, setStagedSortOption] = useState('default');
  const [stagedTopRatedSort, setStagedTopRatedSort] = useState(null);
  const [stagedSortByVerified, setStagedSortByVerified] = useState(false);
  const [stagedSortByTrusted, setStagedSortByTrusted] = useState(false);
  const [stagedRatingSort, setStagedRatingSort] = useState(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRatingDropdownOpen, setIsRatingDropdownOpen] = useState(false);
  const [showAllFilters, setShowAllFilters] = useState(false);

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
        setError(null);

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
          throw new Error(`HTTP error: ${response.status}`);
        }
        const result = await response.json();
        console.log('API response:', result);

        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          const imagePromises = result.data.map((listing) =>
            fetch(`/api/getImagesByCategory?category=${encodeURIComponent(listing.category)}`, {
              cache: 'no-store',
            })
              .then((res) => res.json().then((data) => ({ category: listing.category, data })))
              .catch((error) => {
                console.error(`Failed to fetch images for ${listing.category}: ${error.message}`);
                return { category: listing.category, data: { images: [] } };
              })
          );

          const imageResults = await Promise.all(imagePromises);
          const imageMap = Object.fromEntries(
            imageResults.map(({ category, data }) => [category, data.images || []])
          );

          const listingsWithImages = result.data.map((listing) => ({
            ...listing,
            images: imageMap[listing.category] || [],
            imageError: imageMap[listing.category]?.length ? null : `No images found for ${listing.category}`,
          }));

          setListings(listingsWithImages);
          const initialVisibleImages = {};
          listingsWithImages.forEach((_, index) => {
            initialVisibleImages[index] = 1;
          });
          setVisibleImages(initialVisibleImages);
        } else {
          setListings([]);
          setError(result.message || 'No listings found for the given query');
        }
      } catch (err) {
        console.error('Fetch error:', err.message);
        setError(`Unable to load listings: ${err.message}`);
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

  useEffect(() => {
    if (showAllFilters) {
      setStagedSortOption(sortOption);
      setStagedTopRatedSort(topRatedSort);
      setStagedSortByVerified(sortByVerified);
      setStagedSortByTrusted(sortByTrusted);
      setStagedRatingSort(ratingSort);
    }
  }, [showAllFilters, sortOption, topRatedSort, sortByVerified, sortByTrusted, ratingSort]);

  const handleShowMoreImages = (listingIndex) => {
    setVisibleImages((prev) => ({
      ...prev,
      [listingIndex]: (prev[listingIndex] || 1) + 5,
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

  const resetAllFilters = () => {
    setStagedSortOption('default');
    setStagedTopRatedSort(null);
    setStagedSortByVerified(false);
    setStagedSortByTrusted(false);
    setStagedRatingSort(null);
  };

  const applyFilters = () => {
    setSortOption(stagedSortOption);
    setTopRatedSort(stagedTopRatedSort);
    setSortByVerified(stagedSortByVerified);
    setSortByTrusted(stagedSortByTrusted);
    setRatingSort(stagedRatingSort);
    setShowAllFilters(false);
  };

  const clearAllFilters = () => {
    setSortOption('default');
    setTopRatedSort(null);
    setSortByVerified(false);
    setSortByTrusted(false);
    setRatingSort(null);
    setStagedSortOption('default');
    setStagedTopRatedSort(null);
    setStagedSortByVerified(false);
    setStagedSortByTrusted(false);
    setStagedRatingSort(null);
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

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500 dark:text-red-400">
        <div className="text-center">
          {error}
          <Button
            onClick={() => {
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
            }}
            className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-6xl px-4 py-6">
        {(query || selectedPincode !== '560062' || selectedCity || selectedCategory || selectedTag || selectedName || selectedAddress) && (
          <div className="mb-6 text-sm text-gray-600 dark:text-gray-300 pt-20">
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

        <div
          className="dark:bg-gray-800 p-4 rounded-lg w-full z-40 flex justify-between items-center mx-auto -mt-5 bg-white shadow-md"
          style={{
            position: 'fixed',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: '1280px',
            width: '100%',
            zIndex: 40,
          }}
        >
          <div className="flex flex-wrap items-center gap-3 mx-auto">
            <div className="relative">
              <Button
                onClick={() => {
                  setIsDropdownOpen(!isDropdownOpen);
                  setTopRatedSort(null);
                  setStagedTopRatedSort(null);
                }}
                className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 flex items-center gap-2 px-4 py-2 rounded-md"
                aria-label="sort-options"
                aria-expanded={isDropdownOpen}
              >
                Sort by: {sortOption === 'rating' ? 'Rating' : 'Default'}
                <ChevronDown className="h-4 w-4" />
              </Button>
              {isDropdownOpen && (
                <div className="absolute z-50 mt-2 bg-white rounded-md shadow-lg w-40 dark:bg-gray-700">
                  <button
                    onClick={() => {
                      setSortOption('default');
                      setStagedSortOption('default');
                      setIsDropdownOpen(false);
                    }}
                    className="block w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600"
                  >
                    Default
                  </button>
                  <button
                    onClick={() => {
                      setSortOption('rating');
                      setStagedSortOption('rating');
                      setIsDropdownOpen(false);
                    }}
                    className="block w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600"
                  >
                    Rating
                  </button>
                </div>
              )}
            </div>

            <Button
              onClick={() => {
                setSortOption('default');
                setStagedSortOption('default');
                const newTopRatedSort = topRatedSort === 'desc' ? 'asc' : topRatedSort === 'asc' ? null : 'desc';
                setTopRatedSort(newTopRatedSort);
                setStagedTopRatedSort(newTopRatedSort);
              }}
              className={`${
                topRatedSort === 'desc'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : topRatedSort === 'asc'
                  ? 'bg-blue-400 text-white hover:bg-blue-500'
                  : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
              } px-4 py-2 flex items-center gap-1 rounded-md`}
            >
              <Star className="h-4 w-4" /> Top Rated {topRatedSort === 'desc' ? '↓' : topRatedSort === 'asc' ? '↑' : ''}
            </Button>

            <Button
              onClick={() => {
                const newSortByVerified = !sortByVerified;
                setSortByVerified(newSortByVerified);
                setStagedSortByVerified(newSortByVerified);
              }}
              className={`${
                sortByVerified
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
              } px-4 py-2 rounded-md`}
            >
              DB Verified
            </Button>

            <Button
              onClick={() => {
                const newSortByTrusted = !sortByTrusted;
                setSortByTrusted(newSortByTrusted);
                setStagedSortByTrusted(newSortByTrusted);
              }}
              className={`${
                sortByTrusted
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                  : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
              } px-4 py-2 rounded-md`}
            >
              DB Trust
            </Button>

            <div className="relative">
              <Button
                onClick={() => setIsRatingDropdownOpen(!isRatingDropdownOpen)}
                className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 flex items-center gap-2 px-4 py-2 rounded-md"
                aria-label="rating sort-options"
                aria-expanded={isRatingDropdownOpen}
              >
                Ratings: {ratingSort ? `${ratingSort}+` : 'All'}
                <ChevronDown className="h-4 w-4" />
              </Button>
              {isRatingDropdownOpen && (
                <div className="absolute z-50 mt-1 w-32 bg-white rounded-md shadow-lg dark:bg-gray-700">
                  <button
                    onClick={() => {
                      setRatingSort(null);
                      setStagedRatingSort(null);
                      setIsRatingDropdownOpen(false);
                    }}
                    className="block w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600"
                  >
                    All
                  </button>
                  {[5, 4.5, 4.0, 3.5].map((value) => (
                    <button
                      key={value}
                      onClick={() => {
                        setRatingSort(value);
                        setStagedRatingSort(value);
                        setIsRatingDropdownOpen(false);
                      }}
                      className="block w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600"
                    >
                      {value}+
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={() => setShowAllFilters(true)}
              className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md"
            >
              <SlidersHorizontal className="h-4 w-4" /> All Filters
            </Button>

            {(sortOption !== 'default' ||
              topRatedSort ||
              sortByVerified ||
              sortByTrusted ||
              ratingSort ||
              selectedPincode !== '560062' ||
              selectedCity) && (
              <Button
                onClick={clearAllFilters}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>

        {showAllFilters && (
          <>
            <div
              className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm z-40"
              onClick={() => setShowAllFilters(false)}
            />
            <div
              className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-800 shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
                showAllFilters ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              <div className="p-6 h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">All Filters</h3>
                  <button
                    onClick={() => setShowAllFilters(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                    aria-label="Close filter modal"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="flex-1 space-y-6 overflow-y-auto">
                  <div>
                    <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-100">Sort By</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => setStagedSortOption('default')}
                        className={`${
                          stagedSortOption === 'default'
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
                        } px-4 py-2 rounded-md`}
                      >
                        Default
                      </Button>
                      <Button
                        onClick={() => setStagedSortOption('rating')}
                        className={`${
                          stagedSortOption === 'rating'
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
                        } px-4 py-2 rounded-md`}
                      >
                        Rating
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-100">Top Rated</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => setStagedTopRatedSort('desc')}
                        className={`${
                          stagedTopRatedSort === 'desc'
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
                        } px-4 py-2 rounded-md`}
                      >
                        Descending
                      </Button>
                      <Button
                        onClick={() => setStagedTopRatedSort('asc')}
                        className={`${
                          stagedTopRatedSort === 'asc'
                            ? 'bg-blue-600 text-white hover:bg-blue-500'
                            : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
                        } px-4 py-2 rounded-md`}
                      >
                        Ascending
                      </Button>
                      <Button
                        onClick={() => setStagedTopRatedSort(null)}
                        className={`${
                          stagedTopRatedSort === null
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
                        } px-4 py-2 rounded-md`}
                      >
                        None
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-100">Verified & Trust</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => setStagedSortByVerified(!stagedSortByVerified)}
                        className={`${
                          stagedSortByVerified
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
                        } px-4 py-2 rounded-md`}
                      >
                        DB Verified
                      </Button>
                      <Button
                        onClick={() => setStagedSortByTrusted(!stagedSortByTrusted)}
                        className={`${
                          stagedSortByTrusted
                            ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                            : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
                        } px-4 py-2 rounded-md`}
                      >
                        DB Trust
                      </Button>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-100">Minimum Rating</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => setStagedRatingSort(null)}
                        className={`${
                          stagedRatingSort === null
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
                        } px-4 py-2 rounded-md`}
                      >
                        All
                      </Button>
                      {[5, 4.5, 4.0, 3.5].map((value) => (
                        <Button
                          key={value}
                          onClick={() => setStagedRatingSort(value)}
                          className={`${
                            stagedRatingSort === value
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'
                          } px-4 py-2 rounded-md`}
                        >
                          {value}+
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <Button
                    onClick={resetAllFilters}
                    className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md"
                  >
                    Reset All
                  </Button>
                  <Button
                    onClick={applyFilters}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="flex flex-col gap-6 pt-0">
          <div className="w-full">
            {listings.length === 0 ? (
              <div className="text-center text-gray-600 dark:text-gray-300 py-10">
                No listings found for your query. Try adjusting your search or filters.
              </div>
            ) : (
              listings.map((listing, index) => {
                const business = {
                  services: Array.isArray(listing.tags) ? listing.tags : [],
                  images: Array.isArray(listing.images) ? listing.images : [],
                  imageError: listing.imageError || null,
                  name: listing.name || 'Napc Airlines',
                  rating: listing.rating ? parseFloat(listing.rating).toFixed(1) : '4.8',
                  totalRatings: listing.totalRatings
                    ? `${parseInt(listing.totalRatings).toLocaleString()} Ratings`
                    : '10,885 Ratings',
                  badges: [
                    listing.isTrusted && 'Trust',
                    listing.isVerified && 'Verified',
                    listing.isPopular && 'Claimed',
                  ].filter(Boolean),
                  address: listing.address || 'Dickenson Road',
                  city: listing.city || 'Bangalore, Konanakunte, Bangalore',
                  pincode: listing.pincode || '560062',
                  contact: { phone: listing.phone || '+916753454599' },
                  category: listing.category || 'Airlines',
                };

                const visibleImageCount = visibleImages[index] || 1;
                const displayedImages = business.images.slice(0, visibleImageCount);
                const hasMoreImages = visibleImageCount < business.images.length;

                return (
                  <div
                    key={index}
                    className="border rounded-xl p-1 bg-white dark:bg-gray-800 shadow-md mb-6"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col md:flex-row items-start gap-6">
                        {/* Image Section (Left) - Updated to larger dimensions */}
                        <div className="flex flex-wrap gap-3">
                          {business.imageError ? (
                            <div className="w-64 h-64 rounded-md border flex items-center justify-center text-red-500 dark:text-red-400 text-sm text-center p-2">
                              {business.imageError}
                            </div>
                          ) : displayedImages.length > 0 ? (
                            displayedImages.map((image, imgIndex) => (
                              <img
                                key={imgIndex}
                                src={
                                  image.url.includes('/upload/')
                                    ? image.url.replace(/\/upload\//, '/upload/w_300,h_300,c_fill/')
                                    : image.url
                                }
                                alt={`${business.name} image ${imgIndex + 1}`}
                                className="w-100 h-64 rounded-md object-cover border"
                                loading="lazy"
                                onError={(e) => {
                                  e.target.src = '/placeholder-image.jpg';
                                  console.error(`Failed to load image ${image.url}`);
                                }}
                              />
                            ))
                          ) : (
                            <div className="w-64 h-64 rounded-md border flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
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
                              <Star className="w-3 h-3 text-white fill-current" />
                            </Badge>
                            <span className="text-sm text-gray-600 dark:text-gray-300">
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

                          <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
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
                                className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 flex items-center gap-2 text-sm dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-900 rounded-md"
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
                            </div>
                            <div className="flex justify-end ">
                              <Button
                                variant="outline"
                                className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-2 -mt-5 py-2 flex items-center gap-2 text-sm dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-900 rounded-md"
                                onClick={() => handleVisit(business.name, business.category)}
                              >
                                <ExternalLink className="w-5 h-5" />
                                <span>Visit</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {hasMoreImages && (
                        <div className="mt-4">
                          <Button
                            onClick={() => handleShowMoreImages(index)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                          >
                            Show More Images ({business.images.length - visibleImageCount} remaining)
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}