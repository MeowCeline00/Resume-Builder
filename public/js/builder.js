function showModal() {
    document.getElementById('resumeModal').style.display = 'flex';
  }
  
  function hideModal() {
    document.getElementById('resumeModal').style.display = 'none';
  }
  
  function createResume() {
    const title = document.getElementById('resumeTitleInput').value;
    if (!title.trim()) return alert("Please enter a title.");
  
    fetch('/resume/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    })
    .then(res => res.json())
    .then(data => {
      window.location.href = `/resume/edit/${data.id}`;
    });
  }
  
  function openResume(id) {
    window.location.href = `/resume/edit/${id}`;
  }
  
  function deleteResume(id) {
    if (!confirm("Delete this resume?")) return;
    fetch(`/resume/delete/${id}`, { method: 'DELETE' })
      .then(() => window.location.reload());
  }
  
  function toggleMenu(btn) {
    const menu = btn.nextElementSibling;
    menu.classList.toggle("show");
  }
  