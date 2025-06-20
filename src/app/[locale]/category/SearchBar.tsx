"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { debounce } from "lodash";
import { Clock, X } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import LocationModal from "./LocationModal";
import { useLocale } from "next-intl";


// Define interface for search result items
interface SearchResultItem {
  id: string;
  name: string;
  type: "business" | "category" | "tag" | "city" | "name";
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
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [pincode, setPincode] = useState<string>("");
  const [city, setCity] = useState<string>("");
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
  const searchRef = useRef<HTMLDivElement>(null);

  // Load recent searches, pincode, city, and URL parameters on mount
  useEffect(() => {
    if (pathname !== "/category") return;
    const storedSearches = JSON.parse(localStorage.getItem("recentSearches") || "[]") as string[];
    const storedPincode = localStorage.getItem("pincode") || "";
    const storedCity = localStorage.getItem("city") || "";
    const urlPincode = searchParams?.get("pincode") || "";
    const urlCity = searchParams?.get("city") || "";
    const query = searchParams?.get("query") || "";

    setRecentSearches(storedSearches);
    setSearchQuery(query);
    setPincode(urlPincode || storedPincode);
    setCity(urlCity || storedCity);
  }, [searchParams, pathname]);

  // Save pincode and city to localStorage whenever they change
  useEffect(() => {
    if (pincode) {
      localStorage.setItem("pincode", pincode);
    } else {
      localStorage.removeItem("pincode");
    }
    if (city) {
      localStorage.setItem("city", city);
    } else {
      localStorage.removeItem("city");
    }
  }, [pincode, city]);

  // Update URL when pincode or city changes, preserving one existing parameter if present
  useEffect(() => {
    if (pathname !== "/category") return;
    if (pincode && !pincodeError && searchParams && /^\d{6}$/.test(pincode)) {
      const currentParams = new URLSearchParams();
      currentParams.set("pincode", pincode);
      if (city) {
        currentParams.set("city", city);
      }

      const allowedParams = ["name", "category", "tag", "query"];
      const existingParam = allowedParams.find((param) => searchParams.has(param));
      if (existingParam) {
        const paramValue = searchParams.get(existingParam);
        if (paramValue) {
          currentParams.set(existingParam, paramValue);
        }
      }

      const currentUrl = `/category?${currentParams.toString()}`;
      const existingUrl = `/category?${searchParams.toString()}`;
      if (currentUrl !== existingUrl) {
        router.push(currentUrl, { scroll: false });
      }
    } else if (!pincode && !pincodeError) {
      setPincodeError("Please select a valid pin");
    }
  }, [pincode, city, pincodeError, router, searchParams, pathname]);

  const handlePincodeChange = (newPincode: string, newCity?: string) => {
    setPincode(newPincode);
    setCity(newCity || "");
    setPincodeError(null);

    if (pathname === "/category") {
      const currentParams = new URLSearchParams();
      currentParams.set("pincode", newPincode);
      if (newCity) {
        currentParams.set("city", newCity);
      }

      const allowedParams = ["name", "category", "tag", "query"];
      const existingParam = allowedParams.find((param) => searchParams?.has(param));
      if (existingParam) {
        const paramValue = searchParams?.get(existingParam);
        if (paramValue) {
          currentParams.set(existingParam, paramValue);
        }
      }

      router.replace(`/category?${currentParams.toString()}`, { scroll: false });
    } else {
      router.push(`/category?pincode=${newPincode}${newCity ? `&city=${newCity}` : ""}`);
    }
  };

