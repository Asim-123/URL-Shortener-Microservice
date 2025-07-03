const fetch = require('node-fetch');

const BASE_URL = 'https://velvety-dragon-2e2760.netlify.app';

async function testDebug() {
  console.log('🧪 Debug Test...\n');

  try {
    // Step 1: Create a short URL
    console.log('1. Creating short URL for https://freeCodeCamp.org...');
    const response1 = await fetch(`${BASE_URL}/api/shorturl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: 'https://freeCodeCamp.org' })
    });

    const data1 = await response1.json();
    console.log('Create Response:', data1);
    
    if (data1.error) {
      console.log('❌ Failed to create URL:', data1.error);
      return;
    }

    const shortUrl = data1.short_url;
    console.log(`✅ Created short URL: ${shortUrl}`);
    console.log(`   Original URL stored: "${data1.original_url}"`);

    // Step 2: Get all URLs to see what's stored
    console.log('\n2. Getting all URLs...');
    const response2 = await fetch(`${BASE_URL}/api/shorturl`);
    const allUrls = await response2.json();
    console.log('All URLs:', allUrls);

    // Step 3: Test redirect
    console.log(`\n3. Testing redirect to /api/shorturl/${shortUrl}...`);
    const response3 = await fetch(`${BASE_URL}/api/shorturl/${shortUrl}`, {
      method: 'GET',
      redirect: 'manual'
    });

    console.log('Redirect Status:', response3.status);
    console.log('Redirect Headers:', Object.fromEntries(response3.headers.entries()));
    
    const location = response3.headers.get('location');
    console.log(`   Expected: "https://freeCodeCamp.org/"`);
    console.log(`   Got:      "${location}"`);
    
    if (location === 'https://freeCodeCamp.org/') {
      console.log('✅ Redirect working correctly!');
    } else {
      console.log('❌ Redirect not working correctly');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDebug(); 