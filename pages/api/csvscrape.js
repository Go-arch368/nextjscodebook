// import puppeteer from 'puppeteer';
// import fs from 'fs';
// import path from 'path';

// export default async function handler(req, res) {
//   if (req.method !== 'GET') {
//     res.setHeader('Content-Type', 'text/csv');
//     res.setHeader('Content-Disposition', 'attachment; filename="error.csv"');
//     return res.status(405).send('error\n"Method not allowed"');
//   }

//   const { category, listCategories } = req.query; // Extract query parameters

//   let browser;
//   try {
//     browser = await puppeteer.launch({
//       headless: process.env.NODE_ENV === 'production' ? 'new' : false,
//       args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-geolocation'],
//       executablePath:
//         process.env.NODE_ENV === 'production'
//           ? process.env.PUPPETEER_EXECUTABLE_PATH
//           : puppeteer.executablePath(),
//     });

//     const page = await browser.newPage();

//     await page.evaluateOnNewDocument(() => {
//       Object.defineProperty(navigator, 'webdriver', { get: () => false });
//       Object.defineProperty(navigator, 'geolocation', { get: () => undefined });
//     });

//     await page.setUserAgent(
//       'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
//     );
//     await page.setExtraHTTPHeaders({
//       'Accept-Language': 'en-US,en;q=0.9',
//       'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
//       'Referer': 'https://www.justdial.com/',
//     });
//     await page.setViewport({ width: 1366, height: 768 });
//     await page.setJavaScriptEnabled(true);

//     const delay = (ms) => new Promise((r) => setTimeout(r, ms));

//     // Create the filemanager directory if it doesn't exist
//     const outputDir = path.join(process.cwd(), 'filemanager');
//     if (!fs.existsSync(outputDir)) {
//       fs.mkdirSync(outputDir, { recursive: true });
//       console.log(`Created directory: ${outputDir}`);
//     }

//     // Navigate to Justdial Hassan page
//     await page.goto('https://www.justdial.com/Hassan', { waitUntil: 'networkidle2', timeout: 60000 });
//     console.log('Navigated to Justdial Hassan page');
//     await page.screenshot({ path: path.join(outputDir, 'hassan-page.png'), fullPage: true });
//     console.log(`Screenshot saved: ${path.join(outputDir, 'hassan-page.png')}`);

//     // Handle cookie consent popup
//     try {
//       const acceptCookiesBtn = await page.waitForSelector(
//         '#cookie_btn, .cookie-agree, [id*="cookie"][id*="accept"], [class*="cookie"][class*="accept"]',
//         { timeout: 5000 }
//       );
//       if (acceptCookiesBtn) {
//         await acceptCookiesBtn.click();
//         console.log('Accepted cookies');
//         await delay(2000);
//       }
//     } catch (e) {
//       console.log('No cookie consent popup found or failed to click:', e.message);
//     }

//     // Handle auto-location popup
//     try {
//       const denyLocationBtn = await page.waitForSelector(
//         '[id*="geo"][id*="deny"], [class*="geo"][class*="deny"], [class*="location"][class*="reject"], [class*="button"][class*="reject"]',
//         { timeout: 5000 }
//       );
//       if (denyLocationBtn) {
//         await denyLocationBtn.click();
//         console.log('Denied auto-location prompt');
//         await delay(2000);
//       }
//     } catch (e) {
//       console.log('No auto-location popup found or failed to click:', e.message);
//     }

//     // Verify location is Hassan and click "Popular Categories" button
//     try {
//       console.log('Verifying location is Hassan...');
//       const locationInputSelector = '#city, [name="city"], [id*="location"], [class*="city"] input, [placeholder*="city"], [class*="location"] input, #home-city-autocomplete';
//       const locationInput = await page.waitForSelector(locationInputSelector, { visible: true, timeout: 15000 });
//       if (locationInput) {
//         const currentValue = await page.evaluate(el => el.value, locationInput);
//         console.log('Current location input:', currentValue);
//         if (!currentValue.toLowerCase().includes('hassan')) {
//           console.log('Location not set to Hassan, setting now...');
//           await locationInput.click({ clickCount: 3 });
//           await locationInput.press('Backspace');
//           await locationInput.type('Hassan', { delay: 100 });
//           await delay(3000);

//           const suggestionSelector = '.suggestions_list li, .city-suggestion, .autocomplete-suggestion, [class*="suggestion"], [class*="autoComplete"], li:contains("Hassan")';
//           await page.waitForSelector(suggestionSelector, { visible: true, timeout: 10000 });
//           await page.evaluate(() => {
//             const suggestions = document.querySelectorAll('.suggestions_list li, .city-suggestion, .autocomplete-suggestion, [class*="suggestion"], [class*="autoComplete"], li');
//             for (let suggestion of suggestions) {
//               if (suggestion.textContent.toLowerCase().includes('hassan')) {
//                 suggestion.click();
//                 break;
//               }
//             }
//           });
//           console.log('Clicked "Hassan" from suggestions');
//           await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });
//           console.log('Navigation completed after selecting city');

//           const newValue = await page.evaluate(el => el.value, locationInput);
//           console.log('New location input:', newValue);
//           if (!newValue.toLowerCase().includes('hassan')) {
//             throw new Error('Failed to set location to Hassan, found: ' + newValue);
//           }
//         }
//         console.log('Successfully confirmed location as Hassan');
//       } else {
//         console.log('Location input not found, relying on URL');
//       }

//       const currentUrl = await page.url();
//       if (!currentUrl.includes('/Hassan')) {
//         console.log('URL does not contain Hassan, navigating to correct URL');
//         await page.goto('https://www.justdial.com/Hassan', { waitUntil: 'networkidle2', timeout: 30000 });
//       }

