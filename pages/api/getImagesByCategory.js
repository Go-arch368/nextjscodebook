import { v2 as cloudinary } from 'cloudinary';

const imageCache = new Map();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Normalizes category names for Cloudinary
 */
function normalizeCategory(category) {
  return decodeURIComponent(category)
    .replace(/near me/gi, '')
    .replace(/[^\w\s-]/g, '')
    .trim();
}

/**
 * Search strategies for Cloudinary
 */
async function searchImages(category) {
  const normalized = normalizeCategory(category);
  console.log(`Searching for: "${normalized}"`);

  // Try these exact folder paths in order
  const folderPaths = [
    `Pictures/${normalized}`,          // "Pictures/Best Hospitals"
    `Pictures/${normalized.replace(/ /g, '_')}`,  // "Pictures/Best_Hospitals"
    normalized,                       // "Best Hospitals" (root level)
    `Medical/${normalized}`,          // Alternative medical folder
    'Pictures/Hospitals'              // Fallback generic
  ];

  for (const path of folderPaths) {
    try {
      console.log(`Trying path: "${path}"`);
      
      // 1. First try exact folder match
      const folderResult = await cloudinary.search
        .expression(`folder="${path}"`)
        .max_results(50)
        .execute();

      if (folderResult.resources?.length > 0) {
        console.log(`Found ${folderResult.resources.length} images in "${path}"`);
        return folderResult.resources;
      }

      // 2. Try prefix search if exact folder fails
      const prefixResult = await cloudinary.api.resources({
        type: 'upload',
        prefix: path,
        max_results: 50
      });

      if (prefixResult.resources?.length > 0) {
        console.log(`Found ${prefixResult.resources.length} images with prefix "${path}"`);
        return prefixResult.resources;
      }

    } catch (error) {
      console.error(`Search failed for "${path}":`, error.message);
    }
  }

  return [];
}

/**
 * Main image fetching function
 */
export default async function handler(req, res) {
  const { category } = req.query;

  if (!category) {
    return res.status(400).json({ 
      success: false,
      error: 'Category parameter is required'
    });
  }

  try {
    const startTime = Date.now();
    console.log(`\n=== Fetching images for "${category}" ===`);
    
    const resources = await searchImages(category);
    const images = resources.map(img => ({
      url: img.secure_url,
      publicId: img.public_id,
      width: img.width,
      height: img.height
    }));

    console.log(`=== Found ${images.length} images in ${Date.now() - startTime}ms ===\n`);
    
    return res.status(200).json({
      success: true,
      images,
      total: images.length,
      searchedPath: `Pictures/${normalizeCategory(category)}`
    });

  } catch (error) {
    console.error('Failed to fetch images:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      details: `Ensure you have images in "Pictures/Best Hospitals" folder`
    });
  }
}