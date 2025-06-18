// utils/imageUtils.ts

// Interface for the expected response structure
interface ImageResponse {
  images: Array<{ url: string }>;
  searchedPaths: string[];
}

// Function to fetch images by category
export async function fetchImagesByCategory(category: string): Promise<ImageResponse> {
  try {
    const response = await fetch(`/api/getImagesByCategory?category=${encodeURIComponent(category)}`, {
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: ImageResponse = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching images for category ${category}:`, error);
    return { images: [], searchedPaths: [] };
  }
}