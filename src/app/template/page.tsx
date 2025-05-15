"use client";

import React, { useState, useEffect } from "react";
import BusinessCard from "@/carservice/BusinessCard";
import PhotosComponent from "@/carservice/PhotosComponent";
import { useSearchParams } from "next/navigation";
import data from "@/data/data.json"; 

interface ListingData {
  WebsiteIdentifier: string;
  Category: string;
  Subcategory: string;
  business: {
    businessId?: string;
    name: string;
    image?: string;
    services: string[];
    rating: number;
    total_ratings: number;
    badges: string[];
    location: string;
    hours: { status: string };
    years_in_business: string;
    booking_info: string;
    information: string[];
    contact: { phone: string };
  };
  photos: { source: string; description: string; image: string }[];
  price_list: { service: string; description: string; price: string; details_link: string; button: string }[];
  Quick_Information: { Qname: string; Qdescription: string; Qestablished: string; Qestablished_year: string }[];
  Services: { sname: string; sdata1: string; sdata2: string }[];
  general_contact: { phone: string };
  address: string;
  actions: { label: string; icon: string }[];
  customer_reviews: { source: string; name: string; feedback: string; time: string }[];
  key_insights: {
    section_title: string;
    what_users_liked: { title: string; points: string[] };
    what_can_be_improved: { title: string; points: string[] };
    disclaimer: string;
    metadata: { source: string; version: string; last_updated: string };
  };
  reviews_ratings: { title: string; rating: number; total_ratings: number; description: string; button_text: string };
  review: { title: string; ratings: number[] };
  userReviews: {
    title: string;
    sortOrder: string[];
    reviewHighlightstitle: string;
    reviewHighlights: { highlight: string; rating: number }[];
  };
  reviewPeople: {
    user: { name: string; review_count: number; follower_count: number };
    date: string;
    location: string;
    title: string;
    tags: string[];
    content: string;
    actions: string[];
    sentiment: string;
    rating: number;
  }[];
  listingCategories: string[];
}

const TemplatePage: React.FC = () => {
  const searchParams = useSearchParams();
  const websiteIdentifier = searchParams?.get("websiteIdentifier") || "Automobile-CarRepair-560062";
  const [listingData, setListingData] = useState<ListingData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (!data || !data.listings || typeof data.listings !== "object") {
        throw new Error("Invalid data structure: listings not found");
      }

      
      const rawListings = data.listings as Record<string, any>;
      const listings: Record<string, ListingData> = {};
      Object.entries(rawListings).forEach(([key, value]) => {
        if (value.business && typeof value.business.total_ratings === "string") {
          value.business.total_ratings = Number(value.business.total_ratings);
        }
        listings[key] = value as ListingData;
      });
      const listing = listings[websiteIdentifier];
      if (listing) {
        setListingData(listing);
        setError(null);
      } else {
        setListingData(null);
        setError("Listing not found for the provided websiteIdentifier");
      }
    } catch (err) {
      console.error("Error loading listing data:", err);
      setListingData(null);
      setError("Failed to load listing data");
    }
  }, [websiteIdentifier]);

  if (error || !listingData) {
    return <div className="container mx-auto p-4">{error || "No data available"}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <BusinessCard business={listingData.business} />
      <PhotosComponent listingData={listingData} />
    </div>
  );
};

export default TemplatePage;