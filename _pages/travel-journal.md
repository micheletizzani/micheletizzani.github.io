---
layout: page
title: travels
permalink: /travel-journal/
nav: true
nav_order: 5
---

  <div class="gallery-section other-section">
    <h2 class="section-title">Sweden 2025</h2>
    
    <div class="photography-grid">
      {% for photo in site.photography %}
        {% if photo.category == "travel" and photo.category != "piedmont" %}
          <div class="photo-card">
            <img src="{{ photo.image }}" alt="{{ photo.title }}" class="photo-img" loading="lazy">
            <div class="photo-overlay">
              <h3>{{ photo.title }}</h3>
              {% if photo.location %}<p class="location">{{ photo.location }}</p>{% endif %}
            </div>
          </div>
        {% endif %}
      {% endfor %}
    </div>
  </div>
</div>

<div class="photo-gallery-container">
  <div class="gallery-section piedmont-section">
    <h2 class="section-title">Piedmont Mountains - 2024</h2>
    <p class="section-intro">Autmn through the Alps.</p>
    
    <div class="photography-grid">
      {% for photo in site.photography %}
        {% if photo.category == "piedmont" %}
          <div class="photo-card">
            <img src="{{ photo.image }}" alt="{{ photo.title }}" class="photo-img" loading="lazy">
            <div class="photo-overlay">
              <h3>{{ photo.title }}</h3>
              {% if photo.location %}<p class="location">{{ photo.location }}</p>{% endif %}
            </div>
          </div>
        {% endif %}
      {% endfor %}
    </div>
  </div>

<style>
/* Gallery Container - Full Width, Minimal Margins */
.photo-gallery-container {
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  background: #000000;
  padding: 0;
}

/* Section Styling */
.gallery-section {
  padding: 3rem 2rem;
  background: #000000;
}

.section-title {
  color: #ffffff !important;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0 !important;
  text-align: left;
  border: none !important;
}

.section-intro {
  color: #aaaaaa;
  font-size: 0.95rem;
  margin: 0 0 2rem 0;
  font-weight: 300;
}

/* Photography Grid - Horizontal Spread */
.photography-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

/* Photo Card - Minimal Info */
.photo-card {
  position: relative;
  overflow: hidden;
  aspect-ratio: 4 / 5;
  background: #1a1a1a;
  border-radius: 2px;
  cursor: pointer;
  group: "photo";
}

.photo-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.4s cubic-bezier(0.33, 0.66, 0.66, 1);
}

.photo-card:hover .photo-img {
  transform: scale(1.08);
}

/* Overlay - Appears on Hover */
.photo-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.6), transparent);
  padding: 2rem 1rem 1rem;
  color: #ffffff;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
}

.photo-card:hover .photo-overlay {
  opacity: 1;
  transform: translateY(0);
}

.photo-overlay h3 {
  margin: 0 0 0.3rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
}

.photo-overlay .location {
  margin: 0;
  font-size: 0.8rem;
  color: #aaaaaa;
  font-weight: 300;
}

/* Dark Mode - Stays Black */
html.dark-mode .photo-gallery-container,
html.dark-mode .gallery-section {
  background: #000000;
}

html.dark-mode .section-title {
  color: #ffffff !important;
}

html.dark-mode .section-intro {
  color: #aaaaaa;
}

html.dark-mode .photo-card {
  background: #1a1a1a;
}

/* Responsive */
@media (max-width: 1200px) {
  .photography-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .gallery-section {
    padding: 2rem 1rem;
  }

  .photography-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 0.8rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .photo-overlay {
    padding: 1.5rem 0.8rem 0.8rem;
  }

  .photo-overlay h3 {
    font-size: 0.95rem;
  }
}

@media (max-width: 480px) {
  .photography-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }

  .section-title {
    font-size: 1.2rem;
  }
}

/* Hide page margins for full-width effect */
.page-content {
  margin: 0 !important;
  padding: 0 !important;
}
</style>
