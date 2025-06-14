// pages/api/images.ts (or wherever your API route is located)
import { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary, ResourceApiResponse } from 'cloudinary';

// Define interface for Cloudinary resource
interface CloudinaryResource {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
}

// Define custom interface for Cloudinary search response (replacing SearchApiResponse)
interface CustomSearchApiResponse {
  resources: CloudinaryResource[];
  total_count?: number;
  time?: number;
  next_cursor?: string;
}

// Define response data interface
interface ResponseData {
  success: boolean;
  images?: {
    url: string;
    publicId: string;
    width: number;
    height: number;
  }[];
  total?: number;
  searchedPaths?: string[];
  cacheHit?: boolean;
  error?: string;
  details?: string;
}

// Cache to store image results for categories
const imageCache = new Map<string, CloudinaryResource[]>();

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

// Normalize the category name for consistent searching
function normalizeCategory(category: string): string {
  const decoded = decodeURIComponent(category);
  const cleaned = decoded
    .replace(/near me/gi, '') // Remove "near me" (case-insensitive)
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .trim(); // Remove leading/trailing spaces
  return cleaned;
}

// Retry logic for Cloudinary API calls
async function withRetry<T>(fn: () => Promise<T>, retries: number = 3, delay: number = 1000): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      if (attempt === retries) throw error;
      console.warn(`Attempt ${attempt} failed: ${error.message}. Retrying in ${delay}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error('Unexpected error: Retry loop exited without returning or throwing');
}

// Search for images in Cloudinary based on the category
async function searchImages(category: string): Promise<CloudinaryResource[]> {
  const normalized = normalizeCategory(category);
  console.log(`Searching for: "${normalized}"`);

  // Check cache first
  if (imageCache.has(normalized)) {
    console.log(`Cache hit for "${normalized}"`);
    return imageCache.get(normalized)!;
  }

  // Define possible folder path variations
  const folderPaths = [
    `Pictures/${normalized}`, // e.g., "Pictures/Best Hospitals"
    `Pictures/${normalized.replace(/ /g, '_')}`, // e.g., "Pictures/Best_Hospitals"
    `Pictures/${normalized.replace(/ /g, '').toLowerCase()}`, // e.g., "Pictures/besthospitals"
    `Pictures/${normalized.replace(/ /g, '_').toLowerCase()}`, // e.g., "Pictures/best_hospitals"
    normalized, // e.g., "Best Hospitals" (root level)
    'Pictures/Generic', // Fallback folder for generic images
  ];

  // Deduplicate folder paths to avoid redundant searches
  const uniqueFolderPaths = [...new Set(folderPaths)];
  const attemptedPaths: string[] = [];

  for (const path of uniqueFolderPaths) {
    attemptedPaths.push(path);
    try {
      console.log(`Trying path: "${path}"`);

      // 1. First try exact folder match with retry
      const folderResult = await withRetry<CustomSearchApiResponse>(() =>
        cloudinary.search
          .expression(`folder="${path}"`)
          .max_results(50)
          .execute()
      );

      console.log(`Folder search response for "${path}":`, JSON.stringify(folderResult, null, 2));

      if (folderResult.resources?.length > 0) {
        console.log(`Found ${folderResult.resources.length} images in "${path}"`);
        // Cache the result
        imageCache.set(normalized, folderResult.resources);
        return folderResult.resources;
      }

      // 2. Try prefix search if exact folder fails with retry
      const prefixResult = await withRetry<ResourceApiResponse>(() =>
        cloudinary.api.resources({
          type: 'upload',
          prefix: path,
          max_results: 50,
        })
      );

      console.log(`Prefix search response for "${path}":`, JSON.stringify(prefixResult, null, 2));

      if (prefixResult.resources?.length > 0) {
        console.log(`Found ${prefixResult.resources.length} images with prefix "${path}"`);
        // Cache the result
        imageCache.set(normalized, prefixResult.resources as CloudinaryResource[]);
        return prefixResult.resources as CloudinaryResource[];
      }
    } catch (error: any) {
      console.error(`Search failed for "${path}":`, error.message);
      if (error.http_code) {
        console.error(`Cloudinary HTTP error: ${error.http_code} - ${error.message}`);
      }
    }
  }

  // If no images are found, cache an empty array to avoid repeated searches
  imageCache.set(normalized, []);
  console.log(`No images found after trying paths: ${attemptedPaths.join(', ')}`);
  return [];
}

// API handler for fetching images by category
export default async function handler(req: NextApiRequest, res: NextApiResponse<ResponseData>) {
  const { category } = req.query as { category?: string };

  if (!category) {
    return res.status(400).json({
      success: false,
      error: 'Category parameter is required',
    });
  }

  try {
    const startTime = Date.now();
    console.log(`\n=== Fetching images for "${category}" ===`);

    const resources = await searchImages(category);
    const images = resources.map((img) => ({
      url: img.secure_url,
      publicId: img.public_id,
      width: img.width,
      height: img.height,
    }));

    console.log(`=== Found ${images.length} images in ${Date.now() - startTime}ms ===\n`);

    return res.status(200).json({
      success: true,
      images,
      total: images.length,
      searchedPaths: [
        `Pictures/${normalizeCategory(category)}`,
        `Pictures/${normalizeCategory(category).replace(/ /g, '_')}`,
        `Pictures/${normalizeCategory(category).replace(/ /g, '').toLowerCase()}`,
        `Pictures/${normalizeCategory(category).replace(/ /g, '_').toLowerCase()}`,
        normalizeCategory(category),
        'Pictures/Generic',
      ],
      cacheHit: imageCache.has(normalizeCategory(category)),
    });
  } catch (error: any) {
    console.error('Failed to fetch images:', error.message);
    if (error.http_code) {
      console.error(`Cloudinary HTTP error: ${error.http_code} - ${error.message}`);
    }
    return res.status(500).json({
      success: false,
      error: error.message,
      details: `Ensure you have images in one of the following folders: ${[
        `Pictures/${normalizeCategory(category)}`,
        `Pictures/${normalizeCategory(category).replace(/ /g, '_')}`,
        `Pictures/${normalizeCategory(category).replace(/ /g, '').toLowerCase()}`,
        `Pictures/${normalizeCategory(category).replace(/ /g, '_').toLowerCase()}`,
      ].join(', ')}`,
    });
  }
}