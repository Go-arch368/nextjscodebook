require('dotenv').config({ path: '.env.local' });

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function undoMoveImages(cursor = null) {
  try {
    const result = await cloudinary.api.resources({
      resource_type: 'image',
      type: 'upload',
      prefix: 'Pictures/',
      max_results: 500,
      next_cursor: cursor,
    });

    const images = result.resources;
    console.log(`Fetched ${images.length} images`);

    for (const image of images) {
      const publicId = image.public_id;
      if (publicId.split('/').length <= 2) {
        console.log(`Skipping ${publicId} (not in a subfolder)`);
        continue;
      }

      const newPublicId = publicId.split('/').pop(); // Move to root
      try {
        await cloudinary.uploader.rename(publicId, newPublicId);
        console.log(`Moved ${publicId} to ${newPublicId}`);
      } catch (renameError) {
        console.error(`Error moving ${publicId}:`, renameError);
      }
    }

    if (result.next_cursor) {
      console.log('Fetching next batch...');
      await undoMoveImages(result.next_cursor);
    } else {
      console.log('Finished undoing moves');
    }
  } catch (error) {
    console.error('Error fetching images:', error);
  }
}

undoMoveImages();