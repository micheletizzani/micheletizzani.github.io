---
layout: page
title: publications
permalink: /publications/
nav: true
nav_order: 4
---

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
