// components/CategoryContent.jsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThumbsUp, Star, Phone, MessageSquare, MessageCircle, MapPin, ExternalLink, ChevronDown, X } from 'lucide-react';

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
  const [categories, setCategories] = useState([]);
  const [city, setCity] = useState('Your City');
  const [pincode, setPincode] = useState('');
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

  // Get all query parameters
  const query = searchParams.get('query');
  const selectedCategory = searchParams.get('category');
  const selectedSubcategory = searchParams.get('subcategory');
  const selectedTag = searchParams.get('tag');
  const selectedName = searchParams.get('name');
  const selectedAddress = searchParams.get('address');
  const selectedCity = searchParams.get('city');
  const selectedPincode = searchParams.get('pincode');

  const fetchListings = useCallback(
    debounce(async (params, sort, sortFields) => {
      try {
        setLoading(true);
        setError(null);

        const queryParams = new URLSearchParams();
        if (params.query) queryParams.set('q', params.query);
        if (params.category) queryParams.set('category', params.category);
        if (params.subcategory) queryParams.set('subcategory', params.subcategory);
        if (params.tag) queryParams.set('tag', params.tag);
        if (params.name) queryParams.set('name', params.name);
        if (params.address) queryParams.set('address', params.address);
        if (params.city) queryParams.set('city', params.city);
        if (params.pincode) queryParams.set('pincode', params.pincode);
        if (sort) queryParams.set('sort', sort);
        if (sortFields.sortByVerified) queryParams.set('sortByVerified', 'true');
        if (sortFields.sortByTrusted) queryParams.set('sortByTrusted', 'true');
        if (sortFields.ratingSort) queryParams.set('sortByRating', sortFields.ratingSort);

        const response = await fetch(`/api/getListings?${queryParams.toString()}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch listings: ${response.status}`);
        }
        const result = await response.json();

        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          const uniqueCategories = [...new Set(result.data.map((listing) => listing.category).filter(Boolean))];

          // Fetch images for categories
          const imagePromises = uniqueCategories.map((cat) =>
            fetch(`/api/getImagesByCategory?category=${encodeURIComponent(cat)}`, {
              cache: 'no-store',
            })
              .then((res) => res.json().then((data) => ({ category: cat, data })))
              .catch((error) => {
                console.error(`Failed to fetch images for ${cat}: ${error.message}`);
                return { category: cat, data: { images: [] } };
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
          setCategories(uniqueCategories);
          setCity(params.city || result.data[0]?.city || 'Your City');
          setPincode(params.pincode || result.data[0]?.pincode || '');
          const initialVisibleImages = {};
          listingsWithImages.forEach((_, index) => {
            initialVisibleImages[index] = 1;
          });
          setVisibleImages(initialVisibleImages);
        } else {
          throw new Error(result.message || 'No listings found');
        }
      } catch (err) {
        console.error('Fetch error:', err.message);
        setError(`Unable to load listings: ${err.message}`);
        setListings([]);
        setCategories([]);
        setCity(params.city || 'Your City');
        setPincode(params.pincode || '');
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
      subcategory: selectedSubcategory,
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
    selectedSubcategory,
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
          subcategory: selectedSubcategory,
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
    selectedSubcategory,
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
      'Leading Educational Institutions : Top Schools': '/template?websiteIdentifier=Education-Schools-560038',
      'Best Veterinarians': '/template?websiteIdentifier=Health%26Medical-Veterinary-560076',
      // Add other category routes as needed
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
      subcategory: selectedSubcategory,
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
              const params = {
                query,
                category: selectedCategory,
                subcategory: selectedSubcategory,
                tag: selectedTag,
                name: selectedName,
                address: selectedAddress,
                city: selectedCity,
                pincode: selectedPincode,
              };
              let sort = null;
              if (topRatedSort === 'desc') {
                sort = 'totalRatings-desc';
              } else if (topRatedSort === 'asc') {
                sort = 'totalRatings-asc';
              } else if (sortOption === 'rating') {
                sort = 'rating';
              }
              const sortFields = { sortByVerified, sortByTrusted, ratingSort };
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
        {(query || selectedPincode || selectedCity || selectedCategory || selectedName) && (
          <div className="mb-6 text-sm text-gray-600 dark:text-gray-300">
            Showing results for:{' '}
            {query && <span>Search: "{query}"</span>}
            {(query && (selectedPincode || selectedCity || selectedCategory || selectedName)) && ', '}
            {selectedName && <span>Name: "{selectedName}"</span>}
            {(query || selectedName) && (selectedPincode || selectedCity || selectedCategory) && ', '}
            {selectedCategory && <span>Category: {selectedCategory}</span>}
            {(query || selectedName || selectedCategory) && (selectedPincode || selectedCity) && ', '}
            {selectedPincode && <span>Pincode: {selectedPincode}</span>}
            {selectedPincode && selectedCity && ', '}
            {selectedCity && <span>City: {selectedCity}</span>}
          </div>
        )}

        <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Button
                onClick={() => {
                  setIsDropdownOpen(!isDropdownOpen);
                  setTopRatedSort(null);
                  setStagedTopRatedSort(null);
                }}
                className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 flex items-center gap-2 px-4 py-2 rounded-md"
                aria-label="Sort options"
                aria-expanded={isDropdownOpen}
              >
                Sort by: {sortOption === 'rating' ? 'Rating' : 'Default'}
                <ChevronDown className="h-4 w-4" />
              </Button>
              {isDropdownOpen && (
                <div className="absolute z-10 mt-2 w-40 bg-white dark:bg-gray-700 shadow-lg rounded-md">
                  <button
                    onClick={() => {
                      setSortOption('default');
                      setStagedSortOption('default');
                      setIsDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
                  >
                    Default
                  </button>
                  <button
                    onClick={() => {
                      setSortOption('rating');
                      setStagedSortOption('rating');
                      setIsDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
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
              Top Rated {topRatedSort === 'desc' ? '↓' : topRatedSort === 'asc' ? '↑' : ''}
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
                aria-label="Rating sort options"
                aria-expanded={isRatingDropdownOpen}
              >
                Ratings: {ratingSort ? `${ratingSort}+` : 'All'}
                <ChevronDown className="h-4 w-4" />
              </Button>
              {isRatingDropdownOpen && (
                <div className="absolute z-10 mt-2 w-40 bg-white dark:bg-gray-700 shadow-lg rounded-md">
                  <button
                    onClick={() => {
                      setRatingSort(null);
                      setStagedRatingSort(null);
                      setIsRatingDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
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
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200"
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
              All Filters
            </Button>

            {(sortOption !== 'default' ||
              topRatedSort ||
              sortByVerified ||
              sortByTrusted ||
              ratingSort ||
              selectedPincode ||
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
              className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-40"
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

        {categories.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Categories</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              {categories.map((cat, index) => (
                <Badge
                  key={index}
                  className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-6">
          <div className="w-full">
            {listings.length === 0 ? (
              <div className="text-center text-gray-600 dark:text-gray-300 py-10">
                No listings found for "{query || selectedCategory || selectedName || 'your search'}".
              </div>
            ) : (
              listings.map((listing, index) => {
                const business = {
                  services: Array.isArray(listing.tags) ? listing.tags : [],
                  images: Array.isArray(listing.images) ? listing.images : [],
                  imageError: listing.imageError || null,
                  name: listing.name || 'Unknown Business',
                  rating: listing.rating ? parseFloat(listing.rating).toFixed(1) : 'N/A',
                  totalRatings: listing.totalRatings || 'No Ratings',
                  badges: [
                    listing.isTrusted && 'Trust',
                    listing.isVerified && 'Verified',
                    listing.isPopular && 'Claimed',
                  ].filter(Boolean),
                  address: listing.address || 'Unknown Address',
                  city: listing.city || 'Unknown City',
                  pincode: listing.pincode || 'Unknown Pincode',
                  contact: { phone: listing.phone || generateRandomPhone() },
                  category: listing.category || 'Unknown Category',
                  subcategory: listing.subcategory || '',
                };

                const visibleImageCount = visibleImages[index] || 1;
                const displayedImages = business.images.slice(0, visibleImageCount);
                const hasMoreImages = visibleImageCount < business.images.length;

                return (
                  <div
                    key={index}
                    className="border rounded-xl p-6 bg-white dark:bg-gray-800 shadow-md mb-6"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col md:flex-row items-start gap-6">
                        <div className="flex flex-wrap gap-3">
                          {business.imageError ? (
                            <div className="w-32 h-32 rounded-md border flex items-center justify-center text-red-500 dark:text-red-400 text-sm text-center p-2">
                              {business.imageError}
                            </div>
                          ) : displayedImages.length > 0 ? (
                            displayedImages.map((image, imgIndex) => (
                              <img
                                key={imgIndex}
                                src={
                                  image.url.includes('/upload/')
                                    ? image.url.replace(/\/upload\//, '/upload/w_150,h_150,c_fill/')
                                    : image.url
                                }
                                alt={`${business.name} image ${imgIndex + 1}`}
                                className="w-32 h-32 rounded-md object-cover border"
                                loading="lazy"
                                onError={(e) => {
                                  e.target.src = '/placeholder-image.jpg';
                                  console.error(`Failed to load image ${image.url}`);
                                }}
                              />
                            ))
                          ) : (
                            <div className="w-32 h-32 rounded-md border flex items-center justify-center text-gray-500 dark:text-gray-400 text-sm">
                              No images available
                            </div>
                          )}
                        </div>
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
                            {business.subcategory && ` > ${business.subcategory}`}
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

                          {hasMoreImages && (
                            <Button
                              onClick={() => handleShowMoreImages(index)}
                              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                            >
                              Show More Images ({business.images.length - visibleImageCount} remaining)
                            </Button>
                          )}

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
                            <div className="flex justify-end mt-4">
                              <Button
                                variant="outline"
                                className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 flex items-center gap-2 text-sm dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-900 rounded-md"
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
  );
}