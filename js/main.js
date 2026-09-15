document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach((link) => {
        link.addEventListener('click', (event) => {
            const id = link.getAttribute('href');
            if (!id || id === '#') return;

            const target = document.querySelector(id);
            if (!target) return;

            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            history.pushState(null, '', id);
        });
    });

    const copyButtons = document.querySelectorAll('[data-copy-value]');

    copyButtons.forEach((button) => {
        button.addEventListener('click', async () => {
            const value = button.dataset.copyValue;
            const status = button.parentElement?.querySelector('.copy-status');
            if (!value) return;

            try {
                await navigator.clipboard.writeText(value);
                if (status) status.textContent = 'copied';
            } catch {
                if (status) status.textContent = 'select email';
            }

            window.setTimeout(() => {
                if (status) status.textContent = '';
            }, 1800);
        });
    });
});