  const saveRecentSearch = (query: string) => {
    if (!query) return;
    let updatedSearches = [...recentSearches];
    updatedSearches = updatedSearches.filter((search) => search.toLowerCase() !== query.toLowerCase());
    updatedSearches.unshift(query);
    updatedSearches = updatedSearches.slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const validatePincode = useCallback(
    debounce((pin: string) => {
      const effectivePincode = pin || (searchParams?.get("pincode") || "");
      if (!effectivePincode || !/^\d{6}$/.test(effectivePincode)) {
        setPincodeError("Please enter a valid 6-digit pincode");
        return;
      }
      setIsLoading(true);
      setPincodeError(null);
      fetch(`/api/search?pincode=${encodeURIComponent(effectivePincode)}&lang=${locale}`, {
        cache: "no-store",
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
          }
          return response.json() as Promise<ApiResponse>;
        })
        .then((result) => {
          console.log("Validate Pincode Response:", result); // Debug log
          if (!result.success && result.error?.includes("Pincode")) {
            setPincodeError(`Pincode ${effectivePincode} not found in the database`);
          } else {
            setPincodeError(null);
            if (!pin && effectivePincode) {
              setPincode(effectivePincode);
            }
          }
        })
        .catch((error: unknown) => {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          console.error("Error validating pincode:", errorMessage);
          setPincodeError(`Failed to validate pincode: ${errorMessage}`);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 300),
    [searchParams, locale]
  );

  const fetchResults = useCallback(
    debounce((query: string, pin: string) => {
      const effectivePincode = pin || (searchParams?.get("pincode") || "");
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

      setIsLoading(true);
      setError(null);
      const queryParams = new URLSearchParams({ q: query, pincode: effectivePincode, lang: locale });
      if (city) {
        queryParams.set("city", city);
      }
      fetch(`/api/search?${queryParams.toString()}`, {
        cache: "no-store",
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
          }
          return response.json() as Promise<ApiResponse>;
        })
        .then((result) => {
          console.log("Search Results Response:", result); // Debug log
          if (result.success && result.data) {
            setResults(result.data);
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
            setError(result.error || "No results found for your search.");
          }
        })
        .catch((error: unknown) => {
          const errorMessage = error instanceof Error ? error.message : "Unknown error";
          console.error("Error fetching search results:", errorMessage);
          setError("Failed to load results. Please try again.");
          setResults({
            businesses: [],
            categories: [],
            tags: [],
            cities: [],
            names: [],
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, 300),
    [searchParams, city, locale]
  );

  useEffect(() => {
    if (pincode) {
      validatePincode(pincode);
    }
    fetchResults(searchQuery, pincode);
  }, [searchQuery, pincode, fetchResults, validatePincode]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const effectivePincode = pincode || (searchParams?.get("pincode") || "");
    if (!effectivePincode || !/^\d{6}$/.test(effectivePincode)) {
      setPincodeError("Please enter a valid 6-digit pincode");
      return;
    }
    if (pincodeError) {
      return;
    }
    if (searchQuery) {
      saveRecentSearch(searchQuery);
      const currentParams = new URLSearchParams();
      currentParams.set("pincode", effectivePincode);
      if (city) {
        currentParams.set("city", city);
      }
      currentParams.set("query", searchQuery);
      router.push(`/category?${currentParams.toString()}`);
      setIsSearchOpen(false);
      setSearchQuery("");
      if (!pincode && effectivePincode) {
        setPincode(effectivePincode);
      }
    }
  };

  const handleSelect = (item: SearchResultItem) => {
    const effectivePincode = pincode || (searchParams?.get("pincode") || "");
    if (!effectivePincode || !/^\d{6}$/.test(effectivePincode)) {
      setPincodeError("Please enter a valid 6-digit pincode");
      return;
    }
    if (pincodeError) {
      return;
    }
    saveRecentSearch(item.name);
    const currentParams = new URLSearchParams();
    currentParams.set("pincode", effectivePincode);
    if (city) {
      currentParams.set("city", city);
    }
    switch (item.type) {
      case "business":
        currentParams.set("name", item.name);
        break;
      case "category":
        currentParams.set("category", item.name);
        break;
      case "tag":
        currentParams.set("tag", item.name);
        break;
      case "city":
        currentParams.set("city", item.name);
        break;
      case "name":
        currentParams.set("name", item.name);
        break;
    }
    router.push(`/category?${currentParams.toString()}`);
    setSearchQuery("");
    setIsSearchOpen(false);
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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-center gap-2 w-full max-w-4xl">
      <div className="flex flex-col gap-1 w-auto">
        <LocationModal onPincodeChange={handlePincodeChange} />
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
                    onClick={() => setSearchQuery("")}
                    className="h-6 w-6 dark:hover:bg-gray-700"
                  >
                    <X className="h-4 w-4 dark:text-gray-400" />
                  </Button>
                )}
              </div>
            </div>
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
                                const effectivePincode = pincode || (searchParams?.get("pincode") || "");
                                if (!effectivePincode || !/^\d{6}$/.test(effectivePincode)) {
                                  setPincodeError("Please enter a valid 6-digit pincode");
                                  return;
                                }
                                if (pincodeError) return;
                                setSearchQuery(search);
                                saveRecentSearch(search);
                                const currentParams = new URLSearchParams();
                                currentParams.set("pincode", effectivePincode);
                                if (city) {
                                  currentParams.set("city", city);
                                }
                                currentParams.set("query", search);
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
                              {item.category && (
                                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                                  ({item.category})
                                </span>
                              )}
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