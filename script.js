document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('shorten-form');
    const urlInput = document.getElementById('url-input');
    const errorMessage = document.getElementById('error-message');
    const resultContainer = document.getElementById('result-container');
    const shortUrlEl = document.getElementById('short-url');
    const copyBtn = document.getElementById('copy-btn');
    const submitBtn = document.getElementById('shorten-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.spinner');

    const isValidUrl = (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const originalUrl = urlInput.value.trim();

        if (!isValidUrl(originalUrl)) {
            errorMessage.textContent = 'Please enter a valid URL.';
            errorMessage.classList.remove('hidden');
            urlInput.style.borderColor = 'var(--error-color)';
            return;
        }

        // Reset UI
        errorMessage.classList.add('hidden');
        urlInput.style.borderColor = 'var(--border-color)';
        resultContainer.classList.add('hidden');
        
        // Loading state
        btnText.classList.add('hidden');
        spinner.classList.remove('hidden');
        submitBtn.disabled = true;

        try {
            const response = await fetch('/api/shorten', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ original_url: originalUrl })
            });

            const data = await response.json();

            if (response.ok) {
                shortUrlEl.href = data.short_url;
                shortUrlEl.textContent = data.short_url;
                resultContainer.classList.remove('hidden');
                
                // Reset copy button if previously clicked
                copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
                copyBtn.classList.remove('copy-success');
                copyBtn.title = "Copy to Clipboard";
            } else {
                errorMessage.textContent = data.error || 'Something went wrong';
                errorMessage.classList.remove('hidden');
            }
        } catch (error) {
            errorMessage.textContent = 'Failed to connect to the server. Please try again.';
            errorMessage.classList.remove('hidden');
        } finally {
            // Remove loading state
            btnText.classList.remove('hidden');
            spinner.classList.add('hidden');
            submitBtn.disabled = false;
        }
    });

    // Copy to clipboard
    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(shortUrlEl.textContent);
            
            // Show success state
            copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            copyBtn.classList.add('copy-success');
            copyBtn.title = "Copied!";
            
            setTimeout(() => {
                copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
                copyBtn.classList.remove('copy-success');
                copyBtn.title = "Copy to Clipboard";
            }, 2000);
        } catch (err) {
            console.error('Failed to copy!', err);
        }
    });
});
