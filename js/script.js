document.addEventListener('DOMContentLoaded', function() {
    let observer; // Intersection Observer instance
    let sections = []; // Array for all sections (hero + filterable)
    let currentIndex = 0; // Current section index
    const prevButtonNav = document.querySelector('.prev-button');
    const nextButtonNav = document.querySelector('.next-button');
    const heroSection = document.querySelector('.georg-hero');
    const sliders = document.querySelectorAll('.custom-slider');
    const cards = document.querySelectorAll('.card');
    const images = document.querySelectorAll('* img'); // Adjust selector to target your images
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeLightbox = document.querySelector('.close-lightbox');

    // Open lightbox on image click
    images.forEach(img => {
        img.addEventListener('click', () => {
            lightbox.style.display = 'flex';
            lightboxImg.src = img.src; // Use clicked image as lightbox source
        });
    });

    // Close lightbox when clicking the close button
    closeLightbox.addEventListener('click', () => {
        lightbox.style.display = 'none';
    });

    // Close lightbox when pressing Esc key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            lightbox.style.display = 'none';
        }
    });

    // Close lightbox when clicking outside the image
    lightbox.addEventListener('click', (event) => {
        if (event.target === lightbox) {
            lightbox.style.display = 'none';
        }
    });

    // Initialize all features
    setupAvatarChange();
    setupFilter();
    setupScrollButton();
    setupScrollForNavButtons();
    setupNavigationButtons();
    sliders.forEach(slider => setupCustomSlider(slider));

    // ---------------------
    // Reset All State on Page Load
    // ---------------------
    function resetToDefaultState() {
        const defaultRadio = document.querySelector('.image-selector input[type="radio"]:checked');

        // Reset all cards' checked state and apply only the default checked state
        cards.forEach(card => card.classList.remove('checked'));
        if (defaultRadio) {
            defaultRadio.checked = true;
            defaultRadio.closest('.card').classList.add('checked');
            applySettingsFromRadio(defaultRadio); // Apply default color settings
        }
    }

    // Call resetToDefaultState to ensure initial state
    resetToDefaultState();

    // ---------------------
    // Avatar Change
    // ---------------------
    function setupAvatarChange() {
        const radios = document.querySelectorAll('.image-selector input[type="radio"]');
        const avatarPicture = document.querySelector('.avatare');
        const sources = avatarPicture.querySelectorAll('source');
        const fallbackImg = avatarPicture.querySelector('img');
        const rootStyle = document.documentElement.style;

        function applySettingsFromRadio(radio) {
            // Update avatar images
            sources[0].srcset = radio.getAttribute('data-image-mobile');
            sources[1].srcset = radio.getAttribute('data-image-tablet');
            sources[2].srcset = radio.getAttribute('data-image-desktop');
            fallbackImg.src = radio.getAttribute('data-image-desktop');

            // Update color variables
            const primaryColor = radio.getAttribute('data-primary-color');
            const surfaceDarkerColor = radio.getAttribute('data-surface-darker');
            const surfaceLighterColor = radio.getAttribute('data-surface-lighter');
            const innerShadowColor = radio.getAttribute('data-inner-shadow');
            const selectedBgColor = radio.getAttribute('data-bg-color');

            rootStyle.setProperty('--primary-default', primaryColor);
            rootStyle.setProperty('--surface-darker', surfaceDarkerColor);
            rootStyle.setProperty('--surface-lighter', surfaceLighterColor);
            rootStyle.setProperty('--inner-shadow-default', innerShadowColor);

            // Apply background color for hero and other sections
            heroSection.style.backgroundColor = selectedBgColor;
            rootStyle.setProperty('--section-bg-color', selectedBgColor);
        }

        // Apply default color settings on page load
        const defaultRadio = document.querySelector('.image-selector input[type="radio"]:checked');
        if (defaultRadio) applySettingsFromRadio(defaultRadio);

        radios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.checked) {
                    applySettingsFromRadio(this);
                    resetToDefaultState(); // Reset all cards
                }
            });
        });
    }

    // ---------------------
    // Cards Checked State
    // ---------------------
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

    // ---------------------
    // Filter Function with Event Dispatch
    // ---------------------
    function setupFilter() {
        const filterControls = document.querySelectorAll('.image-selector input[type="radio"]');
        const filterableSections = document.querySelectorAll('.filterDiv');
        const projectCounter = document.getElementById('project-counter');

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
            projectCounter.textContent = visibleCount;
            document.dispatchEvent(new Event('filterChanged')); // Reinitialize navigation
        }

        applyFilter('all'); // Initial filter set
    }

    // ---------------------
    // Scroll Button Function
    // ---------------------
    function setupScrollButton() {
        const scrollButton = document.getElementById('scroll-button');
        const filterableSections = document.querySelectorAll('.filterDiv');

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

    // ---------------------
    // Navigation Button Visibility
    // ---------------------
    function setupScrollForNavButtons() {
        prevButtonNav.style.display = 'none';
        nextButtonNav.style.display = 'none';

        window.addEventListener('scroll', () => {
            const isHeroVisible = heroSection.getBoundingClientRect().bottom > 0;
            prevButtonNav.style.display = nextButtonNav.style.display = isHeroVisible ? 'none' : 'inline-block';
        });
    }

    // ---------------------
    // Navigation Functions
    // ---------------------
    function setupNavigationButtons() {
        function updateSections() {
            if (observer) observer.disconnect();
            sections = [heroSection, ...document.querySelectorAll('.filterDiv:not(.hidden)')];
            sections.forEach(section => observer.observe(section));
        }

        function updateNavigationButtons() {
            prevButtonNav.style.display = currentIndex <= 0 ? 'none' : 'inline-block';
            const nextButtonText = nextButtonNav.querySelector('.button-text');
            nextButtonText.textContent = currentIndex >= sections.length - 1 ? 'Back to the top' : 'Next';
        }

        function intersectionCallback(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    currentIndex = sections.indexOf(entry.target);
                    updateNavigationButtons();
                }
            });
        }

        observer = new IntersectionObserver(intersectionCallback, { threshold: 0.6 });
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

    // ---------------------
    // Slider Setup with Fullscreen Feature
    // ---------------------
    function setupCustomSlider(sliderContainer) {
        const slidesWrapper = sliderContainer.querySelector('.slides-wrapper');
        const slides = slidesWrapper.querySelectorAll('.custom-slide');
        const prevButton = sliderContainer.querySelector('.custom-prev-button');
        const nextButton = sliderContainer.querySelector('.custom-next-button');
        const dotsContainer = sliderContainer.querySelector('.custom-pagination-dots');

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

        // Fullscreen toggle for sliders
        sliderContainer.addEventListener('dblclick', function() {
            openFullscreenSlider(sliderContainer);
        });
    }

    // Fullscreen slider functionality
    function openFullscreenSlider(slider) {
        // Clone the slider to create a fullscreen version
        const fullscreenOverlay = document.createElement('div');
        fullscreenOverlay.classList.add('fullscreen-overlay');
        fullscreenOverlay.style.position = 'fixed';
        fullscreenOverlay.style.top = 0;
        fullscreenOverlay.style.left = 0;
        fullscreenOverlay.style.width = '100vw';
        fullscreenOverlay.style.height = '100vh';
        fullscreenOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        fullscreenOverlay.style.zIndex = 1000;
        fullscreenOverlay.style.display = 'flex';
        fullscreenOverlay.style.alignItems = 'center';
        fullscreenOverlay.style.justifyContent = 'center';

        // Clone the original slider into the overlay
        const clonedSlider = slider.cloneNode(true);
        clonedSlider.style.width = '90%';
        clonedSlider.style.height = 'auto';
        fullscreenOverlay.appendChild(clonedSlider);

        // Close fullscreen on overlay click (outside slider)
        fullscreenOverlay.addEventListener('click', function (e) {
            if (e.target === fullscreenOverlay) {
                document.body.removeChild(fullscreenOverlay);
            }
        });

        // Append overlay with the cloned slider to body
        document.body.appendChild(fullscreenOverlay);

        // Initialize slider functionality within fullscreen overlay
        setupCustomSlider(clonedSlider); // Call your slider setup function on the cloned slider
    }

    // ---------------------
    // Debounce Utility Function
    // ---------------------
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
});
