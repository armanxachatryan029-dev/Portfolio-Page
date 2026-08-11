/**
 * project-page.js — Shows a single project with video player or external link.
 *
 * Supports:
 *   - Local video files (MP4, WebM)
 *   - YouTube URLs
 *   - External project links
 */

document.addEventListener("DOMContentLoaded", () => {
  loadProjectDetail();
});

async function loadProjectDetail() {
  const content = document.getElementById("project-content");

  // Get project ID from URL: /project/abc123
  const id = window.location.pathname.split("/project/")[1];
  if (!id) {
    content.innerHTML = "<p>Project not found.</p>";
    return;
  }

  try {
    const res = await fetch("/api/projects/" + id);
    if (!res.ok) {
      content.innerHTML = "<p>Project not found.</p>";
      return;
    }

    const project = await res.json();
    document.title = project.title + " — Portfolio";

    let mediaHTML = "";

    if (project.projectType === "video") {
      if (project.videoFile) {
        // Local video file (MP4 / WebM)
        mediaHTML = `
          <div class="project-video-wrapper">
            <video controls>
              <source src="${project.videoFile}" type="video/mp4">
              Your browser does not support video playback.
            </video>
          </div>`;
      } else if (project.videoUrl) {
        // YouTube or other embed URL
        const embedUrl = getYouTubeEmbed(project.videoUrl);
        if (embedUrl) {
          mediaHTML = `
            <div class="project-video-wrapper">
              <iframe src="${embedUrl}" allowfullscreen></iframe>
            </div>`;
        } else {
          mediaHTML = `
            <div class="project-video-wrapper">
              <video controls>
                <source src="${project.videoUrl}">
              </video>
            </div>`;
        }
      }
    }

    if (project.projectType === "link" && project.projectUrl) {
      mediaHTML += `
        <div class="project-external-link">
          <a href="${project.projectUrl}" target="_blank" class="btn btn-primary">Open Project →</a>
        </div>`;
    }

    content.innerHTML = `
      <h1 class="project-detail-title">${project.title}</h1>
      <div class="project-detail-category">${project.category}</div>
      <p class="project-detail-description">${project.description}</p>
      ${mediaHTML}
    `;
  } catch (err) {
    content.innerHTML = "<p>Could not load project.</p>";
    console.error(err);
  }
}

// Convert YouTube watch URL to embed URL
function getYouTubeEmbed(url) {
  if (!url) return null;

  let videoId = null;

  // youtube.com/watch?v=ID
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) videoId = watchMatch[1];

  // youtu.be/ID
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) videoId = shortMatch[1];

  // Already an embed URL
  if (url.includes("/embed/")) return url;

  if (videoId) {
    return "https://www.youtube.com/embed/" + videoId;
  }

  return null;
}
