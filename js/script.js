document.addEventListener('DOMContentLoaded', function() {
    let observer; // Intersection Observer instance
    let sections = []; // Array for all sections (hero + filterable)
    let currentIndex = 0; // Current section index
    const prevButtonNav = document.querySelector('.prev-button');
    const nextButtonNav = document.querySelector('.next-button');
    const heroSection = document.querySelector('.georg-hero');
    const sliders = document.querySelectorAll('.custom-slider');
    const cards = document.querySelectorAll('.card');
    
    // Initialize all features
    setupAvatarChange();
    setupFilter();
    setupScrollButton();
    setupScrollForNavButtons();
    setupNavigationButtons();
    sliders.forEach(slider => setupCustomSlider(slider));

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
    // Avatar Change
    // ---------------------
    function setupAvatarChange() {
    const radios = document.querySelectorAll('.image-selector input[type="radio"]');
    const avatarPicture = document.querySelector('.avatare');
    const sources = avatarPicture.querySelectorAll('source');
    const fallbackImg = avatarPicture.querySelector('img');
    const rootStyle = document.documentElement.style;

    radios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                // Update avatar images
                sources[0].srcset = this.getAttribute('data-image-mobile');
                sources[1].srcset = this.getAttribute('data-image-tablet');
                sources[2].srcset = this.getAttribute('data-image-desktop');
                fallbackImg.src = this.getAttribute('data-image-desktop');

                // Update background color
                const selectedBgColor = this.getAttribute('data-bg-color');
                heroSection.style.backgroundColor = selectedBgColor;

                // Update primary color
                const primaryColor = this.getAttribute('data-primary-color');
                rootStyle.setProperty('--primary-default', primaryColor);

                // Update surface-darker color
                const surfaceDarkerColor = this.getAttribute('data-surface-darker');
                console.log(`Changing surface darker color to: ${surfaceDarkerColor}`);
                rootStyle.setProperty('--surface-darker', surfaceDarkerColor);
            }
        });
    });

    // Set initial state
    const defaultRadio = radios[0];
    if (defaultRadio) defaultRadio.checked = true;
    radios[0].dispatchEvent(new Event('change'));
}

    

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
    // Slider Setup
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
