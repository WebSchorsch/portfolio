document.addEventListener('DOMContentLoaded', function() {
    // Global Variables Accessible Across Functions
    let observer; // Intersection Observer instance
    let sections = []; // Array to hold all sections (hero + filterable)
    let currentIndex = 0; // Current section index
    const prevButtonNav = document.querySelector('.prev-button');
    const nextButtonNav = document.querySelector('.next-button');
    const heroSection = document.querySelector('.georg-hero');
    const sliders = document.querySelectorAll('.custom-slider');
    const cards = document.querySelectorAll('.card');
    sliders.forEach(slider => setupCustomSlider(slider));

    // Initialize All Functionalities
    setupAvatarChange();
    setupFilter();
    setupScrollButton();
    setupScrollForNavButtons();
    setupNavigationButtons();
    // setupCustomSlider();

// ---------------------
// Cards are checked
// ---------------------

    cards.forEach(card => {
        const radioInput = card.querySelector('input[type="radio"]');
        radioInput.addEventListener('change', function() {
            if (radioInput.checked) {
                // Remove 'checked' class from all cards
                cards.forEach(card => card.classList.remove('checked'));
                // Add 'checked' class to the currently selected card
                card.classList.add('checked');
            }
        });
    });


    
// ---------------------
// Avatar Change Function
// ---------------------
function setupAvatarChange() {
    const radios = document.querySelectorAll('.image-selector input[type="radio"]');
    const avatarImage = document.querySelector('.avatare');
    radios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                avatarImage.src = this.value;
            }
        });
    });

    // Set initial avatar based on the first radio button being checked
    const defaultRadio = radios[0];  // Assuming the first radio should be the default checked
    defaultRadio.checked = true;
    avatarImage.src = defaultRadio.value;
}

// ---------------------
// Filter Function
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
            const sectionClasses = Array.from(section.classList);
            const isFilterMatch = sectionClasses.includes(filter) || filter === 'all';

            if (isFilterMatch) {
                section.classList.remove('hidden');  // Show the section
                visibleCount++;
            } else {
                section.classList.add('hidden');  // Hide the section
            }
        });

        // Update the project counter
        projectCounter.textContent = visibleCount;
    }

    applyFilter('all'); // Set default filter on load
}

