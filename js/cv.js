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
