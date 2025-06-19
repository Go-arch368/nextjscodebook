'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import CategoryImageSlider from './image';
import { Heart, Share2, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

type Business = {
  id: string | number;
  name: string;
  rating: number;
  totalRatings: number;
  address: string;
  tags: string[];
  phone: string;
  city?: string;
};

export default function BusinessPage() {
  const t = useTranslations();
  const businesses = t.raw('businesses') as Business[]; // Array from JSON
  const categoryName = 'Restaurants';
  const error = false;

  return (
    <div className="h-full p-5 bg-gray-100 dark:bg-black">
      <div className="mt-18 mb-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('businessPage.title', { category: categoryName })}
        </h1>
      </div>
      {error ? (
        <p className="text-red-500">{t('businessPage.error')}</p>
      ) : businesses.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">
          {t('businessPage.noBusinesses')}
        </p>
      ) : (
        <div className="space-y-6">
          {businesses.map((business) => (
            <div
              key={business.id}
              className="relative flex flex-col sm:flex-row bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="absolute top-4 right-4 flex gap-2 z-10">
                <button aria-label="Share" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
                <button aria-label="Like" className="text-gray-600 dark:text-gray-300 hover:text-red-500 transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
              </div>

              <CategoryImageSlider categoryName={categoryName ?? ''} altText={business.name} />

              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{business.name}</h2>
                  <div className="flex items-center gap-2">
                    <p>Rating: {business.rating}</p>
                    <span className="text-gray-800 dark:text-gray-300 text-sm">
                      ({business.totalRatings})
                    </span>
                  </div>
                  <p className="mt-3 text-gray-700 dark:text-gray-300">{business.address}</p>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {business.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 text-sm px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-end mt-6 flex-wrap gap-4">
                  <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-300">
                    <a href={`tel:${business.phone}`} className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                      <Phone className="w-4 h-4" />
                      {business.phone}
                    </a>
                    {business.city && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                      >
                        <MapPin className="w-4 h-4" />
                        {business.city}
                      </a>
                    )}
                    <Link
                      href="#"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                    >
                      {t('businessPage.visit')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
