// Show the "Back to Top" button when scrolling down
window.addEventListener('scroll', () => {
    const button = document.getElementById('backToTop');
    if (window.scrollY > 200) {
        button.style.display = 'flex';
    } else {
        button.style.display = 'none';
    }
});

// Smoothly scroll to the top when the button is clicked
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Contact form submission
const form = document.getElementById('contactForm');

form.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission behavior

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    if (name && email && message) {
        alert('Thank you for reaching out! Your message has been sent.');
        form.reset(); // Clear the form after submission
    } else {
        alert('Please fill in all fields before submitting.');
    }
});
