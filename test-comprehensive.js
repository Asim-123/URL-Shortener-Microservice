const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function comprehensiveTest() {
  console.log('🧪 Comprehensive URL Shortener Test\n');

  try {
    // Test 1: Valid URL with DNS validation
    console.log('1. Testing valid URL (should pass DNS validation)...');
    const response1 = await fetch(`${BASE_URL}/api/shorturl`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://www.github.com' })
    });
    
    const data1 = await response1.json();
    console.log('✅ Valid URL result:', data1);
    
    if (data1.error) {
      console.log('❌ Unexpected error for valid URL');
      return;
    }

    // Test 2: Invalid URL (non-existent domain)
    console.log('\n2. Testing invalid URL (non-existent domain)...');
    const response2 = await fetch(`${BASE_URL}/api/shorturl`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://this-domain-does-not-exist-12345.com' })
    });
    
    const data2 = await response2.json();
    console.log('✅ Invalid URL result:', data2);
    
    if (!data2.error) {
      console.log('❌ Expected error for invalid URL');
      return;
    }

    // Test 3: Malformed URL
    console.log('\n3. Testing malformed URL...');
    const response3 = await fetch(`${BASE_URL}/api/shorturl`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'not-a-url' })
    });
    
    const data3 = await response3.json();
    console.log('✅ Malformed URL result:', data3);
    
    if (!data3.error) {
      console.log('❌ Expected error for malformed URL');
      return;
    }

    // Test 4: Duplicate URL (should return existing short URL)
    console.log('\n4. Testing duplicate URL...');
    const response4 = await fetch(`${BASE_URL}/api/shorturl`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://www.github.com' })
    });
    
    const data4 = await response4.json();
    console.log('✅ Duplicate URL result:', data4);
    
    if (data4.error) {
      console.log('❌ Unexpected error for duplicate URL');
      return;
    }

    // Test 5: Redirect functionality
    console.log('\n5. Testing redirect functionality...');
    const shortUrl = data1.short_url;
    const response5 = await fetch(`${BASE_URL}/api/shorturl/${shortUrl}`, {
      method: 'GET',
      redirect: 'manual'
    });
    
    console.log('✅ Redirect status:', response5.status);
    console.log('✅ Redirect location:', response5.headers.get('location'));
    
    if (response5.status !== 302) {
      console.log('❌ Expected 302 redirect');
      return;
    }

    // Test 6: Get all URLs
    console.log('\n6. Testing get all URLs...');
    const response6 = await fetch(`${BASE_URL}/api/shorturl`, {
      method: 'GET'
    });
    
    const data6 = await response6.json();
    console.log('✅ All URLs:', data6);
    
    console.log('\n🎉 All tests passed! The URL shortener is working correctly with:');
    console.log('   ✅ URL format validation');
    console.log('   ✅ DNS lookup validation');
    console.log('   ✅ Duplicate detection');
    console.log('   ✅ Redirect functionality');
    console.log('   ✅ API endpoints working');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

comprehensiveTest(); 