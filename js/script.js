document.addEventListener('DOMContentLoaded', function () {
    // Initialize carousels
    const carousels = document.querySelectorAll('.carousel-container');
    carousels.forEach(carousel => setupCarousel(carousel));

    // Initialize avatar change functionality
    setupAvatarChange();

    // Initialize filter functionality
    setupFilter();

    // Initialize scroll button functionality
    setupScrollButton();

    // Initialize scroll-based visibility for navigation buttons
    setupScrollForNavButtons();

    // Setup navigation button functionality
    setupNavigationButtons();
    
    // Initialize the custom slider functionality
    setupCustomSlider();
});

function setupCarousel(carouselContainer) {
    let currentSlide = 0;
    const slides = carouselContainer.querySelectorAll('.carousel-item');
    const dots = carouselContainer.querySelectorAll('.dot');
    const carousel = carouselContainer.querySelector('.carousel');
    const prevArrow = carouselContainer.querySelector('.prev-arrow');
    const nextArrow = carouselContainer.querySelector('.next-arrow');

    function showSlide(index) {
        if (index >= slides.length) {
            currentSlide = 0;
        } else if (index < 0) {
            currentSlide = slides.length - 1;
        } else {
            currentSlide = index;
        }

        // Move carousel
        carousel.style.transform = `translateX(-${currentSlide * 100}%)`;

        // Update dots
        dots.forEach(dot => {
            dot.classList.remove('active');
            if (parseInt(dot.getAttribute('data-slide')) === currentSlide) {
                dot.classList.add('active');
            }
        });
    }

    prevArrow.addEventListener('click', () => showSlide(currentSlide - 1));
    nextArrow.addEventListener('click', () => showSlide(currentSlide + 1));
    dots.forEach(dot => {
        dot.addEventListener('click', () => showSlide(parseInt(dot.getAttribute('data-slide'))));
    });

    showSlide(currentSlide);  // Initialize the first slide
}

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
    const defaultRadio = radios[0];  // Assuming first radio should be the default checked
    defaultRadio.checked = true;
    avatarImage.src = defaultRadio.value;
}

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
        let visibleCount = 0;  // Initialize a counter for visible sections

        filterableSections.forEach(section => {
            const sectionClasses = Array.from(section.classList);
            const isFilterMatch = sectionClasses.includes(filter) || filter === 'all';

            if (isFilterMatch) {
                section.classList.remove('hidden');  // Smoothly show section
                visibleCount++;  // Increment counter for each visible section
            } else {
                section.classList.add('hidden');  // Smoothly hide section
            }
        });

        // Update the project counter with the number of visible sections
        projectCounter.textContent = visibleCount;
    }

    applyFilter('all');  // Set default filter on load
}

function setupScrollButton() {
    const scrollButton = document.getElementById('scroll-button');
    const filterableSections = document.querySelectorAll('.filterDiv');

    scrollButton.addEventListener('click', function(event) {
        event.preventDefault();  // Prevent the default anchor click behavior

        // Find the first visible section
        for (let section of filterableSections) {
            if (!section.classList.contains('hidden')) {
                section.scrollIntoView({ behavior: 'smooth' });
                break;  // Stop after finding the first visible section
            }
        }
    });
}

function setupScrollForNavButtons() {
    const heroSection = document.querySelector('.georg-hero');
    const prevButton = document.querySelector('.prev-button');
    const nextButton = document.querySelector('.next-button');

    // Initially hide the buttons
    prevButton.style.display = 'none';
    nextButton.style.display = 'none';

    window.addEventListener('scroll', () => {
        const heroBottom = heroSection.getBoundingClientRect().bottom;

        if (window.scrollY > heroBottom) {
            // Show navigation buttons when scrolling past the hero section
            prevButton.style.display = 'inline-block';
            nextButton.style.display = 'inline-block';
        } else {
            // Hide navigation buttons when back in the hero section
            prevButton.style.display = 'none';
            nextButton.style.display = 'none';
        }
    });
}

