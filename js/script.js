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

    // Setup custom touch-enabled slider
    setupCustomSlider();
});

// Function to setup the default carousel
function setupCarousel(carouselContainer) {
    let currentSlide = 0;
const slides = carouselContainer.querySelectorAll('.carousel-item');
const dots = carouselContainer.querySelectorAll('.dot');
const carousel = carouselContainer.querySelector('.carousel');
const prevArrow = carouselContainer.querySelector('.prev-arrow');
const nextArrow = carouselContainer.querySelector('.next-arrow');

let isDragging = false;
let startPos = 0;
let currentTranslate = 0;
let prevTranslate = 0;
let animationID = 0;
const slideWidth = slides[0].offsetWidth;

function showSlide(index) {
    if (index >= slides.length) {
        currentSlide = 0;
    } else if (index < 0) {
        currentSlide = slides.length - 1;
    } else {
        currentSlide = index;
    }

    // Move carousel
    carousel.style.transition = 'transform 0.5s ease';
    carousel.style.transform = `translateX(-${currentSlide * 100}%)`;

    // Update dots
    dots.forEach(dot => {
        dot.classList.remove('active');
        if (parseInt(dot.getAttribute('data-slide')) === currentSlide) {
            dot.classList.add('active');
        }
    });
}

// Arrow functionality
prevArrow.addEventListener('click', () => showSlide(currentSlide - 1));
nextArrow.addEventListener('click', () => showSlide(currentSlide + 1));

// Dot navigation functionality
dots.forEach(dot => {
    dot.addEventListener('click', () => showSlide(parseInt(dot.getAttribute('data-slide'))));
});

// Touch events for swipe functionality
carousel.addEventListener('touchstart', touchStart);
carousel.addEventListener('touchend', touchEnd);
carousel.addEventListener('touchmove', touchMove);

function touchStart(event) {
    startPos = event.touches[0].clientX;
    isDragging = true;
    prevTranslate = currentTranslate;
    animationID = requestAnimationFrame(animation);
}

function touchMove(event) {
    if (isDragging) {
        const currentPosition = event.touches[0].clientX;
        const distanceMoved = currentPosition - startPos;
        currentTranslate = prevTranslate + distanceMoved;
    }
}

function touchEnd() {
    isDragging = false;
    cancelAnimationFrame(animationID);
    const movedBy = currentTranslate - prevTranslate;

    // If swipe moved enough, change slides
    if (movedBy < -50 && currentSlide < slides.length - 1) {
        showSlide(currentSlide + 1);
    } else if (movedBy > 50 && currentSlide > 0) {
        showSlide(currentSlide - 1);
    } else {
        showSlide(currentSlide);
    }
}

function animation() {
    carousel.style.transform = `translateX(${currentTranslate}px)`;
    if (isDragging) requestAnimationFrame(animation);
}

// Initialize the first slide
showSlide(currentSlide);
}

// Function to handle avatar image change
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

// Function to filter projects based on selected category
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

// Function to scroll to the first visible project section
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

// Function to handle the visibility of navigation buttons when scrolling
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

// Function to handle navigation between sections
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

// Function to setup the custom touch-enabled slider
// Function to setup the custom touch-enabled slider
function setupCustomSlider() {
    const slides = document.querySelectorAll('.custom-slide');
    const prevButton = document.querySelector('.custom-prev-button');
    const nextButton = document.querySelector('.custom-next-button');
    const dots = document.querySelectorAll('.custom-pagination-dot');
    let currentSlide = 0;
    let isDragging = false;
    let startPos = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID = 0;
    let slideWidth = slides[0].offsetWidth;

    // Set the current slide and update the UI accordingly
    function setActiveSlide(index) {
        if (index >= slides.length) {
            currentSlide = slides.length - 1; // Don't go beyond the last slide
        } else if (index < 0) {
            currentSlide = 0; // Don't go beyond the first slide
        } else {
            currentSlide = index;
        }
        updateSlidePosition();
        updateDots();
    }

    // Update the carousel's slide position
    function updateSlidePosition() {
        currentTranslate = -currentSlide * slideWidth;
        slides.forEach(slide => {
            slide.style.transition = 'transform 0.3s ease-in-out'; // Smooth transition
            slide.style.transform = `translateX(${currentTranslate}px)`;
        });
    }

    // Update pagination dots to reflect the active slide
    function updateDots() {
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }

    // Event listeners for previous and next buttons
    prevButton.addEventListener('click', () => {
        if (currentSlide > 0) {
            setActiveSlide(currentSlide - 1);
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentSlide < slides.length - 1) {
            setActiveSlide(currentSlide + 1);
        }
    });

    // Event listeners for dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            setActiveSlide(index);
        });
    });

    // Touch events for swiping on mobile devices
    slides.forEach((slide, index) => {
        slide.addEventListener('touchstart', touchStart(index), { passive: true });
        slide.addEventListener('touchend', touchEnd);
        slide.addEventListener('touchmove', touchMove, { passive: true });
    });

    function touchStart(index) {
        return function (event) {
            currentSlide = index;
            startPos = event.touches[0].clientX;
            isDragging = true;
            animationID = requestAnimationFrame(animation);
        };
    }

    function touchMove(event) {
        if (isDragging) {
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
            updateSlidePosition(); // Snap back if not enough movement
        }

        prevTranslate = currentTranslate; // Save the current position for the next swipe
    }

    function animation() {
        slides.forEach(slide => {
            slide.style.transform = `translateX(${currentTranslate}px)`;
        });
        if (isDragging) requestAnimationFrame(animation);
    }

    // Ensure the carousel resizes properly on window resize
    window.addEventListener('resize', () => {
        slideWidth = slides[0].offsetWidth; // Recalculate the slide width
        updateSlidePosition(); // Update the slide position to prevent misalignment
    });

    updateSlidePosition(); // Initialize the slider's position
}

// Initialize the slider after DOM content is loaded
document.addEventListener('DOMContentLoaded', setupCustomSlider);


