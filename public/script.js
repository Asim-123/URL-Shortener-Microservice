// Handle short URL redirects
async function handleShortUrlRedirect(shortUrlPath) {
    try {
        const response = await fetch(`/api/shorturl/${shortUrlPath}`);
        const data = await response.json();
        
        if (data.error) {
            alert('Error: ' + data.error);
        } else {
            // Redirect to the original URL
            window.location.href = data.original_url;
        }
    } catch (error) {
        console.error('Error fetching short URL:', error);
        alert('An error occurred while processing the short URL');
    }
}

// Check if current page is a short URL and handle redirect
const path = window.location.pathname;
const shortUrlMatch = path.match(/^\/api\/shorturl\/(\d+)$/);
if (shortUrlMatch) {
    const shortUrlId = shortUrlMatch[1];
    handleShortUrlRedirect(shortUrlId);
}

document.addEventListener('DOMContentLoaded', function() {
    const urlForm = document.getElementById('urlForm');
    const urlInput = document.getElementById('urlInput');
    const submitBtn = document.getElementById('submitBtn');
    const resultContainer = document.getElementById('resultContainer');
    const errorContainer = document.getElementById('errorContainer');
    const resultUrl = document.getElementById('resultUrl');
    const originalUrl = document.getElementById('originalUrl');
    const errorText = document.getElementById('errorText');

    urlForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const url = urlInput.value.trim();
        
        if (!url) {
            showError('Please enter a URL');
            return;
        }

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Shortening...';
        
        try {
            const response = await fetch('/api/shorturl', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ url: url })
            });

            const data = await response.json();

            if (data.error) {
                showError(data.error);
            } else {
                showResult(data);
            }
        } catch (error) {
            showError('An error occurred while shortening the URL');
            console.error('Error:', error);
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.textContent = 'Shorten URL';
        }
    });

    function showResult(data) {
        // Hide error container
        errorContainer.style.display = 'none';
        
        // Set result values
        const shortUrl = `${window.location.origin}/api/shorturl/${data.short_url}`;
        resultUrl.value = shortUrl;
        originalUrl.textContent = data.original_url;
        
        // Show result container
        resultContainer.style.display = 'block';
        
        // Scroll to result
        resultContainer.scrollIntoView({ behavior: 'smooth' });
    }

    function showError(message) {
        // Hide result container
        resultContainer.style.display = 'none';
        
        // Set error message
        errorText.textContent = message;
        
        // Show error container
        errorContainer.style.display = 'block';
        
        // Scroll to error
        errorContainer.scrollIntoView({ behavior: 'smooth' });
    }

    // Clear error when user starts typing
    urlInput.addEventListener('input', function() {
        if (errorContainer.style.display === 'block') {
            errorContainer.style.display = 'none';
        }
    });
});

// Copy to clipboard function
function copyToClipboard() {
    const resultUrl = document.getElementById('resultUrl');
    const copyBtn = document.getElementById('copyBtn');
    
    resultUrl.select();
    resultUrl.setSelectionRange(0, 99999); // For mobile devices
    
    try {
        document.execCommand('copy');
        
        // Show success feedback
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.style.background = '#218838';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '#28a745';
        }, 2000);
        
    } catch (err) {
        console.error('Failed to copy: ', err);
        
        // Fallback for modern browsers
        if (navigator.clipboard) {
            navigator.clipboard.writeText(resultUrl.value).then(() => {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                copyBtn.style.background = '#218838';
                
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                    copyBtn.style.background = '#28a745';
                }, 2000);
            });
        }
    }
} 