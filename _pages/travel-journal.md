---
layout: page
title: travels
permalink: /travel-journal/
nav: true
nav_order: 5
---

<div class="travel-hero">
  <div class="travel-hero-bg"></div>
  <div class="travel-hero-inner">
    <!-- Optional: Add a travel icon or title -->
  </div>
</div>

<div class="photo-gallery-container">
  <div class="gallery-section piedmont-section">
    <h2 class="section-title">Sweden - 2025</h2>
    <p class="section-intro"></p>
    <div class="photography-grid">
      {% for photo in site.photography %}
        {% if photo.category == "sweden" %}
          <div class="photo-card">
            <img src="{{ photo.image }}" alt="{{ photo.title }}" class="photo-img" loading="lazy" onclick="enlargePhoto(this)">
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
            <img src="{{ photo.image }}" alt="{{ photo.title }}" class="photo-img" loading="lazy" onclick="enlargePhoto(this)">
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

<!-- Pop-up Lightbox -->
<div id="photo-popup" onclick="closePhotoPopup()" style="display:none;">
  <div class="popup-blur"></div>
  <img id="photo-popup-img" src="" alt="Enlarged Photo">
  <span class="close-popup">&times;</span>
</div>

<script>
function enlargePhoto(img) {
  const popup = document.getElementById('photo-popup');
  const popupImg = document.getElementById('photo-popup-img');
  popupImg.src = img.src;
  popupImg.alt = img.alt;
  popup.style.display = 'flex';
  document.body.style.overflow = 'hidden'; // Prevent background scrolling
}
function closePhotoPopup() {
  document.getElementById('photo-popup').style.display = 'none';
  document.body.style.overflow = ''; // Restore scrolling
}
document.addEventListener('keydown', function(e) {
  if(e.key === "Escape") closePhotoPopup();
});
</script>

<style>

/* Make the main content container full width */
.page-content {
  max-width: 62vw !important;
  width: 62vw !important;
  margin: 0 !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
  overflow-x: hidden;
}

/* Override any container within the page */
.container,
.container-lg,
.container-md {
  max-width: 62% !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

/* =========================================
   HERO HEADER - Same style as about page
   ========================================= */
.travel-hero {
  position: relative;
  width: 100vw;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  margin-top: -1.5rem;
  margin-bottom: 3rem;
  height: 320px;
  overflow: visible;
}

.travel-hero-bg {
  position: absolute;
  inset: 0;
  width: 62%;
  height: 100%;
  background-image: url("/assets/img/travel-bg.jpg"); 
  background-position: bottom;
  background-size: cover;
  background-repeat: no-repeat;
  filter: brightness(0.8);
  z-index: 0;
  left: 50%;
  transform: translateX(-50%);
}

.travel-hero-inner {
  position: relative;
  height: 100%;
  max-width: 62%;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

html.dark-mode .travel-hero-bg {
  filter: brightness(0.8);
}

@media (max-width: 768px) {
  .travel-hero {
    height: 280px;
  }
  .travel-hero-bg {
    width: 60%;
  }
  .travel-hero-inner {
    max-width: 60%;
  }
  .page-content {
    max-width: 60vw !important;
    width: 60vw !important;
  }
}

/* Ensure gallery spans full width */
.photo-gallery-container,
.gallery-section {
  width: 60vw !important;
  margin-left: 0 !important;
  padding-left: 2rem !important; /* Optional: add some padding */
  padding-right: 2rem !important; /* Optional: add some padding */
}

/*---- POPUP/LIGHTBOX ----*/
#photo-popup {
  position: fixed;
  z-index: 10000;
  inset: 0;
  display: none;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
#photo-popup .popup-blur {
  position: absolute;
  inset: 0;
  backdrop-filter: blur(14px) brightness(0.6);
  background: rgba(10,10,10,0.62);
  z-index: 1;
}
#photo-popup img {
  z-index: 2;
  max-width: 60vw;
  max-height: 60vh;
  border-radius: 6px;
  box-shadow: 0 4px 40px rgba(0,0,0,0.76);
  background: #222;
  transition: box-shadow 0.2s;
}
#photo-popup .close-popup {
  z-index: 3;
  position: absolute;
  top: 35px;
  right: 50px;
  color: #fff;
  font-size: 3rem;
  cursor: pointer;
  transition: opacity 0.2s;
  opacity: 0.65;
}
#photo-popup .close-popup:hover { opacity: 1; }
@media(max-width:600px){
  #photo-popup img { max-width:97vw; max-height:70vh; }
  #photo-popup .close-popup { top: 16px; right: 16px; font-size: 2rem;}
}

/*---- GALLERY LAYOUT ----*/
/* Gallery Container - Full Width, Minimal Margins */
.photo-gallery-container {
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  background: #000;
  padding: 0;
}
.gallery-section {
  padding: 3rem 2rem;
  background: #000;
}
.section-title {
  color: #fff !important;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0 !important;
  text-align: left;
  border: none !important;
}
.section-intro {
  color: #aaa;
  font-size: 0.95rem;
  margin: 0 0 2rem 0;
  font-weight: 300;
}
/* Photography Grid - Horizontal Spread */

.photography-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
  align-items: start;
}
.photo-card {
  position: relative;
  background: #1a1a1a;
  border-radius: 2px;
  cursor: pointer;
  group: "photo";
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-img {
  width: 100%;
  height: auto;
  max-height: 60vh;
  display: block;
  object-fit: contain;
  background: #111;
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
  color: #fff;
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
  color: #fff;
}
.photo-overlay .location {
  margin: 0;
  font-size: 0.8rem;
  color: #aaa;
  font-weight: 300;
}
/* Always-black background, even in light mode */
html.dark-mode .photo-gallery-container,
html.dark-mode .gallery-section,
html.light-mode .photo-gallery-container,
html.light-mode .gallery-section {
  background: #000;
}
html.dark-mode .section-title,
html.light-mode .section-title {
  color: #fff !important;
}
html.dark-mode .section-intro,
html.light-mode .section-intro {
  color: #aaa;
}
html.dark-mode .photo-card,
html.light-mode .photo-card {
  background: #1a1a1a;
}
.page-content {
  margin: 0 !important;
  padding: 0 !important;
}
</style>