function setupNavigationButtons() {
    const filterableSections = document.querySelectorAll('.filterDiv');
    const prevButton = document.querySelector('.prev-button');
    const nextButton = document.querySelector('.next-button');
    const heroSection = document.querySelector('.georg-hero');
    
    let currentIndex = 0;

    // Update the index dynamically based on current scroll position
    window.addEventListener('scroll', updateCurrentIndex);

    // Event listener for forward (next) button
    nextButton.addEventListener('click', function(event) {
        event.preventDefault();
        scrollToNextSection();
    });

    // Event listener for backward (prev) button
    prevButton.addEventListener('click', function(event) {
        event.preventDefault();
        scrollToPreviousSection();
    });

    // Helper function to scroll to the next visible section
    function scrollToNextSection() {
        const visibleSections = Array.from(filterableSections).filter(section => !section.classList.contains('hidden'));

        // Increment index and check if it's the last section
        if (currentIndex < visibleSections.length - 1) {
            currentIndex++;
            visibleSections[currentIndex].scrollIntoView({ behavior: 'smooth' });
            nextButton.textContent = 'Weiter'; // Reset text to default
        } else {
            // Scroll back to top if at the last section
            currentIndex = 0;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // Change button text when reaching the last section
        if (currentIndex === visibleSections.length - 1) {
            nextButton.textContent = 'Zum Anfang';
        } else {
            nextButton.textContent = 'Weiter'; // Ensure button resets when not at the last section
        }
    }

    // Helper function to scroll to the previous visible section
    function scrollToPreviousSection() {
        const visibleSections = Array.from(filterableSections).filter(section => !section.classList.contains('hidden'));

        // Decrement index and make sure it doesn't go below 0
        if (currentIndex > 0) {
            currentIndex--;
            visibleSections[currentIndex].scrollIntoView({ behavior: 'smooth' });
        } else {
            // If it's the first section, scroll to hero section
            heroSection.scrollIntoView({ behavior: 'smooth' });
            prevButton.style.display = 'none';  // Hide button when back to the top
        }
    }

    // Function to update current index based on scroll position
    function updateCurrentIndex() {
        const visibleSections = Array.from(filterableSections).filter(section => !section.classList.contains('hidden'));
        
        visibleSections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            if (rect.top >= 0 && rect.bottom <= window.innerHeight) {
                currentIndex = index;
            }
        });
    }

    // Listen for scroll events and reset the forward button text when not at the last section
    window.addEventListener('scroll', () => {
        const visibleSections = Array.from(filterableSections).filter(section => !section.classList.contains('hidden'));
        const lastSection = visibleSections[visibleSections.length - 1];

        // If we're not at the last section, reset the forward button text
        if (!isElementInView(lastSection)) {
            nextButton.textContent = 'Weiter';
        }
    });

    // Helper function to check if an element is in view
    function isElementInView(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top < window.innerHeight && rect.bottom >= 0
        );
    }
}

function setupCustomSlider() {
    const sliderWrapper = document.querySelector('.custom-slider-wrapper');
    const slides = document.querySelectorAll('.custom-slide');
    const prevButton = document.querySelector('.custom-prev-button');
    const nextButton = document.querySelector('.custom-next-button');
    const paginationContainer = document.querySelector('.custom-pagination');

    let currentSlide = 0;
    const totalSlides = slides.length;

    // Create pagination dots
    for (let i = 0; i < totalSlides; i++) {
        const dot = document.createElement('div');
        dot.classList.add('custom-pagination-dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        paginationContainer.appendChild(dot);
    }

    const paginationDots = document.querySelectorAll('.custom-pagination-dot');

    // Function to go to a specific slide
    function goToSlide(slideIndex) {
        currentSlide = slideIndex;
        updateSlider();
    }

    // Update slider position and pagination dots
    function updateSlider() {
        sliderWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
        paginationDots.forEach(dot => dot.classList.remove('active'));
        paginationDots[currentSlide].classList.add('active');
    }

    // Next slide
    nextButton.addEventListener('click', () => {
        if (currentSlide < totalSlides - 1) {
            currentSlide++;
        } else {
            currentSlide = 0; // Loop back to the first slide
        }
        updateSlider();
    });

    // Previous slide
    prevButton.addEventListener('click', () => {
        if (currentSlide > 0) {
            currentSlide--;
        } else {
            currentSlide = totalSlides - 1; // Loop back to the last slide
        }
        updateSlider();
    });

    // Add touch support for mobile devices
    let startX = 0;
    let isDragging = false;

    sliderWrapper.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
    });

    sliderWrapper.addEventListener('touchmove', (e) => {
        if (isDragging) {
            const currentX = e.touches[0].clientX;
            const moveX = startX - currentX;
            if (moveX > 50) {
                nextButton.click();
                isDragging = false;
            } else if (moveX < -50) {
                prevButton.click();
                isDragging = false;
            }
        }
    });

    sliderWrapper.addEventListener('touchend', () => {
        isDragging = false;
    });
}
