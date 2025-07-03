const fetch = require('node-fetch');

const BASE_URL = 'https://velvety-dragon-2e2760.netlify.app';

async function testRedirect() {
  console.log('🧪 Testing URL Shortener Redirect...\n');

  try {
    // Step 1: Create a short URL
    console.log('1. Creating short URL...');
    const response1 = await fetch(`${BASE_URL}/api/shorturl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: 'https://www.google.com' })
    });

    const data1 = await response1.json();
    console.log('Response:', data1);
    
    if (data1.error) {
      console.log('❌ Failed to create short URL:', data1.error);
      return;
    }

    const shortUrl = data1.short_url;
    console.log(`✅ Created short URL: ${shortUrl}`);

    // Step 2: Test redirect
    console.log(`\n2. Testing redirect to /api/shorturl/${shortUrl}...`);
    
    const response2 = await fetch(`${BASE_URL}/api/shorturl/${shortUrl}`, {
      method: 'GET',
      redirect: 'manual' // Don't follow redirects
    });

    console.log('Status:', response2.status);
    console.log('Headers:', Object.fromEntries(response2.headers.entries()));
    
    if (response2.status === 302) {
      const location = response2.headers.get('location');
      console.log('✅ Redirect working! Location:', location);
    } else {
      console.log('❌ Redirect failed. Expected 302, got:', response2.status);
    }

    // Step 3: Test invalid URL
    console.log('\n3. Testing invalid URL...');
    const response3 = await fetch(`${BASE_URL}/api/shorturl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: 'invalid-url' })
    });

    const data3 = await response3.json();
    console.log('Invalid URL Response:', data3);
    
    if (data3.error === 'invalid url') {
      console.log('✅ Invalid URL test passed');
    } else {
      console.log('❌ Invalid URL test failed');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRedirect(); 