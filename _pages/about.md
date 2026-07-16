---
layout: about
title: about
permalink: /
# Remove this entire block:
# profile:
#   align: right
#   image: prof_pic.jpg
#   image_circular: true
news: false
latest_posts: false
selected_papers: false
social: true
---

<div class="about-hero">
  <div class="about-hero-bg"></div>
  <div class="about-hero-inner">
    <div class="about-hero-profile">
      <img src="/assets/img/prof_pic.jpg" class="about-hero-avatar" />
    </div>
  </div>
</div>

**Model of dynamics on complex networks.**
Foundation of network science and its applications, with a particular interest in studying the evolution of dynamical processes on temporal networks and diffusion processes on hypergraphs. \
**Computational social science.**
Data-driven modeling for study human behavior, focusing on non-conventional data extracted from social media such as Twitter and Reddit, as well as news outlets and Wikipedia. My focus encompassed infectious diseases (such as influenza, vaccine adoption, and COVID-19), climate change, and policy acceptance. \
**Epidemiology.**
Both the data-driven and the modeling approach confluence in the assessment of epidemic outputs. Additionally, to the models and the analysis of digital data sources, I used survey data to investigate the role of contact patterns during and after the COVID-19 pandemic. The main focus was to examine the impact of non-pharmaceutical interventions (NPIs) on the pandemic and the impact of socioeconomic determinants in Italy.

The main purpose of my research is to integrate data-driven approaches with model-driven explorations, focusing on human behavior.

---

## Selected Publications

<div class="selected-publications">
  {% for pub in site.data.scholar_selected_papers %}
    <div class="publication-item">
      <h4>{{ pub.title }}</h4>
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
   1. DEFAULT (LIGHT MODE)
   ========================================= */
:root {
  --pub-bg: #ffffff;
  --pub-border:rgb(255,66,65);
  --pub-title-color: #1a1a1a;
  --pub-meta-color: #555555;
  --pub-text-color: #444444;
  --pub-link-color:rgb(255,66,65);
  --pub-shadow: rgba(0, 0, 0, 0.1);
  --pub-details-bg: #f8f9fa;
}

/* =========================================
   2. DARK MODE OVERRIDES
   ========================================= */
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

/* =========================================
   3. COMPONENT STYLES
   ========================================= */
.selected-publications {
  margin-top: 2rem;
  margin-bottom: 2rem;
}

.publication-item {
  margin-bottom: 2.5rem;
  padding: 1.5rem;
  /* Use variables directly - no !important needed if selectors are correct */
  background-color: var(--pub-bg);
  border-left: 4px solid var(--pub-border);
  border-radius: 4px;
  box-shadow: 0 1px 3px var(--pub-shadow);
  transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.publication-item:hover {
  box-shadow: 0 4px 12px var(--pub-shadow);
}

.publication-item h4 {
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

.publication-item + .publication-item {
  margin-top: 1.5rem;
}
</style>

<style>
 .about-hero {
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

.about-hero-bg {
  position: absolute;
  inset: 0;
  width: 60%;
  height: 100%;
  background-image: url("/assets/img/about-bg.jpg");
  background-position: top;
  background-size: cover;
  background-repeat: no-repeat;
  filter: brightness(0.8);
  z-index: 0;
  left: 50%;
  transform: translateX(-50%);
}

.about-hero-inner {
  position: relative;
  height: 100%;
  max-width: 60%;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: flex-end;      /* Bottom alignment */
  justify-content: flex-end;  /* Right alignment */
  z-index: 1;
}

.about-hero-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: -30px;  /* Overlaps slightly below hero */
  padding: 0 0 1rem 0;
}

.about-hero-avatar {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #ffffff;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  margin-bottom: 1rem;
}

.about-hero-name {
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
  text-align: center;
  margin: 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
  white-space: nowrap;
}

html.dark-mode .about-hero-bg {
  filter: brightness(0.4);
}

html.dark-mode .about-hero-avatar {
  border-color: #e6e6e6;
}

@media (max-width: 576px) {
  .about-hero {
    height: 280px;
  }
  .about-hero-inner {
    padding: 0 1rem;
  }
  .about-hero-profile {
    margin-bottom: -20px;
    padding-bottom: 0.5rem;
  }
  .about-hero-avatar {
    width: 130px;
    height: 130px;
  }
  .about-hero-name {
    font-size: 1.3rem;
  }
}
</style>