//       console.log('Looking for Popular Categories button with id="popular_categories"...');
//       const popularCategoriesBtn = await page.waitForSelector('#popular_categories', { visible: true, timeout: 30000 });
//       if (!popularCategoriesBtn) {
//         throw new Error('Popular Categories button with id="popular_categories" not found');
//       }

//       await page.evaluate(() => {
//         const btn = document.querySelector('#popular_categories');
//         if (btn) {
//           btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
//         }
//       });
//       await delay(2000);
//       await page.screenshot({ path: path.join(outputDir, 'before-popular-categories-click.png'), fullPage: true });
//       console.log(`Screenshot saved: ${path.join(outputDir, 'before-popular-categories-click.png')}`);

//       await popularCategoriesBtn.click();
//       console.log('Clicked Popular Categories button with id="popular_categories"');
//       await delay(5000);
//       await page.screenshot({ path: path.join(outputDir, 'after-popular-categories-click.png'), fullPage: true });
//       console.log(`Screenshot saved: ${path.join(outputDir, 'after-popular-categories-click.png')}`);

//       const sideMenu = await page.waitForSelector('.sidemenu_cateitem', { timeout: 10000 });
//       if (!sideMenu) {
//         throw new Error('Side menu with categories did not appear after clicking Popular Categories');
//       }
//       console.log('Side menu with categories appeared successfully');
//     } catch (e) {
//       console.error('Error setting/verifying location or clicking Popular Categories:', e.message);
//       await page.screenshot({ path: path.join(outputDir, 'location-or-popular-error.png'), fullPage: true });
//       console.log(`Screenshot saved: ${path.join(outputDir, 'location-or-popular-error.png')}`);
//       await browser.close();
//       res.setHeader('Content-Type', 'text/csv');
//       res.setHeader('Content-Disposition', 'attachment; filename="error.csv"');
//       return res.status(500).send(`error\n"Failed to set location or click Popular Categories: ${e.message}"`);
//     }

//     // Extract category links from the side menu
//     let categoryLinks = [];
//     try {
//       console.log('Extracting category links from sidemenu_catebox...');
//       await page.waitForSelector('.sidemenu_cateitem', { timeout: 30000 });
//       categoryLinks = await page.evaluate(() => {
//         const links = [];
//         const categoryItems = document.querySelectorAll('.sidemenu_cateitem');
//         categoryItems.forEach((item) => {
//           const anchor = item.querySelector('a');
//           const categoryName = anchor.querySelector('.sidemenu_text')?.textContent?.trim() || '';
//           const href = anchor?.href || '';
//           if (href && categoryName) {
//             links.push({ href, categoryName });
//           }
//         });
//         return links;
//       });

//       console.log(`Found ${categoryLinks.length} category links:`, categoryLinks.map(link => link.categoryName));
//     } catch (e) {
//       console.error('Error extracting category links:', e.message);
//       await browser.close();
//       res.setHeader('Content-Type', 'text/csv');
//       res.setHeader('Content-Disposition', 'attachment; filename="error.csv"');
//       return res.status(500).send(`error\n"Failed to extract category links: ${e.message}"`);
//     }

//     if (categoryLinks.length === 0) {
//       await browser.close();
//       res.setHeader('Content-Type', 'text/csv');
//       res.setHeader('Content-Disposition', 'attachment; filename="error.csv"');
//       return res.status(200).send('error\n"No categories found"');
//     }

//     // If listCategories is true, return the list of categories as JSON
//     if (listCategories === 'true') {
//       await browser.close();
//       res.status(200).json({ categories: categoryLinks.map(link => link.categoryName) });
//       return;
//     }

//     // Auto-scroll function
//     async function autoScroll(page) {
//       await page.evaluate(async () => {
//         await new Promise((resolve) => {
//           let totalHeight = 0;
//           const distance = 300;
//           const maxScrolls = 1000;
//           let scrollCount = 0;
//           let lastScrollHeight = document.body.scrollHeight;
//           let unchangedCount = 0;
//           let lastListingCount = document.querySelectorAll('.resultbox').length;

//           const timer = setInterval(() => {
//             window.scrollBy(0, distance);
//             totalHeight += distance;
//             scrollCount++;

//             const currentScrollHeight = document.body.scrollHeight;
//             const currentListingCount = document.querySelectorAll('.resultbox').length;

//             if (currentScrollHeight > lastScrollHeight || currentListingCount > lastListingCount) {
//               lastScrollHeight = currentScrollHeight;
//               lastListingCount = currentListingCount;
//               unchangedCount = 0;
//             } else {
//               unchangedCount++;
//             }

//             if (unchangedCount >= 15 || scrollCount >= maxScrolls || 
//                 (window.innerHeight + window.scrollY) >= document.body.scrollHeight) {
//               clearInterval(timer);
//               resolve();
//             }
//           }, 500);
//         });
//       });
//     }

//     // Function to convert data to CSV
//     const convertToCSV = (data) => {
//       if (!data || data.length === 0) return '';

//       const headers = [
//         'name',
//         'initial',
//         'rating',
//         'totalRatings',
//         'address',
//         'distance',
//         'phone',
//         'tags',
//         'hasWhatsApp',
//         'hasEnquiry',
//         'isTrusted',
//         'isVerified',
//         'isPopular',
//         'category',
//         'city',
//         'timestamp',
//       ];

//       const escapeCsvValue = (value) => {
//         if (value === null || value === undefined) return '';
//         const str = String(value);
//         if (str.includes(',') || str.includes('"') || str.includes('\n')) {
//           return `"${str.replace(/"/g, '""')}"`;
//         }
//         return str;
//       };

//       const rows = data.map(item => {
//         const tagsString = Array.isArray(item.tags) ? item.tags.join('; ') : item.tags || '';
//         return headers.map(header => {
//           if (header === 'tags') {
//             return escapeCsvValue(tagsString);
//           }
//           return escapeCsvValue(item[header]);
//         }).join(',');
//       });

