'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, PlusCircle, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchBar from './SearchBar';
import LoginModal from '../clerkAuth/LoginModal';
import { useTranslations } from 'next-intl';

const CategoryNavbar = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = useTranslations('navbar');

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 dark:bg-gray-800">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-orange-600 dark:text-orange-500">
          {t('logo')}
        </Link>

        <div className="hidden md:flex flex-1 mx-8">
          <SearchBar />
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <Link href="/leads" className="flex items-center text-gray-600 hover:text-blue-600 font-medium dark:text-gray-300 dark:hover:text-blue-500">
            <Mail className="h-5 w-5 text-blue-600 mr-2 dark:text-blue-500" />
            {t('leads')}
          </Link>
          <Link
            href="/free-listing"
            className="flex items-center text-gray-600 hover:text-blue-600 font-medium dark:text-gray-300 dark:hover:text-blue-500"
          >
            <PlusCircle className="h-5 w-5 text-blue-600 mr-2 dark:text-blue-500" />
            {t('freeListing')}
          </Link>
          <LoginModal />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden dark:hover:bg-gray-700"
          onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={t('toggleMenu')}
        >
          <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        </Button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-md dark:bg-gray-800">
          <div className="p-4">
            <SearchBar />
          </div>
          <div className="flex flex-col p-4 space-y-4 border-t border-gray-200 dark:border-gray-600">
            <Link href="/leads" className="flex items-center text-gray-600 hover:text-blue-600 font-medium dark:text-gray-300 dark:hover:text-blue-500">
              <Mail className="h-5 w-5 text-blue-600 mr-2 dark:text-blue-500" />
              {t('leads')}
            </Link>
            <Link
              href="/free-listing"
              className="flex items-center text-gray-600 hover:text-blue-600 font-medium dark:text-gray-300 dark:hover:text-blue-500"
            >
              <PlusCircle className="h-5 w-5 text-blue-600 mr-2 dark:text-blue-500" />
              {t('freeListing')}
            </Link>
            <div className="flex items-center">
              <LoginModal />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default CategoryNavbar;
