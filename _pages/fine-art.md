---
layout: page
title: photoexperiments
permalink: /fine-art/
nav: false
nav_order: 6
---

Exploring light, composition, and emotion through photographic art.

<div class="gallery-container fine-art-gallery">
  {% for photo in site.photography %}
    {% if photo.category == "fine-art" %}
      <div class="gallery-item">
        <img src="{{ photo.image }}" alt="{{ photo.title }}" class="gallery-image" loading="lazy">
        <div class="photo-info">
          <h4>{{ photo.title }}</h4>
          {% if photo.technique %}<p class="technique">🎨 {{ photo.technique }}</p>{% endif %}
          {% if photo.date %}<p class="date">📅 {{ photo.date }}</p>{% endif %}
          {% if photo.description %}<p class="description">{{ photo.description }}</p>{% endif %}
        </div>
      </div>
    {% endif %}
  {% endfor %}
</div>

<style>
.gallery-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.gallery-item {
  background: var(--card-bg, #f8f9fa);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.gallery-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.gallery-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
  display: block;
}

.photo-info {
  padding: 1rem;
}

.photo-info h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: var(--text-color, #1a1a1a);
}

.technique, .date {
  margin: 0.25rem 0;
  font-size: 0.85rem;
  color: var(--muted-text, #666);
}

.description {
  margin: 0.5rem 0 0 0;
  font-size: 0.9rem;
  color: var(--text-color, #555);
  line-height: 1.5;
}

/* Fine art gallery specific - larger images */
.fine-art-gallery {
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
}

/* Dark mode support */
html.dark-mode .gallery-item {
  background: var(--card-bg-dark, #2a2a2a);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

html.dark-mode .photo-info h4 {
  color: var(--text-color-dark, #e6e6e6);
}

html.dark-mode .technique,
html.dark-mode .date {
  color: var(--muted-text-dark, #999);
}

html.dark-mode .description {
  color: var(--text-color-dark, #b3b3b3);
}

@media (max-width: 768px) {
  .gallery-container {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .fine-art-gallery {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}
</style>
