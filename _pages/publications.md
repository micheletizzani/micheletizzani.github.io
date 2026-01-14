---
layout: page
title: publications
permalink: /publications/
title: publications
nav: true
nav_order: 4
---

<div class="publications-hero">
  <div class="publications-hero-bg-wrapper">
    <div class="publications-hero-bg-img"></div>
    <div class="publications-hero-overlay"></div>
  </div>
  <div class="publications-hero-inner">
    <!-- Optional: add title here if you want text on the hero -->
    <!-- <h1 class="publications-hero-title">Publications</h1> -->
  </div>
</div>

<div class="selected-publications">
  {% for pub in site.data.scholar_all_papers %}
    <div class="publication-item">
      <h3>{{ pub.title }}</h3>
      <p class="pub-meta">
        <em>{{ pub.author }}</em>
      </p>
      <p class="pub-journal">
        {% if pub.journal %}{{ pub.journal }}{% endif %}
        {% if pub.volume %}, <strong>{{ pub.volume }}</strong>{% endif %}
        {% if pub.year %}({{ pub.year }}){% endif %}
        {% if pub.pages %}, pp. {{ pub.pages }}{% endif %}
      </p>
      
      {% if pub.abstract %}
        <details>
          <summary>Abstract</summary>
          <p class="pub-abstract">{{ pub.abstract }}</p>
        </details>
      {% endif %}
      
      {% if pub.url %}
        <p class="pub-links">
          <a href="{{ pub.url }}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-primary">
            {% if pub.doi %}📖 DOI Link{% else %}🔗 View Paper{% endif %}
          </a>
        </p>
      {% endif %}
    </div>
  {% endfor %}
</div>

<style>

  /* Make the main content container full width */
.page-content {
  max-width: 60vw !important;
  width: 60vw !important;
  margin: 0 !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  overflow-x: hidden;
}

/* Override any container within the page */
.container,
.container-lg,
.container-md {
  max-width: 60% !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}
/* =========================================
   HERO HEADER STYLES (Full Width)
   ========================================= */
.publications-hero {
  position: relative;
  width: 100vw;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  margin-top: -1.5rem;
  margin-bottom: 2rem;
  height: 320px;
  overflow: visible;
}


.publications-hero-bg-img {
  position: absolute;
  inset: 0;
  width: 60%;
  height: 100%;
  background-image: url("/assets/img/publication-bg.jpg");
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  filter: brightness(0.8);
  z-index: 0;
  left: 50%;
  transform: translateX(-50%);
}

.publications-hero-inner {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.publications-hero-title {
  font-size: 3rem;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
  margin: 0;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.7);
  text-transform: capitalize;
}

html.dark-mode .publications-hero-overlay {
  background: rgba(0, 0, 0, 0.6);
}

@media (max-width: 768px) {
  .publications-hero {
    height: 300px;
  }
  .publications-hero-title {
    font-size: 2.2rem;
  }
}

@media (max-width: 576px) {
  .publications-hero {
    height: 250px;
  }
  .publications-hero-title {
    font-size: 1.8rem;
  }
}


/* =========================================
   PUBLICATIONS STYLES
   ========================================= */
:root {
  --pub-bg: #ffffff;
  --pub-border: rgb(255,66,65);
  --pub-title-color: #1a1a1a;
  --pub-meta-color: #555555;
  --pub-text-color: #444444;
  --pub-link-color: rgb(255,66,65);
  --pub-shadow: rgba(0, 0, 0, 0.1);
  --pub-details-bg: #f8f9fa;
}

html.dark-mode,
html[data-theme="dark"] {
  --pub-bg: rgb(28,28,29);
  --pub-border: #2691B2;
  --pub-title-color: #e6e6e6;
  --pub-meta-color: #cccccc;
  --pub-text-color: #b3b3b3;
  --pub-link-color: #2691B2;
  --pub-shadow: rgba(0, 0, 0, 0.5);
  --pub-details-bg: rgb(35,35,36);
}

.selected-publications {
  margin-top: 2rem;
  margin-bottom: 2rem;
}

.publication-item {
  margin-bottom: 2.5rem;
  padding: 1.5rem;
  background-color: var(--pub-bg);
  border-left: 4px solid var(--pub-border);
  border-radius: 4px;
  box-shadow: 0 1px 3px var(--pub-shadow);
  transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.publication-item:hover {
  box-shadow: 0 4px 12px var(--pub-shadow);
}

.publication-item h3 {
  margin: 0 0 0.8rem 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--pub-title-color);
  line-height: 1.5;
  transition: color 0.3s ease;
}

.pub-meta {
  margin: 0.3rem 0;
  font-size: 0.95rem;
  color: var(--pub-meta-color);
  transition: color 0.3s ease;
}

.pub-meta em {
  color: var(--pub-meta-color);
  font-style: italic;
}

.pub-journal {
  margin: 0.5rem 0;
  font-size: 0.95rem;
  color: var(--pub-text-color);
  transition: color 0.3s ease;
}

.pub-abstract {
  margin: 1rem 0 0 0;
  font-size: 0.9rem;
  color: var(--pub-text-color);
  line-height: 1.6;
  transition: color 0.3s ease;
}

details {
  margin: 1rem 0;
  padding: 0.5rem;
  background-color: var(--pub-details-bg);
  border-radius: 3px;
  cursor: pointer;
  border: 1px solid var(--pub-border);
  border-left: none;
  transition: background-color 0.3s ease;
}

details summary {
  font-weight: 600;
  color: var(--pub-link-color);
  transition: color 0.3s ease;
  user-select: none;
  padding: 0.25rem;
}

details summary:hover {
  opacity: 0.8;
}

details[open] summary {
  margin-bottom: 0.5rem;
}

.pub-links {
  margin: 1rem 0 0 0;
  font-size: 0.9rem;
}

.pub-links .btn {
  margin-right: 0.5rem;
  transition: all 0.3s ease;
}

.pub-links .btn:hover {
  transform: translateY(-2px);
}

/* DOI button colors */
.pub-links .btn-outline-primary {
  color: rgb(255,66,65);
  border-color: rgb(255,66,65);
  background-color: transparent;
}

.pub-links .btn-outline-primary:hover {
  color: #ffffff;
  background-color: rgb(255,66,65);
  border-color: rgb(255,66,65);
}

html.dark-mode .pub-links .btn-outline-primary,
html[data-theme="dark"] .pub-links .btn-outline-primary {
  color: #2691B2;
  border-color: #2691B2;
}

html.dark-mode .pub-links .btn-outline-primary:hover,
html[data-theme="dark"] .pub-links .btn-outline-primary:hover {
  color: #ffffff;
  background-color: #2691B2;
  border-color: #2691B2;
}

.publication-item + .publication-item {
  margin-top: 1.5rem;
}
</style>
