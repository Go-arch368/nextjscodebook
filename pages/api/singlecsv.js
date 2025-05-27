import puppeteer from 'puppeteer';
import fs from 'fs';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).end('Method not allowed');
  }

  let browser;
  try {
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

    const url = req.query.url || 'https://www.justdial.com/Khargone/search?q=autospares-hub&stype=company_list&trkid=9970468686-fcomp&term=AutoSpares%20Hub';

    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });

    try {
      await page.waitForSelector('.resultbox', { timeout: 60000 });
      console.log('Initial .resultbox elements found');
    } catch (e) {
      console.error('Selector .resultbox not found:', e);
      await browser.close();
      return res.status(200).end('No results found. Selector .resultbox not found.');
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

    // Write data to CSV file
    if (data.results.length > 0) {
      try {
        const csvHeaders = [
          'name',
          'initial',
          'imageUrl',
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
          'city',
          'timestamp',
        ];

        // Escape CSV values to handle commas, quotes, and newlines
        const escapeCsv = (value) => {
          if (value === null || value === undefined) return '';
          if (Array.isArray(value)) value = value.join('|');
          const str = String(value);
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        };

        const csvRows = data.results.map((item) =>
          csvHeaders.map((header) => escapeCsv(item[header])).join(',')
        );
        const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');

        fs.writeFileSync('business_listings.csv', csvContent, 'utf8');
        console.log(`Saved ${data.results.length} business listings to business_listings.csv`);
        await browser.close();
        return res.status(200).end(`Successfully scraped and saved ${data.results.length} business listings to CSV`);
      } catch (csvError) {
        console.error('Error writing to CSV:', csvError);
        await browser.close();
        return res.status(500).end('Scraping succeeded but failed to write to CSV: ' + csvError.message);
      }
    }

    await browser.close();
    return res.status(200).end('No results found. Possible issue with selectors or content loading.');
  } catch (error) {
    console.error('Scraping error:', error);
    if (browser) {
      try {
        await browser.close();
      } catch (e) {
        console.error('Error closing browser:', e);
      }
    }
    return res.status(500).end('Scraping failed: ' + error.message);
  }
}