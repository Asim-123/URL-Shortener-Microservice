const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testUIRedirect() {
  console.log('🧪 Testing UI Redirect Functionality...\n');

  try {
    // Step 1: Create a short URL
    console.log('1. Creating short URL...');
    const response1 = await fetch(`${BASE_URL}/api/shorturl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: 'https://www.example.com' })
    });

    const data1 = await response1.json();
    console.log('Response:', data1);
    
    if (data1.error) {
      console.log('❌ Failed to create short URL:', data1.error);
      return;
    }

    const shortUrl = data1.short_url;
    console.log(`✅ Created short URL: ${shortUrl}`);

    // Step 2: Test redirect without following it (like the UI does)
    console.log(`\n2. Testing redirect to /api/shorturl/${shortUrl} (without following)...`);
    
    const response2 = await fetch(`${BASE_URL}/api/shorturl/${shortUrl}`, {
      method: 'GET',
      redirect: 'manual' // Don't follow redirects - this is what the UI does
    });

    console.log('Status:', response2.status);
    console.log('Headers:', Object.fromEntries(response2.headers.entries()));
    
    if (response2.status === 302) {
      const location = response2.headers.get('location');
      console.log('✅ Redirect test successful!');
      console.log('📍 Location header:', location);
      console.log('📝 This is what the UI will show when you click "Test Redirect"');
    } else {
      console.log('❌ Redirect test failed. Expected 302, got:', response2.status);
    }

    // Step 3: Show the full short URL that would be displayed in UI
    const fullShortUrl = `${BASE_URL}/api/shorturl/${shortUrl}`;
    console.log(`\n3. Full short URL that would be displayed in UI:`);
    console.log(`🔗 ${fullShortUrl}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUIRedirect(); 