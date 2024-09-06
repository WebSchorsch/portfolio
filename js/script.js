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

  // Initialize navigation buttons functionality
  setupNavigationButtons();
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

function setupNavigationButtons() {
  const filterableSections = document.querySelectorAll('.filterDiv');
  
  filterableSections.forEach((section, index) => {
      const prevButton = section.querySelector('.prev-button');
      const nextButton = section.querySelector('.next-button');

      // Event listener for "Vorheriges Projekt" button
      if (prevButton) {
          prevButton.addEventListener('click', function(event) {
              event.preventDefault();
              scrollToPreviousSection(index);
          });
      }

      // Event listener for "Nächstes Projekt" button
      if (nextButton) {
          nextButton.addEventListener('click', function(event) {
              event.preventDefault();
              scrollToNextSection(index);
          });
      }
  });

  function scrollToPreviousSection(currentIndex) {
      // Find the previous visible section
      for (let i = currentIndex - 1; i >= 0; i--) {
          if (!filterableSections[i].classList.contains('hidden')) {
              filterableSections[i].scrollIntoView({ behavior: 'smooth' });
              break;
          }
      }
  }

  function scrollToNextSection(currentIndex) {
      // Check if the current section is the last visible one
      let isLastVisibleSection = true;
      for (let i = currentIndex + 1; i < filterableSections.length; i++) {
          if (!filterableSections[i].classList.contains('hidden')) {
              isLastVisibleSection = false;
              filterableSections[i].scrollIntoView({ behavior: 'smooth' });
              break;
          }
      }

      // If it is the last visible section, scroll to the top and change button text
      if (isLastVisibleSection) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          const nextButton = filterableSections[currentIndex].querySelector('.next-button');
          nextButton.textContent = 'Nach Oben';
      }
  }
}
