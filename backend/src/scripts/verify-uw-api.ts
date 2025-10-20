#!/usr/bin/env ts-node

/**
 * UW API v3 Verification Script
 * 
 * This script tests your UW API v3 configuration and connection.
 * 
 * Usage:
 *   npm run verify-api          # Test with Fall 2024 (1249)
 *   npm run verify-api 1249     # Test with specific term code
 *   npm run verify-api 1251     # Test with Winter 2025
 * 
 * Term Code Format: {century}{year}{term}
 *   Examples: 1249 = Fall 2024, 1251 = Winter 2025
 */

import { config } from '../config/env';
import { logger } from '../config/logger';

async function verifyAPI(termCode: string = '1249') {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║       UW Open Data API v3 Verification Tool          ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');

  // Validate term code format
  if (!/^\d{4}$/.test(termCode)) {
    console.log('❌ Invalid term code format!');
    console.log('');
    console.log('   Term codes must be 4 digits.');
    console.log('   Format: {century}{year}{term}');
    console.log('');
    console.log('   Examples:');
    console.log('     1249 - Fall 2024');
    console.log('     1251 - Winter 2025');
    console.log('     1245 - Spring 2024');
    console.log('');
    console.log('   Usage: npm run verify-api 1249');
    console.log('');
    process.exit(1);
  }

  // Step 1: Check environment variables
  console.log('📋 Step 1: Checking Environment Configuration');
  console.log('   ────────────────────────────────────────────────');
  
  const checks = {
    'API Base URL': config.uwApi.baseUrl,
    'API Key Configured': config.uwApi.apiKey ? '✅ Yes' : '❌ No',
    'API Key Length': config.uwApi.apiKey?.length || 0,
  };

  Object.entries(checks).forEach(([key, value]) => {
    console.log(`   ${key}: ${value}`);
  });
  console.log('');

  if (!config.uwApi.apiKey) {
    console.log('❌ ERROR: API Key not configured!');
    console.log('');
    console.log('   To fix this:');
    console.log('   1. Copy backend/env.example to backend/.env');
    console.log('   2. Get an API key from: https://uwaterloo.ca/api/');
    console.log('   3. Add it to .env file: UW_API_KEY=your-key-here');
    console.log('');
    process.exit(1);
  }

  // Step 2: Test API connection
  console.log('🔗 Step 2: Testing API Connection');
  console.log('   ────────────────────────────────────────────────');
  console.log(`   Endpoint: ${config.uwApi.baseUrl}/Courses/${termCode}`);
  console.log(`   Term Code: ${termCode}`);
  console.log('');

  try {
    console.log('   Sending request...');
    const url = `${config.uwApi.baseUrl}/Courses/${termCode}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'X-API-KEY': config.uwApi.apiKey,
      },
    });

    console.log(`   Response Status: ${response.status} ${response.statusText}`);
    console.log('');

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ API Request Failed!');
      console.log('');
      console.log('   Status:', response.status);
      console.log('   Error:', errorText);
      console.log('');

      if (response.status === 401) {
        console.log('   💡 Troubleshooting:');
        console.log('      - Your API key may be invalid or not confirmed');
        console.log('      - Check your email for confirmation link');
        console.log('      - Register at: https://uwaterloo.ca/api/');
      } else if (response.status === 404) {
        console.log('   💡 Troubleshooting:');
        console.log('      - The term code might be invalid');
        console.log('      - Try: npm run verify-api 1249 (Fall 2024)');
        console.log('      - Verify endpoint format is correct');
      } else if (response.status === 429) {
        console.log('   💡 Troubleshooting:');
        console.log('      - Rate limit exceeded');
        console.log('      - Wait a few minutes and try again');
      }
      console.log('');
      process.exit(1);
    }

    const data = await response.json() as any;

    // Step 3: Parse and display results
    console.log('✅ API Connection Successful!');
    console.log('');
    console.log('📊 Step 3: Response Analysis');
    console.log('   ────────────────────────────────────────────────');

    let courses: any[] = [];
    let responseType = 'Unknown';

    if (Array.isArray(data)) {
      courses = data;
      responseType = 'Direct Array';
    } else if (data?.data && Array.isArray(data.data)) {
      courses = data.data;
      responseType = 'Data Wrapper';
    } else if (data?.courses && Array.isArray(data.courses)) {
      courses = data.courses;
      responseType = 'Courses Wrapper';
    } else {
      responseType = 'Custom Format';
      console.log('   Response Type:', responseType);
      console.log('   Response Keys:', data ? Object.keys(data).join(', ') : 'none');
      console.log('');
      console.log('   ⚠️  Unexpected response format!');
      console.log('   Raw response:');
      console.log(JSON.stringify(data, null, 2).split('\n').slice(0, 20).join('\n'));
      console.log('');
      process.exit(1);
    }

    console.log(`   Response Type: ${responseType}`);
    console.log(`   Courses Found: ${courses.length}`);
    console.log('');

    if (courses.length > 0) {
      console.log('📚 Sample Course Data:');
      console.log('   ────────────────────────────────────────────────');
      
      const sample = courses[0];
      const fields = [
        'subjectCode',
        'catalogNumber',
        'title',
        'description',
        'termName',
        'termCode',
      ];

      fields.forEach(field => {
        if (sample[field]) {
          const value = typeof sample[field] === 'string' && sample[field].length > 80
            ? sample[field].substring(0, 80) + '...'
            : sample[field];
          console.log(`   ${field}: ${value}`);
        }
      });

      console.log('');
      console.log('   Available Fields:', Object.keys(sample).join(', '));
      console.log('');

      console.log('🎉 SUCCESS! Your UW API v3 configuration is working correctly.');
      console.log('');
      console.log('📝 Next Steps:');
      console.log('   1. Run: npm run populate');
      console.log('      (Populates current and next term automatically)');
      console.log('   2. Or specify term codes: npm run populate 1249 1251');
      console.log('   3. Start the API: npm run dev');
      console.log('');
    } else {
      console.log('   ⚠️  No courses found for term code:', termCode);
      console.log('   Try a different term: npm run verify-api 1249');
      console.log('');
    }

    process.exit(0);
  } catch (error) {
    console.log('❌ Connection Failed!');
    console.log('');
    console.log('   Error:', error instanceof Error ? error.message : String(error));
    console.log('');
    console.log('   💡 Troubleshooting:');
    console.log('      - Check your internet connection');
    console.log('      - Verify the base URL is correct');
    console.log('      - Try again in a few moments');
    console.log('');
    
    if (error instanceof Error && error.stack) {
      logger.error({ err: error, stack: error.stack }, 'API verification failed');
    }

    process.exit(1);
  }
}

// Run the verification
// Default to Fall 2024 (1249)
const termCode = process.argv[2] || '1249';
verifyAPI(termCode);

