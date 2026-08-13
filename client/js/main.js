/**
 * main.js — Profile loading, navigation, scroll effects.
 * Data source: /api/profile (unchanged)
 */

document.addEventListener("DOMContentLoaded", () => {
  loadProfile();
  setupNavigation();
  setupFooter();
  setupScrollReveal();
  setupNavbarScroll();
});

/* Skill groups — only items present in profile.json are rendered */
const SKILL_GROUPS = {
  "3D Animation": {
    icon: "◆",
    items: ["3D Animation", "Animation", "Blender", "Maya", "Video Editing"],
    interests: ["Character Animation", "Fight Animation"],
  },
  Programming: {
    icon: "▸",
    items: ["Python", "JavaScript", "Node.js", "Machine Learning"],
    interests: ["Programming"],
  },
};

async function loadProfile() {
  try {
    const res = await fetch("/api/profile");
    const profile = await res.json();

    const nameParts = profile.name.trim().split(/\s+/);
    const firstName = nameParts[0] || "ARMAN";
    const lastName = nameParts.slice(1).join(" ") || "KHACHATRYAN";

    document.getElementById("hero-name-first").textContent = firstName.toUpperCase();
    document.getElementById("hero-name-last").textContent = lastName.toUpperCase();
    document.getElementById("hero-eyebrow").textContent = profile.heroSubtitle;
    document.getElementById("hero-description").textContent = profile.heroDescription;
    document.getElementById("hero-location").textContent = profile.location;
    document.getElementById("hero-role").textContent = profile.heroSubtitle.split("&")[0].trim();
    document.title = profile.name + " — Portfolio";

    const tagItems = profile.interests.slice(0, 4).join(" • ");
    document.getElementById("hero-tags").textContent = tagItems;

    document.getElementById("about-age").textContent = profile.age;
    document.getElementById("about-location").textContent = profile.location;
    document.getElementById("about-direction").textContent = profile.heroSubtitle.split("&")[0].trim();
    document.getElementById("about-focus").textContent = profile.mainDirection;
    document.getElementById("about-lead").textContent = profile.about.split(".")[0] + ".";
    document.getElementById("about-text").textContent = profile.about;

    document.getElementById("about-interests").innerHTML = profile.interests
      .map((item) => `<span class="interest-tag">${item}</span>`)
      .join("");

    const tools = profile.skills.filter((s) => ["Blender", "Maya"].includes(s));
    document.getElementById("about-tools").innerHTML = tools
      .map((t) => `<span class="tool-pill">${t}</span>`)
      .join("");

    renderStats(profile);
    renderSkills(profile);
    renderJourney(profile);
    renderMarquee(profile);
    renderContact(profile);
    renderFooterSocial(profile);

    document.getElementById("footer-name").textContent = profile.name;
    document.getElementById("footer-tagline").textContent =
      profile.heroSubtitle.split("&")[0].trim().toUpperCase();

    const ageLabel = document.querySelector(".hero-float-label--3");
    if (ageLabel) ageLabel.textContent = String(profile.age).padStart(3, "0");

    const heroPills = document.querySelector(".hero-visual-stats");
    if (heroPills && tools.length) {
      heroPills.innerHTML = tools.map((t) => `<div class="hero-stat-pill">${t.toUpperCase()}</div>`).join("");
    }
  } catch (err) {
    console.error("Could not load profile:", err);
  }
}

function renderStats(profile) {
  const stats = [
    { label: "3D", sub: "Animation" },
    { label: "Character", sub: "Animation" },
    { label: "Programming", sub: "Development" },
    { label: "Creative", sub: "Projects" },
  ].filter((_, i) => {
    if (i === 0) return profile.interests.includes("3D Animation") || profile.skills.includes("3D Animation");
    if (i === 1) return profile.interests.includes("Character Animation");
    if (i === 2) return profile.interests.includes("Programming") || profile.skills.includes("JavaScript");
    return true;
  });

  document.getElementById("stats-grid").innerHTML = stats
    .map(
      (s) => `
    <div class="stat-block reveal">
      <span class="stat-label">${s.label}</span>
      <span class="stat-sub">${s.sub}</span>
    </div>`
    )
    .join("");

  observeNewReveals("#stats-grid .reveal");
}

