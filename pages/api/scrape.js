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
    await delay(1000 + Math.random() * 2000);

    const url =
      'https://www.justdial.com/Bangalore/AC-Repair-Services-in-Konanakunte/nct-10890481?trkid=16855-bangalore-fcat&term=AC%20Repair%20&%20Services%20Near%20Konanakunte';

    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    await page.waitForSelector('.resultbox', { timeout: 15000 });
    await delay(2000 + Math.random() * 3000);

    const data = await page.evaluate(() => {
      const results = [];

   
      const heading = document.querySelector('h1')?.textContent || '';
      const headingMatch = heading.match(/Popular\s+(.+?)\s+in\s+(.+)/i);
      const category = headingMatch?.[1]?.trim() || '';
      const city = headingMatch?.[2]?.trim() || '';

      const containers = document.querySelectorAll('.resultbox');

      containers.forEach((container) => {
        const getText = (selector) =>
          container.querySelector(selector)?.textContent?.trim() || '';

        const name =
          getText('.resultbox_title_anchor') || getText('.resultbox_title');

        let initial = '';
        const img = container.querySelector('.resultbox_imagebox img');
        if (img?.alt) {
          initial = img.alt.trim()[0];
        } else {
          initial =
            container
              .querySelector('.resultbox_imagebox')
              ?.textContent?.trim()?.[0] || '';
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
    });

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
