'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, PlusCircle, Bell, User, Menu, Search, MapPin, Clock } from 'lucide-react';
import { debounce } from 'lodash';

const CategoryNavbar = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [businesses, setBusinesses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    setRecentSearches(storedSearches);
  }, []);

  const saveRecentSearch = (query) => {
    if (!query) return;
    let updatedSearches = [...recentSearches];
    updatedSearches = updatedSearches.filter((search) => search.toLowerCase() !== query.toLowerCase());
    updatedSearches.unshift(query);
    updatedSearches = updatedSearches.slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const fetchResults = useCallback(
    debounce(async (query) => {
      try {
        setIsLoading(true);
        const queryParams = new URLSearchParams();
        if (query) {
          queryParams.append('name', query);
          queryParams.append('category', query);
        }
        const response = await fetch(`/api/getListings?${queryParams.toString()}`, {
          cache: 'no-store',
        });
        const result = await response.json();
        if (result.success && result.data) {
          setBusinesses(
            result.data.map((item, index) => ({
              id: item._id || `biz-${index}`,
              name: item.name,
              type: 'business',
              category: item.category,
            }))
          );
          setCategories(
            result.categories.map((cat, index) => ({
              id: `cat-${index}`,
              name: cat,
              type: 'category',
            }))
          );
        } else {
          setBusinesses([]);
          setCategories([]);
        }
      } catch (error) {
        console.error('Error fetching results:', error);
        setBusinesses([]);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    }, 200),
    []
  );

  useEffect(() => {
    fetchResults(searchQuery);
  }, [searchQuery, fetchResults]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery) {
      saveRecentSearch(searchQuery);
      router.push(`/category?query=${encodeURIComponent(searchQuery)}`);
      setShowResults(false);
      setMobileMenuOpen(false);
    }
  };

  const handleSearchButtonClick = () => {
    setShowResults(!showResults);
  };

  const filteredResults = searchQuery
    ? [
        ...categories.filter((cat) => cat.name.toLowerCase().includes(searchQuery.toLowerCase())),
        ...businesses.filter(
          (biz) =>
            biz.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            biz.category.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      ]
    : [...categories, ...businesses];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-orange-600">
          LOGOS
        </Link>

        <div className="hidden md:flex items-center flex-1 mx-8 gap-2">
          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
            <MapPin className="h-5 w-5 text-gray-500 mx-2" />
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="relative w-[40%] min-w-[200px]">
            <form onSubmit={handleSearch}>
              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                <input
                  type="text"
                  placeholder="Search businesses or categories..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowResults(true);
                  }}
                  onFocus={() => setShowResults(true)}
                  className="w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  aria-label="Search for businesses or categories"
                />
                <button
                  type="button"
                  onClick={handleSearchButtonClick}
                  className="px-2 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-r-md"
                  aria-label="Toggle search results"
                >
                  <Search className="h-7 w-7" />
                </button>
              </div>
            </form>

            {showResults && (
              <div className="absolute z-10 w-full bg-white shadow-md rounded-md mt-1 max-h-60 overflow-y-auto">
                {recentSearches.length > 0 && (
                  <div className="border-b border-gray-200">
                    <div className="px-4 py-2 text-sm font-semibold text-gray-700 flex justify-between items-center">
                      Recent Searches
                      <button
                        onClick={clearRecentSearches}
                        className="text-red-500 text-xs hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                    {recentSearches.map((search, index) => (
                      <Link
                        key={index}
                        href={`/category?query=${encodeURIComponent(search)}`}
                        className="px-4 py-2 hover:bg-gray-100 flex items-center"
                        onClick={() => {
                          setSearchQuery(search);
                          setShowResults(false);
                          setMobileMenuOpen(false);
                          saveRecentSearch(search);
                        }}
                      >
                        <Clock className="h-4 w-4 text-gray-500 mr-2" />
                        {search}
                      </Link>
                    ))}
                  </div>
                )}

                <div>
                  {isLoading ? (
                    <div className="px-4 py-2 text-gray-500">Loading...</div>
                  ) : filteredResults.length > 0 ? (
                    filteredResults.map((item) => (
                      <Link
                        key={item.id}
                        href={
                          item.type === 'business'
                            ? `/category?name=${encodeURIComponent(item.name)}`
                            : `/category?category=${encodeURIComponent(item.name)}`
                        }
                        className="block px-4 py-2 hover:bg-gray-100"
                        onClick={() => {
                          setSearchQuery(item.name);
                          setShowResults(false);
                          setMobileMenuOpen(false);
                          saveRecentSearch(item.name);
                        }}
                      >
                        {item.type === 'business' ? (
                          <>
                            {item.name} <span className="text-sm text-gray-500">({item.category})</span>
                          </>
                        ) : (
                          item.name
                        )}
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500">No results found</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <Link href="/leads" className="flex items-center text-gray-700 hover:text-blue-600 font-medium">
            <Mail className="h-5 w-5 text-blue-600 mr-1" />
            Leads
          </Link>
          <Link href="/free-listing" className="flex items-center text-gray-700 hover:text-blue-600 font-medium">
            <PlusCircle className="h-5 w-5 text-blue-600 mr-1" />
            Free Listing
          </Link>
          <Link href="/notifications" className="text-gray-700 hover:text-blue-600">
            <Bell className="h-5 w-5 text-blue-600" />
          </Link>
          <Link href="/profile" className="text-gray-700 hover:text-blue-600 border-2 border-blue-600 rounded-full p-1">
            <User className="h-5 w-5 text-blue-600" />
          </Link>
        </div>

        <button
          className="md:hidden text-gray-700"
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-md">
          <div className="flex flex-col p-4 space-y-3">
            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
              <MapPin className="h-5 w-5 text-gray-500 mx-2" />
              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full py-2 px-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <form onSubmit={handleSearch}>
              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
                <input
                  type="text"
                  placeholder="Search businesses or categories..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowResults(true);
                  }}
                  onFocus={() => setShowResults(true)}
                  className="w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={handleSearchButtonClick}
                  className="px-2 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-r-md"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </form>

            {showResults && (
              <div className="max-h-96 overflow-y-auto">
                {recentSearches.length > 0 && (
                  <div className="border-b border-gray-200">
                    <div className="px-4 py-2 text-sm font-semibold text-gray-700 flex justify-between items-center">
                      Recent Searches
                      <button
                        onClick={clearRecentSearches}
                        className="text-red-500 text-xs hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                    {recentSearches.map((search, index) => (
                      <Link
                        key={index}
                        href={`/category?query=${encodeURIComponent(search)}`}
                        className="flex px-4 py-2 hover:bg-gray-100 items-center border-b border-gray-100"
                        onClick={() => {
                          setSearchQuery(search);
                          setShowResults(false);
                          setMobileMenuOpen(false);
                          saveRecentSearch(search);
                        }}
                      >
                        <Clock className="h-4 w-4 text-gray-500 mr-2" />
                        {search}
                      </Link>
                    ))}
                  </div>
                )}

                <div>
                  {isLoading ? (
                    <div className="px-4 py-2 text-gray-500">Loading...</div>
                  ) : filteredResults.length > 0 ? (
                    filteredResults.map((item) => (
                      <Link
                        key={item.id}
                        href={
                          item.type === 'business'
                            ? `/category?name=${encodeURIComponent(item.name)}`
                            : `/category?category=${encodeURIComponent(item.name)}`
                        }
                        className="block px-4 py-2 hover:bg-gray-100 border-b border-gray-100"
                        onClick={() => {
                          setSearchQuery(item.name);
                          setShowResults(false);
                          setMobileMenuOpen(false);
                          saveRecentSearch(item.name);
                        }}
                      >
                        {item.type === 'business' ? (
                          <>
                            {item.name} <span className="text-sm text-gray-500">({item.category})</span>
                          </>
                        ) : (
                          item.name
                        )}
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500">No results found</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col p-4 space-y-4 border-t border-gray-200">
            <Link href="/leads" className="flex items-center text-gray-700 hover:text-blue-600 font-medium">
              <Mail className="h-5 w-5 text-blue-600 mr-2" />
              Leads
            </Link>
            <Link href="/free-listing" className="flex items-center text-gray-700 hover:text-blue-600 font-medium">
              <PlusCircle className="h-5 w-5 text-blue-600 mr-2" />
              Free Listing
            </Link>
            <Link href="/notifications" className="flex items-center text-gray-700 hover:text-blue-600">
              <Bell className="h-5 w-5 text-blue-600 mr-2" />
              Notifications
            </Link>
            <Link href="/profile" className="flex items-center text-gray-700 hover:text-blue-600 border-2 border-blue-600 rounded-full px-2 py-1">
              <User className="h-5 w-5 text-blue-600 mr-2" />
              Profile
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default CategoryNavbar;