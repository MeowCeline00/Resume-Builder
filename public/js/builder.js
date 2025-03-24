// Show modal for new resume
function showModal() {
    const modal = document.getElementById('resumeModal');
    if (modal) {
      modal.style.display = 'flex';
      // Focus on the input field
      setTimeout(() => {
        document.getElementById('resumeTitleInput').focus();
      }, 100);
    }
  }
  
  // Hide modal
  function hideModal() {
    const modal = document.getElementById('resumeModal');
    if (modal) {
      modal.style.display = 'none';
      // Clear the input field
      const titleInput = document.getElementById('resumeTitleInput');
      if (titleInput) {
        titleInput.value = '';
      }
    }
  }
  
  // Create new resume
  function createResume() {
    const titleInput = document.getElementById('resumeTitleInput');
    const title = titleInput ? titleInput.value.trim() : '';
    
    if (!title) {
      alert("Please enter a title for your resume.");
      return;
    }
    
    fetch('/resume/create', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ title: title })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Server error: ' + response.status);
      }
      return response.json();
    })
    .then(data => {
      if (data.success && data.id) {
        window.location.href = `/resume/edit/${data.id}`;
      } else {
        throw new Error('Invalid response from server');
      }
    })
    .catch(error => {
      console.error('Error creating resume:', error);
      alert('Failed to create resume. Please try again.');
    });
  }
  
  // Handle resume card click
  document.addEventListener('DOMContentLoaded', function() {
    // Close modal when clicking outside content
    const modal = document.getElementById('resumeModal');
    if (modal) {
      modal.addEventListener('click', function(event) {
        if (event.target === modal) {
          hideModal();
        }
      });
    }
    
    // Handle Enter key in title input
    const titleInput = document.getElementById('resumeTitleInput');
    if (titleInput) {
      titleInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
          createResume();
        }
      });
    }
    
    // Handle resume card clicks
    const resumeCards = document.querySelectorAll('.existing-resume-card');
    resumeCards.forEach(card => {
      card.addEventListener('click', function(event) {
        event.stopPropagation();
        const resumeId = this.getAttribute('data-resume-id');
        const dropdown = document.getElementById(`actions-dropdown-${resumeId}`);
        
        // Close all other dropdowns
        document.querySelectorAll('.resume-actions-dropdown.active').forEach(el => {
          if (el !== dropdown) {
            el.classList.remove('active');
          }
        });
        
        // Toggle this dropdown
        dropdown.classList.toggle('active');
      });
    });
    
    // Close dropdowns when clicking elsewhere
    document.addEventListener('click', function() {
      document.querySelectorAll('.resume-actions-dropdown.active').forEach(dropdown => {
        dropdown.classList.remove('active');
      });
    });
    
    // Prevent dropdown clicks from closing the dropdown
    document.querySelectorAll('.resume-actions-dropdown').forEach(dropdown => {
      dropdown.addEventListener('click', function(e) {
        e.stopPropagation();
      });
    });
  });
  
  // Open resume
  function openResume(id) {
    if (id) {
      window.location.href = `/resume/edit/${id}`;
    }
  }
  
  // Delete resume
  function deleteResume(id) {
    if (!id) return;
    
    if (!confirm('Are you sure you want to delete this resume? This action cannot be undone.')) {
      return;
    }
    
    fetch(`/resume/delete/${id}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        window.location.reload();
      } else {
        alert(data.error || 'Failed to delete resume');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred while deleting the resume');
    });
  }
  
  // Rename resume
  function renameResume(id, currentName) {
    if (!id) return;
    
    const newName = prompt('Enter a new name for your resume:', currentName || '');
    if (!newName || newName === currentName) return;
    
    fetch(`/resume/${id}/rename`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ newTitle: newName })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        window.location.reload();
      } else {
        alert(data.error || 'Failed to rename resume');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred while renaming the resume');
    });
  }
  
  // Duplicate resume
  function duplicateResume(id) {
    if (!id) return;
    
    fetch(`/resume/${id}/duplicate`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        window.location.reload();
      } else {
        alert(data.error || 'Failed to duplicate resume');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred while duplicating the resume');
    });
  }
  
  // Toggle lock status
  function lockResume(id, lock) {
    if (!id) return;
    
    fetch(`/resume/${id}/lock`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ lock })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        window.location.reload();
      } else {
        alert(data.error || 'Failed to update lock status');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      alert('An error occurred while updating lock status');
    });
  }