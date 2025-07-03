const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testLocalServer() {
  console.log('🧪 Testing Local Server (Port 3000)...\n');

  try {
    // Test 1: POST a URL to /api/shorturl and get JSON response
    console.log('1. Testing POST /api/shorturl with valid URL...');
    const response1 = await fetch(`${BASE_URL}/api/shorturl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: 'https://freeCodeCamp.org' })
    });

    const data1 = await response1.json();
    console.log('Response:', data1);
    
    if (data1.original_url && data1.short_url) {
      console.log('✅ Test 1 PASSED - Got original_url and short_url properties');
      
      const shortUrl = data1.short_url;
      
      // Test 2: Visit /api/shorturl/<short_url> and get redirected
      console.log(`\n2. Testing GET /api/shorturl/${shortUrl} redirect...`);
      
      const response2 = await fetch(`${BASE_URL}/api/shorturl/${shortUrl}`, {
        method: 'GET',
        redirect: 'manual'
      });

      console.log('Status:', response2.status);
      const location = response2.headers.get('location');
      console.log('Location header:', location);
      
      if (response2.status === 302 && location) {
        console.log('✅ Test 2 PASSED - Redirect working');
      } else {
        console.log('❌ Test 2 FAILED - Expected 302 redirect');
      }
    } else {
      console.log('❌ Test 1 FAILED - Missing original_url or short_url');
    }

    // Test 3: POST invalid URL
    console.log('\n3. Testing POST /api/shorturl with invalid URL...');
    const response3 = await fetch(`${BASE_URL}/api/shorturl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: 'invalid-url' })
    });

    const data3 = await response3.json();
    console.log('Response:', data3);
    
    if (data3.error === 'invalid url') {
      console.log('✅ Test 3 PASSED - Invalid URL properly rejected');
    } else {
      console.log('❌ Test 3 FAILED - Expected error: "invalid url"');
    }

    // Test 4: Test with http://www.example.com format
    console.log('\n4. Testing with http://www.example.com format...');
    const response4 = await fetch(`${BASE_URL}/api/shorturl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: 'http://www.example.com' })
    });

    const data4 = await response4.json();
    console.log('Response:', data4);
    
    if (data4.original_url && data4.short_url) {
      console.log('✅ Test 4 PASSED - http://www.example.com format accepted');
    } else {
      console.log('❌ Test 4 FAILED - http://www.example.com format rejected');
    }

    // Test 5: Test with invalid format (missing protocol)
    console.log('\n5. Testing with invalid format (missing protocol)...');
    const response5 = await fetch(`${BASE_URL}/api/shorturl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: 'www.example.com' })
    });

    const data5 = await response5.json();
    console.log('Response:', data5);
    
    if (data5.error === 'invalid url') {
      console.log('✅ Test 5 PASSED - Invalid format properly rejected');
    } else {
      console.log('❌ Test 5 FAILED - Invalid format should be rejected');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLocalServer(); 