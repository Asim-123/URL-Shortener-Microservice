const fetch = require('node-fetch');

const BASE_URL = 'https://velvety-dragon-2e2760.netlify.app';

async function testFreeCodeCampExact() {
  console.log('🧪 Testing FreeCodeCamp Exact Requirements...\n');

  try {
    // Test 1: POST a URL to /api/shorturl and get a JSON response with original_url and short_url properties
    console.log('1. Testing POST /api/shorturl with https://freeCodeCamp.org...');
    const response1 = await fetch(`${BASE_URL}/api/shorturl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: 'https://freeCodeCamp.org' })
    });

    const data1 = await response1.json();
    console.log('Response:', data1);
    
    if (data1.original_url === 'https://freeCodeCamp.org' && typeof data1.short_url === 'number') {
      console.log('✅ Test 1 PASSED - Got correct original_url and short_url properties');
      
      const shortUrl = data1.short_url;
      
      // Test 2: When you visit /api/shorturl/<short_url>, you will be redirected to the original URL
      console.log(`\n2. Testing GET /api/shorturl/${shortUrl} redirect...`);
      
      const response2 = await fetch(`${BASE_URL}/api/shorturl/${shortUrl}`, {
        method: 'GET',
        redirect: 'manual'
      });

      console.log('Status:', response2.status);
      const location = response2.headers.get('location');
      console.log('Location header:', location);
      
      if (response2.status === 302 && location === 'https://freeCodeCamp.org/') {
        console.log('✅ Test 2 PASSED - Redirect working correctly');
      } else {
        console.log('❌ Test 2 FAILED - Expected 302 redirect to https://freeCodeCamp.org/');
        console.log('   Got status:', response2.status, 'location:', location);
      }
    } else {
      console.log('❌ Test 1 FAILED - Expected { original_url: "https://freeCodeCamp.org", short_url: 1 }');
      console.log('   Got:', data1);
    }

    // Test 3: If you pass an invalid URL that doesn't follow the valid http://www.example.com format, 
    // the JSON response will contain { error: 'invalid url' }
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
      console.log('✅ Test 3 PASSED - Invalid URL properly rejected with { error: "invalid url" }');
    } else {
      console.log('❌ Test 3 FAILED - Expected { error: "invalid url" }');
      console.log('   Got:', data3);
    }

    // Test 4: Test with http://www.example.com format (should be valid)
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
    
    if (data4.original_url === 'http://www.example.com' && typeof data4.short_url === 'number') {
      console.log('✅ Test 4 PASSED - http://www.example.com format accepted');
    } else {
      console.log('❌ Test 4 FAILED - http://www.example.com format should be accepted');
      console.log('   Got:', data4);
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
      console.log('   Got:', data5);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFreeCodeCampExact(); 