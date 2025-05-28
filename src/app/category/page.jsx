// src/app/category/page.jsx
import { Suspense } from 'react';
import CategoryContent from './categoryContent';
import CategoryNavbar from './categoryNavbar';

export const dynamic = 'force-dynamic';

export default function CategoryPage() {
  return (
    <Suspense fallback={<div className="text-center text-gray-600 dark:text-gray-300">Loading...</div>}>
      <CategoryNavbar />
      <CategoryContent />
    </Suspense>
  );
}