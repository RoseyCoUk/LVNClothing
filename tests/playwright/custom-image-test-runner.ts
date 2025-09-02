#!/usr/bin/env ts-node

/**
 * Custom Image Test Suite Runner
 * 
 * Orchestrates the execution of all custom image tests in the proper order:
 * 1. Data validation script (baseline check)
 * 2. Admin image upload tests
 * 3. Frontend thumbnail display tests
 * 4. Printful sync protection tests
 * 5. Image validation and storage tests
 * 6. E2E purchase flow tests
 * 7. Performance and edge case tests
 * 8. Final validation and reporting
 */

import { execSync, spawn } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';

interface TestSuite {
  name: string;
  description: string;
  file: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedTime: number; // minutes
  dependencies: string[];
}

interface TestResult {
  suite: string;
  status: 'passed' | 'failed' | 'skipped' | 'error';
  duration: number;
  failedTests: number;
  passedTests: number;
  skippedTests: number;
  errors: string[];
  screenshots: string[];
}

interface TestRunSummary {
  timestamp: string;
  totalDuration: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  suiteResults: TestResult[];
  overallStatus: 'success' | 'partial' | 'failed';
  recommendations: string[];
}

class CustomImageTestRunner {
  private testSuites: TestSuite[] = [
    {
      name: 'Data Validation',
      description: 'Baseline validation of custom image data integrity',
      file: 'scripts/validate-custom-image-data.ts',
      priority: 'critical',
      estimatedTime: 2,
      dependencies: []
    },
    {
      name: 'Admin Image Upload',
      description: 'Admin interface image upload and management functionality',
      file: 'tests/playwright/custom-image-upload.spec.ts',
      priority: 'critical',
      estimatedTime: 15,
      dependencies: []
    },
    {
      name: 'Frontend Thumbnail Display',
      description: 'Frontend display of custom thumbnails across all touchpoints',
      file: 'tests/playwright/thumbnail-display.spec.ts',
      priority: 'critical',
      estimatedTime: 10,
      dependencies: ['Admin Image Upload']
    },
    {
      name: 'Printful Sync Protection',
      description: 'Verification that Printful sync preserves custom images',
      file: 'tests/playwright/printful-sync-protection.spec.ts',
      priority: 'high',
      estimatedTime: 12,
      dependencies: ['Admin Image Upload']
    },
    {
      name: 'Image Validation & Storage',
      description: 'File format validation, storage limits, and security testing',
      file: 'tests/playwright/image-validation-storage.spec.ts',
      priority: 'high',
      estimatedTime: 20,
      dependencies: []
    },
    {
      name: 'E2E Purchase Flow',
      description: 'Complete purchase journey with custom images',
      file: 'tests/playwright/custom-image-e2e-flow.spec.ts',
      priority: 'critical',
      estimatedTime: 25,
      dependencies: ['Frontend Thumbnail Display', 'Admin Image Upload']
    },
    {
      name: 'Performance & Edge Cases',
      description: 'Edge cases, performance testing, and error handling',
      file: 'tests/playwright/edge-cases-performance.spec.ts',
      priority: 'medium',
      estimatedTime: 30,
      dependencies: ['Admin Image Upload', 'Frontend Thumbnail Display']
    }
  ];

  private results: TestResult[] = [];

  constructor() {
    console.log('🧪 Custom Image Test Runner initialized');
    console.log(`📋 ${this.testSuites.length} test suites configured`);
  }

  private async checkPrerequisites(): Promise<boolean> {
    console.log('🔍 Checking prerequisites...');

    try {
      // Check if Playwright is installed
      execSync('npx playwright --version', { stdio: 'pipe' });
      console.log('✅ Playwright available');
    } catch (error) {
      console.error('❌ Playwright not available. Run: npm install @playwright/test');
      return false;
    }

    try {
      // Check if development server is running
      const response = await fetch('http://localhost:5173');
      if (response.ok) {
        console.log('✅ Development server running at localhost:5173');
      } else {
        throw new Error('Server not responding');
      }
    } catch (error) {
      console.error('❌ Development server not running. Please run: npm run dev');
      return false;
    }

    try {
      // Check if Supabase is accessible
      const response = await fetch('http://localhost:54321/rest/v1/', {
        headers: { 'apikey': process.env.VITE_SUPABASE_ANON_KEY || '' }
      });
      if (response.status === 200 || response.status === 401) { // 401 is OK, means auth is working
        console.log('✅ Supabase API accessible');
      } else {
        throw new Error('Supabase not responding correctly');
      }
    } catch (error) {
      console.error('❌ Supabase not accessible. Please run: supabase start');
      return false;
    }

    // Check test directory structure
    const testDir = path.join(process.cwd(), 'tests', 'playwright');
    try {
      const files = await fs.readdir(testDir);
      const requiredFiles = this.testSuites
        .filter(suite => suite.file.startsWith('tests/'))
        .map(suite => path.basename(suite.file));
      
      for (const file of requiredFiles) {
        if (!files.includes(file)) {
          console.error(`❌ Required test file missing: ${file}`);
          return false;
        }
      }
      console.log('✅ All test files present');
    } catch (error) {
      console.error('❌ Test directory not accessible');
      return false;
    }

    return true;
  }

