const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

async function seedDatabase() {
  try {
    const dataFilePath = path.join(__dirname, '../src/data/data.json');
    let jsonData;
    try {
      jsonData = JSON.parse(await fs.readFile(dataFilePath, 'utf-8'));
    } catch (error) {
      throw new Error(`Failed to read or parse data.json: ${error.message}`);
    }

    if (!jsonData.listings || typeof jsonData.listings !== 'object') {
      console.log('No listings found in data.json.');
      return;
    }

    const listings = jsonData.listings;

    for (const [websiteIdentifier, data] of Object.entries(listings)) {
      const businessData = {
        WebsiteIdentifier: websiteIdentifier,
        ...data,
      };

      
      if (businessData.business && businessData.business.total_ratings) {
        const totalRatings = businessData.business.total_ratings.toString();
        const numericValue = parseInt(totalRatings.match(/\d+/)?.[0] || '0', 10);
        businessData.business.total_ratings = numericValue;
      }

      try {
       
        const checkResponse = await axios.get(`http://localhost:3000/api/business?websiteIdentifier=${encodeURIComponent(websiteIdentifier)}`);
        if (checkResponse.data.length > 0) {
      
          try {
            await axios.put(`http://localhost:3000/api/business/${websiteIdentifier}`, businessData);
            console.log(`Successfully updated: ${websiteIdentifier}`);
          } catch (updateError) {
            console.error(`Error updating ${websiteIdentifier}:`, updateError.response?.data || updateError.message);
          }
          continue;
        }

   
        const response = await axios.post('http://localhost:3000/api/business', businessData);
        console.log(`Successfully inserted: ${websiteIdentifier}`);
      } catch (error) {
        console.error(`Error inserting ${websiteIdentifier}:`, error.response?.data || error.message);
      }
    }

    console.log('Seeding completed.');
  } catch (error) {
    console.error('Error during seeding:', error.message);
  }
}

seedDatabase();


// to run this file  "node scripts/seed.js"