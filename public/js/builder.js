function showModal() {
    document.getElementById('resumeModal').style.display = 'flex';
  }
  
  function hideModal() {
    document.getElementById('resumeModal').style.display = 'none';
  }
  
  function createResume() {
    const titleInput = document.getElementById('resumeTitleInput');
    const title = titleInput ? titleInput.value : '';
    
    if (!title.trim()) {
      alert("Please enter a title for your resume.");
      return;
    }
  
    // Display loading state or disable button here if desired
    
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
  
  function openResume(id) {
    if (!id) return;
    window.location.href = `/resume/edit/${id}`;
  }
  
  function deleteResume(id) {
    if (!id) return;
    
    if (!confirm("Are you sure you want to delete this resume? This action cannot be undone.")) {
      return;
    }
    
    fetch(`/resume/delete/${id}`, { 
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Server error: ' + response.status);
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        window.location.reload();
      } else {
        throw new Error(data.error || 'Failed to delete resume');
      }
    })
    .catch(error => {
      console.error('Error deleting resume:', error);
      alert('Failed to delete resume. Please try again.');
    });
  }
  
  function toggleMenu(btn) {
    if (!btn) return;
    
    // Close all other open menus first
    document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
      if (menu !== btn.nextElementSibling) {
        menu.classList.remove('show');
      }
    });
    
    // Toggle this menu
    const menu = btn.nextElementSibling;
    if (menu) {
      menu.classList.toggle('show');
      
      // Close menu when clicking outside
      const closeMenu = function(e) {
        if (!menu.contains(e.target) && e.target !== btn) {
          menu.classList.remove('show');
          document.removeEventListener('click', closeMenu);
        }
      };
      
      if (menu.classList.contains('show')) {
        setTimeout(() => {
          document.addEventListener('click', closeMenu);
        }, 0);
      }
    }
  }
  
  function renameResume(id, currentName) {
    if (!id) return;
    
    const newName = prompt("Enter a new name for the resume:", currentName || '');
    if (!newName || newName === currentName) return;
    
    fetch(`/resume/${id}/rename`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ newTitle: newName })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Server error: ' + response.status);
      }
      return response.json();
    })
    .then(() => {
      window.location.reload();
    })
    .catch(error => {
      console.error('Error renaming resume:', error);
      alert('Failed to rename resume. Please try again.');
    });
  }
  
  function duplicateResume(id) {
    if (!id) return;
    
    fetch(`/resume/${id}/duplicate`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Server error: ' + response.status);
      }
      return response.json();
    })
    .then(() => {
      window.location.reload();
    })
    .catch(error => {
      console.error('Error duplicating resume:', error);
      alert('Failed to duplicate resume. Please try again.');
    });
  }
  
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
    .then(response => {
      if (!response.ok) {
        throw new Error('Server error: ' + response.status);
      }
      return response.json();
    })
    .then(() => {
      window.location.reload();
    })
    .catch(error => {
      console.error('Error updating resume lock status:', error);
      alert('Failed to update resume lock status. Please try again.');
    });
  }
  
  // Initialize any event listeners when the DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    // Add event handler for the modal close button if it exists
    const closeModalBtn = document.querySelector('.modal .close-btn');
    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', hideModal);
    }
    
    // Close modal when clicking outside of it
    const modal = document.getElementById('resumeModal');
    if (modal) {
      modal.addEventListener('click', function(event) {
        if (event.target === modal) {
          hideModal();
        }
      });
    }
  });