  private async runDataValidation(): Promise<TestResult> {
    console.log('🔍 Running data validation script...');
    const startTime = Date.now();

    try {
      const result = execSync('npx ts-node scripts/validate-custom-image-data.ts', {
        encoding: 'utf8',
        cwd: process.cwd(),
        timeout: 120000 // 2 minutes
      });

      const duration = Date.now() - startTime;
      
      // Parse output for issues
      const criticalIssues = (result.match(/❌ Errors: (\d+)/)?.[1] || '0');
      const warnings = (result.match(/⚠️  Warnings: (\d+)/)?.[1] || '0');
      
      return {
        suite: 'Data Validation',
        status: parseInt(criticalIssues) === 0 ? 'passed' : 'failed',
        duration,
        failedTests: parseInt(criticalIssues),
        passedTests: 1,
        skippedTests: 0,
        errors: parseInt(criticalIssues) > 0 ? ['Critical data validation issues found'] : [],
        screenshots: []
      };
    } catch (error: any) {
      return {
        suite: 'Data Validation',
        status: 'error',
        duration: Date.now() - startTime,
        failedTests: 1,
        passedTests: 0,
        skippedTests: 0,
        errors: [error.message || 'Data validation script failed'],
        screenshots: []
      };
    }
  }

  private async runPlaywrightSuite(suite: TestSuite): Promise<TestResult> {
    console.log(`🎭 Running ${suite.name} tests...`);
    const startTime = Date.now();

    try {
      const testFile = suite.file.replace('tests/playwright/', '');
      
      const result = execSync(
        `npx playwright test ${testFile} --reporter=json --output-dir=test-results/${suite.name.toLowerCase().replace(/\s+/g, '-')}`,
        {
          encoding: 'utf8',
          cwd: process.cwd(),
          timeout: suite.estimatedTime * 60 * 1000 // Convert minutes to milliseconds
        }
      );

      const duration = Date.now() - startTime;

      // Parse Playwright JSON output
      let testStats = {
        passed: 0,
        failed: 0,
        skipped: 0,
        errors: [] as string[]
      };

      try {
        const jsonResult = JSON.parse(result);
        testStats.passed = jsonResult.suites?.reduce((acc: number, suite: any) => 
          acc + (suite.specs?.filter((spec: any) => spec.tests?.[0]?.results?.[0]?.status === 'passed').length || 0), 0) || 0;
        testStats.failed = jsonResult.suites?.reduce((acc: number, suite: any) => 
          acc + (suite.specs?.filter((spec: any) => spec.tests?.[0]?.results?.[0]?.status === 'failed').length || 0), 0) || 0;
        testStats.skipped = jsonResult.suites?.reduce((acc: number, suite: any) => 
          acc + (suite.specs?.filter((spec: any) => spec.tests?.[0]?.results?.[0]?.status === 'skipped').length || 0), 0) || 0;
      } catch (parseError) {
        // Fallback parsing from text output
        const passedMatch = result.match(/(\d+) passed/);
        const failedMatch = result.match(/(\d+) failed/);
        const skippedMatch = result.match(/(\d+) skipped/);
        
        testStats.passed = passedMatch ? parseInt(passedMatch[1]) : 0;
        testStats.failed = failedMatch ? parseInt(failedMatch[1]) : 0;
        testStats.skipped = skippedMatch ? parseInt(skippedMatch[1]) : 0;
      }

      // Collect screenshots
      const screenshotDir = `test-results/${suite.name.toLowerCase().replace(/\s+/g, '-')}`;
      let screenshots: string[] = [];
      try {
        const files = await fs.readdir(screenshotDir);
        screenshots = files.filter(f => f.endsWith('.png')).map(f => path.join(screenshotDir, f));
      } catch (error) {
        // Screenshots directory may not exist
      }

      return {
        suite: suite.name,
        status: testStats.failed === 0 ? 'passed' : 'failed',
        duration,
        failedTests: testStats.failed,
        passedTests: testStats.passed,
        skippedTests: testStats.skipped,
        errors: testStats.errors,
        screenshots
      };

    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      // Check if it's a timeout
      if (error.message.includes('timeout')) {
        return {
          suite: suite.name,
          status: 'error',
          duration,
          failedTests: 1,
          passedTests: 0,
          skippedTests: 0,
          errors: [`Test suite timed out after ${suite.estimatedTime} minutes`],
          screenshots: []
        };
      }

      return {
        suite: suite.name,
        status: 'error',
        duration,
        failedTests: 1,
        passedTests: 0,
        skippedTests: 0,
        errors: [error.message || 'Test execution failed'],
        screenshots: []
      };
    }
  }

