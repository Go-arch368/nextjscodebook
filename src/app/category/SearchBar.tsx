// components/SearchBar.tsx
'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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

// Define interface for search result items
interface SearchResultItem {
  id: string;
  name: string;
  type: 'business' | 'category' | 'tag' | 'city' | 'name';
  pincode: string;
  category?: string;
}

// Define interface for search results from API
interface SearchResults {
  businesses: SearchResultItem[];
  categories: SearchResultItem[];
  tags: SearchResultItem[];
  cities: SearchResultItem[];
  names: SearchResultItem[];
}

// Define interface for API response
interface ApiResponse {
  success: boolean;
  data?: SearchResults;
  error?: string;
}

const SearchBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pincode, setPincode] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [results, setResults] = useState<SearchResults>({
    businesses: [],
    categories: [],
    tags: [],
    cities: [],
    names: [],
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pincodeError, setPincodeError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchRef = useRef<HTMLDivElement>(null);

  // Load recent searches, pincode, and URL parameters on mount
  useEffect(() => {
    const storedSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]') as string[];
    const storedPincode = localStorage.getItem('pincode') || '';
    // Safely access searchParams
    const urlPincode = searchParams ? searchParams.get('pincode') || '' : '';
    const query = searchParams ? searchParams.get('query') || '' : '';

    setRecentSearches(storedSearches);
    setSearchQuery(query);
    // Prefer stored pincode, fall back to URL pincode
    setPincode(storedPincode || urlPincode);
  }, [searchParams]);

  // Save pincode to localStorage whenever it changes
  useEffect(() => {
    if (pincode) {
      localStorage.setItem('pincode', pincode);
    } else {
      localStorage.removeItem('pincode');
    }
  }, [pincode]);

  // Update URL when pincode changes, preserving one existing parameter if present
  useEffect(() => {
    if (pincode && !pincodeError && searchParams) {
      const currentParams = new URLSearchParams();
      currentParams.set('pincode', pincode);

      // Check for exactly one existing parameter to preserve
      const allowedParams = ['name', 'category', 'tag', 'city', 'query'];
      const existingParam = allowedParams.find((param) => searchParams.has(param));
      if (existingParam) {
        const paramValue = searchParams.get(existingParam);
        if (paramValue) {
          currentParams.set(existingParam, paramValue);
        }
      }

      // Only update URL if the pincode or parameters have changed
      const currentUrl = `/category?${currentParams.toString()}`;
      const existingUrl = `/category?${searchParams.toString()}`;
      if  (currentUrl !== existingUrl) {
        router.push(currentUrl, { scroll: false });
      }
    }
  }, [pincode, pincodeError, router, searchParams]);

  const saveRecentSearch = (query: string) => {
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

  const validatePincode = useCallback(
    debounce(async (pin: string) => {
      // Use URL pincode as fallback if input pin is empty
      const effectivePincode = pin || (searchParams ? searchParams.get('pincode') || '' : '');
      if (!effectivePincode) {
        setPincodeError('Pincode is required');
        return;
      }
      try {
        setIsLoading(true);
        setPincodeError(null);
        const response = await fetch(`/api/search?pincode=${encodeURIComponent(effectivePincode)}`, {
          cache: 'no-store',
        });
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        const result: ApiResponse = await response.json();
        if (!result.success && result.error?.includes('Pincode')) {
          setPincodeError(`Pincode ${effectivePincode} not found in the database`);
        } else {
          setPincodeError(null);
          // Update pincode state if using URL pincode
          if (!pin && effectivePincode) {
            setPincode(effectivePincode);
          }
        }
      } catch (error: any) {
        console.error('Error validating pincode:', error.message);
        setPincodeError(`Failed to validate pincode: ${error?.message}`);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [searchParams]
  );

  const fetchResults = useCallback(
    debounce(async (query: string, pin: string) => {
      // Use URL pincode as fallback if input pin is empty
      const effectivePincode = pin || (searchParams ? searchParams.get('pincode') || '' : '');
      if (!query || !effectivePincode) {
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
        const queryParams = new URLSearchParams({ q: query, pincode: effectivePincode });
        const response = await fetch(`/api/search?${queryParams.toString()}`, {
          cache: 'no-store',
        });
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        const result: ApiResponse = await response.json();
        if (result.success && result.data) {
          setResults(result.data);
          // Update pincode state if using URL pincode
          if (!pin && effectivePincode) {
            setPincode(effectivePincode);
          }
        } else {
          setResults({
            businesses: [],
            categories: [],
            tags: [],
            cities: [],
            names: [],
          });
          setError(result.error || 'No results found for your search.');
        }
      } catch (error: any) {
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
    [searchParams]
  );

  useEffect(() => {
    validatePincode(pincode);
    fetchResults(searchQuery, pincode);
  }, [searchQuery, pincode, fetchResults, validatePincode]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Use URL pincode if input is empty
    const effectivePincode = pincode || (searchParams ? searchParams.get('pincode') || '' : '');
    if (!effectivePincode) {
      setPincodeError('Pincode is required');
      return;
    }
    if (pincodeError) {
      return;
    }
    if (searchQuery) {
      saveRecentSearch(searchQuery);
      const currentParams = new URLSearchParams();
      currentParams.set('pincode', effectivePincode);
      currentParams.set('query', searchQuery);
      router.push(`/category?${currentParams.toString()}`);
      setIsSearchOpen(false);
      setSearchQuery('');
      // Update pincode state if using URL pincode
      if (!pincode && effectivePincode) {
        setPincode(effectivePincode);
      }
    }
  };

  const handleSelect = (item: SearchResultItem) => {
    // Use URL pincode if input is empty
    const effectivePincode = pincode || (searchParams ? searchParams.get('pincode') || '' : '');
    if (!effectivePincode) {
      setPincodeError('Pincode is required');
      return;
    }
    if (pincodeError) {
      return;
    }
    saveRecentSearch(item.name);
    const currentParams = new URLSearchParams();
    currentParams.set('pincode', effectivePincode);
    switch (item.type) {
      case 'business':
        currentParams.set('name', item.name);
        break;
      case 'category':
        currentParams.set('category', item.name);
        break;
      case 'tag':
        currentParams.set('tag', item.name);
        break;
      case 'city':
        currentParams.set('city', item.name);
        break;
      case 'name':
        currentParams.set('name', item.name);
        break;
    }
    router.push(`/category?${currentParams.toString()}`);
    setSearchQuery('');
    setIsSearchOpen(false);
    // Update pincode state if using URL pincode
    if (!pincode && effectivePincode) {
      setPincode(effectivePincode);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-2 w-full max-w-4xl">
      <div className="flex flex-col gap-1 w-32">
        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden dark:border-gray-600">
          <MapPin className="h-5 w-5 text-gray-500 mx-2 dark:text-gray-400" />
          <Input
            type="text"
            placeholder="Enter pincode"
            value={pincode}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setPincode(e.target.value);
              setPincodeError(null);
            }}
            className={`w-full border-none focus:ring-0 dark:bg-gray-800 dark:text-gray-200 ${
              pincodeError ? 'border-red-500 dark:border-red-400' : ''
            }`}
            aria-label="Enter pincode"
          />
        </div>
        {pincodeError && (
          <p className="text-xs text-red-500 dark:text-red-400">{pincodeError}</p>
        )}
      </div>
      <div className="relative flex-1" ref={searchRef}>
        <form onSubmit={handleSearch} className="w-full">
          <Command className="rounded-lg border border-gray-300 dark:border-gray-600 w-full relative overflow-visible">
            <div className="relative w-full [&_[cmdk-input-wrapper]]:block [&_[cmdk-input-wrapper]]:w-full">
              <CommandInput
                placeholder="Search businesses, services ..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                onFocus={() => setIsSearchOpen(true)}
                className="w-full border-none focus:ring-0 pr-10 text-base dark:bg-gray-800 dark:text-gray-200 placeholder:text-gray-400 placeholder:text-base pl-3 py-2"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchQuery('')}
                    className="h-6 w-6 dark:hover:bg-gray-700"
                  >
                    <X className="h-4 w-4 dark:text-gray-400" />
                  </Button>
                )}
              </div>
            </div>
            {/* Dropdown Results */}
            {isSearchOpen && (
              <div className="absolute top-full left-0 w-full z-50 mt-0">
                <CommandList className="w-full bg-white shadow-lg rounded-b-md max-h-[500px] overflow-y-auto dark:bg-gray-700 border border-t-0 border-gray-300 dark:border-gray-600">
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
                                const effectivePincode = pincode || (searchParams ? searchParams.get('pincode') || '' : '');
                                if (!effectivePincode) {
                                  setPincodeError('Pincode is required');
                                  return;
                                }
                                if (pincodeError) return;
                                setSearchQuery(search);
                                saveRecentSearch(search);
                                const currentParams = new URLSearchParams();
                                currentParams.set('pincode', effectivePincode);
                                currentParams.set('query', search);
                                router.push(`/category?${currentParams.toString()}`);
                                setIsSearchOpen(false);
                                if (!pincode && effectivePincode) {
                                  setPincode(effectivePincode);
                                }
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