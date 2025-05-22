require('dotenv').config({ path: '.env.local' });

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function moveImages(cursor = null) {
  try {
    console.log('Fetching images with prefix: Pictures/');
    let result = await cloudinary.api.resources({
      resource_type: 'image',
      type: 'upload',
      prefix: 'Pictures/',
      max_results: 500,
      next_cursor: cursor,
    });

    let images = result.resources;
    console.log(`Fetched ${images.length} images with prefix Pictures/`);

    if (images.length === 0) {
      console.log('No images found in Pictures/. Trying a broader search...');
      result = await cloudinary.api.resources({
        resource_type: 'image',
        type: 'upload',
        max_results: 500,
        next_cursor: cursor,
      });
      images = result.resources;
      console.log(`Fetched ${images.length} images with no prefix (root level)`);
      if (images.length > 0) {
        console.log('Sample public IDs:', images.slice(0, 5).map(img => img.public_id));
      }
    }

    for (const image of images) {
      const publicId = image.public_id;

      if (publicId.split('/').length > 2) {
        console.log(`Skipping ${publicId} (already in a subfolder)`);
        continue;
      }

      let category;
      const publicIdLastPart = publicId.split('/').pop();
      const publicIdParts = publicIdLastPart.split('_');

      if (publicIdParts.length > 1 && /^[a-zA-Z]/.test(publicIdParts[0])) {
        category = publicIdParts.slice(0, -1).join('_');
      } else {
        category = 'miscellaneous';
      }

      const normalizedCategory = category.toLowerCase().replace(/\s+/g, '_');
      const newFolder = `Pictures/${normalizedCategory}`;
      const newPublicId = `${newFolder}/${publicIdLastPart}`;

      try {
        await cloudinary.uploader.rename(publicId, newPublicId);
        console.log(`Moved ${publicId} to ${newPublicId}`);
      } catch (renameError) {
        console.error(`Error moving ${publicId}:`, renameError);
      }
    }

    if (result.next_cursor) {
      console.log('Fetching next batch...');
      await moveImages(result.next_cursor);
    } else {
      console.log('Finished moving all images');
    }
  } catch (error) {
    console.error('Error fetching images:', error);
  }
}

moveImages();