  private async runAllTests(options: {
    skipNonCritical?: boolean;
    maxParallel?: number;
    continueOnFailure?: boolean;
  } = {}): Promise<TestRunSummary> {
    
    const startTime = Date.now();
    console.log('🚀 Starting comprehensive custom image test execution');
    console.log(`📅 Start time: ${new Date().toISOString()}`);

    // Filter test suites based on options
    let suitesToRun = this.testSuites;
    if (options.skipNonCritical) {
      suitesToRun = this.testSuites.filter(suite => 
        suite.priority === 'critical' || suite.priority === 'high'
      );
      console.log(`🎯 Running only critical and high priority tests (${suitesToRun.length} suites)`);
    }

    // Calculate estimated time
    const estimatedTime = suitesToRun.reduce((sum, suite) => sum + suite.estimatedTime, 0);
    console.log(`⏱️  Estimated execution time: ${estimatedTime} minutes`);

    // Run data validation first
    console.log('\n📊 Phase 1: Data Validation');
    const dataValidationResult = await this.runDataValidation();
    this.results.push(dataValidationResult);

    if (dataValidationResult.status === 'failed' && !options.continueOnFailure) {
      console.log('❌ Data validation failed - stopping execution');
      return this.generateSummary(startTime);
    }

    // Run Playwright test suites
    console.log('\n🎭 Phase 2: Playwright Test Suites');
    
    const playwrightSuites = suitesToRun.filter(suite => suite.file.startsWith('tests/'));
    
    for (const suite of playwrightSuites) {
      console.log(`\n--- ${suite.name} ---`);
      console.log(`📝 ${suite.description}`);
      console.log(`⏰ Estimated time: ${suite.estimatedTime} minutes`);
      
      // Check dependencies
      const missingDeps = suite.dependencies.filter(dep => 
        !this.results.find(r => r.suite === dep && r.status === 'passed')
      );
      
      if (missingDeps.length > 0) {
        console.log(`⚠️  Skipping due to failed dependencies: ${missingDeps.join(', ')}`);
        this.results.push({
          suite: suite.name,
          status: 'skipped',
          duration: 0,
          failedTests: 0,
          passedTests: 0,
          skippedTests: 1,
          errors: [`Dependencies failed: ${missingDeps.join(', ')}`],
          screenshots: []
        });
        continue;
      }

      const result = await this.runPlaywrightSuite(suite);
      this.results.push(result);

      if (result.status === 'failed' && !options.continueOnFailure) {
        console.log(`❌ ${suite.name} failed - stopping execution`);
        break;
      }
    }

    return this.generateSummary(startTime);
  }

  private generateSummary(startTime: number): TestRunSummary {
    const totalDuration = Date.now() - startTime;
    
    const passedTests = this.results.reduce((sum, r) => sum + r.passedTests, 0);
    const failedTests = this.results.reduce((sum, r) => sum + r.failedTests, 0);
    const skippedTests = this.results.reduce((sum, r) => sum + r.skippedTests, 0);
    const totalTests = passedTests + failedTests + skippedTests;

    const failedSuites = this.results.filter(r => r.status === 'failed' || r.status === 'error').length;
    const passedSuites = this.results.filter(r => r.status === 'passed').length;

    let overallStatus: 'success' | 'partial' | 'failed';
    if (failedSuites === 0) {
      overallStatus = 'success';
    } else if (passedSuites > failedSuites) {
      overallStatus = 'partial';
    } else {
      overallStatus = 'failed';
    }

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (failedTests > 0) {
      recommendations.push(`Address ${failedTests} failed tests before production deployment`);
    }
    
    const criticalFailures = this.results.filter(r => 
      (r.status === 'failed' || r.status === 'error') && 
      this.testSuites.find(s => s.name === r.suite)?.priority === 'critical'
    );
    
    if (criticalFailures.length > 0) {
      recommendations.push(`Critical test failures require immediate attention: ${criticalFailures.map(r => r.suite).join(', ')}`);
    }

    const slowTests = this.results.filter(r => r.duration > 10 * 60 * 1000); // > 10 minutes
    if (slowTests.length > 0) {
      recommendations.push(`Consider optimizing slow test suites: ${slowTests.map(r => r.suite).join(', ')}`);
    }

    if (overallStatus === 'success') {
      recommendations.push('All tests passed! Custom image system is ready for production.');
    }

    return {
      timestamp: new Date().toISOString(),
      totalDuration,
      totalTests,
      passedTests,
      failedTests,
      skippedTests,
      suiteResults: this.results,
      overallStatus,
      recommendations
    };
  }

