document.querySelectorAll('[data-copy-value]').forEach((button) => {
    button.addEventListener('click', async () => {
        const status = button.nextElementSibling;
        try {
            await navigator.clipboard.writeText(button.dataset.copyValue);
            if (status) status.textContent = 'copied';
        } catch {
            if (status) status.textContent = 'select the address to copy';
        }
        setTimeout(() => {
            if (status) status.textContent = '';
        }, 1800);
    });
});
