function toggleDropdown(resumeId) {
    const dropdown = document.getElementById(`dropdown-${resumeId}`);
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

// Hide dropdown when clicking outside
document.addEventListener('click', function (event) {
    if (!event.target.matches('.options-btn')) {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.style.display = 'none';
        });
    }
});

// Resume Actions (Placeholder Functions)
function renameResume(id) {
    alert(`Rename function for Resume ID: ${id}`);
}

function lockResume(id) {
    alert(`Lock function for Resume ID: ${id}`);
}

function deleteResume(id) {
    if (confirm("Are you sure you want to delete this resume?")) {
        fetch(`/resume/delete/${id}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                alert("Resume deleted successfully!");
                window.location.reload();
            })
            .catch(error => console.error('Error:', error));
    }
}
