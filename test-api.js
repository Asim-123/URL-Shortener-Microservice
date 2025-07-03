const fetch = require('node-fetch');

// Replace with your actual Netlify URL
const BASE_URL = 'https://velvety-dragon-2e2760.netlify.app';

async function testAPI() {
  console.log('🧪 Testing URL Shortener API...\n');

  // Test 1: POST a valid URL
  console.log('1. Testing POST /api/shorturl with valid URL...');
  try {
    const response1 = await fetch(`${BASE_URL}/api/shorturl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: 'https://www.google.com' })
    });

    const data1 = await response1.json();
    console.log('Status:', response1.status);
    console.log('Response:', data1);
    
    if (data1.error) {
      console.log('❌ Test 1 FAILED - Got error:', data1.error);
    } else if (data1.original_url && data1.short_url) {
      console.log('✅ Test 1 PASSED - URL shortened successfully');
      
      // Test 2: Test redirection
      console.log('\n2. Testing GET /api/shorturl/:id redirection...');
      try {
        const response2 = await fetch(`${BASE_URL}/api/shorturl/${data1.short_url}`, {
          method: 'GET',
          redirect: 'manual' // Don't follow redirects
        });
        
        console.log('Status:', response2.status);
        console.log('Location header:', response2.headers.get('location'));
        
        if (response2.status === 302 && response2.headers.get('location')) {
          console.log('✅ Test 2 PASSED - Redirect working');
        } else {
          console.log('❌ Test 2 FAILED - No redirect or wrong status');
        }
      } catch (error) {
        console.log('❌ Test 2 FAILED - Error:', error.message);
      }
    }
  } catch (error) {
    console.log('❌ Test 1 FAILED - Network error:', error.message);
  }

  // Test 3: POST an invalid URL
  console.log('\n3. Testing POST /api/shorturl with invalid URL...');
  try {
    const response3 = await fetch(`${BASE_URL}/api/shorturl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: 'invalid-url' })
    });

    const data3 = await response3.json();
    console.log('Status:', response3.status);
    console.log('Response:', data3);
    
    if (data3.error === 'invalid url') {
      console.log('✅ Test 3 PASSED - Invalid URL properly rejected');
    } else {
      console.log('❌ Test 3 FAILED - Expected error: "invalid url", got:', data3.error);
    }
  } catch (error) {
    console.log('❌ Test 3 FAILED - Network error:', error.message);
  }

  // Test 4: Test non-existent short URL
  console.log('\n4. Testing GET /api/shorturl/999 (non-existent)...');
  try {
    const response4 = await fetch(`${BASE_URL}/api/shorturl/999`, {
      method: 'GET'
    });

    const data4 = await response4.json();
    console.log('Status:', response4.status);
    console.log('Response:', data4);
    
    if (response4.status === 404) {
      console.log('✅ Test 4 PASSED - Non-existent URL properly handled');
    } else {
      console.log('❌ Test 4 FAILED - Expected 404, got:', response4.status);
    }
  } catch (error) {
    console.log('❌ Test 4 FAILED - Network error:', error.message);
  }

  console.log('\n🏁 Testing complete!');
}

// Run the tests
testAPI().catch(console.error); 