  private printSummary(summary: TestRunSummary): void {
    console.log('\n' + '='.repeat(80));
    console.log('🧪 CUSTOM IMAGE TEST EXECUTION SUMMARY');
    console.log('='.repeat(80));

    const durationMinutes = Math.round(summary.totalDuration / 1000 / 60);
    console.log(`📅 Completed: ${summary.timestamp}`);
    console.log(`⏱️  Total Duration: ${durationMinutes} minutes`);
    console.log(`📊 Overall Status: ${summary.overallStatus.toUpperCase()}`);

    console.log('\n📈 TEST STATISTICS');
    console.log(`✅ Passed: ${summary.passedTests}`);
    console.log(`❌ Failed: ${summary.failedTests}`);
    console.log(`⏭️  Skipped: ${summary.skippedTests}`);
    console.log(`📋 Total: ${summary.totalTests}`);

    console.log('\n🎭 SUITE RESULTS');
    summary.suiteResults.forEach(result => {
      const statusIcon = {
        passed: '✅',
        failed: '❌',
        skipped: '⏭️',
        error: '💥'
      }[result.status];

      const durationSec = Math.round(result.duration / 1000);
      console.log(`${statusIcon} ${result.suite} (${durationSec}s) - P:${result.passedTests} F:${result.failedTests} S:${result.skippedTests}`);

      if (result.errors.length > 0) {
        result.errors.forEach(error => console.log(`   🔸 ${error}`));
      }
    });

    if (summary.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS');
      summary.recommendations.forEach((rec, i) => console.log(`${i + 1}. ${rec}`));
    }

    console.log('\n📸 ARTIFACTS GENERATED');
    const allScreenshots = summary.suiteResults.flatMap(r => r.screenshots);
    if (allScreenshots.length > 0) {
      console.log(`🖼️  Screenshots: ${allScreenshots.length} files in test-results/`);
    }
    console.log(`📄 Test reports: HTML reports available in playwright-report/`);

    console.log('\n🎯 FINAL ASSESSMENT');
    switch (summary.overallStatus) {
      case 'success':
        console.log('🟢 SUCCESS: All custom image tests passed! System ready for production.');
        break;
      case 'partial':
        console.log('🟡 PARTIAL: Some tests failed. Review failures before production deployment.');
        break;
      case 'failed':
        console.log('🔴 FAILED: Critical issues found. Do not deploy to production.');
        break;
    }

    console.log('='.repeat(80));
  }

  async saveReport(summary: TestRunSummary): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `test-results/custom-image-test-report-${timestamp}.json`;
    
    try {
      await fs.mkdir('test-results', { recursive: true });
      await fs.writeFile(filename, JSON.stringify(summary, null, 2));
      console.log(`📁 Detailed report saved to: ${filename}`);
    } catch (error) {
      console.error('❌ Failed to save test report:', error);
    }
  }

  // Public method to run tests with different configurations
  async runTests(mode: 'full' | 'critical' | 'quick' = 'full'): Promise<TestRunSummary> {
    const prerequisites = await this.checkPrerequisites();
    if (!prerequisites) {
      console.error('❌ Prerequisites not met. Please fix the above issues and try again.');
      process.exit(1);
    }

    const options = {
      skipNonCritical: mode === 'critical' || mode === 'quick',
      continueOnFailure: mode === 'full',
      maxParallel: mode === 'quick' ? 2 : 1
    };

    console.log(`🎯 Running in ${mode.toUpperCase()} mode`);

    const summary = await this.runAllTests(options);
    
    this.printSummary(summary);
    await this.saveReport(summary);

    return summary;
  }
}

// CLI interface
async function main() {
  const mode = (process.argv[2] as 'full' | 'critical' | 'quick') || 'full';
  
  console.log('🧪 Custom Image Test Suite');
  console.log('==========================');
  console.log(`Mode: ${mode.toUpperCase()}`);
  console.log('');

  const runner = new CustomImageTestRunner();
  const summary = await runner.runTests(mode);

  // Exit with appropriate code
  if (summary.overallStatus === 'success') {
    process.exit(0);
  } else if (summary.overallStatus === 'partial') {
    process.exit(1);
  } else {
    process.exit(2);
  }
}

// Export for use as module
export { CustomImageTestRunner, TestRunSummary, TestResult };

// Run if called directly
if (require.main === module) {
  main();
}