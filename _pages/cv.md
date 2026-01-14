---
layout: cv
permalink: /cv/
title: cv
nav: true
nav_order: 5
cv_pdf: CV-Tizzani.pdf
description: Essential CV.
toc:
  sidebar: left
---

<div class="cv-hero">
  <div class="cv-hero-bg"></div>
  <div class="cv-hero-inner">
    <!-- Optional: add title or icon here -->
    <!-- <h1 class="cv-hero-title">Curriculum Vitae</h1> -->
  </div>
</div>

<style>
/* =========================================
   HERO HEADER STYLES
   ========================================= */
.cv-hero {
  position: relative;
  width: 100vw;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  margin-top: -1.5rem;
  margin-bottom: 3rem;
  height: 300px;
  overflow: hidden;
}

.cv-hero-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  background-image: url("/assets/img/cv-bg.jpg"); /* Create/upload this image */
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  filter: brightness(0.6);
  z-index: 0;
}

.cv-hero-inner {
  position: relative;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.cv-hero-title {
  font-size: 3rem;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
  margin: 0;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.7);
}

html.dark-mode .cv-hero-bg {
  filter: brightness(0.4);
}

@media (max-width: 768px) {
  .cv-hero {
    height: 250px;
  }
  .cv-hero-title {
    font-size: 2.2rem;
  }
}

@media (max-width: 576px) {
  .cv-hero {
    height: 200px;
  }
  .cv-hero-title {
    font-size: 1.8rem;
  }
}

/* =========================================
   PAGE LAYOUT
   ========================================= */
.page-content {
  max-width: 60vw !important;
  width: 60vw !important;
  margin: 0 auto !important;
  padding-left: 2rem !important;
  padding-right: 2rem !important;
  overflow-x: hidden;
}

.container,
.container-lg,
.container-md {
  max-width: 100% !important;
  padding-left: 0 !important;
  padding-right: 0 !important;
}

/* Make CV content readable */
.cv {
  max-width: 100%;
}

@media (max-width: 768px) {
  .page-content {
    max-width: 90vw !important;
    width: 90vw !important;
    padding-left: 1rem !important;
    padding-right: 1rem !important;
  }
}
</style>
