// import type { NextApiRequest, NextApiResponse } from 'next';
// import dbConnect from '@/lib/dbConnect';
// import User from '@/models/User';

// type ResponseData = {
//   success: boolean;
//   data?: any;
//   error?: string;
// };

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse<ResponseData>
// ) {
//   await dbConnect();

//   try {
//     if (req.method === 'POST') {
//       const { name, email, age } = req.body;
//       const user = await User.create({ name, email, age });
//       return res.status(201).json({ success: true, data: user });
//     }

//     if (req.method === 'GET') {
//       const users = await User.find();
//       return res.status(200).json({ success: true, data: users });
//     }

//     res.setHeader('Allow', ['GET', 'POST']);
//     return res.status(405).json({ success: false, error: 'Method not allowed' });
//   } catch (error) {
//     return res.status(500).json({ success: false, error: 'Server error' });
//   }
// }




  {/* <div className="mb-6 ">
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
      )} */}