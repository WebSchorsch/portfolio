document.addEventListener("DOMContentLoaded", function() {
    const radios = document.querySelectorAll('input[name="image"]');
    const avatarImage = document.querySelector('.avatare');

    radios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                avatarImage.src = this.value;
            }
        });
    });
});

