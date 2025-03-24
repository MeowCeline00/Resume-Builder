// public/js/preview-controls.js

// This script only runs on the preview page and controls the download, share, and print functionality.
document.addEventListener("DOMContentLoaded", () => {
    const downloadBtn = document.getElementById("btn-download");
    const shareBtn = document.getElementById("btn-share");
    const printBtn = document.getElementById("btn-print");
    const resumeId = document.getElementById("resumePreviewWrapper")?.dataset?.resumeId;
  
    if (downloadBtn && resumeId) {
      downloadBtn.addEventListener("click", () => {
        window.open(`/resume/download/${resumeId}`, "_blank");
      });
    }
  
    if (shareBtn) {
      shareBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
          alert("Resume preview link copied to clipboard!");
        } catch (err) {
          alert("Failed to copy the link.");
        }
      });
    }
  
    if (printBtn) {
      printBtn.addEventListener("click", () => {
        window.frames["resumePreview"].focus();
        window.frames["resumePreview"].print();
      });
    }
  });
  