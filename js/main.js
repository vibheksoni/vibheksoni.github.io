document.addEventListener('DOMContentLoaded', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener('click', (event) => {
            const id = link.getAttribute('href');
            if (!id || id === '#') return;
            const target = document.querySelector(id);
            if (!target) return;
            event.preventDefault();
            target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
            history.pushState(null, '', id);
        });
    });

    document.querySelectorAll('[data-copy-value]').forEach((button) => {
        button.addEventListener('click', async () => {
            const value = button.dataset.copyValue;
            const status = button.parentElement?.querySelector('.copy-status');
            if (!value) return;
            try {
                await navigator.clipboard.writeText(value);
                if (status) status.textContent = 'copied';
            } catch {
                if (status) status.textContent = 'select the address to copy';
            }
            window.setTimeout(() => {
                if (status) status.textContent = '';
            }, 1800);
        });
    });

    const nav = document.querySelector('[data-nav]');
    const onScroll = () => nav?.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    // Duplicate the ticker content so the loop is seamless.
    const track = document.querySelector('.ticker-track');
    if (track) track.innerHTML += track.innerHTML;

    if (reduceMotion) return;

    // The ticker drifts slowly and speeds up while the page is being scrolled, easing back after.
    if (track) {
        track.style.animation = 'none';
        const basePxPerSec = 36;
        let offset = 0;
        let speed = basePxPerSec;
        let lastY = window.scrollY;
        let lastT = performance.now();
        const step = (now) => {
            const dt = Math.min((now - lastT) / 1000, 0.05);
            lastT = now;
            const y = window.scrollY;
            const scrollBoost = Math.min(Math.abs(y - lastY), 80) * 6;
            lastY = y;
            speed += (basePxPerSec + scrollBoost - speed) * 0.08;
            offset = (offset + speed * dt) % (track.scrollWidth / 2);
            track.style.transform = `translate3d(${-offset}px, 0, 0)`;
            requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }

    // Reveal sections as they enter the viewport.
    const items = document.querySelectorAll('.section-head, .feature, .row, .timeline li, .about > *, .contact-line');
    items.forEach((el) => el.classList.add('reveal'));
    const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                io.unobserve(entry.target);
            });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );
    items.forEach((el) => io.observe(el));
});
