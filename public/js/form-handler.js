document.addEventListener("DOMContentLoaded", () => {
    const steps = document.querySelectorAll(".form-step");
    const tabs = document.querySelectorAll(".tab");
    let currentStep = 0;
  
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
        const count = section.querySelectorAll(".entry-group").length;
  
        let html = "";
  
        if (type === "experience") {
          html = `
          <div class="entry-group experience-group">
            <input type="text" name="experience[${count}][workTitle]" placeholder="Job Title" />
            <input type="text" name="experience[${count}][workCompany]" placeholder="Company" />
            <input type="text" name="experience[${count}][location]" placeholder="Location" />
            <input type="date" name="experience[${count}][startDate]" />
            <input type="date" name="experience[${count}][endDate]" />
            <textarea name="experience[${count}][description]" placeholder="Job Description"></textarea>
          </div>`;
        }
  
        if (type === "education") {
          html = `
          <div class="entry-group education-group">
            <input type="text" name="education[${count}][institution]" placeholder="Institution" />
            <input type="text" name="education[${count}][degree]" placeholder="Degree" />
            <input type="text" name="education[${count}][location]" placeholder="Location" />
            <input type="date" name="education[${count}][startDate]" />
            <input type="date" name="education[${count}][endDate]" />
            <textarea name="education[${count}][description]" placeholder="Education Description"></textarea>
          </div>`;
        }
  
        if (type === "project") {
          html = `
          <div class="entry-group project-group">
            <input type="text" name="projects[${count}][title]" placeholder="Project Title" />
            <input type="text" name="projects[${count}][company]" placeholder="Company" />
            <textarea name="projects[${count}][description]" placeholder="Project Description"></textarea>
          </div>`;
        }
  
        if (type === "social") {
          const container = document.querySelector(".social-section");
          const index = container.querySelectorAll("input").length;
          const input = document.createElement("input");
          input.type = "url";
          input.name = `personalInfo[socials][${index}]`;
          input.placeholder = "LinkedIn/Website";
          input.className = "social-input";
          container.appendChild(input);
          return;
        }
  
        if (section) section.insertAdjacentHTML("beforeend", html);
      });
    });
  
    // Preview page actions
    const downloadBtn = document.getElementById("btn-download");
    const shareBtn = document.getElementById("btn-share");
    const printBtn = document.getElementById("btn-print");
  
    if (downloadBtn) {
      downloadBtn.addEventListener("click", () => {
        const id = downloadBtn.dataset.id;
        window.open(`/resume/download/${id}`, '_blank');
      });
    }
  
    if (shareBtn) {
      shareBtn.addEventListener("click", () => {
        const id = shareBtn.dataset.id;
        const url = `${window.location.origin}/resume/preview/${id}`;
        navigator.clipboard.writeText(url).then(() => {
          alert("Share link copied to clipboard!");
        });
      });
    }
  
    if (printBtn) {
      printBtn.addEventListener("click", () => {
        const frame = document.getElementById("resumePDFPreview");
        if (frame) frame.contentWindow.print();
      });
    }
  });