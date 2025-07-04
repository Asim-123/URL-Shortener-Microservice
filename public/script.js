document.addEventListener('DOMContentLoaded', function() {
    const urlForm = document.getElementById('urlForm');
    const urlInput = document.getElementById('urlInput');
    const submitBtn = document.getElementById('submitBtn');
    const resultContainer = document.getElementById('result');
    const errorContainer = document.getElementById('error');
    const shortUrlDisplay = document.getElementById('shortUrlDisplay');
    const originalUrlDisplay = document.getElementById('originalUrlDisplay');
    const copyBtn = document.getElementById('copyBtn');
    const testRedirectBtn = document.getElementById('testRedirectBtn');
    const errorMessage = document.getElementById('errorMessage');

    // Form submission handler
    urlForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const url = urlInput.value.trim();
        
        if (!url) {
            showError('Please enter a URL');
            return;
        }

        // Show loading state
        setLoadingState(true);
        hideError();
        hideResult();

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
            console.error('Error:', error);
            showError('Network error. Please try again.');
        } finally {
            setLoadingState(false);
        }
    });

    // Copy button handler
    copyBtn.addEventListener('click', function() {
        const shortUrl = shortUrlDisplay.value;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(shortUrl).then(function() {
                showCopySuccess();
            }).catch(function() {
                fallbackCopyTextToClipboard(shortUrl);
            });
        } else {
            fallbackCopyTextToClipboard(shortUrl);
        }
    });

    // Test redirect button handler
    testRedirectBtn.addEventListener('click', function() {
        const shortUrl = shortUrlDisplay.value;
        
        if (!shortUrl) {
            showError('No short URL to test');
            return;
        }

        // Redirect directly to the short URL endpoint
        window.location.href = shortUrl;
    });

    // Helper functions
    function setLoadingState(loading) {
        if (loading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="loading"></span> Shortening...';
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-cut"></i> Shorten URL';
        }
    }

    function setTestingState(testing) {
        if (testing) {
            testRedirectBtn.disabled = true;
            testRedirectBtn.classList.add('testing');
            testRedirectBtn.innerHTML = '<span class="loading"></span> Testing...';
        } else {
            testRedirectBtn.disabled = false;
            testRedirectBtn.classList.remove('testing');
            testRedirectBtn.innerHTML = '<i class="fas fa-external-link-alt"></i> Visit Short URL';
        }
    }

    function showResult(data) {
        const baseUrl = window.location.origin;
        const shortUrl = `${baseUrl}/api/shorturl/${data.short_url}`;
        
        shortUrlDisplay.value = shortUrl;
        originalUrlDisplay.textContent = data.original_url;
        
        resultContainer.style.display = 'block';
        
        // Scroll to result
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function hideResult() {
        resultContainer.style.display = 'none';
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorContainer.style.display = 'block';
        
        // Scroll to error
        errorContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function hideError() {
        errorContainer.style.display = 'none';
    }

    function showCopySuccess() {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        copyBtn.classList.add('copied');
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.classList.remove('copied');
        }, 2000);
    }

    function showRedirectInfo(location) {
        // Create a temporary success message
        const successDiv = document.createElement('div');
        successDiv.className = 'redirect-success';
        successDiv.innerHTML = `
            <div class="redirect-info">
                <i class="fas fa-check-circle"></i>
                <div>
                    <strong>Redirect Test Successful!</strong>
                    <p>This URL redirects to: <a href="${location}" target="_blank">${location}</a></p>
                </div>
            </div>
        `;
        
        // Insert after the result container
        const resultContainer = document.getElementById('result');
        resultContainer.parentNode.insertBefore(successDiv, resultContainer.nextSibling);
        
        // Scroll to the success message
        successDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.parentNode.removeChild(successDiv);
            }
        }, 5000);
    }

    function fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            if (successful) {
                showCopySuccess();
            } else {
                showError('Failed to copy URL');
            }
        } catch (err) {
            showError('Failed to copy URL');
        }
        
        document.body.removeChild(textArea);
    }

    // URL input validation
    urlInput.addEventListener('input', function() {
        const url = this.value.trim();
        if (url && !isValidUrl(url)) {
            this.setCustomValidity('Please enter a valid URL (e.g., https://www.example.com)');
        } else {
            this.setCustomValidity('');
        }
    });

    function isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    // Auto-focus on URL input
    urlInput.focus();

    // Add some nice animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.feature-card, .api-example').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}); 