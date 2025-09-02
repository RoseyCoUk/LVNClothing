import { Page, expect } from '@playwright/test';

export interface TestError {
  page: string;
  error: string;
  timestamp: string;
  screenshot?: string;
  consoleErrors: string[];
  networkErrors: string[];
}

export class ErrorCollector {
  private errors: TestError[] = [];

  addError(error: TestError) {
    this.errors.push(error);
  }

  getErrors(): TestError[] {
    return this.errors;
  }

  generateReport(): string {
    if (this.errors.length === 0) {
      return '✅ No errors found during testing!';
    }

    let report = `# Frontend Testing Error Report\n\n`;
    report += `Generated: ${new Date().toISOString()}\n`;
    report += `Total Errors: ${this.errors.length}\n\n`;

    this.errors.forEach((error, index) => {
      report += `## Error ${index + 1}: ${error.page}\n\n`;
      report += `**Error:** ${error.error}\n\n`;
      report += `**Timestamp:** ${error.timestamp}\n\n`;
      
      if (error.consoleErrors.length > 0) {
        report += `**Console Errors:**\n`;
        error.consoleErrors.forEach(err => report += `- ${err}\n`);
        report += `\n`;
      }

      if (error.networkErrors.length > 0) {
        report += `**Network Errors:**\n`;
        error.networkErrors.forEach(err => report += `- ${err}\n`);
        report += `\n`;
      }

      if (error.screenshot) {
        report += `**Screenshot:** ${error.screenshot}\n\n`;
      }
      
      report += `---\n\n`;
    });

    return report;
  }
}

export async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000); // Additional wait for any animations
}

export async function checkForErrors(page: Page): Promise<{
  consoleErrors: string[];
  networkErrors: string[];
}> {
  const consoleErrors: string[] = [];
  const networkErrors: string[] = [];

  // Listen for console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // Listen for network errors
  page.on('response', response => {
    if (!response.ok()) {
      networkErrors.push(`${response.status()} ${response.statusText()} - ${response.url()}`);
    }
  });

  return { consoleErrors, networkErrors };
}

export async function takeScreenshotOnError(page: Page, errorName: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `error-${errorName}-${timestamp}.png`;
  const path = `test-results/screenshots/${filename}`;
  
  await page.screenshot({ path, fullPage: true });
  return path;
}

export async function testPageAccessibility(page: Page): Promise<string[]> {
  const issues: string[] = [];
  
  // Check for basic accessibility issues
  const images = await page.locator('img').all();
  for (const img of images) {
    const alt = await img.getAttribute('alt');
    if (!alt) {
      issues.push('Image missing alt attribute');
    }
  }

  // Check for proper heading structure
  const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
  let prevLevel = 0;
  for (const heading of headings) {
    const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
    const level = parseInt(tagName.charAt(1));
    if (level > prevLevel + 1) {
      issues.push(`Heading structure issue: ${tagName} follows h${prevLevel}`);
    }
    prevLevel = level;
  }

  return issues;
}

export async function testPagePerformance(page: Page): Promise<string[]> {
  const issues: string[] = [];
  
  // Check for performance issues
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return {
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
      firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
    };
  });

  if (metrics.loadTime > 5000) {
    issues.push(`Page load time too slow: ${metrics.loadTime}ms`);
  }

  if (metrics.domContentLoaded > 3000) {
    issues.push(`DOM content loaded too slow: ${metrics.domContentLoaded}ms`);
  }

  return issues;
}

