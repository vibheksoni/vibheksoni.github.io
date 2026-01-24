document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.page-section');
    const navItems = document.querySelectorAll('.floating-nav li');
    const navTriggers = document.querySelectorAll('.nav-trigger');
    let currentSectionIndex = 0;
    let isScrolling = false;

    // Projects Carousel Setup
    const projectsTrack = document.querySelector('.projects-track');
    const projectCards = document.querySelectorAll('.project-card');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    const dotsContainer = document.querySelector('.carousel-dots');
    let currentCardIndex = 0;

    /**
     * Switches between sections with animation
     * @param {number} index - The index of the section to switch to
     * @returns {void}
     */
    const switchSection = (index) => {
        if (index < 0 || index >= sections.length) return;
        
        sections.forEach(sec => {
            sec.classList.remove('active');
            sec.style.opacity = '0';
            sec.style.pointerEvents = 'none';
        });
        
        sections[index].classList.add('active');
        setTimeout(() => {
            sections[index].style.opacity = '1';
            sections[index].style.pointerEvents = 'all';
        }, 50);

        navItems.forEach(item => item.classList.remove('active'));
        const targetId = sections[index].id;
        const activeNav = document.querySelector(`.floating-nav li[data-target="${targetId}"]`);
        if (activeNav) activeNav.classList.add('active');

        currentSectionIndex = index;
    };

    navItems.forEach((item, index) => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
            const targetIndex = Array.from(sections).findIndex(sec => sec.id === targetId);
            if (targetIndex !== -1) switchSection(targetIndex);
        });
    });

    navTriggers.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = btn.getAttribute('data-target');
            const targetIndex = Array.from(sections).findIndex(sec => sec.id === targetId);
            if (targetIndex !== -1) switchSection(targetIndex);
        });
    });

    window.addEventListener('wheel', (e) => {
        if (isScrolling) return;
        
        const currentSection = sections[currentSectionIndex];
        const isScrollable = currentSection.scrollHeight > currentSection.clientHeight;
        
        if (isScrollable) {
            if (e.deltaY > 0 && currentSection.scrollTop + currentSection.clientHeight < currentSection.scrollHeight - 10) {
                return;
            }
            if (e.deltaY < 0 && currentSection.scrollTop > 10) {
                return;
            }
        }
        
        if (e.deltaY > 0) {
            if (currentSectionIndex < sections.length - 1) {
                isScrolling = true;
                switchSection(currentSectionIndex + 1);
                setTimeout(() => isScrolling = false, 800);
            }
        } else {
            if (currentSectionIndex > 0) {
                isScrolling = true;
                switchSection(currentSectionIndex - 1);
                setTimeout(() => isScrolling = false, 800);
            }
        }
    }, { passive: false });

    switchSection(0);

    // === Projects Carousel Functions ===

    // Create dot indicators
    const createDots = () => {
        if (!dotsContainer || !projectCards.length) return;
        dotsContainer.innerHTML = '';
        projectCards.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            if (index === 0) dot.classList.add('active');
            dot.setAttribute('aria-label', `Go to project ${index + 1}`);
            dot.addEventListener('click', () => scrollToCard(index));
            dotsContainer.appendChild(dot);
        });
    };

    // Update active dot
    const updateDots = (index) => {
        const dots = dotsContainer?.querySelectorAll('.carousel-dot');
        if (!dots) return;
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    };

    // Update arrow button states
    const updateArrows = () => {
        if (!prevBtn || !nextBtn) return;
        prevBtn.disabled = currentCardIndex === 0;
        nextBtn.disabled = currentCardIndex >= projectCards.length - 1;
    };

    // Check if mobile
    const isMobile = () => window.innerWidth <= 768;

    // Scroll to specific card
    const scrollToCard = (index) => {
        if (!projectsTrack || !projectCards[index]) return;
        currentCardIndex = Math.max(0, Math.min(index, projectCards.length - 1));

        if (isMobile()) {
            // On mobile, hide all cards and show only current one
            projectCards.forEach((card, i) => {
                card.style.display = i === currentCardIndex ? 'flex' : 'none';
            });
        } else {
            // On desktop, scroll to card
            const card = projectCards[currentCardIndex];
            const trackRect = projectsTrack.getBoundingClientRect();
            const cardRect = card.getBoundingClientRect();
            const scrollLeft = card.offsetLeft - (trackRect.width - cardRect.width) / 2;
            projectsTrack.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }

        updateDots(currentCardIndex);
        updateArrows();
    };

    // Detect current card from scroll position
    const detectCurrentCard = () => {
        if (!projectsTrack) return;
        const trackRect = projectsTrack.getBoundingClientRect();
        const trackCenter = trackRect.left + trackRect.width / 2;
        let closestIndex = 0;
        let closestDistance = Infinity;

        projectCards.forEach((card, index) => {
            const cardRect = card.getBoundingClientRect();
            const cardCenter = cardRect.left + cardRect.width / 2;
            const distance = Math.abs(trackCenter - cardCenter);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = index;
            }
        });

        if (closestIndex !== currentCardIndex) {
            currentCardIndex = closestIndex;
            updateDots(currentCardIndex);
            updateArrows();
        }
    };

    // Arrow button click handlers
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentCardIndex > 0) scrollToCard(currentCardIndex - 1);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentCardIndex < projectCards.length - 1) scrollToCard(currentCardIndex + 1);
        });
    }

    // Scroll detection with debounce
    let scrollTimeout;
    if (projectsTrack) {
        projectsTrack.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(detectCurrentCard, 100);
        });
    }

    // Keyboard navigation (when on projects section)
    document.addEventListener('keydown', (e) => {
        if (currentSectionIndex !== 2) return; // Projects is index 2
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            if (currentCardIndex > 0) scrollToCard(currentCardIndex - 1);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            if (currentCardIndex < projectCards.length - 1) {
                scrollToCard(currentCardIndex + 1);
            }
        }
    });

    // Initialize carousel
    const initCarousel = () => {
        if (isMobile()) {
            // Show only first card on mobile
            projectCards.forEach((card, i) => {
                card.style.display = i === currentCardIndex ? 'flex' : 'none';
            });
        } else {
            // Show all cards on desktop
            projectCards.forEach(card => {
                card.style.display = 'flex';
            });
        }
        updateArrows();
    };

    createDots();
    initCarousel();

    // Handle window resize
    window.addEventListener('resize', initCarousel);
});