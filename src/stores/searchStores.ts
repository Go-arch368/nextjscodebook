import { create } from 'zustand';
import { debounce } from 'lodash';

interface SearchResultItem {
  id: string;
  name: string;
  type: 'business' | 'category' | 'tag' | 'city' | 'name' | 'subcategory';
  pincode: string;
  category?: string;
}

interface SearchResults {
  businesses: SearchResultItem[];
  categories: SearchResultItem[];
  tags: SearchResultItem[];
  cities: SearchResultItem[];
  names: SearchResultItem[];
  subcategories: SearchResultItem[];
}

interface ApiResponse {
  success: boolean;
  data?: SearchResults;
  error?: string;
}

interface SearchState {
  isLoading: boolean;
  error: string | null;
  pincodeError: string | null;
  results: SearchResults;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPincodeError: (error: string | null) => void;
  setResults: (results: SearchResults) => void;
  validatePincode: (pincode: string, locale: string, searchParams: URLSearchParams | null) => void;
  fetchResults: (query: string, pincode: string, city: string, locale: string, searchParams: URLSearchParams | null) => void;
}

export const useSearchStore = create<SearchState>((set) => {
  const debouncedValidatePincode = debounce(
    async (pincode: string, locale: string, searchParams: URLSearchParams | null) => {
      const effectivePincode = pincode || (searchParams?.get('pincode') || '');
      if (!effectivePincode || !/^\d{6}$/.test(effectivePincode)) {
        set({ pincodeError: 'Please enter a valid 6-digit pincode', isLoading: false });
        return;
      }
      set({ isLoading: true, pincodeError: null });
      try {
        const response = await fetch(`/api/search?pincode=${encodeURIComponent(effectivePincode)}&lang=${locale}`, {
          cache: 'no-store',
        });
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        const result = await response.json() as ApiResponse;
        console.log('Validate Pincode Response:', result);
        if (!result.success && result.error?.includes('Pincode')) {
          set({ pincodeError: `Pincode ${effectivePincode} not found in the database` });
        } else {
          set({ pincodeError: null });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error validating pincode:', errorMessage);
        set({ pincodeError: `Failed to validate pincode: ${errorMessage}` });
      } finally {
        set({ isLoading: false });
      }
    },
    300
  );

  const debouncedFetchResults = debounce(
    async (query: string, pincode: string, city: string, locale: string, searchParams: URLSearchParams | null) => {
      const effectivePincode = pincode || (searchParams?.get('pincode') || '');
      if (!query || !effectivePincode) {
        set({
          results: {
            businesses: [],
            categories: [],
            tags: [],
            cities: [],
            names: [],
            subcategories: [],
          },
          isLoading: false,
        });
        return;
      }

      set({ isLoading: true, error: null });
      const queryParams = new URLSearchParams({ q: query, pincode: effectivePincode, lang: locale });
      if (city) {
        queryParams.set('city', city);
      }
      try {
        const response = await fetch(`/api/search?${queryParams.toString()}`, {
          cache: 'no-store',
        });
        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }
        const result = await response.json() as ApiResponse;
        console.log('Search Results Response:', result);
        if (result.success && result.data) {
          set({
            results: {
              ...result.data,
              subcategories: result.data.subcategories || [],
            },
          });
        } else {
          set({
            results: {
              businesses: [],
              categories: [],
              tags: [],
              cities: [],
              names: [],
              subcategories: [],
            },
            error: result.error || 'No results found for your search.',
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error fetching search results:', errorMessage);
        set({
          error: 'Failed to load results. Please try again.',
          results: {
            businesses: [],
            categories: [],
            tags: [],
            cities: [],
            names: [],
            subcategories: [],
          },
        });
      } finally {
        set({ isLoading: false });
      }
    },
    300
  );

  return {
    isLoading: false,
    error: null,
    pincodeError: null,
    results: {
      businesses: [],
      categories: [],
      tags: [],
      cities: [],
      names: [],
      subcategories: [],
    },
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),
    setPincodeError: (error) => set({ pincodeError: error }),
    setResults: (results) => set({ results }),
    validatePincode: debouncedValidatePincode,
    fetchResults: debouncedFetchResults,
  };
});