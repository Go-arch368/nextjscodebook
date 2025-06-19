"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThumbsUp, Star, Phone, MessageSquare, MessageCircle, MapPin, ExternalLink, ChevronLeft, ChevronRight, Heart, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import FilterBar from "./FilterBar";
import { fetchImagesByCategory} from "@/utils/imageUtils"; // Adjust the import path as necessary

function debounce<T extends (...args: any[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

function generateRandomPhone() {
  const firstDigit = Math.floor(Math.random() * 4) + 6;
  const randomNum = Math.floor(Math.random() * 900000000) + 100000000;
  return `+91${firstDigit}${randomNum}`;
}

type Listing = {
  tags?: string[];
  images?: { url: string }[];
  imageError?: string | null;
  name?: string;
  rating?: string | number;
  totalRatings?: string | number;
  isTrusted?: boolean;
  isVerified?: boolean;
  isPopular?: boolean;
  address?: string;
  city?: string;
  pincode?: string;
  phone?: string;
  category?: string;
  [key: string]: any;
};

export default function CategoryContent() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndices, setSelectedImageIndices] = useState<{ [key: number]: number }>({});

  // Sorting and filtering states
  const [sortOption, setSortOption] = useState("default");
  const [topRatedSort, setTopRatedSort] = useState<"asc" | "desc" | null>(null);
  const [sortByVerified, setSortByVerified] = useState(false);
  const [sortByTrusted, setSortByTrusted] = useState(false);
  const [ratingSort, setRatingSort] = useState<number | null>(null);

  // Get query parameters
  const query = searchParams?.get("query");
  const selectedCategory = searchParams?.get("category");
  const selectedTag = searchParams?.get("tag");
  const selectedName = searchParams?.get("name");
  const selectedAddress = searchParams?.get("address");
  const selectedCity = searchParams?.get("city");
  const selectedPincode = searchParams?.get("pincode") || "560062";

  const fetchListings = useCallback(
    debounce(async (params, sort, sortFields) => {
      try {
        setLoading(true);

        const queryParams = new URLSearchParams();
        if (params.query) queryParams.append("query", params.query);
        if (params.category) queryParams.append("category", params.category);
        if (params.tag) queryParams.append("tag", params.tag);
        if (params.name) queryParams.append("name", params.name);
        if (params.address) queryParams.append("address", params.address);
        if (params.city) queryParams.append("city", params.city);
        queryParams.append("pincode", params.pincode);

        if (sort) queryParams.append("sort", sort);
        if (sortFields.sortByVerified) queryParams.append("sortByVerified", "true");
        if (sortFields.sortByTrusted) queryParams.append("sortByTrusted", "true");
        if (sortFields.ratingSort) queryParams.append("sortByRating", sortFields.ratingSort);

        const response = await fetch(`/api/getListings?${queryParams.toString()}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          setListings([]);
          return;
        }

        const result = await response.json();

        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          const imagePromises = result.data.map((listing: any) =>
            fetchImagesByCategory(listing.category) // Use the new function
              .then((data: any) => ({ category: listing.category, data }))
          );

          const imageResults = await Promise.all(imagePromises);
          const imageMap = Object.fromEntries(
            imageResults.map(({ category, data }) => [category, data])
          );

          const listingsWithImages = result.data.map((listing: any) => ({
            ...listing,
            images: imageMap[listing.category]?.images || [],
            imageError: imageMap[listing.category]?.images?.length
              ? null
              : `No images found for ${listing.category}`,
          }));

          setListings(listingsWithImages);
          const initialSelectedIndices: { [key: number]: number } = {};
          listingsWithImages.forEach((_: any, index: number) => {
            initialSelectedIndices[index] = 0;
          });
          setSelectedImageIndices(initialSelectedIndices);
        } else {
          setListings([]);
        }
      } finally {
        setLoading(false);
      }
    }, 1000),
    []
  );

  useEffect(() => {
    let sort = null;
    if (topRatedSort === "desc") {
      sort = "totalRatings-desc";
    } else if (topRatedSort === "asc") {
      sort = "totalRatings-asc";
    } else if (sortOption === "rating") {
      sort = "rating";
    }
    const sortFields = { sortByVerified, sortByTrusted, ratingSort };
    const params = {
      query,
      category: selectedCategory,
      tag: selectedTag,
      name: selectedName,
      address: selectedAddress,
      city: selectedCity,
      pincode: selectedPincode,
    };
    fetchListings(params, sort, sortFields);
  }, [
    fetchListings,
    query,
    selectedCategory,
    selectedTag,
    selectedName,
    selectedAddress,
    selectedCity,
    selectedPincode,
    sortOption,
    topRatedSort,
    sortByVerified,
    sortByTrusted,
    ratingSort,
  ]);

  const handleSelectImage = (listingIndex: number, imageIndex: number) => {
    setSelectedImageIndices((prev) => ({
      ...prev,
      [listingIndex]: imageIndex,
    }));
  };

  const handleEnquireNow = (businessName: string) => {
    alert(`Enquiry sent for ${businessName}! Our team will contact you soon.`);
  };

  const handleVisit = (businessName: string, category: string) => {
    try {
      localStorage.setItem("lastVisitedCategory", category);
      localStorage.setItem("lastVisitedBusiness", businessName);
    } catch (error) {
      console.error("Error writing to localStorage:", error);
    }
  
    const categoryRoutes = {
      "Best Hospitals": "/template?websiteIdentifier=Health%26Medical-Hospital-560038",
      "Best Clinics": "/template?websiteIdentifier=Health%26Medical-Clinics-560038",
      "Best Dentists": "/template?websiteIdentifier=Health%26Medical-Dentists-560062",
      "Chemists": "/template?websiteIdentifier=Health%26Medical-Pharmacies-560098",
      "Best Veterinarians": "/template?websiteIdentifier=Health%26Medical-Veterinary-560076",
      "Car Repair": "/template?websiteIdentifier=Automobile-CarRepair-560062",
      "Car Showrooms": "/template?websiteIdentifier=Automobile-CarSales-560062",
      "Tyre Dealers": "/template?websiteIdentifier=Automobile-Tires-560064",
      "Autospares": "/template?websiteIdentifier=Automobile-AutoParts-560062",
      "Best Physiotherapists": "/template?websiteIdentifier=Health&Medical-Physiotherapy-560025",
    } as const;

    const url = categoryRoutes[category as keyof typeof categoryRoutes] || "/category";
    window.location.href = url;
  };

  const clearAllFilters = () => {
    setSortOption("default");
    setTopRatedSort(null);
    setSortByVerified(false);
    setSortByTrusted(false);
    setRatingSort(null);
    const params = {
      query,
      category: selectedCategory,
      tag: selectedTag,
      name: selectedName,
      address: selectedAddress,
      city: selectedCity,
      pincode: selectedPincode,
    };
    fetchListings(params, null, {});
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="h-full p-5 bg-gray-100 dark:bg-black">
      {/* Filter Bar */}
      {listings.length > 0 && (
        <div className="mb-6">
          <FilterBar
            sortOption={sortOption}
            setSortOption={setSortOption}
            topRatedSort={topRatedSort}
            setTopRatedSort={setTopRatedSort}
            sortByVerified={sortByVerified}
            setSortByVerified={setSortByVerified}
            sortByTrusted={sortByTrusted}
            setSortByTrusted={setSortByTrusted}
            ratingSort={ratingSort}
            setRatingSort={setRatingSort}
            selectedPincode={selectedPincode}
            selectedCity={selectedCity ?? ""}
            clearAllFilters={clearAllFilters}
          />
        </div>
      )}

      {/* Listings */}
      {listings.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">
          No businesses found for your search criteria.
        </p>
      ) : (
        <div className="space-y-6">
          {listings.map((listing, index) => {
            const business = {
              services: Array.isArray(listing?.tags) ? listing.tags : [],
              images: Array.isArray(listing?.images) ? listing.images : [],
              imageError: listing?.imageError || null,
              name: listing?.name || "Unknown Business",
              rating: listing?.rating ? parseFloat(String(listing.rating)).toFixed(1) : "4.5",
              totalRatings: listing?.totalRatings || "100",
              badges: [
                listing?.isTrusted && "Trust",
                listing?.isVerified && "Verified",
                listing?.isPopular && "Claimed",
              ].filter(Boolean),
              address: listing?.address || "Unknown Address",
              city: listing?.city || "Unknown City",
              pincode: listing?.pincode || "000000",
              contact: { phone: listing?.phone || generateRandomPhone() },
              category: listing?.category || "General",
            };

            const selectedImageIndex = selectedImageIndices[index] || 0;
            const totalImages = business.images.length;

            return (
              <div
                key={index}
                className="relative flex flex-col sm:flex-row bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Top-right floating buttons */}
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                  <button
                    aria-label="Share"
                    className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  <button
                    aria-label="Like"
                    className="text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                </div>

                {/* Left: Image */}
                <div className="sm:w-1/3 w-full h-56 sm:h-auto relative">
                  {business.imageError ? (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                      {business.imageError}
                    </div>
                  ) : business.images.length > 0 ? (
                    <>
                      <Image
                        src={business.images[selectedImageIndex]?.url || "/placeholder.jpg"}
                        alt={`${business.name} image`}
                        className="object-cover w-full h-full"
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                      />
                      {totalImages > 1 && (
                        <>
                          {selectedImageIndex > 0 && (
                            <button
                              onClick={() => handleSelectImage(index, selectedImageIndex - 1)}
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-900 bg-opacity-70 p-2 rounded-full shadow-md hover:bg-opacity-90 transition-all duration-300 hover:scale-110"
                              aria-label="Previous image"
                            >
                              <ChevronLeft className="w-4 h-4 text-white" />
                            </button>
                          )}
                          {selectedImageIndex < totalImages - 1 && (
                            <button
                              onClick={() => handleSelectImage(index, selectedImageIndex + 1)}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-900 bg-opacity-70 p-2 rounded-full shadow-md hover:bg-opacity-90 transition-all duration-300 hover:scale-110"
                              aria-label="Next image"
                            >
                              <ChevronRight className="w-4 h-4 text-white" />
                            </button>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                      No images available
                    </div>
                  )}
                </div>

                {/* Right: Details */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="w-5 h-5 bg-blue-600 text-white p-1 rounded-full" />
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {business.name}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="bg-green-600 text-white px-2 py-1 text-sm flex items-center gap-1">
                        {business.rating}
                        <Star className="ml-1 h-3 w-3 text-white fill-current" />
                      </Badge>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        ({business.totalRatings} ratings)
                      </span>
                      {business.badges.map((badge, idx) => (
                        <Badge
                          key={idx}
                          className={
                            badge === "Trust"
                              ? "bg-yellow-400 text-black text-xs"
                              : badge === "Verified"
                              ? "bg-blue-500 text-white text-xs"
                              : "bg-gray-100 text-gray-800 text-xs"
                          }
                        >
                          {badge}
                        </Badge>
                      ))}
                    </div>

                    <div className="mt-3 flex items-center gap-1 text-gray-700 dark:text-gray-300">
                      <MapPin className="w-4 h-4" />
                      {business.address}, {business.city}, {business.pincode}
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Category: {business.category}
                    </div>

                    {/* Services/Tags */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {business.services.map((service, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                        >
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4 mt-6">
                    <Button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 flex items-center gap-2 text-sm rounded-md">
                      <Phone className="w-5 h-5" />
                      <span>{business.contact.phone}</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 flex items-center gap-2 text-sm rounded-md"
                      onClick={() => handleEnquireNow(business.name)}
                    >
                      <MessageSquare className="w-5 h-5" />
                      <span>Enquire Now</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="border border-green-600 text-green-600 hover:bg-green-50 px-4 py-2 flex items-center gap-2 text-sm rounded-md"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>WhatsApp</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-4 py-2 flex items-center gap-2 text-sm rounded-md"
                      onClick={() => handleVisit(business.name, business.category)}
                    >
                      <ExternalLink className="w-5 h-5" />
                      <span>Visit</span>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}