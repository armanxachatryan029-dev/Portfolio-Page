/**
 * projects.js — Portfolio showcase from /api/projects
 * Admin panel: /admin
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
      grid.innerHTML =
        '<p class="loading-text">No projects yet. Add some from the admin panel.</p>';
      return;
    }

    const featured = projects[0];
    const rest = projects.slice(1);

    let html = renderFeaturedProject(featured);

    if (rest.length > 0) {
      html += `<div class="work-grid">${rest.map((p) => renderProjectCard(p)).join("")}</div>`;
    }

    grid.innerHTML = html;

    grid.querySelectorAll(".reveal, .work-featured, .project-card").forEach((el, i) => {
      el.classList.add("reveal");
      if (i > 0) el.classList.add("reveal-delay-" + Math.min(i, 4));
      if (window.scrollRevealObserver) window.scrollRevealObserver.observe(el);
    });
  } catch (err) {
    grid.innerHTML = '<p class="loading-text">Could not load projects.</p>';
    console.error("Could not load projects:", err);
  }
}

function hasVideo(project) {
  return (
    project.projectType === "video" && (project.videoFile || project.videoUrl)
  );
}

function renderFeaturedProject(project) {
  const playBtn = hasVideo(project)
    ? `<div class="project-play" aria-hidden="true"><span>PLAY</span></div>`
    : "";

  return `
    <article class="work-featured reveal">
      <a href="/project/${project.id}" class="work-featured-link">
        <div class="work-featured-media">
          <span class="project-badge project-badge--lg">Featured Project</span>
          ${playBtn}
          <img class="project-thumbnail"
               src="${project.thumbnail}"
               alt="${project.title}"
               onerror="this.src='/images/placeholder-project.svg'">
          <div class="project-card-overlay"></div>
        </div>
        <div class="work-featured-body">
          <span class="project-category">${project.category}</span>
          <h3 class="project-title project-title--xl">${project.title}</h3>
          <p class="project-description">${project.description}</p>
          <span class="project-cta">
            View Project <span class="project-arrow">→</span>
          </span>
        </div>
      </a>
    </article>`;
}

function renderProjectCard(project) {
  const playBtn = hasVideo(project)
    ? `<div class="project-play project-play--sm" aria-hidden="true"><span>▶</span></div>`
    : "";

  return `
    <article class="project-card">
      <a href="/project/${project.id}" class="project-card-link">
        <div class="project-card-media">
          ${playBtn}
          <img class="project-thumbnail"
               src="${project.thumbnail}"
               alt="${project.title}"
               onerror="this.src='/images/placeholder-project.svg'">
          <div class="project-card-overlay"></div>
          <div class="project-card-hover-info">
            <span class="project-category">${project.category}</span>
          </div>
        </div>
        <div class="project-card-body">
          <h3 class="project-title">${project.title}</h3>
          <p class="project-description">${project.description}</p>
          <span class="project-cta">
            View <span class="project-arrow">→</span>
          </span>
        </div>
      </a>
    </article>`;
}
