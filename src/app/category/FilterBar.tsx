
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Star, ChevronDown, X, SlidersHorizontal } from 'lucide-react';

type FilterBarProps = {
  sortOption: string;
  setSortOption: (value: string) => void;
  topRatedSort: 'asc' | 'desc' | null;
  setTopRatedSort: (value: 'asc' | 'desc' | null) => void;
  sortByVerified: boolean;
  setSortByVerified: (value: boolean) => void;
  sortByTrusted: boolean;
  setSortByTrusted: (value: boolean) => void;
  ratingSort: number | null;
  setRatingSort: (value: number | null) => void;
  selectedPincode: string;
  selectedCity: string;
  clearAllFilters: () => void;
};

const FilterBar = ({
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
}: FilterBarProps) => {
  // Staged states for filter modal
  const [stagedSortOption, setStagedSortOption] = useState(sortOption);
  const [stagedTopRatedSort, setStagedTopRatedSort] = useState(topRatedSort);
  const [stagedSortByVerified, setStagedSortByVerified] = useState(sortByVerified);
  const [stagedSortByTrusted, setStagedSortByTrusted] = useState(sortByTrusted);
  const [stagedRatingSort, setStagedRatingSort] = useState(ratingSort);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRatingDropdownOpen, setIsRatingDropdownOpen] = useState(false);
  const [showAllFilters, setShowAllFilters] = useState(false);

  // Sync staged states when modal opens
  useEffect(() => {
    if (showAllFilters) {
      setStagedSortOption(sortOption);
      setStagedTopRatedSort(topRatedSort);
      setStagedSortByVerified(sortByVerified);
      setStagedSortByTrusted(sortByTrusted);
      setStagedRatingSort(ratingSort);
    }
  }, [showAllFilters, sortOption, topRatedSort, sortByVerified, sortByTrusted, ratingSort]);

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


return (
    <>
      <div  
        className="dark:bg-gray-800 p-4 -mt-2 rounded-lg w-full flex justify-between items-center mx-auto bg-white shadow-md"
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
                <Button
                  onClick={() => {
                    setSortOption('default');
                    setStagedSortOption('default');
                    setIsDropdownOpen(false);
                  }}
                  className="block w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600"
                >
                  Default
                </Button>
                <Button
                  onClick={() => {
                    setSortOption('rating');
                    setStagedSortOption('rating');
                    setIsDropdownOpen(false);
                  }}
                  className="block w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600"
                >
                  Rating
                </Button>
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
              aria-label="rating-sort-options"
              aria-expanded={isRatingDropdownOpen}
            >
              Ratings: {ratingSort ? `${ratingSort}+` : 'All'}
              <ChevronDown className="h-4 w-4" />
            </Button>
            {isRatingDropdownOpen && (
              <div className="absolute z-50 mt-1 w-32 bg-white rounded-md shadow-lg dark:bg-gray-700">
                <Button
                  onClick={() => {
                    setRatingSort(null);
                    setStagedRatingSort(null);
                    setIsRatingDropdownOpen(false);
                  }}
                  className="block w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600"
                >
                  All
                </Button>
                {[5, 4.5, 4.0, 3.5].map((value) => (
                  <Button
                    key={value}
                    onClick={() => {
                      setRatingSort(value);
                      setStagedRatingSort(value);
                      setIsRatingDropdownOpen(false);
                    }}
                    className="block w-full px-4 py-2 text-left text-gray-800 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600"
                  >
                    {value}+
                  </Button>
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

          {/* {(sortOption !== 'default' 
            topRatedSort 
            sortByVerified 
            sortByTrusted 
            ratingSort 
            selectedPincode !== '560062' 
            selectedCity) && (
            <Button
              onClick={clearAllFilters}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
            >
              Clear All
            </Button>
          )} */}
        </div>
      </div>

      {showAllFilters && (
        <>
          <div
            className="fixed inset-0"
            onClick={() => setShowAllFilters(false)}
          />
          <div
            className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-800 shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
              showAllFilters ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="p-6 h-full mt-30 flex flex-col">
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
    </>
  );
};

export default FilterBar;