//       return [headers.join(','), ...rows].join('\n');
//     };

//     // Function to scrape a single category
//     const scrapeCategory = async (href, categoryName) => {
//       console.log(`Scraping category: ${categoryName} (${href})`);
//       let categoryResults = [];
//       const hassanBaseUrl = 'https://www.justdial.com/Hassan';

//       try {
//         await page.goto(href, { waitUntil: 'networkidle2', timeout: 60000 });

//         const currentUrl = await page.url();
//         if (!currentUrl.includes('/Hassan')) {
//           console.log(`Location changed in URL: ${currentUrl}, resetting to Hassan`);
//           await page.goto(hassanBaseUrl, { waitUntil: 'networkidle2', timeout: 30000 });
//           await page.goto(href, { waitUntil: 'networkidle2', timeout: 60000 });
//         }

//         try {
//           await page.waitForSelector('.resultbox', { timeout: 30000 });
//           console.log(`Initial .resultbox elements found for ${categoryName}`);
//         } catch (e) {
//           console.error(`Selector .resultbox not found for ${categoryName}:`, e.message);
//           return [];
//         }

//         let previousCount = 0;
//         let attempts = 0;
//         const maxAttempts = 10;
//         const maxListingCount = 500;

//         await autoScroll(page);
//         await delay(2000);

//         while (attempts < maxAttempts) {
//           const currentCount = await page.evaluate(
//             () => document.querySelectorAll('.resultbox').length
//           );
//           console.log(`Attempt ${attempts + 1}: Found ${currentCount} .resultbox elements`);

//           if (currentCount >= maxListingCount) {
//             console.log(`Reached maximum of ${maxListingCount} listings, stopping.`);
//             break;
//           }

//           if (currentCount === previousCount) {
//             console.log('No new results loaded, checking for load more button...');
//             const loadMoreBtn = await page.$('.btn-load-more, .load-more-btn, [id*="load-more"], [class*="load-more"], .more-btn');
            
//             if (loadMoreBtn) {
//               console.log('Load More Button found, attempting to click...');
//               try {
//                 await page.evaluate(btn => {
//                   btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
//                 }, loadMoreBtn);
//                 await delay(1000);
//                 await loadMoreBtn.click({ delay: 100 });
//                 console.log('Clicked load more button');
                
//                 await Promise.race([
//                   page.waitForResponse(
//                     response => response.url().includes('/search') && response.status() === 200,
//                     { timeout: 10000 }
//                   ),
//                   page.waitForFunction(
//                     count => document.querySelectorAll('.resultbox').length > count,
//                     { timeout: 10000 },
//                     currentCount
//                   ),
//                   delay(5000)
//                 ]);
                
//                 console.log('New listings loaded after click');
//                 await autoScroll(page);
//                 await delay(2000);
//               } catch (clickError) {
//                 console.log('Click failed:', clickError.message);
//                 break;
//               }
//             } else {
//               console.log('No load more button found, stopping.');
//               break;
//             }
//           }

//           previousCount = currentCount;
//           attempts++;
//           await delay(3000 + Math.random() * 1000);
//         }

//         const data = await page.evaluate((scrapedUrl, categoryText) => {
//           let category = categoryText;
//           let city = 'Hassan';
//           const heading = document.querySelector('h1')?.textContent || '';
//           const headingMatch = heading.match(/(.+?)\s+in\s+(.+)/i);
//           if (headingMatch) {
//             category = headingMatch[1]?.trim() || categoryText;
//             city = headingMatch[2]?.trim() || 'Hassan';
//           }

//           if (category.toLowerCase().startsWith('popular')) {
//             category = category.replace(/^popular\s+/i, '').trim();
//           }

//           const results = [];
//           const containers = document.querySelectorAll('.resultbox');

//           containers.forEach((container) => {
//             const getText = (selector) =>
//               container.querySelector(selector)?.textContent?.trim() || '';

//             const name =
//               getText('.resultbox_title_anchor') || 
//               getText('.resultbox_title') || 
//               getText('.jcn a') ||
//               getText('.jcn');

//             let initial = '';
//             const imageBoxText =
//               container.querySelector('.resultbox_imagebox')?.textContent?.trim() || '';
//             initial = imageBoxText[0] || name?.[0] || '';

//             const rating =
//               getText('.resultbox_totalrate') || 
//               getText('.green-box') ||
//               getText('.rating-count');

//             const totalRatings =
//               getText('.resultbox_countrate') ||
//               getText('.resultbox_totalratings') ||
//               getText('.font12.fw400.color777') ||
//               getText('.rev-count');

//             const address =
//               getText('.resultbox_address .locatcity') || 
//               getText('.comp-text') ||
//               getText('.cont_fl_addr');

//             const distance =
//               getText('.resultbox_address > .font12') || 
//               getText('.rsw__distance') ||
//               getText('.dist');

//             const phoneAnchor = container.querySelector('a[href^="tel:"]');
//             let phone = phoneAnchor
//               ? phoneAnchor.getAttribute('href')?.replace('tel:', '').trim()
//               : '';

//             const callNow = container.querySelector('.callNowAnchor, .call-btn');
//             const callText = callNow?.textContent?.trim();

//             if (!phone && callText && /^[\d\s+-]+$/.test(callText)) {
//               phone = callText;
//             }

//             const tags = [
//               ...Array.from(container.querySelectorAll('.rsw__services li')),
//               ...Array.from(container.querySelectorAll('.resultbox_services li')),
//               ...Array.from(container.querySelectorAll('.resultbox_amenities .amenities_tabs')),
//               ...Array.from(container.querySelectorAll('.jrcw')),
//             ]
//               .map((tag) => tag.textContent?.trim())
//               .filter(Boolean);

