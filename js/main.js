document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.page-section');
    const navItems = document.querySelectorAll('.floating-nav li');
    const navTriggers = document.querySelectorAll('.nav-trigger');
    let currentSectionIndex = 0;
    let isScrolling = false;

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
});