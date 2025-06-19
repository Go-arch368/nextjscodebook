import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CategoryImageSliderProps {
  categoryName: string;
  altText: string;
}

interface ImageData {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

export default function CategoryImageSlider({ categoryName, altText }: CategoryImageSliderProps) {
  const [images, setImages] = useState<ImageData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch(`/api/search-list/getImagesByCategory?category=${encodeURIComponent(categoryName)}`);
        const data = await res.json();

        if (data.success && Array.isArray(data.images)) {
          setImages(data.images);
        }
      } catch (error) {
        console.error("Failed to load category images:", error);
      }
    };

    fetchImages();
  }, [categoryName]);

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const image = images[currentIndex];

  return (
    <div className="sm:w-1/3 w-full h-56 sm:h-auto relative overflow-hidden group">
      {image ? (
        <>
          <Image
            src={image.url}
            alt={altText}
            fill
            className="object-cover w-full h-full"
            sizes="(max-width: 640px) 100vw, 33vw"
          />
          <button
            onClick={prevImage}
            className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-black/40 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextImage}
            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-black/40 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      ) : (
        <div className="flex justify-center items-center w-full h-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
          No Image Available
        </div>
      )}
    </div>
  );
}
