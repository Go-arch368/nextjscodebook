// components/CategoryNavbar.jsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, PlusCircle, Bell, User, Menu, MapPin, Clock, X } from 'lucide-react';
import { debounce } from 'lodash';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const CategoryNavbar = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [results, setResults] = useState({
    businesses: [],
    categories: [],
    subcategories: [],
    tags: [],
    addresses: [],
    cities: [],
  });
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const searchRef = useRef(null);

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
    debounce(async (query, pincode) => {
      if (!query && !pincode) {
        setResults({
          businesses: [],
          categories: [],
          subcategories: [],
          tags: [],
          addresses: [],
          cities: [],
        });
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const queryParams = new URLSearchParams();
        if (query) queryParams.append('q', query);
        if (pincode) queryParams.append('pincode', pincode);
        const response = await fetch(`/api/getListings?${queryParams.toString()}`, {
          cache: 'no-store',
        });
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        const result = await response.json();
        if (result.success) {
          setResults({
            businesses: result.data.map((item, index) => ({
              id: item._id || `biz-${index}`,
              name: item.name || 'Unknown Business',
              type: 'business',
              category: item.category || '',
              subcategory: item.subcategory || '',
            })),
            categories: (result.categories || []).map((cat, index) => ({
              id: `cat-${index}`,
              name: cat || '',
              type: 'category',
            })),
            subcategories: (result.subcategories || []).map((subcat, index) => ({
              id: `subcat-${index}`,
              name: subcat || '',
              type: 'subcategory',
            })),
            tags: (result.tags || []).map((tag, index) => ({
              id: `tag-${index}`,
              name: tag || '',
              type: 'tag',
            })),
            addresses: (result.addresses || []).map((addr, index) => ({
              id: `addr-${index}`,
              name: addr || '',
              type: 'address',
            })),
            cities: (result.cities || []).map((city, index) => ({
              id: `city-${index}`,
              name: city || '',
              type: 'city',
            })),
          });
        } else {
          setResults({
            businesses: [],
            categories: [],
            subcategories: [],
            tags: [],
            addresses: [],
            cities: [],
          });
        }
      } catch (error) {
        console.error('Error fetching results:', error.message);
        setError('Failed to load results. Please try again.');
        setResults({
          businesses: [],
          categories: [],
          subcategories: [],
          tags: [],
          addresses: [],
          cities: [],
        });
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchResults(searchQuery, location);
  }, [searchQuery, location, fetchResults]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery) {
      saveRecentSearch(searchQuery);
      const queryParams = new URLSearchParams({ query: searchQuery });
      if (location) queryParams.append('pincode', location);
      router.push(`/category?${queryParams.toString()}`);
      setIsSearchOpen(false);
      setMobileMenuOpen(false);
      setSearchQuery('');
    }
  };

  const handleSelect = (item) => {
    saveRecentSearch(item.name);
    let url = '/category';
    const queryParams = new URLSearchParams();
    switch (item.type) {
      case 'business':
        queryParams.append('name', item.name);
        break;
      case 'category':
        queryParams.append('category', item.name);
        break;
      case 'subcategory':
        queryParams.append('subcategory', item.name);
        break;
      case 'tag':
        queryParams.append('tag', item.name);
        break;
      case 'address':
        queryParams.append('address', item.name);
        break;
      case 'city':
        queryParams.append('city', item.name);
        break;
      default:
        queryParams.append('query', item.name);
    }
    if (location) queryParams.append('pincode', location);
    router.push(`${url}?${queryParams.toString()}`);
    setSearchQuery('');
    setIsSearchOpen(false);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 dark:bg-gray-800">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-orange-600 dark:text-orange-500">
          LOGOS
        </Link>

        <div className="hidden md:flex items-center flex-1 mx-8 gap-2">
          <div className="flex items-center border border-gray-300 rounded-md overflow-hidden dark:border-gray-600">
            <MapPin className="h-5 w-5 text-gray-500 mx-2 dark:text-gray-400" />
            <Input
              type="text"
              placeholder="Enter pincode"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-32 border-none focus:ring-0 dark:bg-gray-800 dark:text-gray-200"
              aria-label="Enter pincode"
            />
          </div>

          <div className="relative w-[40%] min-w-[200px]" ref={searchRef}>
            <form onSubmit={handleSearch}>
              <Command className="rounded-md border border-gray-300 dark:border-gray-600">
                <div className="flex items-center">
                  <CommandInput
                    placeholder="Search businesses, categories, addresses..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    onFocus={() => setIsSearchOpen(true)}
                    className="border-none focus:ring-0 dark:bg-gray-800 dark:text-gray-200"
                    aria-label="Search for businesses, categories, or addresses"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSearchQuery('')}
                      className="h-8 w-8 dark:hover:bg-gray-700"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4 dark:text-gray-400" />
                    </Button>
                  )}
                </div>
                {isSearchOpen && (
                  <CommandList className="absolute top-full left-0 w-full bg-white shadow-md rounded-md mt-1 max-h-96 overflow-y-auto z-50 dark:bg-gray-700">
                    {isLoading ? (
                      <CommandEmpty>Loading...</CommandEmpty>
                    ) : error ? (
                      <CommandEmpty className="text-red-500 dark:text-red-400">{error}</CommandEmpty>
                    ) : (
                      <>
                        {recentSearches.length > 0 && !searchQuery && (
                          <CommandGroup heading="Recent Searches">
                            <div className="flex justify-between items-center px-2 py-1">
                              <span />
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearRecentSearches}
                                className="text-red-500 text-xs dark:text-red-400"
                              >
                                Clear
                              </Button>
                            </div>
                            {recentSearches.map((search, index) => (
                              <CommandItem
                                key={index}
                                onSelect={() => {
                                  setSearchQuery(search);
                                  saveRecentSearch(search);
                                  router.push(
                                    `/category?query=${encodeURIComponent(search)}${
                                      location ? `&pincode=${encodeURIComponent(location)}` : ''
                                    }`
                                  );
                                  setIsSearchOpen(false);
                                }}
                                className="cursor-pointer dark:hover:bg-gray-600"
                              >
                                <Clock className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                                {search}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}

                        {results.businesses.length > 0 && (
                          <CommandGroup heading="Businesses">
                            {results.businesses.map((item) => (
                              <CommandItem
                                key={item.id}
                                onSelect={() => handleSelect(item)}
                                className="cursor-pointer dark:hover:bg-gray-600"
                              >
                                {item.name}{' '}
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  ({item.category}{item.subcategory ? ` > ${item.subcategory}` : ''})
                                </span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}

                        {results.categories.length > 0 && (
                          <CommandGroup heading="Categories">
                            {results.categories.map((item) => (
                              <CommandItem
                                key={item.id}
                                onSelect={() => handleSelect(item)}
                                className="cursor-pointer dark:hover:bg-gray-600"
                              >
                                {item.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}

                        {results.subcategories.length > 0 && (
                          <CommandGroup heading="Subcategories">
                            {results.subcategories.map((item) => (
                              <CommandItem
                                key={item.id}
                                onSelect={() => handleSelect(item)}
                                className="cursor-pointer dark:hover:bg-gray-600"
                              >
                                {item.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}

                        {results.tags.length > 0 && (
                          <CommandGroup heading="Tags">
                            {results.tags.map((item) => (
                              <CommandItem
                                key={item.id}
                                onSelect={() => handleSelect(item)}
                                className="cursor-pointer dark:hover:bg-gray-600"
                              >
                                {item.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}

                        {results.addresses.length > 0 && (
                          <CommandGroup heading="Addresses">
                            {results.addresses.map((item) => (
                              <CommandItem
                                key={item.id}
                                onSelect={() => handleSelect(item)}
                                className="cursor-pointer dark:hover:bg-gray-600"
                              >
                                {item.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}

                        {results.cities.length > 0 && (
                          <CommandGroup heading="Cities">
                            {results.cities.map((item) => (
                              <CommandItem
                                key={item.id}
                                onSelect={() => handleSelect(item)}
                                className="cursor-pointer dark:hover:bg-gray-600"
                              >
                                {item.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}

                        {!results.businesses.length &&
                          !results.categories.length &&
                          !results.subcategories.length &&
                          !results.tags.length &&
                          !results.addresses.length &&
                          !results.cities.length &&
                          searchQuery && <CommandEmpty>No results found</CommandEmpty>}
                      </>
                    )}
                  </CommandList>
                )}
              </Command>
            </form>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <Link href="/leads" className="flex items-center text-gray-600 hover:text-blue-600 font-medium dark:text-gray-300 dark:hover:text-blue-500">
            <Mail className="h-5 w-5 text-blue-600 mr-2 dark:text-blue-500" />
            Leads
          </Link>
          <Link
            href="/free-listing"
            className="flex items-center text-gray-600 hover:text-blue-600 font-medium dark:text-gray-300 dark:hover:text-blue-500"
          >
            <PlusCircle className="h-5 w-5 text-blue-600 mr-2 dark:text-blue-500" />
            Free Listing
          </Link>
          <Link href="/notifications" className="text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-500">
            <Bell className="h-5 w-5 text-blue-600 dark:text-blue-500" />
          </Link>
          <Link
            href="/profile"
            className="text-gray-600 hover:text-blue-600 border-2 border-blue-600 rounded-full p-1 dark:border-blue-500 dark:text-gray-300 dark:hover:text-blue-500"
          >
            <User className="h-5 w-5 text-blue-600 dark:text-blue-500" />
          </Link>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden dark:hover:bg-gray-700"
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        </Button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-md dark:bg-gray-800">
          <div className="flex flex-col p-4 space-y-4">
            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden dark:border-gray-600">
              <MapPin className="h-5 w-5 text-gray-500 mx-2 dark:text-gray-400" />
              <Input
                type="text"
                placeholder="Enter pincode"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="border-none focus:ring-0 dark:bg-gray-800 dark:text-gray-200"
                aria-label="Enter pincode"
              />
            </div>

            <div className="relative" ref={searchRef}>
              <form onSubmit={handleSearch}>
                <Command className="rounded-md border border-gray-300 dark:border-gray-600">
                  <div className="flex items-center">
                    <CommandInput
                      placeholder="Search businesses, categories, addresses..."
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                      onFocus={() => setIsSearchOpen(true)}
                      className="border-none focus:ring-0 dark:bg-gray-800 dark:text-gray-200"
                      aria-label="Search for businesses, categories, or addresses"
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSearchQuery('')}
                        className="h-8 w-8 dark:hover:bg-gray-700"
                        aria-label="Clear search"
                      >
                        <X className="h-4 w-4 dark:text-gray-400" />
                      </Button>
                    )}
                  </div>
                  {isSearchOpen && (
                    <CommandList className="absolute top-full left-0 w-full bg-white shadow-md rounded-md mt-1 max-h-96 overflow-y-auto z-50 dark:bg-gray-700">
                      {isLoading ? (
                        <CommandEmpty>Loading...</CommandEmpty>
                      ) : error ? (
                        <CommandEmpty className="text-red-500 dark:text-red-400">{error}</CommandEmpty>
                      ) : (
                        <>
                          {recentSearches.length > 0 && !searchQuery && (
                            <CommandGroup heading="Recent Searches">
                              <div className="flex justify-between items-center px-2 py-1">
                                <span />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={clearRecentSearches}
                                  className="text-red-500 text-xs dark:text-red-400"
                                >
                                  Clear
                                </Button>
                              </div>
                              {recentSearches.map((search, index) => (
                                <CommandItem
                                  key={index}
                                  onSelect={() => {
                                    setSearchQuery(search);
                                    saveRecentSearch(search);
                                    router.push(
                                      `/category?query=${encodeURIComponent(search)}${
                                        location ? `&pincode=${encodeURIComponent(location)}` : ''
                                      }`
                                    );
                                    setIsSearchOpen(false);
                                    setMobileMenuOpen(false);
                                  }}
                                  className="cursor-pointer dark:hover:bg-gray-600"
                                >
                                  <Clock className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
                                  {search}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}

                          {results.businesses.length > 0 && (
                            <CommandGroup heading="Businesses">
                              {results.businesses.map((item) => (
                                <CommandItem
                                  key={item.id}
                                  onSelect={() => handleSelect(item)}
                                  className="cursor-pointer dark:hover:bg-gray-600"
                                >
                                  {item.name}{' '}
                                  <span className="text-sm text-gray-500 dark:text-gray-400">
                                    ({item.category}{item.subcategory ? ` > ${item.subcategory}` : ''})
                                  </span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}

                          {results.categories.length > 0 && (
                            <CommandGroup heading="Categories">
                              {results.categories.map((item) => (
                                <CommandItem
                                  key={item.id}
                                  onSelect={() => handleSelect(item)}
                                  className="cursor-pointer dark:hover:bg-gray-600"
                                >
                                  {item.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}

                          {results.subcategories.length > 0 && (
                            <CommandGroup heading="Subcategories">
                              {results.subcategories.map((item) => (
                                <CommandItem
                                  key={item.id}
                                  onSelect={() => handleSelect(item)}
                                  className="cursor-pointer dark:hover:bg-gray-600"
                                >
                                  {item.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}

                          {results.tags.length > 0 && (
                            <CommandGroup heading="Tags">
                              {results.tags.map((item) => (
                                <CommandItem
                                  key={item.id}
                                  onSelect={() => handleSelect(item)}
                                  className="cursor-pointer dark:hover:bg-gray-600"
                                >
                                  {item.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}

                          {results.addresses.length > 0 && (
                            <CommandGroup heading="Addresses">
                              {results.addresses.map((item) => (
                                <CommandItem
                                  key={item.id}
                                  onSelect={() => handleSelect(item)}
                                  className="cursor-pointer dark:hover:bg-gray-600"
                                >
                                  {item.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}

                          {results.cities.length > 0 && (
                            <CommandGroup heading="Cities">
                              {results.cities.map((item) => (
                                <CommandItem
                                  key={item.id}
                                  onSelect={() => handleSelect(item)}
                                  className="cursor-pointer dark:hover:bg-gray-600"
                                >
                                  {item.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}

                          {!results.businesses.length &&
                            !results.categories.length &&
                            !results.subcategories.length &&
                            !results.tags.length &&
                            !results.addresses.length &&
                            !results.cities.length &&
                            searchQuery && <CommandEmpty>No results found</CommandEmpty>}
                        </>
                      )}
                    </CommandList>
                  )}
                </Command>
              </form>
            </div>
          </div>

          <div className="flex flex-col p-4 space-y-4 border-t border-gray-200 dark:border-gray-600">
            <Link href="/leads" className="flex items-center text-gray-600 hover:text-blue-600 font-medium dark:text-gray-300 dark:hover:text-blue-500">
              <Mail className="h-5 w-5 text-blue-600 mr-2 dark:text-blue-500" />
              Leads
            </Link>
            <Link
              href="/free-listing"
              className="flex items-center text-gray-600 hover:text-blue-600 font-medium dark:text-gray-300 dark:hover:text-blue-500"
            >
              <PlusCircle className="h-5 w-5 text-blue-600 mr-2 dark:text-blue-500" />
              Free Listing
            </Link>
            <Link href="/notifications" className="flex items-center text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-500">
              <Bell className="h-5 w-5 text-blue-600 mr-2 dark:text-blue-500" />
              Notifications
            </Link>
            <Link
              href="/profile"
              className="flex items-center text-gray-600 hover:text-blue-600 border-2 border-blue-600 rounded-full px-2 py-1 dark:border-blue-500 dark:text-gray-300 dark:hover:text-blue-500"
            >
              <User className="h-5 w-5 text-blue-600 mr-2 dark:text-blue-500" />
              Profile
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default CategoryNavbar;