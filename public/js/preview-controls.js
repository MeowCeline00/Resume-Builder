// public/js/preview-controls.js

// This script only runs on the preview page and controls the download, share, and print functionality.
document.addEventListener("DOMContentLoaded", () => {
    const downloadBtn = document.getElementById("btn-download");
    const shareBtn = document.getElementById("btn-share");
    const printBtn = document.getElementById("btn-print");
    const resumeId = document.getElementById("resumePreviewWrapper")?.dataset?.resumeId;
  
    if (downloadBtn && resumeId) {
      downloadBtn.addEventListener("click", () => {
        downloadBtn.disabled = true;
        downloadBtn.style.opacity = '0.7';
        
        try {
          window.open(`/resume/download/${resumeId}`, "_blank");
        } catch (error) {
          console.error("Error opening download window:", error);
          alert("There was an error downloading your resume. Please try again.");
        }
        
        // Re-enable the button after a short delay
        setTimeout(() => {
          downloadBtn.disabled = false;
          downloadBtn.style.opacity = '1';
        }, 1000);
      });
    }
  
    if (shareBtn) {
      shareBtn.addEventListener("click", async () => {
        shareBtn.disabled = true;
        shareBtn.style.opacity = '0.7';
        
        try {
          // Try Web Share API first if available
          if (navigator.share) {
            await navigator.share({
              title: 'My Resume',
              url: window.location.href
            });
          } else {
            // Fall back to clipboard
            await navigator.clipboard.writeText(window.location.href);
            alert("Resume preview link copied to clipboard!");
          }
        } catch (err) {
          console.error("Error sharing:", err);
          alert("Failed to copy or share the link.");
        }
        
        // Re-enable the button after a short delay
        setTimeout(() => {
          shareBtn.disabled = false;
          shareBtn.style.opacity = '1';
        }, 1000);
      });
    }
  
    if (printBtn) {
      printBtn.addEventListener("click", () => {
        printBtn.disabled = true;
        printBtn.style.opacity = '0.7';
        
        try {
          // Get the resume preview iframe
          const previewFrame = window.frames["resumePreview"];
          if (previewFrame) {
            previewFrame.focus();
            previewFrame.print();
          } else {
            // Fallback to window print if iframe method fails
            window.print();
          }
        } catch (error) {
          console.error("Error printing:", error);
          alert("There was an error printing your resume. Please try again.");
        }
        
        // Re-enable the button after a short delay
        setTimeout(() => {
          printBtn.disabled = false;
          printBtn.style.opacity = '1';
        }, 1000);
      });
    }
    
    // Add save button functionality if it exists
    const saveBtn = document.querySelector('a[href*="save-preview"]');
    if (saveBtn) {
      saveBtn.addEventListener('click', function(e) {
        // Show saving indicator on the button
        const originalText = this.textContent;
        this.textContent = 'Saving...';
        
        // Let the link navigate normally
      });
    }
});