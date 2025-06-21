"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Phone, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { fetchImagesByCategory } from "@/utils/imageUtils";

type Listing = {
  _id: string;
  name: string;
  address: string;
  city: string;
  category: string;
  subcategory?: string;
  tags: string[] | { en?: string; tags: string[] };
  rating: number;
  totalRatings: number;
  phone: string | { en?: string; tags?: string[] };
  images?: { url: string }[];
  imageError?: string | null;
  pincode?: string;
  isPopular?: boolean;
  isTrusted?: boolean;
  isVerified?: boolean;
  hasEnquiry?: boolean;
  hasWhatsApp?: boolean;
};

type SelectedImageIndices = {
  [index: number]: number;
};

function debounce<T extends (...args: any[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

export default function CategoryContent() {
  const searchParams = useSearchParams();
  const locale = useLocale();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImageIndices, setSelectedImageIndices] = useState<SelectedImageIndices>({});

  const fetchListings = useCallback(
    debounce(async (params: Record<string, string | undefined>) => {
      try {
        setLoading(true);
        const queryParams = new URLSearchParams();
        if (params.query) queryParams.append("query", params.query);
        if (params.category) queryParams.append("category", params.category);
        if (params.tag) queryParams.append("tag", params.tag);
        if (params.name) queryParams.append("name", params.name);
        if (params.address) queryParams.append("address", params.address);
        if (params.city) queryParams.append("city", params.city);
        queryParams.append("pincode", params.pincode ?? "");

        const response = await fetch(`/api/getListings?lang=${locale}&${queryParams.toString()}`, {
          cache: "no-store",
        });
        const result = await response.json();
        console.log("API Response Listings:", result.data); // Debug log
        if (result.success && Array.isArray(result.data)) {
          const imagePromises = result.data.map((listing: Listing) =>
            fetchImagesByCategory(listing.category || "").then((data) => ({ category: listing.category, data }))
          );

          const imageResults = await Promise.all(imagePromises);
          const imageMap = Object.fromEntries(
            imageResults.map(({ category, data }: { category: string; data: any }) => [category, data])
          );

          const listingsWithImages = result.data.map((listing: Listing) => ({
            ...listing,
            tags: Array.isArray(listing.tags) ? listing.tags : listing.tags?.tags || [],
            phone: typeof listing.phone === "string" ? listing.phone : listing.phone?.en || "", // Normalize phone
            images: imageMap[listing.category]?.images || [],
            imageError: imageMap[listing.category]?.images?.length ? null : `No images for ${listing.category}`,
          }));

          const initialSelectedIndices: SelectedImageIndices = {};
          listingsWithImages.forEach((_: Listing, index: number) => {
            initialSelectedIndices[index] = 0;
          });
          setListings(listingsWithImages);
          setSelectedImageIndices(initialSelectedIndices);
        } else {
          setListings([]);
        }
      } finally {
        setLoading(false);
      }
    }, 1000),
    [locale]
  );

  useEffect(() => {
    if (!searchParams) return;
    const params = {
      query: searchParams.get("query") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      tag: searchParams.get("tag") ?? undefined,
      name: searchParams.get("name") ?? undefined,
      address: searchParams.get("address") ?? undefined,
      city: searchParams.get("city") ?? undefined,
      pincode: searchParams.get("pincode") ?? "560062",
    };
    fetchListings(params);
  }, [searchParams, fetchListings]);

  const prevImage = (index: number) => {
    setSelectedImageIndices((prev) => {
      const currentIndex = prev[index] || 0;
      const totalImages = listings[index]?.images?.length || 1;
      return {
        ...prev,
        [index]: currentIndex === 0 ? totalImages - 1 : currentIndex - 1,
      };
    });
  };

  const nextImage = (index: number) => {
    setSelectedImageIndices((prev) => {
      const currentIndex = prev[index] || 0;
      const totalImages = listings[index]?.images?.length || 1;
      return {
        ...prev,
        [index]: currentIndex === totalImages - 1 ? 0 : currentIndex + 1,
      };
    });
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-4">
      {listings.length === 0 ? (
        <p>No businesses found for your search criteria.</p>
      ) : (
        <div className="space-y-6">
          {listings.map((listing, index) => {
            const selectedImageIndex = selectedImageIndices[index] || 0;
            const hasMultipleImages = (listing.images?.length || 0) > 1;

            return (
              <div key={listing._id} className="border p-4 rounded-md bg-white shadow">
                <div className="flex flex-col sm:flex-row">
                  <div className="sm:w-1/3 w-full h-48 relative">
                    {listing.imageError ? (
                      <div className="flex items-center justify-center h-full bg-gray-200">
                        {listing.imageError}
                      </div>
                    ) : (
                      <div className="relative w-full h-full">
                        <Image
                          src={listing.images?.[selectedImageIndex]?.url || "/placeholder.jpg"}
                          alt={listing.name}
                          fill
                          className="object-cover rounded-md"
                        />
                        {hasMultipleImages && (
                          <div className="absolute inset-0 flex items-center justify-between px-2">
                            <button
                              onClick={() => prevImage(index)}
                              className="bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 focus:outline-none"
                              aria-label="Previous image"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => nextImage(index)}
                              className=" bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75 focus:outline-none"
                              aria-label="Next image"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="sm:w-2/3 w-full sm:pl-4 mt-4 sm:mt-0">
                    <h2 className="text-xl font-bold">{listing.name}</h2>
                    <div className="flex flex-row sm:flex-row sm:items-center gap-2">
                      <p className="text-sm text-gray-600">{listing.address}</p>
                      <p className="text-sm text-gray-600">{listing.city}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge>
                        {listing.rating} <Star className="w-3 h-3 ml-1" />
                      </Badge>
                      <span className="text-sm">({listing.totalRatings} ratings)</span>
                      {listing.isTrusted && (
                        <Badge className="bg-yellow-500 text-white">Trusted</Badge>
                      )}
                      {listing.isPopular && (
                        <Badge className="bg-gray-500 text-white">Popular</Badge>
                      )}
                      {listing.isVerified && (
                        <Badge className="bg-blue-500 text-white">Verified</Badge>
                      )}
                    </div>
                    <p className="text-sm mt-2">{listing.category}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(Array.isArray(listing.tags) ? listing.tags : listing.tags?.tags || []).map(
                        (tag: string, i: number) => (
                          <Badge key={i} variant="secondary">
                            {tag}
                          </Badge>
                        )
                      )}
                    </div>
                    <div className="mt-4 flex items-center gap-4">
                      <p className="text-sm flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded">
                        <Phone className="w-4 h-4" />{" "}
                        {typeof listing.phone === "string"
                          ? listing.phone
                          : listing.phone?.en || "No phone available"}
                      </p>
                      <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                        <MessageSquare className="w-4 h-4 mr-1" /> Enquire
                      </Button>
                    </div>
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