'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, PlusCircle, Bell, User, Menu, Search, MapPin } from 'lucide-react';

const CategoryNavbar = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const router = useRouter();

  const categoryIdToName = {
    1: 'Best Clinics',
    2: 'Best Hospitals',
    3: 'Best Dentists',
    4: 'Chemists',
    5: 'Best Veterinarians',
    6: 'Car Repair & Services',
    7: 'Car Showrooms',
    8: 'Tyre Dealers',
    9: 'Autospares Hub',
    10: "Top Educational Institutions : Colleges",
    11: "Best Fast Food",
    12: "Best Bakeries",
    13: "Leading Educational Institutions : Top Schools",
    14: "Lawyers",
    15: "Marketing Agencies",
    16: "Professional Business Consultants",
    17: "Carpenters",
    18: "Electricians",
    19: "Plumbers",
    20: "Cleaning Services",
    21: "Airlines",
    22: "Best Deals - Top Hotels",
    23: "Travel Agents",
    24: "Trusted Financial Partners : Banks near me",
    25: "Loan Agency Services",
    26: 'AC Repair & Services',
    // Removed duplicate "Best Deals - Top Hotels"
  };

  // Convert to array of objects with both id and name
  const categories = Object.entries(categoryIdToName).map(([id, name]) => ({
    id: parseInt(id),
    name
  }));

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery || location) {
      router.push(`/category?category=${encodeURIComponent(searchQuery)}`);
      setMobileMenuOpen(false);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
    
        <Link href="/" className="text-2xl font-bold text-orange-600">
          LOGOS
        </Link>

       
        <div className="hidden md:flex items-center flex-1 mx-8 gap-2">
              <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
              <input
                type="text"
                placeholder="Location"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                aria-label="Search for services"
              />
              
            </div>
          <div className="relative w-[40%] min-w-[200px]">
            
            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                aria-label="Search for services"
              />
              <button
                onClick={handleSearch}
                className="px-2 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-r-md"
                aria-label="Search"
              >
                <Search className="h-7 w-7" />
              </button>
            </div>
           
            {searchQuery && (
              <div className="absolute z-10 w-full bg-white shadow-md rounded-md mt-1 max-h-60 overflow-y-auto">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <Link
                      key={category.id}  
                      href={`/category?category=${encodeURIComponent(category.name)}`}
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => {
                        console.log('Selected category:', category.name);
                        setSearchQuery(category.name);
                        setMobileMenuOpen(false);
                      }}
                    >
                      {category.name}
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500">No results found</div>
                )}
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
            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden max-w-[70%]">
              <MapPin className="h-5 w-5 text-gray-500 mx-2" />
              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full py-2 px-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                aria-label="Enter location"
              />
            </div>

            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden max-w-[80%]">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                aria-label="Search for services"
              />
              <button
                onClick={handleSearch}
                className="px-2 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-r-md"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>

            {searchQuery && (
              <div className="relative z-10 w-full bg-white shadow-md rounded-md mt-1 max-h-60 overflow-y-auto">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <Link
                      key={category.id}  // Using the unique ID as key
                      href={`/category?category=${encodeURIComponent(category.name)}`}
                      className="block px-4 py-2 hover:bg-gray-100"
                      onClick={() => {
                        console.log('Selected category:', category.name);
                        setSearchQuery(category.name);
                        setMobileMenuOpen(false);
                      }}
                    >
                      {category.name}
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500">No results found</div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col p-4 space-y-4">
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