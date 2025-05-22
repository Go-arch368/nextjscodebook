import { v2 as cloudinary } from 'cloudinary';

const imageCache = new Map();

// Validate environment variables
const requiredEnvVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Clean category name by removing problematic terms
 */
function cleanCategory(category) {
  return category
    .replace(/near me/gi, '') // Remove "near me"
    .replace(/:\s*/g, ' ') // Replace colon with space
    .trim();
}

/**
 * Normalize category name for Cloudinary tags
 */
function normalizeCategory(category) {
  return category
    .replace(/\//g, '_') // Replace slashes with underscores
    .replace(/&/g, 'and') // Replace ampersand with 'and'
    .replace(/:/g, '_') // Replace colon with underscore
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .trim();
}

/**
 * Helper function to search for images with a given expression
 */
async function searchImages(expression, cursor = null) {
  try {
    const search = cloudinary.search
      .expression(expression)
      .sort_by('public_id', 'desc')
      .max_results(30);

    if (cursor) {
      search.next_cursor(cursor);
    }

    const result = await search.execute();
    return result;
  } catch (error) {
    console.error(`Search error for expression "${expression}":`, error.message);
    throw new Error(`Failed to search images: ${error.message}`);
  }
}

/**
 * Fetches all images for an exact folder or tag match with pagination
 */
async function fetchImagesByExactMatch(expression, allImages = new Set(), cursor = null) {
  const result = await searchImages(expression, cursor);
  
  if (result.resources?.length > 0) {
    result.resources.forEach(resource => {
      allImages.add({
        url: resource.secure_url,
        publicId: resource.public_id,
      });
    });

    if (result.next_cursor) {
      await new Promise(resolve => setTimeout(resolve, 100)); // Delay for rate limits
      return fetchImagesByExactMatch(expression, allImages, result.next_cursor);
    }
  }

  return Array.from(allImages);
}

/**
 * Main function to fetch all images for a category
 */
async function fetchAllImages(category, city = '') {
  const cleanedCategory = cleanCategory(category); // e.g., Trusted Financial Partners
  const normalizedCategory = normalizeCategory(cleanedCategory); // e.g., Trusted_Financial_Partners
  const formats = [
    cleanedCategory, // Trusted Financial Partners
    normalizedCategory, // Trusted_Financial_Partners
    normalizedCategory.toLowerCase(), // trusted_financial_partners
    cleanedCategory.replace(/\s+/g, '_'), // Trusted_Financial_Partners
    'Banks', // Fallback generic category
  ];

  if (city) {
    const normalizedCity = city.replace(/\s+/g, '_'); // e.g., Konanakunte_Bangalore
    formats.push(`${normalizedCategory}_${normalizedCity}`); // e.g., Trusted_Financial_Partners_Konanakunte_Bangalore
  }

  // Check cache first
  for (const format of formats) {
    if (imageCache.has(format)) {
      console.log(`Returning cached images for category: ${format}`);
      return imageCache.get(format);
    }
  }

  const allImages = new Set();

  // Try folder matches
  for (const format of formats) {
    try {
      const folderPath = format.includes('/')
        ? `Pictures/${format}` // Keep original slashes for folder
        : `Pictures/${format.replace(/_/g, ' ')}`; // Convert underscores to spaces for folder
      const folderImages = await fetchImagesByExactMatch(`folder:${folderPath}`, allImages);
      console.log(`Found ${folderImages.length} images in folder ${folderPath}`);
    } catch (error) {
      console.log(`No images in folder ${format}:`, error.message);
    }
  }

  // Try tag matches
  for (const format of formats) {
    try {
      const tag = format.replace(/\//g, '_').replace(/\s+/g, '_');
      const tagImages = await fetchImagesByExactMatch(`tags=${tag}`);
      console.log(`Found ${tagImages.length} images with tag ${tag}`);
    } catch (error) {
      console.log(`No images with tag ${format}:`, error.message);
    }
  }

  const result = Array.from(allImages);
  formats.forEach(format => imageCache.set(format, result));
  console.log(`Total: ${result.length} images for category "${cleanedCategory}"${city ? ` in ${city}` : ''}`);

  return result;
}

export default async function handler(req, res) {
  const { category, city } = req.query;

  if (!category || typeof category !== 'string' || category.trim() === '') {
    return res.status(400).json({ error: 'Valid category is required' });
  }

  try {
    const images = await fetchAllImages(category, city);
    return res.status(200).json({
      images,
      total: images.length,
    });
  } catch (error) {
    console.error('Error in handler:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch images',
      details: error.message,
    });
  }
}

