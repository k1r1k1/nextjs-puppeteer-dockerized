import { NextRequest } from 'next/server';
import puppeteer from 'puppeteer';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return Response.json({ error: 'URL is required' }, { status: 400 });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const title = await page.title();
    const content = await page.content();

    await browser.close();

    return Response.json({ url, title, contentLength: content.length });
  } catch (error) {
    console.error('Scraping error:', error);
    if (browser) await browser.close();
    return Response.json({ error: 'Failed to scrape page' }, { status: 500 });
  }
}