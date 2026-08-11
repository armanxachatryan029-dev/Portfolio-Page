/**
 * main.js — Loads profile data and sets up navigation.
 *
 * Profile data comes from: server/data/profile.json
 * To change your name, bio, skills, etc. — edit that file.
 */

document.addEventListener("DOMContentLoaded", () => {
  loadProfile();
  setupNavigation();
  setupFooter();
});

// Load profile data from API and fill the page
async function loadProfile() {
  try {
    const res = await fetch("/api/profile");
    const profile = await res.json();

    // Hero section
    document.getElementById("hero-title").textContent = profile.heroTitle;
    document.getElementById("hero-subtitle").textContent = profile.heroSubtitle;
    document.getElementById("hero-description").textContent = profile.heroDescription;

    // Navigation name
    document.getElementById("nav-name").textContent = profile.name;
    document.title = profile.name + " — Portfolio";

    // About section
    document.getElementById("about-name").textContent = profile.name;
    document.getElementById("about-age").textContent = profile.age;
    document.getElementById("about-location").textContent = profile.location;
    document.getElementById("about-direction").textContent = profile.mainDirection;
    document.getElementById("about-text").textContent = profile.about;

    // Interests tags
    const interestsEl = document.getElementById("about-interests");
    interestsEl.innerHTML = profile.interests
      .map((item) => `<span class="interest-tag">${item}</span>`)
      .join("");

    // Skills cards
    const skillsGrid = document.getElementById("skills-grid");
    skillsGrid.innerHTML = profile.skills
      .map((skill) => `<div class="skill-card">${skill}</div>`)
      .join("");

    // Contact links
    const contactEl = document.getElementById("contact-links");
    contactEl.innerHTML = `
      <a href="mailto:${profile.email}" class="contact-item">
        <span class="contact-label">Email</span>
        <span class="contact-value">${profile.email}</span>
      </a>
      <a href="${profile.social.github}" target="_blank" class="contact-item">
        <span class="contact-label">GitHub</span>
        <span class="contact-value">GitHub</span>
      </a>
      <a href="${profile.social.instagram}" target="_blank" class="contact-item">
        <span class="contact-label">Instagram</span>
        <span class="contact-value">Instagram</span>
      </a>
      <a href="${profile.social.youtube}" target="_blank" class="contact-item">
        <span class="contact-label">YouTube</span>
        <span class="contact-value">YouTube</span>
      </a>
    `;
  } catch (err) {
    console.error("Could not load profile:", err);
  }
}

// Mobile hamburger menu toggle
function setupNavigation() {
  const toggle = document.getElementById("nav-toggle");
  const links = document.getElementById("nav-links");

  toggle.addEventListener("click", () => {
    links.classList.toggle("active");
  });

  // Close menu when a link is clicked
  links.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      links.classList.remove("active");
    });
  });
}

// Footer year and name
function setupFooter() {
  document.getElementById("footer-year").textContent = new Date().getFullYear();
}
