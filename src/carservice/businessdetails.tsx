"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Star,
  Share2,
  Pencil,
  ThumbsUp,
  MapPin,
  Phone,
  MessageSquare,
  MessageCircle,
  Bookmark,
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface Business {
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
}

export function BusinessCard({ business }: { business: Business }) {
  if (!business) {
    return <div>Error: Business data is missing</div>;
  }

  const [businessId, setBusinessId] = useState<string>("");

  useEffect(() => {
    if (business.businessId) {
      const randomDigit = Math.floor(Math.random() * 10);
      const newId = business.businessId.slice(0, -1) + randomDigit;
      setBusinessId(newId);
    } else {
      setBusinessId("12345670");
    }
  }, [business.businessId]);

  const [hoverIndex, setHoverIndex] = useState(-1);

  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm relative mx-auto">
      <div className="absolute right-4 top-4 flex gap-2">
        {business.services.map((service, index) => (
          <Badge key={index} variant="secondary" className="text-xs bg-gray-100 text-gray-800">
            {service}
          </Badge>
        ))}
        <button className="border p-1 rounded-md text-gray-600 hover:bg-gray-100">
          <Bookmark className="h-6 w-6" />
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-4">
          {business.image && (
            <img
              src={business.image}
              alt={`${business.name} logo`}
              className="w-20 h-20 rounded-md object-cover"
            />
          )}

          <div className="flex-1">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <ThumbsUp className="w-5 h-5 text-white bg-black p-1 rounded-md" />
              {business.name}
            </h2>

            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-green-600 text-white px-2 py-0.5 text-sm flex items-center gap-1">
                {business.rating}
                <Star className="w-3 h-3 text-yellow-300 bg-yellow-600" />
              </Badge>

              <span className="text-sm text-gray-700">
                {business.total_ratings} Ratings
              </span>
              {business.badges.includes("Trust") && (
                <Badge className="bg-yellow-400 text-black text-xs">Trust</Badge>
              )}
              {business.badges.includes("Verified") && (
                <Badge className="bg-blue-500 text-white text-xs">Verified</Badge>
              )}
              {business.badges.includes("Claimed") && (
                <Badge className="bg-black text-white text-xs">Claimed</Badge>
              )}
            </div>

            <div className="text-sm text-gray-700 mt-1 flex items-center gap-1 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-gray-600" />
                {business.location}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-green-600 font-semibold">{business.hours.status}</span>
              <span className="text-gray-400">•</span>
              <span>{business.years_in_business}</span>
              <span className="text-gray-400">•</span>
              <span>ID: {businessId}</span>
              <span className="text-gray-400">•</span>
              <span className="text-red-500 font-medium">"{business.booking_info}"</span>
              <span className="text-gray-400">•</span>
              <span className="text-black">5 Suggestions</span>
            </div>

            <div className="flex justify-start gap-3 mt-2 flex-wrap">
              <div className="flex items-center space-x-4">
                <Button
                  variant="default"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 flex items-center gap-2 text-lg"
                >
                  <Phone
                    className="w-5 h-5"
                    style={{ animation: "shake 2.0s infinite" }}
                  />
                  <style>
                    {`
                      @keyframes shake {
                        0%, 100% { transform: translateX(0); }
                        20%, 60% { transform: translateX(-4px); }
                        40%, 80% { transform: translateX(4px); }
                      }
                    `}
                  </style>
                  <span>9344667522</span>
                </Button>

                <Button
                  variant="outline"
                  className="border border-blue-600 bg-blue-600 hover:bg-blue-400 hover:text-white text-white px-4 py-3 flex items-center gap-2 text-lg"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Enquire Now</span>
                </Button>

                <Button
                  variant="outline"
                  className="border border-green-600 text-green-600 hover:bg-green-50 px-4 py-3 flex items-center gap-2 text-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>WhatsApp</span>
                </Button>

                <Button
                  variant="outline"
                  className="border border-gray-600 text-gray-600 hover:bg-gray-50 px-4 py-3 flex items-center gap-2 text-lg"
                >
                  <Share2 className="w-5 h-5" />
                </Button>

                <Button
                  variant="outline"
                  className="border border-yellow-600 text-yellow-600 hover:bg-yellow-50 px-4 py-3 flex items-center gap-2 text-lg"
                >
                  <Pencil className="w-5 h-5" />
                </Button>

                <div className="flex flex-end pl-90">
                  <h1 className="text-md mb-2 text-black -mt-10">Click to rate</h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end items-center -mt-8 mb-3 gap-3">
        {[...Array(5)].map((_, idx) => (
          <div
            key={idx}
            className={`p-1 rounded-md border transition-all duration-300 ${
              idx <= hoverIndex ? "border-yellow-400 bg-yellow-400" : "border-gray-400"
            }`}
            onMouseEnter={() => setHoverIndex(idx)}
            onMouseLeave={() => setHoverIndex(-1)}
          >
            <Star
              className={`w-6 h-6 transition-colors duration-300 ${
                idx <= hoverIndex
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-400 text-gray-400"
              }`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default BusinessCard;
