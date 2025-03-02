document.addEventListener('DOMContentLoaded', function() {
    // Encapsulate all variables and functions within this function scope

    // Initialize variables
    let observer; // Intersection Observer instance
    let sections = []; // Array for all sections (hero + filterable)
    let currentIndex = 0; // Current section index

    // Query DOM elements
    const prevButtonNav = document.querySelector('.prev-button');
    const nextButtonNav = document.querySelector('.next-button');
    const heroSection = document.querySelector('.georg-hero');
    const sliders = document.querySelectorAll('.custom-slider');
    const cards = document.querySelectorAll('.card');

    // ---------------------
    // Functions Definitions
    // ---------------------

    // Apply settings from the selected radio input
    function applySettingsFromRadio(radio) {
        const avatarPicture = document.querySelector('.avatare');
        const rootStyle = document.documentElement.style;

        if (!avatarPicture) return; // Exit if avatarPicture doesn't exist

        const sources = avatarPicture.querySelectorAll('source');
        const fallbackImg = avatarPicture.querySelector('img');

        // Update avatar images
        if (sources.length >= 3) {
            sources[0].srcset = radio.getAttribute('data-image-mobile');
            sources[1].srcset = radio.getAttribute('data-image-tablet');
            sources[2].srcset = radio.getAttribute('data-image-desktop');
        }
        if (fallbackImg) {
            fallbackImg.src = radio.getAttribute('data-image-desktop');
        }

        // Update color variables
        const primaryColor = radio.getAttribute('data-primary-color');
        const surfaceDarkerColor = radio.getAttribute('data-surface-darker');
        const surfaceLighterColor = radio.getAttribute('data-surface-lighter');
        const innerShadowColor = radio.getAttribute('data-inner-shadow');
        const selectedBgColor = radio.getAttribute('data-bg-color');

        if (primaryColor) rootStyle.setProperty('--primary-default', primaryColor);
        if (surfaceDarkerColor) rootStyle.setProperty('--surface-darker', surfaceDarkerColor);
        if (surfaceLighterColor) rootStyle.setProperty('--surface-lighter', surfaceLighterColor);
        if (innerShadowColor) rootStyle.setProperty('--inner-shadow-default', innerShadowColor);

        // Apply background color for hero and other sections
        if (heroSection && selectedBgColor) {
            heroSection.style.backgroundColor = selectedBgColor;
        }
        if (selectedBgColor) rootStyle.setProperty('--section-bg-color', selectedBgColor);
    }

    // Reset All State on Page Load
    function resetToDefaultState() {
        const defaultRadio = document.querySelector('.image-selector input[type="radio"]:checked');

        // Reset all cards' checked state and apply only the default checked state
        cards.forEach(card => card.classList.remove('checked'));
        if (defaultRadio) {
            defaultRadio.checked = true;
            const defaultCard = defaultRadio.closest('.card');
            if (defaultCard) {
                defaultCard.classList.add('checked');
            }
            applySettingsFromRadio(defaultRadio); // Apply default color settings
        }
    }

    // Avatar Change
    function setupAvatarChange() {
        const radios = document.querySelectorAll('.image-selector input[type="radio"]');

        if (radios.length === 0) return; // Exit if no radios exist

        radios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.checked) {
                    applySettingsFromRadio(this);
                    resetToDefaultState(); // Reset all cards
                }
            });
        });
    }

    // Cards Checked State
    function setupCardState() {
        if (cards.length > 0) {
            cards.forEach(card => {
                const radioInput = card.querySelector('input[type="radio"]');
                if (radioInput.checked) card.classList.add('checked');

                radioInput.addEventListener('change', function() {
                    if (radioInput.checked) {
                        cards.forEach(card => card.classList.remove('checked'));
                        card.classList.add('checked');
                    }
                });
            });
        }
    }

    // Filter Function with Event Dispatch
    function setupFilter() {
        const filterControls = document.querySelectorAll('.image-selector input[type="radio"]');
        const filterableSections = document.querySelectorAll('.filterDiv');
        const projectCounter = document.getElementById('project-counter');

        if (filterControls.length === 0 || filterableSections.length === 0) return;

        filterControls.forEach(control => {
            control.addEventListener('change', function() {
                if (this.checked) {
                    applyFilter(this.dataset.filter);
                }
            });
        });

        function applyFilter(filter) {
            let visibleCount = 0;
            filterableSections.forEach(section => {
                const isMatch = section.classList.contains(filter) || filter === 'all';
                section.classList.toggle('hidden', !isMatch);
                if (isMatch) visibleCount++;
            });
            if (projectCounter) {
                projectCounter.textContent = visibleCount;
            }
            document.dispatchEvent(new Event('filterChanged')); // Reinitialize navigation
        }

        applyFilter('all'); // Initial filter set
    }

    // Scroll Button Function
    function setupScrollButton() {
        const scrollButton = document.getElementById('scroll-button');
        const filterableSections = document.querySelectorAll('.filterDiv');

        if (!scrollButton || filterableSections.length === 0) return;

        scrollButton.addEventListener('click', function(event) {
            event.preventDefault();
            for (let section of filterableSections) {
                if (!section.classList.contains('hidden')) {
                    section.scrollIntoView({ behavior: 'smooth' });
                    break;
                }
            }
        });
    }

    // Navigation Button Visibility
    function setupScrollForNavButtons() {
        if (!prevButtonNav || !nextButtonNav || !heroSection) return;

        prevButtonNav.style.display = 'none';
        nextButtonNav.style.display = 'none';

        window.addEventListener('scroll', () => {
            const isHeroVisible = heroSection.getBoundingClientRect().bottom > 0;
            prevButtonNav.style.display = nextButtonNav.style.display = isHeroVisible ? 'none' : 'inline-block';
        });
    }

    // Navigation Functions
    function setupNavigationButtons() {
        if (!prevButtonNav || !nextButtonNav) return;

        function updateSections() {
            if (observer) observer.disconnect();
            sections = [heroSection, ...document.querySelectorAll('.filterDiv:not(.hidden)')].filter(Boolean);
            observer = new IntersectionObserver(intersectionCallback, { threshold: 0.6 });
            sections.forEach(section => observer.observe(section));
        }

        function updateNavigationButtons() {
            prevButtonNav.style.display = currentIndex <= 0 ? 'none' : 'inline-block';
            const nextButtonText = nextButtonNav.querySelector('.button-text');
            if (nextButtonText) {
                nextButtonText.textContent = currentIndex >= sections.length - 1 ? 'Back to the top' : 'Next';
            }
        }

        function intersectionCallback(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    currentIndex = sections.indexOf(entry.target);
                    updateNavigationButtons();
                }
            });
        }

        updateSections();

        nextButtonNav.addEventListener('click', function(event) {
            event.preventDefault();
            currentIndex = currentIndex < sections.length - 1 ? currentIndex + 1 : 0;
            sections[currentIndex].scrollIntoView({ behavior: 'smooth' });
        });

        prevButtonNav.addEventListener('click', function(event) {
            event.preventDefault();
            currentIndex = currentIndex > 0 ? currentIndex - 1 : 0;
            sections[currentIndex].scrollIntoView({ behavior: 'smooth' });
        });

        document.addEventListener('filterChanged', updateSections); // Reinitialize on filter change
    }

    // Slider Setup
    function setupCustomSlider(sliderContainer) {
        const slidesWrapper = sliderContainer.querySelector('.slides-wrapper');
        const slides = slidesWrapper ? slidesWrapper.querySelectorAll('.custom-slide') : [];
        const prevButton = sliderContainer.querySelector('.custom-prev-button');
        const nextButton = sliderContainer.querySelector('.custom-next-button');
        const dotsContainer = sliderContainer.querySelector('.custom-pagination-dots');

        if (!slidesWrapper || slides.length === 0 || !prevButton || !nextButton || !dotsContainer) return;

        let currentSlide = 0;
        let isDragging = false;
        let startPos = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;

        slidesWrapper.style.transition = 'transform 0.3s ease-in-out';

        // Pagination dots
        dotsContainer.innerHTML = '';
        slides.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.classList.add('custom-pagination-dot');
            dot.classList.toggle('active', index === 0);
            dot.dataset.index = index;
            dotsContainer.appendChild(dot);
            dot.addEventListener('click', () => setActiveSlide(index));
        });
        const dots = dotsContainer.querySelectorAll('.custom-pagination-dot');

        function setActiveSlide(index) {
            currentSlide = Math.max(0, Math.min(index, slides.length - 1));
            currentTranslate = -slides[currentSlide].offsetLeft;
            slidesWrapper.style.transform = `translateX(${currentTranslate}px)`;
            dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
        }

        prevButton.addEventListener('click', () => setActiveSlide(currentSlide - 1));
        nextButton.addEventListener('click', () => setActiveSlide(currentSlide + 1));

        // Swipe events
        slides.forEach((slide, index) => {
            slide.addEventListener('touchstart', touchStart(index), { passive: false });
            slide.addEventListener('touchend', touchEnd);
            slide.addEventListener('touchmove', touchMove, { passive: false });
        });

        function touchStart(index) {
            return function(event) {
                currentSlide = index;
                startPos = event.touches[0].clientX;
                isDragging = true;
                prevTranslate = currentTranslate;
            };
        }

        function touchMove(event) {
            if (isDragging) {
                const currentPosition = event.touches[0].clientX;
                currentTranslate = prevTranslate + (currentPosition - startPos);
                slidesWrapper.style.transform = `translateX(${currentTranslate}px)`;
            }
        }

        function touchEnd() {
            isDragging = false;
            const movedBy = currentTranslate - prevTranslate;
            if (movedBy < -50 && currentSlide < slides.length - 1) {
                setActiveSlide(currentSlide + 1);
            } else if (movedBy > 50 && currentSlide > 0) {
                setActiveSlide(currentSlide - 1);
            } else {
                setActiveSlide(currentSlide);
            }
        }

        // Update on window resize
        window.addEventListener('resize', debounce(updateSlidePosition, 200));

        function updateSlidePosition() {
            setActiveSlide(currentSlide);
        }

        setActiveSlide(0); // Initialize
    }

    // Debounce Utility Function
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // ---------------------
    // Initialization
    // ---------------------

    // Only initialize features if elements exist
    if (cards.length > 0) {
        setupAvatarChange();
        setupCardState();
        setupFilter();
        setupScrollButton();
        setupScrollForNavButtons();
        setupNavigationButtons();
        resetToDefaultState(); // Ensure initial state
    }

    if (sliders.length > 0) {
        sliders.forEach(slider => setupCustomSlider(slider));
    }
});
