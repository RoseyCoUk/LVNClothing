import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('Cleaning up global test environment...');
  // Add any cleanup logic here
}

export default globalTeardown;

