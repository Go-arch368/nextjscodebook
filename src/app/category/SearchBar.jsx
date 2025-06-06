// components/SearchBar.jsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { debounce } from 'lodash';
import { MapPin, Clock, X } from 'lucide-react';
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

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [pincode, setPincode] = useState('560062');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [results, setResults] = useState({
    businesses: [],
    categories: [],
    tags: [],
    cities: [],
    names: [],
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
    debounce(async (query, pin) => {
      if (!query) {
        setResults({
          businesses: [],
          categories: [],
          tags: [],
          cities: [],
          names: [],
        });
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const queryParams = new URLSearchParams({ q: query, pincode: pin });
        const response = await fetch(`/api/search?${queryParams.toString()}`, {
          cache: 'no-store',
        });
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        const result = await response.json();
        if (result?.success && result?.data) {
          setResults(result.data);
        } else {
          setResults({
            businesses: [],
            categories: [],
            tags: [],
            cities: [],
            names: [],
          });
          setError('No results found for your search.');
        }
      } catch (error) {
        console.error('Error fetching search results:', error.message);
        setError('Failed to load results. Please try again.');
        setResults({
          businesses: [],
          categories: [],
          tags: [],
          cities: [],
          names: [],
        });
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchResults(searchQuery, pincode);
  }, [searchQuery, pincode, fetchResults]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery) {
      saveRecentSearch(searchQuery);
      const queryParams = new URLSearchParams({ query: searchQuery, pincode });
      router.push(`/category?${queryParams.toString()}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleSelect = (item) => {
    saveRecentSearch(item.name);
    const queryParams = new URLSearchParams({ pincode: item.pincode });
    switch (item.type) {
      case 'business':
        queryParams.append('name', item.name);
        break;
      case 'category':
        queryParams.append('category', item.name);
        break;
      case 'tag':
        queryParams.append('tag', item.name);
        break;
      case 'city':
        queryParams.append('city', item.name);
        break;
      case 'name':
        queryParams.append('name', item.name);
        break;
    }
    router.push(`/category?${queryParams.toString()}`);
    setSearchQuery('');
    setIsSearchOpen(false);
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
    <div className="flex items-center gap-2 w-full max-w-4xl">
      <div className="flex items-center border border-gray-300 rounded-md overflow-hidden dark:border-gray-600">
        <MapPin className="h-5 w-5 text-gray-500 mx-2 dark:text-gray-400" />
        <Input
          type="text"
          placeholder="Enter pincode"
          value={pincode}
          onChange={(e) => setPincode(e.target.value || '560062')}
          className="w-32 border-none focus:ring-0 dark:bg-gray-800 dark:text-gray-200"
          aria-label="Enter pincode"
        />
      </div>
      <div className="relative flex-1" ref={searchRef}>
        <form onSubmit={handleSearch} className="w-full">
          <Command className="rounded-lg border border-gray-300 dark:border-gray-600 w-full relative overflow-visible">
            <div className="relative w-full [&_[cmdk-input-wrapper]]:block [&_[cmdk-input-wrapper]]:w-full">
              <CommandInput
                placeholder="Search by businesses, categories, tags, cities, names..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                onFocus={() => setIsSearchOpen(true)}
                className="w-full border-none pr-10 pl-3 text-sm py-2 dark:bg-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:ring-0"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchQuery('')}
                    className="h-6 w-6 dark:hover:bg-gray-800"
                  >
                    <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </Button>
                )}
              </div>
            </div>
            
            {/* Dropdown Results */}
            {isSearchOpen && (
              <div className="absolute top-full left-0 w-full z-50 mt-0">
                <CommandList className="w-full bg-white shadow-lg rounded-b-lg max-h-[500px] overflow-y-auto dark:bg-gray-700 border border-t-0 dark:border-gray-600">
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
                              className="text-blue-500 text-xs dark:text-blue-400"
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
                                  `/category?query=${encodeURIComponent(search)}&pincode=${pincode}`
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
                              <span className="font-medium">{item.name}</span>
                              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                                ({item.category})
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
                      {results.names.length > 0 && (
                        <CommandGroup heading="Names">
                          {results.names.map((item) => (
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
                      {searchQuery &&
                        !results.businesses.length &&
                        !results.categories.length &&
                        !results.tags.length &&
                        !results.cities.length &&
                        !results.names.length && (
                          <CommandEmpty>No results found.</CommandEmpty>
                        )}
                    </>
                  )}
                </CommandList>
              </div>
            )}
          </Command>
        </form>
      </div>
    </div>
  );
};

export default SearchBar;