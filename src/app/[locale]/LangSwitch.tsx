'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Globe } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function LocaleSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('LocaleSwitcher');

  const locales = [
    { code: 'en', name: t('english') },
    { code: 'ta', name: t('tamil') },
    { code: 'hi', name: t('hindi') },
    { code: 'ka', name: t('kannada') },
  ];

  const currentLocale = locales.find((l) => l.code === locale) || locales[0];

  const changeLocale = (newLocale: string) => {
    const pathSegments = (pathname ?? '').split('/').filter(Boolean); // remove empty parts like ""
    const currentLocaleIndex = locales.findIndex(l => l.code === pathSegments[0]);

    if (currentLocaleIndex !== -1) {
      // Remove the current locale
      pathSegments[0] = newLocale;
    } else {
      // Insert new locale at the beginning
      pathSegments.unshift(newLocale);
    }

    const newPath = '/' + pathSegments.join('/');

    const queryString = searchParams?.toString() ?? '';
    const finalURL = queryString ? `${newPath}?${queryString}` : newPath;

    router.replace(finalURL);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <Button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className="h-4 w-4" />
        <span>{currentLocale.name}</span>
        <svg
          className="-mr-1 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </Button>

      {isOpen && (
        <div className="absolute left-0 z-10 mt-2 w-40 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800">
          <div className="py-1">
            {locales.map((option) => (
              <button
                key={option.code}
                onClick={() => changeLocale(option.code)}
                className={`block w-full px-4 py-2 text-left text-sm ${
                  locale === option.code
                    ? 'bg-gray-400 hover:bg-gray-500 text-gray-900 dark:bg-gray-700 dark:text-white'
                    : 'text-black hover:bg-gray-500 dark:text-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