function renderSkills(profile) {
  const grid = document.getElementById("skills-grid");
  const skillSet = new Set(profile.skills);
  const interestSet = new Set(profile.interests);
  const used = new Set();

  const cards = Object.entries(SKILL_GROUPS)
    .map(([title, group]) => {
      const matched = [
        ...group.items.filter((s) => skillSet.has(s)),
        ...group.interests.filter((s) => interestSet.has(s) && !skillSet.has(s)),
      ].filter((s) => {
        if (used.has(s)) return false;
        used.add(s);
        return true;
      });

      if (matched.length === 0) return "";

      return `
        <div class="skill-card reveal">
          <div class="skill-card-head">
            <span class="skill-card-icon">${group.icon}</span>
            <h3 class="skill-card-title">${title}</h3>
          </div>
          <ul class="skill-card-list">
            ${matched.map((s) => `<li>${s}</li>`).join("")}
          </ul>
        </div>`;
    })
    .join("");

  grid.innerHTML = cards;
  observeNewReveals("#skills-grid .reveal");
}

function renderJourney(profile) {
  const progSkills = profile.skills.filter((s) =>
    ["Python", "JavaScript", "Node.js"].includes(s)
  );
  const year = new Date().getFullYear();

  const steps = [
    {
      year: String(year),
      title: "3D Animation & Portfolio",
      desc: profile.mainDirection,
    },
    {
      year: "Focus",
      title: "Programming",
      desc: progSkills.join(" / ") || "Software development",
    },
    {
      year: "Creative",
      title: "Animation Projects",
      desc: profile.interests.slice(0, 3).join(", "),
    },
  ];

  document.getElementById("journey-track").innerHTML = steps
    .map(
      (step, i) => `
    <div class="journey-item reveal${i > 0 ? " reveal-delay-" + i : ""}">
      <span class="journey-year">${step.year}</span>
      <div class="journey-content">
        <h3 class="journey-title">${step.title}</h3>
        <p class="journey-desc">${step.desc}</p>
      </div>
    </div>`
    )
    .join("");

  observeNewReveals("#journey-track .reveal");
}

function renderMarquee(profile) {
  const items = [...profile.interests, ...profile.skills.filter((s) => !profile.interests.includes(s))];
  const text = items.map((i) => `<span>${i.toUpperCase()}</span><span class="marquee-dot">•</span>`).join("");
  document.getElementById("marquee-track-a").innerHTML = text;
  document.getElementById("marquee-track-b").innerHTML = text;
}

function renderContact(profile) {
  document.getElementById("contact-links").innerHTML = `
    <a href="mailto:${profile.email}" class="contact-card reveal">
      <span class="contact-card-icon">✉</span>
      <span class="contact-card-label">Email</span>
      <span class="contact-card-value">${profile.email}</span>
    </a>
    <a href="${profile.social.github}" target="_blank" rel="noopener" class="contact-card reveal reveal-delay-1">
      <span class="contact-card-icon">⌘</span>
      <span class="contact-card-label">GitHub</span>
      <span class="contact-card-value">View Profile</span>
    </a>
    <a href="${profile.social.instagram}" target="_blank" rel="noopener" class="contact-card reveal reveal-delay-2">
      <span class="contact-card-icon">◎</span>
      <span class="contact-card-label">Instagram</span>
      <span class="contact-card-value">Follow</span>
    </a>
    <a href="${profile.social.youtube}" target="_blank" rel="noopener" class="contact-card reveal reveal-delay-3">
      <span class="contact-card-icon">▶</span>
      <span class="contact-card-label">YouTube</span>
      <span class="contact-card-value">Watch</span>
    </a>`;

  document.getElementById("contact-email-hint").textContent =
    "Reach out at " + profile.email + " for collaborations.";

  observeNewReveals("#contact-links .reveal");
}

function renderFooterSocial(profile) {
  document.getElementById("footer-social").innerHTML = `
    <a href="${profile.social.github}" target="_blank" rel="noopener">GitHub</a>
    <a href="${profile.social.instagram}" target="_blank" rel="noopener">Instagram</a>
    <a href="${profile.social.youtube}" target="_blank" rel="noopener">YouTube</a>
    <a href="mailto:${profile.email}">Email</a>`;
}

function setupNavigation() {
  const toggle = document.getElementById("nav-toggle");
  const links = document.getElementById("nav-links");

  toggle.addEventListener("click", () => links.classList.toggle("active"));

  links.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => links.classList.remove("active"));
  });
}

function setupNavbarScroll() {
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    navbar.classList.toggle("navbar--scrolled", window.scrollY > 40);
  });
}

function setupFooter() {
  document.getElementById("footer-year").textContent = new Date().getFullYear();
}

function setupScrollReveal() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -30px 0px" }
  );

  window.scrollRevealObserver = observer;
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

function observeNewReveals(selector) {
  document.querySelectorAll(selector).forEach((el) => {
    if (window.scrollRevealObserver) window.scrollRevealObserver.observe(el);
  });
}
