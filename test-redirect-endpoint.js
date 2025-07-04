const http = require('http');

// Create a short URL first
function createShortUrl(originalUrl) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify({ url: originalUrl });
        
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: '/api/shorturl',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    console.log('Created short URL:', result);
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

// Test the redirect endpoint
function testRedirect(shortUrl) {
    return new Promise((resolve, reject) => {
        const url = new URL(shortUrl);
        const options = {
            hostname: url.hostname,
            port: url.port || 3001,
            path: url.pathname,
            method: 'GET',
            followRedirect: false // Don't follow redirects automatically
        };

        const req = http.request(options, (res) => {
            console.log(`Status: ${res.statusCode}`);
            console.log(`Headers:`, res.headers);
            
            if (res.statusCode === 302) {
                const location = res.headers.location;
                console.log(`Redirects to: ${location}`);
                resolve({ status: res.statusCode, location });
            } else {
                console.log(`Unexpected status: ${res.statusCode}`);
                resolve({ status: res.statusCode });
            }
        });

        req.on('error', (error) => {
            console.error('Error:', error);
            reject(error);
        });

        req.end();
    });
}

// Test the complete flow
async function testCompleteFlow() {
    try {
        // Step 1: Create a short URL
        console.log('Step 1: Creating short URL...');
        const shortUrlResult = await createShortUrl('https://www.google.com');
        
        // Step 2: Test the redirect
        console.log('\nStep 2: Testing redirect...');
        const testUrl = `http://localhost:3001/api/shorturl/${shortUrlResult.short_url}`;
        console.log(`Testing redirect endpoint: ${testUrl}`);
        
        const redirectResult = await testRedirect(testUrl);
        console.log('\nTest completed:', redirectResult);
        
        if (redirectResult.status === 302) {
            console.log('✅ Redirect is working correctly!');
        } else {
            console.log('❌ Redirect is not working as expected.');
        }
        
    } catch (error) {
        console.error('Test failed:', error);
    }
}

testCompleteFlow(); 