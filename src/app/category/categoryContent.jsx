'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThumbsUp, Star, Phone, MessageSquare, MessageCircle, MapPin, ExternalLink, ChevronDown, X } from 'lucide-react';

function debounce(func, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
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
  const [category, setCategory] = useState('Services');
  const [city, setCity] = useState('Your City');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleImages, setVisibleImages] = useState({});
  const [sortOption, setSortOption] = useState('default');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [topRatedSort, setTopRatedSort] = useState(null);
  const [sortByVerified, setSortByVerified] = useState(false);
  const [sortByTrusted, setSortByTrusted] = useState(false);
  const [ratingSort, setRatingSort] = useState(null);
  const [isRatingDropdownOpen, setIsRatingDropdownOpen] = useState(false);
  const [showAllFilters, setShowAllFilters] = useState(false);

  const selectedCategory = searchParams.get('category') || 'Services';

  const fetchListings = useCallback(
    debounce(async (categoryToFetch, sort, sortFields) => {
      console.log('Fetching listings for category:', categoryToFetch, 'sort:', sort, 'sortFields:', sortFields);
      try {
        setLoading(true);
        setError(null);

        // Build query string
        let query = `category=${encodeURIComponent(categoryToFetch)}`;
        if (sort) query += `&sort=${sort}`;
        if (sortFields.sortByVerified) query += `&sortByVerified=true`;
        if (sortFields.sortByTrusted) query += `&sortByTrusted=true`;
        if (sortFields.ratingSort) query += `&sortByRating=${sortFields.ratingSort}`;

        const response = await fetch(`/api/getListings?${query}`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch listings: ${response.status}`);
        }
        const result = await response.json();

        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          const uniqueCategories = [...new Set(result.data.map(listing => listing.category))];

          const imagePromises = uniqueCategories.map(category => {
            return fetch(`/api/getImagesByCategory?category=${encodeURIComponent(category)}`, {
              cache: 'no-store',
            })
              .then(res => res.json().then(data => ({ category, data })))
              .catch(error => {
                console.error(`Failed to fetch images for ${category}: ${error.message}`);
                return { category, data: { images: [] } };
              });
          });

          const imageResults = await Promise.all(imagePromises);
          const imageMap = Object.fromEntries(
            imageResults.map(({ category, data }) => [category, data.images || []])
          );

          const listingsWithImages = result.data.map(listing => ({
            ...listing,
            images: imageMap[listing.category] || [],
            imageError: imageMap[listing.category]?.length ? null : `No images found for ${listing.category}`,
          }));

          setListings(listingsWithImages);
          setCategory(result.data[0]?.category || categoryToFetch);
          setCity(result.data[0]?.city || 'Your City');

          const initialVisibleImages = {};
          listingsWithImages.forEach((_, index) => {
            initialVisibleImages[index] = 1;
          });
          setVisibleImages(initialVisibleImages);
        } else {
          throw new Error(result.message || `No listings found for category: ${categoryToFetch}`);
        }
      } catch (err) {
        console.error('Fetch error:', err.message);
        setError(`Unable to load listings: ${err.message}`);
        setListings([]);
        setCategory(categoryToFetch);
        setCity('Your City');
      } finally {
        setLoading(false);
      }
    }, 1000),
    []
  );

  useEffect(() => {
    console.log('Category, sort, or sortFields changed:', selectedCategory, sortOption, topRatedSort, sortByVerified, sortByTrusted, ratingSort);
    let sort = null;
    if (topRatedSort === 'desc') {
      sort = 'totalRatings-desc';
    } else if (topRatedSort === 'asc') {
      sort = 'totalRatings-asc';
    } else if (sortOption === 'rating') {
      sort = 'rating';
    }
    const sortFields = { sortByVerified, sortByTrusted, ratingSort };
    fetchListings(selectedCategory, sort, sortFields);
  }, [fetchListings, selectedCategory, sortOption, topRatedSort, sortByVerified, sortByTrusted, ratingSort]);

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
        fetchListings(selectedCategory, sort, sortFields);
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [fetchListings, selectedCategory, sortOption, topRatedSort, sortByVerified, sortByTrusted, ratingSort]);

  const handleShowMoreImages = (listingIndex) => {
    setVisibleImages((prev) => ({
      ...prev,
      [listingIndex]: (prev[listingIndex] || 1) + 5,
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      assistance:
        topRatedSort === 'desc'
          ? 'Top Rated (Descending)'
          : topRatedSort === 'asc'
          ? 'Top Rated (Ascending)'
          : sortOption === 'rating'
          ? 'Rating'
          : 'Default',
      sortFields: {
        verified: sortByVerified ? 'Sort by Verified' : 'None',
        trusted: sortByTrusted ? 'Sort by Trusted' : 'None',
        rating: ratingSort ? `Sort by Rating >= ${ratingSort}` : 'None',
      },
      name: formData.get('name'),
      mobile: formData.get('mobile'),
    };
    console.log('Form Submission:', data);
    alert('Enquiry submitted successfully!');
    e.target.reset();
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

    switch (category) {
      case 'Best Hospitals':
        window.location.href = '/template?websiteIdentifier=Health%26Medical-Hospital-560038';
        break;
      case 'Best Clinics':
        window.location.href = '/template?websiteIdentifier=Health%26Medical-Clinics-560038';
        break;
      case 'Best Dentists':
        window.location.href = '/template?websiteIdentifier=Health%26Medical-Dentists-560062';
        break;
      case 'Chemists':
        window.location.href = '/template?websiteIdentifier=Health%26Medical-Pharmacies-560098';
        break;
      case 'Best Veterinarians':
        window.location.href = '/template?websiteIdentifier=Health%26Medical-Veterinary-560076';
        break;
      case 'Car Repair & Services':
        window.location.href = '/template?websiteIdentifier=Automobile-CarRepair-560062';
        break;
      case 'Car Showrooms':
        window.location.href = '/template?websiteIdentifier=Automobile-CarSales-560062';
        break;
      case 'Tyre Dealers':
        window.location.href = '/template?websiteIdentifier=Automobile-Tires-560062';
        break;
      case 'Autospares Hub':
        window.location.href = '/template?websiteIdentifier=Automobile-AutoParts-560062';
        break;
      default:
        alert(`Visiting ${businessName}`);
        break;
    }
  };

  const resetAllFilters = () => {
    setSortOption('default');
    setTopRatedSort(null);
    setSortByVerified(false);
    setSortByTrusted(false);
    setRatingSort(null);
  };

  if (loading) return <div className="text-center text-gray-600 dark:text-gray-300">Loading listings, please wait...</div>;
  if (error) return (
    <div className="text-center text-red-500 dark:text-red-400">
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
          fetchListings(selectedCategory, sort, sortFields);
        }}
        className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
      >
        Retry
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="flex justify-start gap-2 flex-wrap">
          

          <div className="relative">
            <Button
              onClick={() => {
                setIsDropdownOpen(!isDropdownOpen);
                setTopRatedSort(null);
              }}
              className="bg-gray-200 text-gray-800 hover:bg-gray-300 flex items-center gap-2 px-4"
              aria-label="Sort options"
              aria-expanded={isDropdownOpen}
            >
              Sort by: {sortOption === 'rating' ? 'Rating' : 'Default'} <ChevronDown className="h-4 w-4" />
            </Button>
            {isDropdownOpen && (
              <div className="absolute -right-20 mt-2 w-40 bg-white shadow-md rounded-md z-10">
                <button
                  onClick={() => {
                    setSortOption('default');
                    setIsDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800"
                >
                  Default
                </button>
                <button
                  onClick={() => {
                    setSortOption('rating');
                    setIsDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800"
                >
                  Rating
                </button>
              </div>
            )}
          </div>
          <Button
            onClick={() => {
              setTopRatedSort((prev) => {
                if (prev === null) return 'desc';
                if (prev === 'desc') return 'asc';
                return null;
              });
              setSortOption('default');
            }}
            className={`${
              topRatedSort === 'desc'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : topRatedSort === 'asc'
                ? 'bg-blue-400 text-white hover:bg-blue-500'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            } px-4 flex items-center gap-1`}
            aria-label={
              topRatedSort === 'desc'
                ? 'Sort by Top Rated descending'
                : topRatedSort === 'asc'
                ? 'Sort by Top Rated ascending'
                : 'Enable Top Rated sorting'
            }
          >
            Top Rated {topRatedSort === 'desc' ? '↓' : topRatedSort === 'asc' ? '↑' : ''}
          </Button>
          <Button
            onClick={() => setSortByVerified(!sortByVerified)}
            className={`${
              sortByVerified
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            } px-4`}
            aria-label={sortByVerified ? 'Disable JD Verified sorting' : 'Enable JD Verified sorting'}
          >
            JD Verified
          </Button>
          <Button
            onClick={() => setSortByTrusted(!sortByTrusted)}
            className={`${
              sortByTrusted
                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            } px-4`}
            aria-label={sortByTrusted ? 'Disable JD Trust sorting' : 'Enable JD Trust sorting'}
          >
            JD Trust
          </Button>
          <div className="relative">
            <Button
              onClick={() => setIsRatingDropdownOpen(!isRatingDropdownOpen)}
              className="bg-gray-200 text-gray-800 hover:bg-gray-300 flex items-center gap-2 px-4"
              aria-label="Rating sort options"
              aria-expanded={isRatingDropdownOpen}
            >
              Ratings: {ratingSort ? `${ratingSort}+` : 'All'} <ChevronDown className="h-4 w-4" />
            </Button>
            {isRatingDropdownOpen && (
              <div className="absolute -right-20 mt-2 w-40 bg-white shadow-md rounded-md z-10">
                <button
                  onClick={() => {
                    setRatingSort(null);
                    setIsRatingDropdownOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800"
                >
                  All
                </button>
                {[5, 4.5, 4.0, 3.5].map((value) => (
                  <button
                    key={value}
                    onClick={() => {
                      setRatingSort(value);
                      setIsRatingDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-800"
                  >
                    {value}+
                  </button>
                ))}
              </div>
            )}   
          </div>

          <Button
            onClick={() => setShowAllFilters(true)}
            className="bg-gray-200 text-gray-800 hover:bg-gray-300 px-4"
          >
            All Filters
          </Button>
        </div>
      </div>

      {/* All Filters Popup */}
      {showAllFilters && (
        <div className="fixed inset-0 bg-gray-200 bg-opacity-0 flex items-center justify-center z-10">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full relative">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">All Filters</h3>
              <button 
                onClick={() => setShowAllFilters(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Sort By</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => setSortOption('default')}
                    className={`${
                      sortOption === 'default'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    } px-4`}
                  >
                    Default
                  </Button>
                  <Button
                    onClick={() => setSortOption('rating')}
                    className={`${
                      sortOption === 'rating'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    } px-4`}
                  >
                    Rating
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Top Rated</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => setTopRatedSort('desc')}
                    className={`${
                      topRatedSort === 'desc'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    } px-4`}
                  >
                    Descending
                  </Button>
                  <Button
                    onClick={() => setTopRatedSort('asc')}
                    className={`${
                      topRatedSort === 'asc'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    } px-4`}
                  >
                    Ascending
                  </Button>
                  <Button
                    onClick={() => setTopRatedSort(null)}
                    className={`${
                      topRatedSort === null
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    } px-4`}
                  >
                    None
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Verified & Trust</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => setSortByVerified(!sortByVerified)}
                    className={`${
                      sortByVerified
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    } px-4`}
                  >
                    JD Verified
                  </Button>
                  <Button
                    onClick={() => setSortByTrusted(!sortByTrusted)}
                    className={`${
                      sortByTrusted
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    } px-4`}
                  >
                    JD Trust
                  </Button>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Minimum Rating</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => setRatingSort(null)}
                    className={`${
                      ratingSort === null
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    } px-4`}
                  >
                    All
                  </Button>
                  {[5, 4.5, 4.0, 3.5].map((value) => (
                    <Button
                      key={value}
                      onClick={() => setRatingSort(value)}
                      className={`${
                        ratingSort === value
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                      } px-4`}
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
                className="bg-gray-200 text-gray-800 hover:bg-gray-300 px-4"
              >
                Reset All
              </Button>
              <Button
                onClick={() => setShowAllFilters(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/3 w-full pr-5">
          {listings.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-300">No listings found.</p>
          ) : (
            listings.map((listing, index) => {
              const business = {
                services: Array.isArray(listing.tags) ? listing.tags : [],
                images: Array.isArray(listing.images) ? listing.images : [],
                imageError: listing.imageError || null,
                name: listing.name || 'Unknown Business',
                rating: listing.rating ? parseFloat(listing.rating).toFixed(1) : '4.8',
                total_ratings: listing.totalRatings ? `${parseInt(listing.totalRatings).toLocaleString()} Ratings` : '10,885 Ratings',
                badges: [
                  listing.isTrusted && 'Trust',
                  listing.isVerified && 'Verified',
                  listing.isPopular && 'Claimed',
                ].filter(Boolean),
                address: listing.address || '123 Main Street',
                city: listing.city || 'Your City',
                contact: { phone: listing.phone || generateRandomPhone() },
                category: listing.category || 'Unknown Category',
              };

              const visibleImageCount = visibleImages[index] || 1;
              const displayedImages = business.images.slice(0, visibleImageCount);
              const hasMoreImages = visibleImageCount < business.images.length;

              return (
                <div
                  key={index}
                  className="border rounded-xl p-6 bg-white dark:bg-gray-800 shadow-sm mb-6 py-8"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-wrap gap-2">
                        {business.imageError ? (
                          <div className="w-40 h-40 rounded-md border flex items-center justify-center text-red-500 dark:text-red-400 text-sm text-center p-2">
                            {business.imageError}
                          </div>
                        ) : displayedImages.length > 0 ? (
                          displayedImages.map((image, imgIndex) => (
                            <img
                              key={imgIndex}
                              src={image.url.includes('/upload/')
                                ? image.url.replace(/\/upload\//, '/upload/w_200,h_200,c_fill/')
                                : image.url
                              }
                              alt={`${business.name} image ${imgIndex + 1}`}
                              className="w-40 h-40 rounded-md object-cover border"
                              loading="lazy"
                              onError={() => console.error(`Failed to load image ${image.url}`)}
                            />
                          ))
                        ) : (
                          <div className="w-40 h-40 rounded-md border flex items-center justify-center text-gray-500 dark:text-gray-400">
                            No images available
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-semibold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                          <ThumbsUp className="w-5 h-5 !text-white !bg-black p-1 rounded-md dark:!bg-gray-700 dark:!text-gray-200" />
                          {business.name}
                        </h3>

                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge className="!bg-green-600 !text-white px-2 py-0.5 text-sm flex items-center gap-1 dark:!bg-green-700 dark:!text-gray-100">
                            {business.rating}
                            <Star className="w-3 h-3 !text-white fill-current" />
                          </Badge>
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {business.total_ratings}
                          </span>
                          {business.badges.map((badge, idx) => (
                            <Badge
                              key={idx}
                              className={
                                badge === 'Trust'
                                  ? '!bg-yellow-400 !text-black text-xs dark:!bg-yellow-500 dark:!text-gray-900'
                                  : badge === 'Verified'
                                  ? '!bg-blue-500 !text-white text-xs dark:!bg-blue-600 dark:!text-gray-100'
                                  : '!bg-black !text-white text-xs dark:!bg-gray-900 dark:!text-gray-100'
                              }
                            >
                              {badge === 'Verified' ? `${badge} ✓` : badge}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-sm text-gray-700 dark:text-gray-300 mt-1 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {business.address}, {business.city}
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

                        {hasMoreImages && (
                          <Button
                            onClick={() => handleShowMoreImages(index)}
                            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                          >
                            Show More Images ({business.images.length - visibleImageCount} remaining)
                          </Button>
                        )}

                        <div className="mt-4">
                          <div className="flex flex-wrap gap-4 justify-start">
                            <Button
                              variant="default"
                              className="!bg-green-600 hover:!bg-green-700 !text-white px-4 py-3 flex items-center gap-2 text-sm dark:!bg-green-700 dark:hover:!bg-green-800"
                            >
                              <Phone className="w-5 h-5 animate-shake" />
                              <span>{business.contact.phone}</span>
                            </Button>
                            <Button
                              variant="outline"
                              className="border !border-blue-600 !bg-blue-600 hover:!bg-blue-400 hover:!text-white !text-white px-4 py-3 flex items-center gap-2 text-sm dark:!border-blue-700 dark:!bg-blue-700 dark:hover:!bg-blue-500"
                              onClick={() => handleEnquireNow(business.name)}
                            >
                              <MessageSquare className="w-5 h-5" />
                              <span>Enquire Now</span>
                            </Button>
                            <Button
                              variant="outline"
                              className="border !border-green-600 !text-green-600 hover:!bg-green-50 px-4 py-3 flex items-center gap-2 text-sm dark:!border-green-700 dark:!text-green-400 dark:hover:!bg-green-900"
                            >
                              <MessageCircle className="w-5 h-5" />
                              <span>WhatsApp</span>
                            </Button>
                          </div>
                          <div className="flex justify-end mt-2">
                            <Button
                              variant="outline"
                              className="border !border-blue-600 !bg-blue-600 hover:!bg-blue-400 hover:!text-white !text-white px-4 py-3 flex items-center gap-2 text-sm dark:!border-blue-700 dark:!bg-blue-700 dark:hover:!bg-blue-500"
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

        <div className="lg:w-1/3 w-full lg:fixed top-6 right-4 pr-4 mt-20 max-w-sm">
          <div className="p-4 border rounded-lg shadow-md bg-white dark:bg-gray-800">
            <h2 className="text-2xl font-bold mb-4">
              Get the List of <span className="text-blue-600">{category}</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
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