// ---------------------
// Scroll Button Function
// ---------------------
function setupScrollButton() {
    const scrollButton = document.getElementById('scroll-button'); // The "Jetzt Anschauen" button
    const filterableSections = document.querySelectorAll('.filterDiv');

    scrollButton.addEventListener('click', function(event) {
        event.preventDefault();  // Prevent the default behavior

        // Find the first visible (non-hidden) project section
        for (let section of filterableSections) {
            if (!section.classList.contains('hidden')) {
                section.scrollIntoView({ behavior: 'smooth' });
                break; // Stop after finding and scrolling to the first visible section
            }
        }
    });
}

    // ---------------------
    // Navigation Functions
    // ---------------------
    function setupNavigationButtons() {
        // Function to update sections array and observer when needed
        function updateSections() {
            // Disconnect existing observer
            if (observer) observer.disconnect();

            // Update sections to include hero and currently visible filterable sections
            const visibleSections = Array.from(document.querySelectorAll('.filterDiv:not(.hidden)'));
            sections = [heroSection, ...visibleSections];

            // Re-observe the new set of sections
            sections.forEach(section => observer.observe(section));
        }

        // Function to update navigation buttons visibility and text
        function updateNavigationButtons() {
            // Hide prevButtonNav if at the top (hero section)
            if (currentIndex <= 0) {
                prevButtonNav.style.display = 'none';
            } else {
                prevButtonNav.style.display = 'inline-block';
            }

            // Change nextButtonNav text if at the last section
            if (currentIndex >= sections.length - 1) {
                nextButtonNav.textContent = 'Zum Anfang';
            } else {
                nextButtonNav.textContent = 'Weiter';
            }
        }

        // Callback for Intersection Observer
        function intersectionCallback(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    currentIndex = sections.indexOf(entry.target);
                    updateNavigationButtons();
                }
            });
        }

        // Create Intersection Observer
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.6 // Adjusted threshold for better detection
        };
        observer = new IntersectionObserver(intersectionCallback, observerOptions);

        // Initial setup
        updateSections();
        updateNavigationButtons();

        // Event Listener for Next Button
        nextButtonNav.addEventListener('click', function(event) {
            event.preventDefault();
            if (currentIndex < sections.length - 1) {
                currentIndex++;
                sections[currentIndex].scrollIntoView({ behavior: 'smooth' });
            } else {
                // If at the last section, scroll back to the hero section
                sections[0].scrollIntoView({ behavior: 'smooth' });
                currentIndex = 0;
            }
        });

        // Event Listener for Previous Button
        prevButtonNav.addEventListener('click', function(event) {
            event.preventDefault();
            if (currentIndex > 0) {
                currentIndex--;
                sections[currentIndex].scrollIntoView({ behavior: 'smooth' });
            } else {
                // If at the hero section, scroll to top
                heroSection.scrollIntoView({ behavior: 'smooth' });
                currentIndex = 0;
            }
        });

        // Reinitialize navigation when filters change
        document.addEventListener('filterChanged', () => {
            updateSections();
            updateNavigationButtons();
        });
    }

    // ---------------------
    // Filter Function (Modified)
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
                const sectionClasses = Array.from(section.classList);
                const isFilterMatch = sectionClasses.includes(filter) || filter === 'all';

                if (isFilterMatch) {
                    section.classList.remove('hidden');
                    visibleCount++;
                } else {
                    section.classList.add('hidden');
                }
            });

            // Update the project counter
            projectCounter.textContent = visibleCount;

            // Dispatch a custom event to indicate that the filter has changed
            const event = new Event('filterChanged');
            document.dispatchEvent(event);
        }

        applyFilter('all'); // Set default filter on load
    }

    // ---------------------
    // Scroll-Based Visibility for Navigation Buttons (Updated)
    // ---------------------
    function setupScrollForNavButtons() {
        // Navigation buttons are already selected in global variables

        // Initially hide the navigation buttons
        prevButtonNav.style.display = 'none';
        nextButtonNav.style.display = 'none';

        window.addEventListener('scroll', () => {
            const heroBottom = heroSection.getBoundingClientRect().bottom;

            if (heroBottom <= 0) {
                // Show navigation buttons when hero section is out of view
                prevButtonNav.style.display = 'inline-block';
                nextButtonNav.style.display = 'inline-block';
            } else {
                // Hide navigation buttons when hero section is in view
                prevButtonNav.style.display = 'none';
                nextButtonNav.style.display = 'none';
            }
        });
    }

    // ---------------------
    // Slider
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
        let animationID;
        let slideWidth = slides[0].offsetWidth;
    
        // Create pagination dots
        dotsContainer.innerHTML = ''; // Clear any existing dots
        slides.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.classList.add('custom-pagination-dot');
            if (index === 0) dot.classList.add('active');
            dot.dataset.index = index;
            dotsContainer.appendChild(dot);
        });
        const dots = dotsContainer.querySelectorAll('.custom-pagination-dot');
    
        // Set the current slide and update the UI accordingly
        function setActiveSlide(index) {
            if (index >= slides.length) {
                currentSlide = slides.length - 1; // Don't go beyond the last slide
            } else if (index < 0) {
                currentSlide = 0; // Don't go before the first slide
            } else {
                currentSlide = index;
            }
            updateSlidePosition();
            updateDots();
        }
    
        // Update the slider's position
        function updateSlidePosition() {
            currentTranslate = -currentSlide * slideWidth;
            slidesWrapper.style.transform = `translateX(${currentTranslate}px)`;
            slidesWrapper.style.transition = 'transform 0.3s ease-in-out'; // Smooth transition
        }
    
        // Update pagination dots to reflect the active slide
        function updateDots() {
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });
        }
    
        // Event listeners for previous and next buttons
        prevButton.addEventListener('click', () => {
            setActiveSlide(currentSlide - 1);
        });
    
        nextButton.addEventListener('click', () => {
            setActiveSlide(currentSlide + 1);
        });
    
        // Event listeners for dots
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                setActiveSlide(parseInt(dot.dataset.index));
            });
        });
    
        // Touch events for swiping on mobile devices
        slides.forEach((slide, index) => {
            slide.addEventListener('touchstart', touchStart(index), { passive: false });
            slide.addEventListener('touchend', touchEnd);
            slide.addEventListener('touchmove', touchMove, { passive: false });
        });
    
        function touchStart(index) {
            return function (event) {
                event.preventDefault(); // Prevent default touch behavior
                currentSlide = index;
                startPos = event.touches[0].clientX;
                isDragging = true;
                animationID = requestAnimationFrame(animation);
                prevTranslate = currentTranslate;
                slidesWrapper.style.transition = 'none'; // Disable transition during drag
            };
        }
    
        function touchMove(event) {
            if (isDragging) {
                event.preventDefault(); // Prevent default touch behavior
                const currentPosition = event.touches[0].clientX;
                const distanceMoved = currentPosition - startPos;
                currentTranslate = prevTranslate + distanceMoved;
            }
        }
    
        function touchEnd() {
            isDragging = false;
            cancelAnimationFrame(animationID);
            const movedBy = currentTranslate - prevTranslate;
    
            if (movedBy < -50 && currentSlide < slides.length - 1) {
                setActiveSlide(currentSlide + 1);
            } else if (movedBy > 50 && currentSlide > 0) {
                setActiveSlide(currentSlide - 1);
            } else {
                setActiveSlide(currentSlide);
            }
    
            slidesWrapper.style.transition = 'transform 0.3s ease-in-out'; // Re-enable transition
        }
    
        function animation() {
            slidesWrapper.style.transform = `translateX(${currentTranslate}px)`;
            if (isDragging) requestAnimationFrame(animation);
        }
    
        // Prevent default image dragging
        slidesWrapper.addEventListener('dragstart', (e) => e.preventDefault());
    
        // Ensure the slider resizes properly on window resize
        window.addEventListener('resize', () => {
            slideWidth = slides[0].offsetWidth; // Recalculate the slide width
            updateSlidePosition(); // Update the slide position to prevent misalignment
        });
    
        updateSlidePosition(); // Initialize the slider's position
    }
    


    // ---------------------
    // End of DOMContentLoaded
    // ---------------------
});

