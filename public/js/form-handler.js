// public/js/form-handler.js
document.addEventListener("DOMContentLoaded", () => {
    const steps = document.querySelectorAll(".form-step");
    const tabs = document.querySelectorAll(".tab");
    let currentStep = 0;
    let previewUpdateTimeout;
  
    function showStep(stepIndex) {
      steps.forEach((step, i) => {
        step.classList.toggle("active", i === stepIndex);
        tabs[i].classList.toggle("active", i === stepIndex);
      });
    }
  
    document.querySelectorAll(".next-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        if (currentStep < steps.length - 1) {
          currentStep++;
          showStep(currentStep);
          updatePreview();
        }
      });
    });
  
    document.querySelectorAll(".back-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        if (currentStep > 0) {
          currentStep--;
          showStep(currentStep);
        }
      });
    });
  
    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => {
        currentStep = index;
        showStep(currentStep);
      });
    });
  
    // Add dynamic input groups
    document.querySelectorAll(".btn-add-entry").forEach(button => {
      button.addEventListener("click", () => {
        const type = button.dataset.add;
        const section = document.querySelector(`.${type}-section`);
        if (!section) return;
        
        const count = section.querySelectorAll(".entry-group").length;
        let html = "";
  
        if (type === "experience") {
          html = `
          <div class="entry-group experience-group">
            <div class="form-grid">
              <div class="form-group">
                <input type="text" name="experience[${count}][workTitle]" placeholder="Job Title" />
              </div>
              <div class="form-group">
                <input type="text" name="experience[${count}][workCompany]" placeholder="Company" />
              </div>
            </div>
            <div class="form-group">
              <input type="text" name="experience[${count}][location]" placeholder="Location" />
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label>Start Date</label>
                <input type="date" name="experience[${count}][startDate]" />
              </div>
              <div class="form-group">
                <label>End Date</label>
                <input type="date" name="experience[${count}][endDate]" />
              </div>
            </div>
            <div class="form-group">
              <textarea name="experience[${count}][description]" placeholder="Job Description"></textarea>
            </div>
          </div>`;
        }
  
        if (type === "education") {
          html = `
          <div class="entry-group education-group">
            <div class="form-grid">
              <div class="form-group">
                <input type="text" name="education[${count}][institution]" placeholder="Institution" />
              </div>
              <div class="form-group">
                <input type="text" name="education[${count}][degree]" placeholder="Degree" />
              </div>
            </div>
            <div class="form-group">
              <input type="text" name="education[${count}][location]" placeholder="Location" />
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label>Start Date</label>
                <input type="date" name="education[${count}][startDate]" />
              </div>
              <div class="form-group">
                <label>End Date</label>
                <input type="date" name="education[${count}][endDate]" />
              </div>
            </div>
            <div class="form-group">
              <textarea name="education[${count}][description]" placeholder="Education Description"></textarea>
            </div>
          </div>`;
        }
  
        if (type === "project") {
          html = `
          <div class="entry-group project-group">
            <div class="form-grid">
              <div class="form-group">
                <input type="text" name="projects[${count}][title]" placeholder="Project Title" />
              </div>
              <div class="form-group">
                <input type="text" name="projects[${count}][company]" placeholder="Company" />
              </div>
            </div>
            <div class="form-group">
              <textarea name="projects[${count}][description]" placeholder="Project Description"></textarea>
            </div>
          </div>`;
        }
  
        if (type === "social") {
          const container = document.querySelector(".social-section");
          if (!container) return;
          
          const index = container.querySelectorAll("input").length;
          const formGroup = document.createElement("div");
          formGroup.className = "form-group";
          
          const input = document.createElement("input");
          input.type = "url";
          input.name = `personalInfo[socials][${index}]`;
          input.placeholder = "LinkedIn/Website";
          input.className = "social-input";
          
          formGroup.appendChild(input);
          container.appendChild(formGroup);
          
          // Add event listeners to the new input
          input.addEventListener('change', updatePreview);
          input.addEventListener('blur', updatePreview);
          
          // Focus the new input
          input.focus();
          return;
        }
  
        if (section && html) {
          section.insertAdjacentHTML("beforeend", html);
          
          // Add event listeners to all new inputs and textareas
          const newElements = section.lastElementChild.querySelectorAll('input, textarea');
          newElements.forEach(element => {
            element.addEventListener('change', updatePreview);
            element.addEventListener('blur', updatePreview);
          });
          
          // Focus the first input of the new group
          const firstInput = section.lastElementChild.querySelector('input');
          if (firstInput) firstInput.focus();
          
          updatePreview();
        }
      });
    });
  
    // Function to update preview iframe with debounce
    function updatePreview() {
      clearTimeout(previewUpdateTimeout);
      previewUpdateTimeout = setTimeout(() => {
        const previewFrame = document.getElementById('resumePreview');
        if (previewFrame) {
          try {
            previewFrame.contentWindow.location.reload();
          } catch (error) {
            console.error("Error reloading preview:", error);
          }
        }
      }, 800); // Debounce for 800ms to avoid too many reloads
    }
  
    // Automatically update preview when form inputs change
    const formInputs = document.querySelectorAll('input, textarea');
    formInputs.forEach(input => {
      input.addEventListener('change', updatePreview);
      
      // For text inputs and textareas, update on keyup with debounce
      if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') {
        let timeout;
        input.addEventListener('keyup', () => {
          clearTimeout(timeout);
          timeout = setTimeout(updatePreview, 1000);
        });
      }
    });
  
    // Form submission handler - specifically fix the "Save & Preview" button
    const resumeForm = document.getElementById('resumeForm');
    const submitBtn = document.getElementById('submitButton');
    
    if (resumeForm && submitBtn) {
      // First, just log that we found the form and button
      console.log("Found form with ID:", resumeForm.id);
      console.log("Found submit button:", submitBtn.textContent);
      console.log("Form action:", resumeForm.action);
      
      // Direct submit event handler
      submitBtn.addEventListener('click', function(event) {
        console.log("Submit button clicked");
        
        // Show loading state
        this.textContent = 'Saving...';
        this.disabled = true;
        
        // Submit the form after a short delay
        setTimeout(() => {
          try {
            console.log("Submitting form to:", resumeForm.action);
            resumeForm.submit();
          } catch (error) {
            console.error("Error submitting form:", error);
            this.textContent = 'Save & Preview';
            this.disabled = false;
            alert("There was an error saving your resume. Please try again.");
          }
        }, 200);
      });
      
      // Backup form submit handler
      resumeForm.addEventListener('submit', function(event) {
        console.log("Form submit event triggered");
        
        // Disable submit button to prevent double submission
        if (submitBtn && !submitBtn.disabled) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Saving...';
        }
        
        // Let the form submit normally
      });
    } else {
      console.error("Could not find the resume form or submit button");
      if (!resumeForm) console.error("Resume form not found");
      if (!submitBtn) console.error("Submit button not found");
    }
});