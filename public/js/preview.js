// This file handles both navigation active state and resume card interactions

document.addEventListener('DOMContentLoaded', function () {
    // Highlight current navigation item
    const currentLocation = window.location.pathname;
    const navItems = document.querySelectorAll('.main-nav ul li a');

    navItems.forEach(item => {
        const href = item.getAttribute('href');

        // Ensure correct syntax for matching paths
        if (
            currentLocation === href ||
            (href !== '/' && currentLocation.startsWith(href) &&
                (currentLocation.length === href.length || currentLocation.charAt(href.length) === '/'))
        ) {
            item.classList.add('active');
        }
    });

    // Handle resume card interactions on the resume list page
    setupResumeCardInteractions();
});

// Date formatting utilities
if (!Date.prototype.toRelativeTime) {
    Date.prototype.toRelativeTime = function () {
        const now = new Date();
        const diffMs = now - this;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffDay > 30) {
            return `${Math.floor(diffDay / 30)} month${Math.floor(diffDay / 30) > 1 ? 's' : ''} ago`;
        } else if (diffDay > 0) {
            return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
        } else if (diffHour > 0) {
            return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
        } else if (diffMin > 0) {
            return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
        } else {
            return 'just now';
        }
    };
}

function setupResumeCardInteractions() {
    // Only run this if we're on the resume list page
    const resumeCards = document.querySelectorAll('.existing-resume-card');
    if (resumeCards.length === 0) return;

    // Close all dropdowns when clicking outside
    document.addEventListener('click', function (event) {
        const dropdowns = document.querySelectorAll('.resume-actions-dropdown');
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    });

    // Toggle dropdown for each resume card
    resumeCards.forEach(card => {
        card.addEventListener('click', function (event) {
            event.stopPropagation();
            const resumeId = this.getAttribute('data-resume-id');
            const dropdown = document.getElementById(`actions-dropdown-${resumeId}`);

            // Close all other dropdowns first
            document.querySelectorAll('.resume-actions-dropdown').forEach(d => {
                if (d !== dropdown) {
                    d.classList.remove('active');
                }
            });

            // Toggle this dropdown
            dropdown.classList.toggle('active');
        });
    });

    // Prevent dropdown from closing when clicking inside it
    document.querySelectorAll('.resume-actions-dropdown').forEach(dropdown => {
        dropdown.addEventListener('click', function (event) {
            event.stopPropagation();
        });
    });

    // Confirm before deleting
    document.querySelectorAll('.delete-form').forEach(form => {
        form.addEventListener('submit', function (event) {
            if (!confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
                event.preventDefault();
            }
        });
    });
}