//             const fullText = container.textContent?.toLowerCase() || '';
//             const hasWhatsApp = fullText.includes('whatsapp') || !!container.querySelector('[href*="whatsapp"]');
//             const hasEnquiry = fullText.includes('send enquiry') || !!container.querySelector('[href*="enquiry"]');

//             const isTrusted = !!container.querySelector('.results_jdtrusted, .jdTrusted');
//             const isVerified = !!container.querySelector('.results_jdverified, .verified-icon');
//             const isPopular = !!container.querySelector('.imgtag_box, .popular-tag');

//             if (name) {
//               results.push({
//                 name,
//                 initial,
//                 rating,
//                 totalRatings,
//                 address,
//                 distance,
//                 phone,
//                 tags,
//                 hasWhatsApp,
//                 hasEnquiry,
//                 isTrusted,
//                 isVerified,
//                 isPopular,
//                 category,
//                 city,
//                 timestamp: new Date().toISOString(),
//               });
//             }
//           });

//           return { results, category, city };
//         }, href, categoryName);

//         if (data.results.length > 0) {
//           console.log(`Scraped ${data.results.length} listings for ${categoryName}`);
//           return data.results;
//         } else {
//           console.log(`No results found for category: ${categoryName}`);
//           return [];
//         }
//       } catch (e) {
//         console.error(`Error scraping category ${categoryName}:`, e.message);
//         return [];
//       }
//     };

//     // If a specific category is provided, scrape only that category
//     if (category) {
//       const categoryLink = categoryLinks.find(link => link.categoryName.toLowerCase() === category.toLowerCase());
//       if (!categoryLink) {
//         await browser.close();
//         res.setHeader('Content-Type', 'text/csv');
//         res.setHeader('Content-Disposition', 'attachment; filename="error.csv"');
//         return res.status(400).send(`error\n"Category '${category}' not found"`);
//       }

//       const results = await scrapeCategory(categoryLink.href, categoryLink.categoryName);
//       if (results.length === 0) {
//         await browser.close();
//         res.setHeader('Content-Type', 'text/csv');
//         res.setHeader('Content-Disposition', 'attachment; filename="error.csv"');
//         return res.status(200).send(`error\n"No results found for category '${category}'"`);
//       }

//       const csvData = convertToCSV(results);
//       const safeCategoryName = category.toLowerCase().replace(/[^a-z0-9]/g, '_');
//       const fileName = `hassan_${safeCategoryName}_listings.csv`;
//       const filePath = path.join(outputDir, fileName);

//       // Save the CSV file
//       fs.writeFileSync(filePath, csvData);
//       console.log(`File saved: ${path.resolve(filePath)}`);

//       // Send the CSV file as the response
//       await browser.close();
//       res.setHeader('Content-Type', 'text/csv');
//       res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
//       res.status(200).send(csvData);
//       return;
//     }

//     // Otherwise, scrape all categories and download the combined file
//     const allResults = [];
//     const hassanBaseUrl = 'https://www.justdial.com/Hassan';
//     for (const { href, categoryName } of categoryLinks) {
//       const categoryResults = await scrapeCategory(href, categoryName);
//       if (categoryResults.length > 0) {
//         allResults.push(...categoryResults);

//         // Generate and save CSV for this category
//         const categoryCsvData = convertToCSV(categoryResults);
//         const safeCategoryName = categoryName.toLowerCase().replace(/[^a-z0-9]/g, '_');
//         const categoryFileName = `hassan_${safeCategoryName}_listings.csv`;
//         const categoryFilePath = path.join(outputDir, categoryFileName);

//         fs.writeFileSync(categoryFilePath, categoryCsvData);
//         console.log(`File saved: ${path.resolve(categoryFilePath)}`);
//       }

//       // Navigate back to the Hassan page
//       console.log('Navigating back to Hassan page:', hassanBaseUrl);
//       await page.goto(hassanBaseUrl, { waitUntil: 'networkidle2', timeout: 60000 });

//       try {
//         const popularCategoriesBtn = await page.waitForSelector('#popular_categories', { visible: true, timeout: 20000 });
//         if (popularCategoriesBtn) {
//           await page.evaluate(() => {
//             const btn = document.querySelector('#popular_categories');
//             if (btn) {
//               btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
//             }
//           });
//           await delay(2000);
//           await popularCategoriesBtn.click();
//           console.log('Re-clicked Popular Categories button with id="popular_categories"');
//           await delay(5000);
//         }
//       } catch (e) {
//         console.log('Failed to re-click Popular Categories button:', e.message);
//       }

//       await delay(4000);
//     }

//     await browser.close();

//     if (allResults.length === 0) {
//       res.setHeader('Content-Type', 'text/csv');
//       res.setHeader('Content-Disposition', 'attachment; filename="business_listings.csv"');
//       return res.status(200).send('error\n"No results found across all categories"');
//     }

//     // Generate and save the combined CSV file
//     const combinedCsvData = convertToCSV(allResults);
//     const combinedFileName = 'hassan_all_categories_listings.csv';
//     const combinedFilePath = path.join(outputDir, combinedFileName);
//     fs.writeFileSync(combinedFilePath, combinedCsvData);
//     console.log(`Combined file saved: ${path.resolve(combinedFilePath)}`);

//     // Send the combined CSV file as the response
//     res.setHeader('Content-Type', 'text/csv');
//     res.setHeader('Content-Disposition', 'attachment; filename="hassan_all_categories_listings.csv"');
//     res.status(200).send(combinedCsvData);
//   } catch (error) {
//     console.error('Scraping error:', error);

//     if (browser) {
//       try {
//         await browser.close();
//       } catch (e) {
//         console.error('Error closing browser:', e);
//       }
//     }

//     res.setHeader('Content-Type', 'text/csv');
//     res.setHeader('Content-Disposition', 'attachment; filename="business_listings.csv"');
//     res.status(500).send(`error\n"Scraping failed: ${error.message}"`);
//   }
// }


