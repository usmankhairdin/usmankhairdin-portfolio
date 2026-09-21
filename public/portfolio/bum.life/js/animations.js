// Add scroll-based animations
document.addEventListener('DOMContentLoaded', () => {
    // Create an Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, {
        threshold: 0.15, // Trigger when 15% of the element is visible
        rootMargin: '0px'
    });

    // Elements to observe
    const animateElements = document.querySelectorAll('.animate-on-scroll');
    animateElements.forEach(el => observer.observe(el));

    // Handle header background on scroll
    const header = document.querySelector('nav');
    const handleScroll = () => {
        if (window.scrollY > 20) {
            header.classList.add('solid');
            header.classList.remove('transparent');
        } else {
            header.classList.add('transparent');
            header.classList.remove('solid');
        }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
});