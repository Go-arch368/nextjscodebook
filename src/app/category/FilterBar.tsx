// src/components/FilterBar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { SlidersHorizontal, X } from 'lucide-react';

interface FilterBarProps {
  sortOption: string;
  setSortOption: React.Dispatch<React.SetStateAction<string>>;
  topRatedSort: string | null;
  setTopRatedSort: React.Dispatch<React.SetStateAction<string | null>>;
  sortByVerified: boolean;
  setSortByVerified: React.Dispatch<React.SetStateAction<boolean>>;
  sortByTrusted: boolean;
  setSortByTrusted: React.Dispatch<React.SetStateAction<boolean>>;
  ratingSort: number | null;
  setRatingSort: React.Dispatch<React.SetStateAction<number | null>>;
  selectedPincode: string;
  selectedCity: string | null;
  clearAllFilters: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  sortOption,
  setSortOption,
  topRatedSort,
  setTopRatedSort,
  sortByVerified,
  setSortByVerified,
  sortByTrusted,
  setSortByTrusted,
  ratingSort,
  setRatingSort,
  clearAllFilters,
}) => {
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [stagedSortOption, setStagedSortOption] = useState<string>(sortOption);
  const [stagedTopRatedSort, setStagedTopRatedSort] = useState<string | null>(topRatedSort);
  const [stagedSortByVerified, setStagedSortByVerified] = useState<boolean>(sortByVerified);
  const [stagedSortByTrusted, setStagedSortByTrusted] = useState<boolean>(sortByTrusted);
  const [stagedRatingSort, setStagedRatingSort] = useState<number | null>(ratingSort);

  useEffect(() => {
    if (showFilters) {
      setStagedSortOption(sortOption);
      setStagedTopRatedSort(topRatedSort);
      setStagedSortByVerified(sortByVerified);
      setStagedSortByTrusted(sortByTrusted);
      setStagedRatingSort(ratingSort);
    }
  }, [showFilters, sortOption, topRatedSort, sortByVerified, sortByTrusted, ratingSort]);

  const applyFilters = () => {
    setSortOption(stagedSortOption);
    setTopRatedSort(stagedTopRatedSort);
    setSortByVerified(stagedSortByVerified);
    setSortByTrusted(stagedSortByTrusted);
    setRatingSort(stagedRatingSort);
    setShowFilters(false);
  };

  const resetFilters = () => {
    setStagedSortOption('default');
    setStagedTopRatedSort(null);
    setStagedSortByVerified(false);
    setStagedSortByTrusted(false);
    setStagedRatingSort(null);
  };

  return (
    <>
      <div className="mb-6">
        <Button
          onClick={() => setShowFilters(true)}
          className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 flex items-center gap-2 px-4 py-2 rounded-lg"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </Button>
      </div>
      {showFilters && (
        <>
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm z-40"
            onClick={() => setShowFilters(false)}
          />
          <div className="fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 shadow-lg z-50 transform transition-transform duration-300 ease-in-out translate-x-0">
            <div className="p-6 h-full flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                  aria-label="Close filters"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex-1 space-y-6 overflow-y-auto">
                <div>
                  <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Sort By</h4>
                  <div className="flex flex-wrap gap-2">
                    {['default', 'rating'].map((option) => (
                      <Button
                        key={option}
                        onClick={() => setStagedSortOption(option)}
                        className={`${
                          stagedSortOption === option
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                        } px-3 py-1 rounded-lg text-sm`}
                      >
                        {option === 'default' ? 'Default' : 'Rating'}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Top Rated</h4>
                  <div className="flex flex-wrap gap-2">
                    {['desc', 'asc', null].map((value) => (
                      <Button
                        key={String(value)}
                        onClick={() => setStagedTopRatedSort(value)}
                        className={`${
                          stagedTopRatedSort === value
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                        } px-3 py-1 rounded-lg text-sm`}
                      >
                        {value === 'desc' ? 'Descending' : value === 'asc' ? 'Ascending' : 'None'}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Verification</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => setStagedSortByVerified(!stagedSortByVerified)}
                      className={`${
                        stagedSortByVerified
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                      } px-3 py-1 rounded-lg text-sm`}
                    >
                      Verified
                    </Button>
                    <Button
                      onClick={() => setStagedSortByTrusted(!stagedSortByTrusted)}
                      className={`${
                        stagedSortByTrusted
                          ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                      } px-3 py-1 rounded-lg text-sm`}
                    >
                      Trusted
                    </Button>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Minimum Rating</h4>
                  <div className="flex flex-wrap gap-2">
                    {[null, 5, 4.5, 4.0, 3.5].map((value) => (
                      <Button
                        key={String(value)}
                        onClick={() => setStagedRatingSort(value)}
                        className={`${
                          stagedRatingSort === value
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                        } px-3 py-1 rounded-lg text-sm`}
                      >
                        {value === null ? 'All' : `${value}+`}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-between">
                <Button
                  onClick={resetFilters}
                  className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 px-4 py-2 rounded-lg"
                >
                  Reset
                </Button>
                <Button
                  onClick={applyFilters}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default FilterBar;