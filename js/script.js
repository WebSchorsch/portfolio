document.addEventListener('DOMContentLoaded', function() {
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
});

function setupCarousel(carouselContainer) {
    let currentSlide = 0;
    const slides = carouselContainer.querySelectorAll('.carousel-item');
    const carousel = carouselContainer.querySelector('.carousel');
    const prevArrow = carouselContainer.querySelector('.prev-arrow');
    const nextArrow = carouselContainer.querySelector('.next-arrow');
    const totalSlides = slides.length;

    let isDragging = false;
    let startX = 0;
    let currentX = 0;
    let translateX = 0;

    // Move to a specific slide
    function moveToSlide(index) {
        currentSlide = index;
        translateX = -currentSlide * 100;
        carousel.style.transition = 'transform 0.4s ease'; // Smooth transition
        carousel.style.transform = `translateX(${translateX}%)`;
    }

    // Handle swipe start
    function touchStart(event) {
        isDragging = true;
        startX = event.touches[0].clientX;
        carousel.style.transition = 'none'; // Disable transition for immediate drag
    }

    // Handle swipe move
    function touchMove(event) {
        if (!isDragging) return;
        const touchX = event.touches[0].clientX;
        currentX = touchX - startX;

        // Update the carousel position based on swipe movement
        const percentageMove = (currentX / carouselContainer.offsetWidth) * 100;
        carousel.style.transform = `translateX(calc(${translateX}% + ${percentageMove}%))`;
    }

    // Handle swipe end
    function touchEnd() {
        if (!isDragging) return;
        isDragging = false;

        // Determine if the swipe distance is significant to move to the next or previous slide
        if (currentX < -50) {
            moveToSlide(Math.min(currentSlide + 1, totalSlides - 1)); // Swipe left
        } else if (currentX > 50) {
            moveToSlide(Math.max(currentSlide - 1, 0)); // Swipe right
        } else {
            moveToSlide(currentSlide); // Stay on current slide
        }

        currentX = 0; // Reset swipe distance
    }

    // Initialize the first slide
    moveToSlide(currentSlide);

    // Add touch event listeners
    carousel.addEventListener('touchstart', touchStart);
    carousel.addEventListener('touchmove', touchMove);
    carousel.addEventListener('touchend', touchEnd);

    // Arrow buttons navigation
    prevArrow.addEventListener('click', () => moveToSlide(Math.max(currentSlide - 1, 0)));
    nextArrow.addEventListener('click', () => moveToSlide(Math.min(currentSlide + 1, totalSlides - 1)));
}


const swiper = new Swiper('.swiper-container', {
    // Optional parameters
    direction: 'horizontal',
    loop: true,
    speed: 400,

    // Enable pagination (dots)
    pagination: {
       el: '.swiper-pagination',
       clickable: true,
    },

    // Navigation arrows
    navigation: {
       nextEl: '.swiper-button-next',
       prevEl: '.swiper-button-prev',
    },

    // Enable touch gestures
    grabCursor: true,

    // Enable auto-height (if slides have different heights)
    autoHeight: true,
 });



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
