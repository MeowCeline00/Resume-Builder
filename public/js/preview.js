// This file will be used for the resume preview functionality
// For the home page, we don't need specific functionality

// Add navigation active state highlighting
document.addEventListener('DOMContentLoaded', function() {
    // Highlight current navigation item
    const currentLocation = window.location.pathname;
    const navItems = document.querySelectorAll('.main-nav ul li a');
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (currentLocation === href || (href !== '/' && currentLocation.startsWith(href))) {
            item.classList.add('active');
        }
    });
});