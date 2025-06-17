'use client';

import { useRouter } from 'next/navigation';

export default function FilesPage() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="space-x-4">
        <button
          onClick={() => router.push('/upload')}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          Upload CSV
        </button>
        <button
          onClick={() => router.push('/upload-form')}
          className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition"
        >
          Upload Form
        </button>
      </div>
    </div>
  );
}