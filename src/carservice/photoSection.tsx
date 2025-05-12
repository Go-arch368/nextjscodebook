export function PhotosSection({ photos }) {
  if (!photos || photos.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <h3 className="text-sm font-semibold text-gray-800 mb-2">Photos</h3>
      <div className="flex gap-2 overflow-x-auto">
        {photos.map((photo, index) => (
          <div key={index} className="flex-shrink-0">
            <img
              src={`/images/${photo.image}`}
              alt={photo.description}
              className="w-24 h-24 rounded-md object-cover"
            />
            <p className="text-xs text-gray-600 mt-1 text-center">{photo.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PhotosSection;