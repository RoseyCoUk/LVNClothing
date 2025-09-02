import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set up any global test data or authentication if needed
  console.log('Setting up global test environment...');
  
  await browser.close();
}

export default globalSetup;

