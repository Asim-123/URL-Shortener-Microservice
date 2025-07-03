const fetch = require('node-fetch');

const BASE_URL = 'https://velvety-dragon-2e2760.netlify.app';

async function testCasePreservation() {
  console.log('🧪 Testing Case Preservation...\n');

  try {
    // Test 1: POST with mixed case URL
    console.log('1. Testing POST with mixed case URL...');
    const response1 = await fetch(`${BASE_URL}/api/shorturl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: 'https://freeCodeCamp.org' })
    });

    const data1 = await response1.json();
    console.log('POST Response:', data1);
    
    if (data1.original_url && data1.short_url) {
      console.log('✅ POST successful');
      
      const shortUrl = data1.short_url;
      
      // Test 2: Check what's stored by getting all URLs
      console.log('\n2. Checking what URLs are stored...');
      const response2 = await fetch(`${BASE_URL}/api/shorturl`);
      const allUrls = await response2.json();
      
      const storedUrl = allUrls.find(u => u.short_url === shortUrl);
      console.log('Stored URL:', storedUrl);
      
      // Test 3: Test redirect
      console.log(`\n3. Testing redirect for /api/shorturl/${shortUrl}...`);
      const response3 = await fetch(`${BASE_URL}/api/shorturl/${shortUrl}`, {
        method: 'GET',
        redirect: 'manual'
      });

      console.log('Redirect Status:', response3.status);
      const location = response3.headers.get('location');
      console.log('Redirect Location:', location);
      
      console.log('\n--- Analysis ---');
      console.log('Original submitted:', 'https://freeCodeCamp.org');
      console.log('Stored as:', storedUrl ? storedUrl.original_url : 'NOT FOUND');
      console.log('Redirects to:', location);
      
      if (location === 'https://freeCodeCamp.org') {
        console.log('✅ Case preserved correctly');
      } else {
        console.log('❌ Case not preserved - expected https://freeCodeCamp.org, got', location);
      }
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCasePreservation(); 