import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="error.csv"');
    return res.status(405).send('error\n"Method not allowed"');
  }

  const { category, listCategories } = req.query; 

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: process.env.NODE_ENV === 'production' ? 'new' : false,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-geolocation'],
      executablePath:
        process.env.NODE_ENV === 'production'
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    });

    const page = await browser.newPage();

    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      Object.defineProperty(navigator, 'geolocation', { get: () => undefined });
    });

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Referer': 'https://www.justdial.com/',
    });
    await page.setViewport({ width: 1366, height: 768 });
    await page.setJavaScriptEnabled(true);

    const delay = (ms) => new Promise((r) => setTimeout(r, ms));

    // Create the filemanager directory if it doesn't exist
    const outputDir = path.join(process.cwd(), 'Chikkamagaluru');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`Created directory: ${outputDir}`);
    }

    // Navigate to Justdial Chikkamagaluru page
    const chikkamagaluruBaseUrl = 'https://www.justdial.com/Chikkamagaluru';
    await page.goto(chikkamagaluruBaseUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    console.log('Navigated to Justdial Chikkamagaluru page');
    await page.screenshot({ path: path.join(outputDir, 'chikkamagaluru-page.png'), fullPage: true });
    console.log(`Screenshot saved: ${path.join(outputDir, 'chikkamagaluru-page.png')}`);

    // Handle cookie consent popup
    try {
      const acceptCookiesBtn = await page.waitForSelector(
        '#cookie_btn, .cookie-agree, [id*="cookie"][id*="accept"], [class*="cookie"][class*="accept"]',
        { timeout: 5000 }
      );
      if (acceptCookiesBtn) {
        await acceptCookiesBtn.click();
        console.log('Accepted cookies');
        await delay(2000);
      }
    } catch (e) {
      console.log('No cookie consent popup found or failed to click:', e.message);
    }

    // Handle auto-location popup
    try {
      const denyLocationBtn = await page.waitForSelector(
        '[id*="geo"][id*="deny"], [class*="geo"][class*="deny"], [class*="location"][class*="reject"], [class*="button"][class*="reject"]',
        { timeout: 5000 }
      );
      if (denyLocationBtn) {
        await denyLocationBtn.click();
        console.log('Denied auto-location prompt');
        await delay(2000);
      }
    } catch (e) {
      console.log('No auto-location popup found or failed to click:', e.message);
    }

    // Verify location is Chikkamagaluru and click "Popular Categories" button
    try {
      console.log('Verifying location is Chikkamagaluru...');
      const locationInputSelector = '#city, [name="city"], [id*="location"], [class*="city"] input, [placeholder*="city"], [class*="location"] input, #home-city-autocomplete';
      const locationInput = await page.waitForSelector(locationInputSelector, { visible: true, timeout: 15000 });
      if (locationInput) {
        const currentValue = await page.evaluate(el => el.value, locationInput);
        console.log('Current location input:', currentValue);
        if (!currentValue.toLowerCase().includes('chikkamagaluru')) {
          console.log('Location not set to Chikkamagaluru, setting now...');
          await locationInput.click({ clickCount: 3 });
          await locationInput.press('Backspace');
          await locationInput.type('Chikkamagaluru', { delay: 100 });
          await delay(3000);

          const suggestionSelector = '.suggestions_list li, .city-suggestion, .autocomplete-suggestion, [class*="suggestion"], [class*="autoComplete"], li:contains("Chikkamagaluru")';
          await page.waitForSelector(suggestionSelector, { visible: true, timeout: 10000 });
          await page.evaluate(() => {
            const suggestions = document.querySelectorAll('.suggestions_list li, .city-suggestion, .autocomplete-suggestion, [class*="suggestion"], [class*="autoComplete"], li');
            for (let suggestion of suggestions) {
              if (suggestion.textContent.toLowerCase().includes('chikkamagaluru')) {
                suggestion.click();
                break;
              }
            }
          });
          console.log('Clicked "Chikkamagaluru" from suggestions');
          await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });
          console.log('Navigation completed after selecting city');

          const newValue = await page.evaluate(el => el.value, locationInput);
          console.log('New location input:', newValue);
          if (!newValue.toLowerCase().includes('chikkamagaluru')) {
            throw new Error('Failed to set location to Chikkamagaluru, found: ' + newValue);
          }
        }
        console.log('Successfully confirmed location as Chikkamagaluru');
      } else {
        console.log('Location input not found, relying on URL');
      }

      const currentUrl = await page.url();
      if (!currentUrl.includes('/Chikkamagaluru')) {
        console.log('URL does not contain Chikkamagaluru, navigating to correct URL');
        await page.goto(chikkamagaluruBaseUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      }

      console.log('Looking for Popular Categories button with id="popular_categories"...');
      const popularCategoriesBtn = await page.waitForSelector('#popular_categories', { visible: true, timeout: 30000 });
      if (!popularCategoriesBtn) {
        throw new Error('Popular Categories button with id="popular_categories" not found');
      }

      await page.evaluate(() => {
        const btn = document.querySelector('#popular_categories');
        if (btn) {
          btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
      await delay(2000);
      await page.screenshot({ path: path.join(outputDir, 'before-popular-categories-click.png'), fullPage: true });
      console.log(`Screenshot saved: ${path.join(outputDir, 'before-popular-categories-click.png')}`);

      await popularCategoriesBtn.click();
      console.log('Clicked Popular Categories button with id="popular_categories"');
      await delay(5000);
      await page.screenshot({ path: path.join(outputDir, 'after-popular-categories-click.png'), fullPage: true });
      console.log(`Screenshot saved: ${path.join(outputDir, 'after-popular-categories-click.png')}`);

      const sideMenu = await page.waitForSelector('.sidemenu_cateitem', { timeout: 10000 });
      if (!sideMenu) {
        throw new Error('Side menu with categories did not appear after clicking Popular Categories');
      }
      console.log('Side menu with categories appeared successfully');
    } catch (e) {
      console.error('Error setting/verifying location or clicking Popular Categories:', e.message);
      await page.screenshot({ path: path.join(outputDir, 'location-or-popular-error.png'), fullPage: true });
      console.log(`Screenshot saved: ${path.join(outputDir, 'location-or-popular-error.png')}`);
      await browser.close();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="error.csv"');
      return res.status(500).send(`error\n"Failed to set location or click Popular Categories: ${e.message}"`);
    }

    // Extract category links from the side menu
    let categoryLinks = [];
    try {
      console.log('Extracting category links from sidemenu_catebox...');
      await page.waitForSelector('.sidemenu_cateitem', { timeout: 30000 });
      categoryLinks = await page.evaluate(() => {
        const links = [];
        const categoryItems = document.querySelectorAll('.sidemenu_cateitem');
        categoryItems.forEach((item) => {
          const anchor = item.querySelector('a');
          const categoryName = anchor.querySelector('.sidemenu_text')?.textContent?.trim() || '';
          const href = anchor?.href || '';
          if (href && categoryName) {
            links.push({ href, categoryName });
          }
        });
        return links;
      });

      console.log(`Found ${categoryLinks.length} category links:`, categoryLinks.map(link => link.categoryName));
    } catch (e) {
      console.error('Error extracting category links:', e.message);
      await browser.close();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="error.csv"');
      return res.status(500).send(`error\n"Failed to extract category links: ${e.message}"`);
    }

    if (categoryLinks.length === 0) {
      await browser.close();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="error.csv"');
      return res.status(200).send('error\n"No categories found"');
    }

    // If listCategories is true, return the list of categories as JSON
    if (listCategories === 'true') {
      await browser.close();
      res.status(200).json({ categories: categoryLinks.map(link => link.categoryName) });
      return;
    }

    // Auto-scroll function
    async function autoScroll(page) {
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let totalHeight = 0;
          const distance = 300;
          const maxScrolls = 1000;
          let scrollCount = 0;
          let lastScrollHeight = document.body.scrollHeight;
          let unchangedCount = 0;
          let lastListingCount = document.querySelectorAll('.resultbox').length;

          const timer = setInterval(() => {
            window.scrollBy(0, distance);
            totalHeight += distance;
            scrollCount++;

            const currentScrollHeight = document.body.scrollHeight;
            const currentListingCount = document.querySelectorAll('.resultbox').length;

            if (currentScrollHeight > lastScrollHeight || currentListingCount > lastListingCount) {
              lastScrollHeight = currentScrollHeight;
              lastListingCount = currentListingCount;
              unchangedCount = 0;
            } else {
              unchangedCount++;
            }

            if (unchangedCount >= 15 || scrollCount >= maxScrolls || 
                (window.innerHeight + window.scrollY) >= document.body.scrollHeight) {
              clearInterval(timer);
              resolve();
            }
          }, 500);
        });
      });
    }

    // Function to convert data to CSV
    const convertToCSV = (data) => {
      if (!data || data.length === 0) return '';

      const headers = [
        'name',
        'initial',
        'rating',
        'totalRatings',
        'address',
        'distance',
        'phone',
        'tags',
        'hasWhatsApp',
        'hasEnquiry',
        'isTrusted',
        'isVerified',
        'isPopular',
        'category',
        'subcategory',
        'city',
        'timestamp',
      ];

      const escapeCsvValue = (value) => {
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const rows = data.map(item => {
        const tagsString = Array.isArray(item.tags) ? item.tags.join('; ') : item.tags || '';
        return headers.map(header => {
          if (header === 'tags') {
            return escapeCsvValue(tagsString);
          }
          return escapeCsvValue(item[header]);
        }).join(',');
      });

      return [headers.join(','), ...rows].join('\n');
    };

    // Function to scrape a single category or subcategory
    const scrapeListings = async (href, categoryName, subcategoryName = '') => {
      console.log(`Scraping ${subcategoryName ? `subcategory: ${subcategoryName} under ${categoryName}` : `category: ${categoryName}`} (${href})`);
      let results = [];

      try {
        await page.goto(href, { waitUntil: 'networkidle2', timeout: 60000 });

        const currentUrl = await page.url();
        if (!currentUrl.includes('/Chikkamagaluru')) {
          console.log(`Location changed in URL: ${currentUrl}, resetting to Chikkamagaluru`);
          await page.goto(chikkamagaluruBaseUrl, { waitUntil: 'networkidle2', timeout: 30000 });
          await page.goto(href, { waitUntil: 'networkidle2', timeout: 60000 });
        }

        try {
          await page.waitForSelector('.resultbox', { timeout: 30000 });
          console.log(`Initial .resultbox elements found for ${subcategoryName || categoryName}`);
        } catch (e) {
          console.error(`Selector .resultbox not found for ${subcategoryName || categoryName}:`, e.message);
          return [];
        }

        let previousCount = 0;
        let attempts = 0;
        const maxAttempts = 10;
        const maxListingCount = 50;

        await autoScroll(page);
        await delay(2000);

        while (attempts < maxAttempts) {
          const currentCount = await page.evaluate(
            () => document.querySelectorAll('.resultbox').length
          );
          console.log(`Attempt ${attempts + 1}: Found ${currentCount} .resultbox elements`);

          if (currentCount >= maxListingCount) {
            console.log(`Reached maximum of ${maxListingCount} listings, stopping.`);
            break;
          }

          if (currentCount === previousCount) {
            console.log('No new results loaded, checking for load more button...');
            const loadMoreBtn = await page.$('.btn-load-more, .load-more-btn, [id*="load-more"], [class*="load-more"], .more-btn');
            
            if (loadMoreBtn) {
              console.log('Load More Button found, attempting to click...');
              try {
                await page.evaluate(btn => {
                  btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, loadMoreBtn);
                await delay(1000);
                await loadMoreBtn.click({ delay: 100 });
                console.log('Clicked load more button');
                
                await Promise.race([
                  page.waitForResponse(
                    response => response.url().includes('/search') && response.status() === 200,
                    { timeout: 10000 }
                  ),
                  page.waitForFunction(
                    count => document.querySelectorAll('.resultbox').length > count,
                    { timeout: 10000 },
                    currentCount
                  ),
                  delay(5000)
                ]);
                
                console.log('New listings loaded after click');
                await autoScroll(page);
                await delay(2000);
              } catch (clickError) {
                console.log('Click failed:', clickError.message);
                break;
              }
            } else {
              console.log('No load more button found, stopping.');
              break;
            }
          }

          previousCount = currentCount;
          attempts++;
          await delay(3000 + Math.random() * 1000);
        }

        const data = await page.evaluate((scrapedUrl, categoryText, subCategoryText) => {
          let category = categoryText;
          let subcategory = subCategoryText;
          let city = 'Chikkamagaluru';
          const heading = document.querySelector('h1')?.textContent || '';
          const headingMatch = heading.match(/(.+?)\s+in\s+(.+)/i);
          if (headingMatch) {
            const headingCategory = headingMatch[1]?.trim();
            city = headingMatch[2]?.trim() || 'Chikkamagaluru';
            if (subCategoryText) {
              subcategory = headingCategory; // Subcategory might be in the heading
            } else {
              category = headingCategory || categoryText;
            }
          }

          if (category.toLowerCase().startsWith('popular')) {
            category = category.replace(/^popular\s+/i, '').trim();
          }

          const results = [];
          const containers = document.querySelectorAll('.resultbox');
          
          // Limit to 50 records
          const maxRecords = Math.min(containers.length, 50);

          for (let i = 0; i < maxRecords; i++) {
            const container = containers[i];
            const getText = (selector) =>
              container.querySelector(selector)?.textContent?.trim() || '';

            const name =
              getText('.resultbox_title_anchor') || 
              getText('.resultbox_title') || 
              getText('.jcn a') ||
              getText('.jcn');

            let initial = '';
            const imageBoxText =
              container.querySelector('.resultbox_imagebox')?.textContent?.trim() || '';
            initial = imageBoxText[0] || name?.[0] || '';

            const rating =
              getText('.resultbox_totalrate') || 
              getText('.green-box') ||
              getText('.rating-count');

            const totalRatings =
              getText('.resultbox_countrate') ||
              getText('.resultbox_totalratings') ||
              getText('.font12.fw400.color777') ||
              getText('.rev-count');

            const address =
              getText('.resultbox_address .locatcity') || 
              getText('.comp-text') ||
              getText('.cont_fl_addr');

            const distance =
              getText('.resultbox_address > .font12') || 
              getText('.rsw__distance') ||
              getText('.dist');

            const phoneAnchor = container.querySelector('a[href^="tel:"]');
            let phone = phoneAnchor
              ? phoneAnchor.getAttribute('href')?.replace('tel:', '').trim()
              : '';

            const callNow = container.querySelector('.callNowAnchor, .call-btn');
            const callText = callNow?.textContent?.trim();

            if (!phone && callText && /^[\d\s+-]+$/.test(callText)) {
              phone = callText;
            }

            const tags = [
              ...Array.from(container.querySelectorAll('.rsw__services li')),
              ...Array.from(container.querySelectorAll('.resultbox_services li')),
              ...Array.from(container.querySelectorAll('.resultbox_amenities .amenities_tabs')),
              ...Array.from(container.querySelectorAll('.jrcw')),
            ]
              .map((tag) => tag.textContent?.trim())
              .filter(Boolean);

            const fullText = container.textContent?.toLowerCase() || '';
            const hasWhatsApp = fullText.includes('whatsapp') || !!container.querySelector('[href*="whatsapp"]');
            const hasEnquiry = fullText.includes('send enquiry') || !!container.querySelector('[href*="enquiry"]');

            const isTrusted = !!container.querySelector('.results_jdtrusted, .jdTrusted');
            const isVerified = !!container.querySelector('.results_jdverified, .verified-icon');
            const isPopular = !!container.querySelector('.imgtag_box, .popular-tag');

            if (name) {
              results.push({
                name,
                initial,
                rating,
                totalRatings,
                address,
                distance,
                phone,
                tags,
                hasWhatsApp,
                hasEnquiry,
                isTrusted,
                isVerified,
                isPopular,
                category,
                subcategory,
                city,
                timestamp: new Date().toISOString(),
              });
            }
          }

          return { results, category, subcategory, city };
        }, href, categoryName, subcategoryName);

        if (data.results.length > 0) {
          console.log(`Scraped ${data.results.length} listings for ${subcategoryName || categoryName}`);
          return data.results;
        } else {
          console.log(`No results found for ${subcategoryName || categoryName}`);
          return [];
        }
      } catch (e) {
        console.error(`Error scraping ${subcategoryName || categoryName}:`, e.message);
        return [];
      }
    };

    // Function to scrape a main category and its subcategories
    const scrapeCategoryWithSubcategories = async (mainCategoryHref, mainCategoryName) => {
      console.log(`Processing main category: ${mainCategoryName} (${mainCategoryHref})`);
      let allResultsForCategory = [];

      // Scrape the main category listings
      const mainCategoryResults = await scrapeListings(mainCategoryHref, mainCategoryName);
      if (mainCategoryResults.length > 0) {
        allResultsForCategory.push(...mainCategoryResults);

        // Generate and save CSV for the main category
        const mainCategoryCsvData = convertToCSV(mainCategoryResults);
        const safeMainCategoryName = mainCategoryName.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const mainCategoryFileName = `chikkamagaluru_${safeMainCategoryName}_listings.csv`;
        const mainCategoryFilePath = path.join(outputDir, mainCategoryFileName);

        fs.writeFileSync(mainCategoryFilePath, mainCategoryCsvData);
        console.log(`File saved: ${path.resolve(mainCategoryFilePath)}`);
      }

      // Look for subcategories
      let subcategoryLinks = [];
      try {
        console.log(`Extracting subcategories for ${mainCategoryName}...`);
        await page.waitForSelector('.filter_items, [class*="filter"]', { timeout: 10000 });
        subcategoryLinks = await page.evaluate(() => {
          const links = [];
          const subcategoryItems = document.querySelectorAll('.filter_items a, [class*="filter"] a');
          subcategoryItems.forEach((item) => {
            const subcategoryName = item.textContent?.trim() || '';
            const href = item.href || '';
            if (href && subcategoryName) {
              links.push({ href, subcategoryName });
            }
          });
          return links;
        });

        console.log(`Found ${subcategoryLinks.length} subcategories for ${mainCategoryName}:`, subcategoryLinks.map(link => link.subcategoryName));
      } catch (e) {
        console.log(`No subcategories found for ${mainCategoryName} or failed to extract:`, e.message);
      }

      // If subcategories exist, scrape each one
      if (subcategoryLinks.length > 0) {
        for (const { href, subcategoryName } of subcategoryLinks) {
          const subcategoryResults = await scrapeListings(href, mainCategoryName, subcategoryName);
          if (subcategoryResults.length > 0) {
            allResultsForCategory.push(...subcategoryResults);

            // Generate and save CSV for this subcategory
            const subcategoryCsvData = convertToCSV(subcategoryResults);
            const safeMainCategoryName = mainCategoryName.toLowerCase().replace(/[^a-z0-9]/g, '_');
            const safeSubcategoryName = subcategoryName.toLowerCase().replace(/[^a-z0-9]/g, '_');
            const subcategoryFileName = `chikkamagaluru_${safeMainCategoryName}_${safeSubcategoryName}_listings.csv`;
            const subcategoryFilePath = path.join(outputDir, subcategoryFileName);

            fs.writeFileSync(subcategoryFilePath, subcategoryCsvData);
            console.log(`File saved: ${path.resolve(subcategoryFilePath)}`);
          }

          // Navigate back to the main category page
          await page.goto(mainCategoryHref, { waitUntil: 'networkidle2', timeout: 60000 });
          console.log(`Navigated back to category page for ${mainCategoryName}`);
          await delay(2000);
        }
      }

      return allResultsForCategory;
    };

    // If a specific category is provided, scrape only that category and its subcategories
    if (category) {
      const categoryLink = categoryLinks.find(link => link.categoryName.toLowerCase() === category.toLowerCase());
      if (!categoryLink) {
        await browser.close();
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="error.csv"');
        return res.status(400).send(`error\n"Category '${category}' not found"`);
      }

      const results = await scrapeCategoryWithSubcategories(categoryLink.href, categoryLink.categoryName);
      if (results.length === 0) {
        await browser.close();
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="error.csv"');
        return res.status(200).send(`error\n"No results found for category '${category}' or its subcategories"`);
      }

      const csvData = convertToCSV(results);
      const safeCategoryName = category.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const fileName = `chikkamagaluru_${safeCategoryName}_all_subcategories_listings.csv`;
      const filePath = path.join(outputDir, fileName);

      // Save the CSV file
      fs.writeFileSync(filePath, csvData);
      console.log(`File saved: ${path.resolve(filePath)}`);

      // Send the CSV file as the response
      await browser.close();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.status(200).send(csvData);
      return;
    }

    // Otherwise, scrape all categories and their subcategories
    const allResults = [];
    for (const { href, categoryName } of categoryLinks) {
      const categoryResults = await scrapeCategoryWithSubcategories(href, categoryName);
      if (categoryResults.length > 0) {
        allResults.push(...categoryResults);
      }

      // Navigate back to the Chikkamagaluru page
      console.log('Navigating back to Chikkamagaluru page:', chikkamagaluruBaseUrl);
      await page.goto(chikkamagaluruBaseUrl, { waitUntil: 'networkidle2', timeout: 60000 });

      try {
        const popularCategoriesBtn = await page.waitForSelector('#popular_categories', { visible: true, timeout: 20000 });
        if (popularCategoriesBtn) {
          await page.evaluate(() => {
            const btn = document.querySelector('#popular_categories');
            if (btn) {
              btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          });
          await delay(2000);
          await popularCategoriesBtn.click();
          console.log('Re-clicked Popular Categories button with id="popular_categories"');
          await delay(5000);
        }
      } catch (e) {
        console.log('Failed to re-click Popular Categories button:', e.message);
      }

      await delay(4000);
    }

    await browser.close();

    if (allResults.length === 0) {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="business_listings.csv"');
      return res.status(200).send('error\n"No results found across all categories and subcategories"');
    }

    // Generate and save the combined CSV file
    const combinedCsvData = convertToCSV(allResults);
    const combinedFileName = 'chikkamagaluru_all_categories_listings.csv';
    const combinedFilePath = path.join(outputDir, combinedFileName);
    fs.writeFileSync(combinedFilePath, combinedCsvData);
    console.log(`Combined file saved: ${path.resolve(combinedFilePath)}`);

    // Send the combined CSV file as the response
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="chikkamagaluru_all_categories_listings.csv"');
    res.status(200).send(combinedCsvData);
  } catch (error) {
    console.error('Scraping error:', error);

    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error('Error closing browser:', e);
      }
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="business_listings.csv"');
    res.status(500).send(`error\n"Scraping failed: ${error.message}"`);
  }
}