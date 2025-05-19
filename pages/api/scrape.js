import puppeteer from 'puppeteer';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
      ],
      executablePath:
        process.env.NODE_ENV === 'production'
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
    });

    await page.setViewport({ width: 1366, height: 768 });
    await page.setJavaScriptEnabled(true);

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const url =
      'https://www.justdial.com/Bangalore/Veterinary-Clinics-in-Konanakunte/nct-10519261?trkid=46494-bangalore&term=';

    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await page.waitForSelector('.resultbox', { timeout: 15000 });

   
    let previousHeight = 0;
    let maxScrollAttempts = 20;
    let scrollAttempts = 0;

    while (scrollAttempts < maxScrollAttempts) {
      const currentHeight = await page.evaluate('document.body.scrollHeight');
      if (currentHeight === previousHeight) {
        break;
      }
      previousHeight = currentHeight;

      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      await delay(2000); 
      scrollAttempts++;
    }

    const data = await page.evaluate((scrapedUrl) => {
      function extractFirstSrcsetUrl(srcset) {
        if (!srcset) return '';
        const beforeComma = srcset.split(',')[0].trim();
        const firstUrl = beforeComma.split(' ')[0];
        return firstUrl;
      }

      let category = '';
      let city = '';
      const heading = document.querySelector('h1')?.textContent || '';
      const headingMatch = heading.match(/(.+?)\s+in\s+(.+)/i);
      if (headingMatch) {
        category = headingMatch[1]?.trim() || '';
        city = headingMatch[2]?.trim() || '';
      }

      if (!category || !city) {
        const urlParts = scrapedUrl.split('/').filter(Boolean);
        if (urlParts.length >= 4) {
          const cityPart = urlParts[3];
          const categoryPart = urlParts[4];
          city = cityPart.replace(/-/g, ' ');
          const categoryMatch = categoryPart.match(/(.+?)-in-(.+)/i);
          if (categoryMatch) {
            category = categoryMatch[1].replace(/-/g, ' ').trim();
            const subLocation = categoryMatch[2].replace(/-/g, ' ').trim();
            city = `${subLocation}, ${city}`;
          }
        }
      }

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
          const text = container.querySelector('.resultbox_imagebox')?.textContent?.trim() || '';
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

      return results;
    }, url);

    await browser.close();

    return res.status(200).json({
      success: true,
      url,
      count: data.length,
      data,
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
      suggestion:
        process.env.NODE_ENV === 'development'
          ? 'Run "npm install puppeteer" and ensure Chrome is installed'
          : 'Check server logs and PUPPETEER_EXECUTABLE_PATH environment variable',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
}
