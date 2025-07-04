const fetch = require('node-fetch');

// Test our implementation vs freeCodeCamp example
async function compareWithFreeCodeCamp() {
  console.log('🔍 Comparing our implementation with freeCodeCamp example...\n');

  const ourUrl = 'https://velvety-dragon-2e2760.netlify.app';
  const freeCodeCampUrl = 'https://url-shortener-microservice.freecodecamp.rocks';

  try {
    // Test 1: Create a short URL on our implementation
    console.log('1. Creating short URL on our implementation...');
    const response1 = await fetch(`${ourUrl}/api/shorturl`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: 'https://forum.freecodecamp.org/' })
    });

    const data1 = await response1.json();
    console.log('Our response:', data1);

    if (data1.short_url) {
      // Test 2: Test redirect on our implementation (manual)
      console.log(`\n2. Testing redirect on our implementation: /api/shorturl/${data1.short_url}`);
      const response2 = await fetch(`${ourUrl}/api/shorturl/${data1.short_url}`, {
        method: 'GET',
        redirect: 'manual'
      });

      console.log('Our redirect status:', response2.status);
      console.log('Our location header:', response2.headers.get('location'));

      // Test 3: Test redirect on our implementation (follow)
      console.log(`\n3. Testing redirect on our implementation (following): /api/shorturl/${data1.short_url}`);
      const response2Follow = await fetch(`${ourUrl}/api/shorturl/${data1.short_url}`, {
        method: 'GET',
        redirect: 'follow'
      });

      console.log('Our final URL after redirect:', response2Follow.url);

      // Test 4: Test freeCodeCamp example redirect (manual)
      console.log('\n4. Testing freeCodeCamp example redirect (manual): /api/shorturl/3');
      const response3 = await fetch(`${freeCodeCampUrl}/api/shorturl/3`, {
        method: 'GET',
        redirect: 'manual'
      });

      console.log('FreeCodeCamp redirect status:', response3.status);
      console.log('FreeCodeCamp location header:', response3.headers.get('location'));

      // Test 5: Test freeCodeCamp example redirect (follow)
      console.log('\n5. Testing freeCodeCamp example redirect (following): /api/shorturl/3');
      const response3Follow = await fetch(`${freeCodeCampUrl}/api/shorturl/3`, {
        method: 'GET',
        redirect: 'follow'
      });

      console.log('FreeCodeCamp final URL after redirect:', response3Follow.url);

      // Compare the behaviors
      console.log('\n📊 Comparison Results:');
      console.log('Our implementation:');
      console.log(`  - Manual status: ${response2.status}`);
      console.log(`  - Manual location: ${response2.headers.get('location')}`);
      console.log(`  - Final URL: ${response2Follow.url}`);
      console.log('FreeCodeCamp example:');
      console.log(`  - Manual status: ${response3.status}`);
      console.log(`  - Manual location: ${response3.headers.get('location')}`);
      console.log(`  - Final URL: ${response3Follow.url}`);

      // Check if both end up at the same destination
      if (response2Follow.url === response3Follow.url) {
        console.log('✅ Both implementations redirect to the same final URL');
      } else {
        console.log('❌ Final URLs differ');
      }

    } else {
      console.log('❌ Failed to create short URL');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

compareWithFreeCodeCamp(); 