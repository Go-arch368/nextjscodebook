'use client';

import { useRouter } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function FilesPage() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Tabs defaultValue="upload" className="w-[300px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger 
            value="upload"
            onClick={() => router.push('en/upload')}
            className="px-6 py-3 font-semibold border-r border-gray-300"
          >
            Upload CSV
          </TabsTrigger>
          <TabsTrigger 
            value="upload-form"
            onClick={() => router.push('en/upload-form')}
            className="px-6 py-3 font-semibold"
          >
            Upload Form
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}