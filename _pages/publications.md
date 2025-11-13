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
/* ========== LIGHT MODE (Default) ========== */
:root {
  --pub-bg: rgb(215, 211, 211);
  --pub-border: #0066cc;
  --pub-title-color: #1a1a1a;
  --pub-meta-color: #333333;
  --pub-text-color: #555555;
  --pub-link-color: #0066cc;
  --pub-shadow: rgba(0, 0, 0, 0.1);
  --pub-details-bg: #ffffff;
}

/* ========== DARK MODE (al-folio's .dark-mode class) ========== */
html.dark-mode:root,
html.dark-mode {
  --pub-bg: #2a2a2a !important;
  --pub-border: #4da6ff !important;
  --pub-title-color: #e6e6e6 !important;
  --pub-meta-color: #cccccc !important;
  --pub-text-color: #b3b3b3 !important;
  --pub-link-color: #66b3ff !important;
  --pub-shadow: rgba(0, 0, 0, 0.3) !important;
  --pub-details-bg: #1f1f1f !important;
}

/* ========== LIGHT MODE EXPLICIT (al-folio's .light-mode class) ========== */
html.light-mode:root,
html.light-mode {
  --pub-bg: #f8f9fa !important;
  --pub-border: #0066cc !important;
  --pub-title-color: #1a1a1a !important;
  --pub-meta-color: #333333 !important;
  --pub-text-color: #555555 !important;
  --pub-link-color: #0066cc !important;
  --pub-shadow: rgba(0, 0, 0, 0.1) !important;
  --pub-details-bg: #ffffff !important;
}

/* ========== STYLES ========== */
.selected-publications {
  margin-top: 2rem;
  margin-bottom: 2rem;
}

.publication-item {
  margin-bottom: 2.5rem;
  padding: 1.5rem;
  background-color: var(--pub-bg) !important;
  border-left: 4px solid var(--pub-border) !important;
  border-radius: 4px;
  box-shadow: 0 1px 3px var(--pub-shadow);
  transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

.publication-item:hover {
  box-shadow: 0 2px 6px var(--pub-shadow);
}

.publication-item h3 {
  margin: 0 0 0.8rem 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--pub-title-color) !important;
  line-height: 1.5;
  transition: color 0.3s ease;
}

.pub-meta {
  margin: 0.3rem 0;
  font-size: 0.95rem;
  color: var(--pub-meta-color) !important;
  transition: color 0.3s ease;
}

.pub-meta em {
  color: var(--pub-meta-color) !important;
  font-style: italic;
}

.pub-journal {
  margin: 0.5rem 0;
  font-size: 0.95rem;
  color: var(--pub-text-color) !important;
  transition: color 0.3s ease;
}

.pub-abstract {
  margin: 1rem 0 0 0;
  font-size: 0.9rem;
  color: var(--pub-text-color) !important;
  line-height: 1.6;
  transition: color 0.3s ease;
}

details {
  margin: 1rem 0;
  padding: 0.5rem;
  background-color: var(--pub-details-bg) !important;
  border-radius: 3px;
  cursor: pointer;
  border: 1px solid var(--pub-border) !important;
  border-left: none;
  transition: background-color 0.3s ease;
}

details summary {
  font-weight: 600;
  color: var(--pub-link-color) !important;
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
