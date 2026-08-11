/**
 * projects.js — Loads and displays portfolio projects on the main page.
 *
 * Projects come from: server/data/projects.json (via API)
 * To add/edit/delete projects — use the admin panel at /admin
 */

document.addEventListener("DOMContentLoaded", () => {
  loadProjects();
});

async function loadProjects() {
  const grid = document.getElementById("projects-grid");

  try {
    const res = await fetch("/api/projects");
    const projects = await res.json();

    if (projects.length === 0) {
      grid.innerHTML = '<p class="loading-text">No projects yet. Add some from the admin panel.</p>';
      return;
    }

    grid.innerHTML = projects
      .map(
        (project) => `
      <div class="project-card fade-in">
        <img class="project-thumbnail"
             src="${project.thumbnail}"
             alt="${project.title}"
             onerror="this.src='/images/placeholder-project.svg'">
        <div class="project-info">
          <div class="project-category">${project.category}</div>
          <h3 class="project-title">${project.title}</h3>
          <p class="project-description">${project.description}</p>
          <a href="/project/${project.id}" class="project-link">View Project →</a>
        </div>
      </div>
    `
      )
      .join("");
  } catch (err) {
    grid.innerHTML = '<p class="loading-text">Could not load projects.</p>';
    console.error("Could not load projects:", err);
  }
}
