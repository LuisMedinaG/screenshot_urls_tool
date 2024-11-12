const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

class ScreenshotValidator {
  constructor(configPath) {
    this.screenshotDir = path.join(__dirname, 'screenshots');
    this.config = this.loadConfig(configPath);
    this.ensureScreenshotDirectory();
  }

  loadConfig(configPath) {
    try {
      const configContent = fs.readFileSync(configPath, 'utf-8');
      return JSON.parse(configContent);
    } catch (error) {
      throw new Error(`Failed to load config file: ${error.message}

      Example contents:
        // config.json
        {
          "urls": [
            "https://example.com/"
          ]
        }
      `);
    }
  }

  ensureScreenshotDirectory() {
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir);
    }
  }

  sanitizeUrl(url) {
    return url.replace(/https?:\/\//, '').replace(/\//g, '_');
  }

  async connectToBrowser() {
    try {
      // Connect to the existing Chrome instance on the default debugging port
      return await puppeteer.connect({
        browserURL: 'http://127.0.0.1:9222',
        defaultViewport: { width: 1920, height: 1080 }
      });
    } catch (error) {
      throw new Error(`Failed to connect to Chrome browser: ${error.message}. 
        Make sure Chrome is running with remote debugging enabled. 
        Run this command first:
        /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --no-first-run --no-default-browser-check --user-data-dir=$(mktemp -d -t 'chrome-remote_data_dir')`);
    }
  }

  async takeScreenshot(page, url) {
    try {
      console.log(`Navigating to ${url}...`);
      await page.goto(url, {
        waitUntil: ['load', 'domcontentloaded', 'networkidle0'],
        timeout: 30000
      });

      const screenshotPath = path.join(
        this.screenshotDir,
        `${this.sanitizeUrl(url)}.png`
      );

      console.log(`Taking screenshot of ${url}...`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      return screenshotPath;
    } catch (error) {
      throw new Error(`Screenshot failed for ${url}: ${error.message}`);
    }
  }

  async validateUrls() {
    let browser;
    try {
      console.log('Connecting to Chrome...');
      browser = await this.connectToBrowser();

      const page = await browser.newPage();
      console.log('Starting URL validation...');

      const results = [];
      for (const url of this.config.urls) {
        try {
          const screenshotPath = await this.takeScreenshot(page, url);
          results.push({
            url,
            status: 'success',
            path: screenshotPath
          });
        } catch (error) {
          results.push({
            url,
            status: 'failed',
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      throw new Error(`Validation process failed: ${error.message}`);
    } finally {
      if (browser) {
        await browser.disconnect();
      }
    }
  }
}

async function run() {
  const validator = new ScreenshotValidator('config.json');

  try {
    const results = await validator.validateUrls();

    console.log('\nValidation Results:');
    results.forEach(({ url, status, path, error }) => {
      if (status === 'success') {
        console.log(`✅ ${url} - Screenshot saved: ${path}`);
      } else {
        console.log(`❌ ${url} - Error: ${error}`);
      }
    });
  } catch (error) {
    console.error('Validation failed:', error.message);
    process.exit(1);
  }
}

run();
