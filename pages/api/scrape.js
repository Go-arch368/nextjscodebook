import puppeteer from 'puppeteer';
import dbConnect from '@/lib/dbConnect';
import BusinessListing from '../../models/BusinessListing';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let browser;
  try {
    await dbConnect();
    console.log('Connected to MongoDB');

    browser = await puppeteer.launch({
      headless: process.env.NODE_ENV === 'production' ? true : false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath:
        process.env.NODE_ENV === 'production'
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    });

    const page = await browser.newPage();

    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });
    await page.setViewport({ width: 1366, height: 768 });
    await page.setJavaScriptEnabled(true);

    const delay = (ms) => new Promise((r) => setTimeout(r, ms));

    const url = req.query.url || 'https://www.justdial.com/Khargone/search?q=autospares-hub&stype=company_list&trkid=9970468686-fcomp&term=AutoSpares%20Hub'

    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

    try {
      await page.waitForSelector('.resultbox', { timeout: 60000 });
      console.log('Initial .resultbox elements found');
    } catch (e) {
      console.error('Selector .resultbox not found:', e);
      await browser.close();
      return res.status(200).json({
        success: false,
        url,
        count: 0,
        data: [],
        message: 'No results found. Selector .resultbox not found.',
        scrapedAt: new Date().toISOString(),
      });
    }

    async function autoScroll(page) {
      await page.evaluate(async () => {
        await new Promise((resolve) => {
          let totalHeight = 0;
          const distance = 200;
          const maxScrolls = 200;
          let scrollCount = 0;
          let lastScrollHeight = 0;

          const timer = setInterval(() => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;
            scrollCount++;

            if (scrollHeight > lastScrollHeight) {
              lastScrollHeight = scrollHeight;
              scrollCount = 0;
            }

            if (scrollCount >= maxScrolls || totalHeight >= scrollHeight) {
              clearInterval(timer);
              resolve();
            }
          }, 300);
        });
      });
    }

    let previousCount = 0;
    let attempts = 0;
    const maxAttempts = 50;

    while (attempts < maxAttempts) {
      await autoScroll(page);
      await delay(2000);

      const currentCount = await page.evaluate(
        () => document.querySelectorAll('.resultbox').length
      );
      console.log(`Attempt ${attempts + 1}: Found ${currentCount} .resultbox elements`);

      if (currentCount === previousCount && attempts > 0) {
        console.log('No new results loaded, checking for button...');
        const loadMoreBtn = await page.$('.btn-load-more, .load-more-btn');
        console.log('Load More Button:', loadMoreBtn ? 'Found' : 'Not Found');

        if (!loadMoreBtn) {
          console.log('No load more button found, stopping.');
          break;
        }

        const isVisible = await page.evaluate(
          (btn) => btn.offsetParent !== null && !btn.disabled,
          loadMoreBtn
        );
        if (!isVisible) {
          console.log('Load more button not visible or disabled, stopping.');
          break;
        }

        try {
          await loadMoreBtn.click();
          console.log('Clicked load more button');
          await page.waitForResponse(
            (response) =>
              response.url().includes('/search') && response.status() === 200,
            { timeout: 15000 }
          );
          console.log('Received /search response');
        } catch (e) {
          console.log('Load more click or response wait failed:', e.message);
          break;
        }
      }

      previousCount = currentCount;
      await delay(4000 + Math.random() * 2000);
      attempts++;
    }

    console.log('Finished loading attempts, scraping data...');
    const data = await page.evaluate((scrapedUrl) => {
      console.log('Resultbox count:', document.querySelectorAll('.resultbox').length);

      function extractFirstSrcsetUrl(srcset) {
        if (!srcset) return '';
        const beforeComma = srcset.split(',')[0].trim();
        const firstUrl = beforeComma.split(' ')[0];
        return firstUrl;
      }

      let category = '';
      let city = '';
      const heading = document.querySelector('h1')?.textContent || '';
      console.log('Heading for category extraction:', heading);
      const headingMatch = heading.match(/(.+?)\s+in\s+(.+)/i);
      if (headingMatch) {
        category = headingMatch[1]?.trim() || '';
        city = headingMatch[2]?.trim() || '';
      } else {
        console.log('Heading match failed, trying URL parsing');
      }

      if (!category || !city) {
        const urlParts = scrapedUrl.split('/').filter(Boolean);
        console.log('URL Parts for category:', urlParts);
        if (urlParts.length >= 4) {
          const cityPart = urlParts[3];
          const categoryPart = urlParts[4];
          city = cityPart.replace(/-/g, ' ');
          const categoryMatch = categoryPart.match(/(.+?)-in-(.+)/i);
          if (categoryMatch) {
            category = categoryMatch[1].replace(/-/g, ' ').trim();
            const subLocation = categoryMatch[2].replace(/-/g, ' ').trim();
            city = `${subLocation}, ${city}`;
          } else {
            console.log('Category match failed for URL part:', categoryPart);
          }
        } else {
          console.log('URL parts insufficient:', urlParts);
        }
      }

      // Remove "Popular" from the start of the category name
      if (category.toLowerCase().startsWith('popular')) {
        category = category.replace(/^popular\s+/i, '').trim();
      }

      console.log('Extracted category (after removing Popular):', category, 'city:', city);

      const results = [];
      const containers = document.querySelectorAll('.resultbox');

      containers.forEach((container) => {
        const getText = (selector) =>
          container.querySelector(selector)?.textContent?.trim() || '';

        const name =
          getText('.resultbox_title_anchor') || getText('.resultbox_title');

        let initial = '';
        let imageUrl = '';
        const img = container.querySelector('.srcset');
        if (img) {
          const srcset = img.getAttribute('srcset');
          if (srcset) {
            imageUrl = extractFirstSrcsetUrl(srcset);
          } else {
            imageUrl = img.src || '';
          }
          initial = img.alt?.trim()?.[0] || '';
        } else {
          const text =
            container.querySelector('.resultbox_imagebox')?.textContent?.trim() ||
            '';
          initial = text[0] || '';
        }

        const rating =
          getText('.resultbox_totalrate') || getText('.green-box');

        const totalRatings =
          getText('.resultbox_countrate') ||
          getText('.resultbox_totalratings') ||
          getText('.font12.fw400.color777');

        const address =
          getText('.resultbox_address .locatcity') || getText('.comp-text');

        const distance =
          getText('.resultbox_address > .font12') || getText('.rsw__distance');

        const phoneAnchor = container.querySelector('a[href^="tel:"]');
        let phone = phoneAnchor
          ? phoneAnchor.getAttribute('href')?.replace('tel:', '').trim()
          : '';

        const callNow = container.querySelector('.callNowAnchor');
        const callText = callNow?.textContent?.trim();

        if (!phone && callText && /^[\d\s+-]+$/.test(callText)) {
          phone = callText;
        }

        const tags = [
          ...Array.from(container.querySelectorAll('.rsw__services li')),
          ...Array.from(container.querySelectorAll('.resultbox_services li')),
          ...Array.from(container.querySelectorAll('.resultbox_amenities .amenities_tabs')),
        ]
          .map((tag) => tag.textContent?.trim())
          .filter(Boolean);

        const fullText = container.textContent?.toLowerCase() || '';
        const hasWhatsApp = fullText.includes('whatsapp');
        const hasEnquiry = fullText.includes('send enquiry');

        const isTrusted = !!container.querySelector('.results_jdtrusted');
        const isVerified = !!container.querySelector('.results_jdverified');
        const isPopular = !!container.querySelector('.imgtag_box');

        if (name) {
          results.push({
            name,
            initial,
            imageUrl,
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
            city,
            timestamp: new Date().toISOString(),
          });
        }
      });

      return { results, category, city };
    }, url);

    // Delete existing data for the same category and city
    if (data.results.length > 0) {
      try {
        await BusinessListing.deleteMany({
          category: data.category,
          city: data.city,
        });
        console.log(`Deleted existing listings for category: ${data.category}, city: ${data.city}`);

        // Save new data to MongoDB
        const savePromises = data.results.map(async (item) => {
          const business = new BusinessListing({
            ...item,
            timestamp: new Date(item.timestamp),
          });
          return business.save();
        });

        const savedResults = await Promise.all(savePromises);
        console.log(`Saved ${savedResults.length} new business listings to MongoDB`);
      } catch (dbError) {
        console.error('Error saving to MongoDB:', dbError);
        await browser.close();
        return res.status(500).json({
          success: false,
          url,
          count: data.results.length,
          data: data.results,
          message: 'Scraping succeeded but failed to save to database',
          error: dbError.message,
          scrapedAt: new Date().toISOString(),
        });
      }
    }

    await browser.close();

    if (data.results.length === 0) {
      return res.status(200).json({
        success: false,
        url,
        count: 0,
        data: [],
        message: 'No results found. Possible issue with selectors or content loading.',
        scrapedAt: new Date().toISOString(),
      });
    }

    return res.status(200).json({
      success: true,
      url,
      count: data.results.length,
      data: data.results,
      category: data.category,
      city: data.city,
      message: `Successfully scraped and saved ${data.results.length} business listings`,
      scrapedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Scraping error:', error);

    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error('Error closing browser:', e);
      }
    }

    return res.status(500).json({
      error: 'Scraping failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}