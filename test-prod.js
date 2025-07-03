const fetch = require('node-fetch');

const BASE_URL = 'https://velvety-dragon-2e2760.netlify.app';

async function testProductionAPI() {
  console.log('🧪 Testing Production API...\n');

  try {
    // Test 1: POST with proper Content-Type header
    console.log('1. Testing POST with proper Content-Type...');
    const response1 = await fetch(`${BASE_URL}/api/shorturl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: 'https://example.com' })
    });

    console.log('Status:', response1.status);
    const data1 = await response1.text();
    console.log('Response:', data1);
    
    if (response1.ok) {
      console.log('✅ Test 1 PASSED');
    } else {
      console.log('❌ Test 1 FAILED');
    }

    // Test 2: POST without Content-Type header
    console.log('\n2. Testing POST without Content-Type header...');
    const response2 = await fetch(`${BASE_URL}/api/shorturl`, {
      method: 'POST',
      body: JSON.stringify({ url: 'https://test.com' })
    });

    console.log('Status:', response2.status);
    const data2 = await response2.text();
    console.log('Response:', data2);

    // Test 3: POST with form data
    console.log('\n3. Testing POST with form data...');
    const formData = new URLSearchParams();
    formData.append('url', 'https://formtest.com');
    
    const response3 = await fetch(`${BASE_URL}/api/shorturl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    });

    console.log('Status:', response3.status);
    const data3 = await response3.text();
    console.log('Response:', data3);

    // Test 4: GET all URLs
    console.log('\n4. Testing GET all URLs...');
    const response4 = await fetch(`${BASE_URL}/api/shorturl`);
    
    console.log('Status:', response4.status);
    const data4 = await response4.text();
    console.log('Response:', data4);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testProductionAPI(); 