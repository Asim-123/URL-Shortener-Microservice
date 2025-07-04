const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testDNSValidation() {
  console.log('🧪 Testing DNS Validation...\n');

  const testCases = [
    {
      name: 'Valid URL (Google)',
      url: 'https://www.google.com',
      expected: 'success'
    },
    {
      name: 'Valid URL (GitHub)',
      url: 'https://github.com',
      expected: 'success'
    },
    {
      name: 'Invalid URL (Non-existent domain)',
      url: 'https://this-domain-does-not-exist-12345.com',
      expected: 'invalid url'
    },
    {
      name: 'Invalid URL (Malformed)',
      url: 'not-a-url',
      expected: 'invalid url'
    },
    {
      name: 'Invalid URL (Missing protocol)',
      url: 'www.example.com',
      expected: 'invalid url'
    }
  ];

  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name}`);
    console.log(`URL: ${testCase.url}`);
    
    try {
      const response = await fetch(`${BASE_URL}/api/shorturl`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: testCase.url })
      });

      const data = await response.json();
      console.log(`Response:`, data);
      
      if (testCase.expected === 'success') {
        if (data.error) {
          console.log(`❌ Expected success, got error: ${data.error}`);
        } else {
          console.log(`✅ Success! Short URL: ${data.short_url}`);
        }
      } else {
        if (data.error === testCase.expected) {
          console.log(`✅ Correctly rejected with: ${data.error}`);
        } else {
          console.log(`❌ Expected ${testCase.expected}, got: ${data.error || 'success'}`);
        }
      }
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`);
    }
    
    console.log('---\n');
  }
}

testDNSValidation(); 