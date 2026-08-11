/**
 * admin.js — Admin panel logic: login, add/edit/delete projects.
 *
 * Login credentials are in .env file (ADMIN_USERNAME, ADMIN_PASSWORD).
 */

document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  setupLoginForm();
  setupLogout();
  setupProjectForm();
  setupProjectTypeToggle();
});

const loginSection = document.getElementById("login-section");
const dashboardSection = document.getElementById("dashboard-section");

// Check if already logged in
async function checkAuth() {
  try {
    const res = await fetch("/api/auth/check");
    const data = await res.json();

    if (data.isAdmin) {
      showDashboard();
    } else {
      showLogin();
    }
  } catch (err) {
    showLogin();
  }
}

function showLogin() {
  loginSection.classList.remove("hidden");
  dashboardSection.classList.add("hidden");
}

function showDashboard() {
  loginSection.classList.add("hidden");
  dashboardSection.classList.remove("hidden");
  loadAdminProjects();
}

// Login form
function setupLoginForm() {
  document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;
    const errorEl = document.getElementById("login-error");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        errorEl.textContent = "";
        showDashboard();
      } else {
        errorEl.textContent = data.error || "Login failed.";
      }
    } catch (err) {
      errorEl.textContent = "Connection error.";
    }
  });
}

// Logout button
function setupLogout() {
  document.getElementById("logout-btn").addEventListener("click", async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    showLogin();
  });
}

// Toggle video/link fields based on project type
function setupProjectTypeToggle() {
  const typeSelect = document.getElementById("project-type");
  const videoFields = document.getElementById("video-fields");
  const linkField = document.getElementById("link-field");

  typeSelect.addEventListener("change", () => {
    if (typeSelect.value === "video") {
      videoFields.classList.remove("hidden");
      linkField.classList.add("hidden");
    } else {
      videoFields.classList.add("hidden");
      linkField.classList.remove("hidden");
    }
  });
}

// Add / Edit project form
function setupProjectForm() {
  const form = document.getElementById("project-form");
  const cancelBtn = document.getElementById("cancel-edit-btn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    await saveProject();
  });

  cancelBtn.addEventListener("click", () => {
    resetForm();
  });
}

async function saveProject() {
  const id = document.getElementById("project-id").value;
  const formData = new FormData();

  formData.append("title", document.getElementById("project-title").value);
  formData.append("description", document.getElementById("project-description").value);
  formData.append("category", document.getElementById("project-category").value);
  formData.append("projectType", document.getElementById("project-type").value);
  formData.append("videoUrl", document.getElementById("project-video-url").value);
  formData.append("projectUrl", document.getElementById("project-url").value);

  const thumbnailFile = document.getElementById("project-thumbnail").files[0];
  if (thumbnailFile) formData.append("thumbnail", thumbnailFile);

  const videoFile = document.getElementById("project-video").files[0];
  if (videoFile) formData.append("video", videoFile);

  const messageEl = document.getElementById("form-message");
  const isEdit = !!id;
  const url = isEdit ? "/api/projects/" + id : "/api/projects";
  const method = isEdit ? "PUT" : "POST";

  try {
    const res = await fetch(url, { method, body: formData });
    const data = await res.json();

    if (res.ok) {
      messageEl.textContent = isEdit ? "Project updated!" : "Project added!";
      messageEl.className = "form-message success";
      resetForm();
      loadAdminProjects();
    } else {
      messageEl.textContent = data.error || "Something went wrong.";
      messageEl.className = "form-message error";
    }
  } catch (err) {
    messageEl.textContent = "Connection error.";
    messageEl.className = "form-message error";
  }
}

// Load projects list in admin dashboard
async function loadAdminProjects() {
  const list = document.getElementById("admin-project-list");

  try {
    const res = await fetch("/api/projects");
    const projects = await res.json();

    if (projects.length === 0) {
      list.innerHTML = '<p class="loading-text">No projects yet.</p>';
      return;
    }

    list.innerHTML = projects
      .map(
        (p) => `
      <div class="admin-project-item">
        <img class="admin-project-thumb" src="${p.thumbnail}" alt="${p.title}"
             onerror="this.src='/images/placeholder-project.svg'">
        <div class="admin-project-info">
          <h3>${p.title}</h3>
          <span>${p.category}</span>
        </div>
        <div class="admin-project-actions">
          <button class="btn-edit" onclick="editProject('${p.id}')">Edit</button>
          <button class="btn-delete" onclick="deleteProject('${p.id}')">Delete</button>
        </div>
      </div>
    `
      )
      .join("");
  } catch (err) {
    list.innerHTML = '<p class="loading-text">Could not load projects.</p>';
  }
}

// Edit project — fill form with existing data
async function editProject(id) {
  try {
    const res = await fetch("/api/projects/" + id);
    const project = await res.json();

    document.getElementById("project-id").value = project.id;
    document.getElementById("project-title").value = project.title;
    document.getElementById("project-description").value = project.description;
    document.getElementById("project-category").value = project.category;
    document.getElementById("project-type").value = project.projectType;
    document.getElementById("project-video-url").value = project.videoUrl || "";
    document.getElementById("project-url").value = project.projectUrl || "";

    document.getElementById("form-title").textContent = "Edit Project";
    document.getElementById("submit-btn").textContent = "Save Changes";
    document.getElementById("cancel-edit-btn").classList.remove("hidden");

    // Toggle fields
    const typeSelect = document.getElementById("project-type");
    if (typeSelect.value === "video") {
      document.getElementById("video-fields").classList.remove("hidden");
      document.getElementById("link-field").classList.add("hidden");
    } else {
      document.getElementById("video-fields").classList.add("hidden");
      document.getElementById("link-field").classList.remove("hidden");
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (err) {
    alert("Could not load project for editing.");
  }
}

// Delete project
async function deleteProject(id) {
  if (!confirm("Are you sure you want to delete this project?")) return;

  try {
    const res = await fetch("/api/projects/" + id, { method: "DELETE" });
    if (res.ok) {
      loadAdminProjects();
    } else {
      alert("Could not delete project.");
    }
  } catch (err) {
    alert("Connection error.");
  }
}

// Reset form to "Add Project" mode
function resetForm() {
  document.getElementById("project-form").reset();
  document.getElementById("project-id").value = "";
  document.getElementById("form-title").textContent = "Add Project";
  document.getElementById("submit-btn").textContent = "Add Project";
  document.getElementById("cancel-edit-btn").classList.add("hidden");
  document.getElementById("form-message").textContent = "";
  document.getElementById("video-fields").classList.remove("hidden");
  document.getElementById("link-field").classList.add("hidden");
}
