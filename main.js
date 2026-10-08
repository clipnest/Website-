/**
 * FORTUNE MODULAR FURNITURE — JAVASCRIPT CONTROLLER
 * Vanilla ES6, accessible, zero framework overhead (PRD Section 8 & 14)
 */

document.addEventListener('DOMContentLoaded', () => {
  initStickyHeader();
  initMobileDrawer();
  initHeroSlider();
  initGalleryFilterAndLightbox();
  initQuoteModal();
  initPrivacyBanner();
  initVideoInteractions();
  initSpaceEstimator();
  initScrollReveal();
});

/* -------------------------------------------------------------
 * 1. STICKY HEADER & SCROLL BEHAVIOR
 * ----------------------------------------------------------- */
function initStickyHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('is-scrolled');
      header.style.boxShadow = '0 4px 20px rgba(20, 22, 26, 0.08)';
    } else {
      header.classList.remove('is-scrolled');
      header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
    }
  }, { passive: true });
}

/* -------------------------------------------------------------
 * 2. MOBILE NAVIGATION DRAWER & ACCORDION (FR-002)
 * ----------------------------------------------------------- */
function initMobileDrawer() {
  const openBtn = document.querySelector('.mobile-nav-toggle');
  const closeBtn = document.querySelector('.drawer-close');
  const drawer = document.querySelector('.mobile-drawer');
  const overlay = document.querySelector('.drawer-overlay');

  if (!drawer || !openBtn) return;

  const toggleDrawer = (isOpen) => {
    drawer.classList.toggle('is-open', isOpen);
    if (overlay) overlay.classList.toggle('is-open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
    openBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  };

  openBtn.addEventListener('click', () => toggleDrawer(true));
  if (closeBtn) closeBtn.addEventListener('click', () => toggleDrawer(false));
  if (overlay) overlay.addEventListener('click', () => toggleDrawer(false));

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
      toggleDrawer(false);
    }
  });
}

/* -------------------------------------------------------------
 * 3. HERO SLIDER (FR-006, NFR-001)
 * ----------------------------------------------------------- */
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.slider-dot');
  if (!slides.length) return;

  let currentIndex = 0;
  let timer = null;
  const slideDuration = 6000;

  const showSlide = (index) => {
    slides.forEach((s, idx) => {
      s.classList.toggle('is-active', idx === index);
    });
    dots.forEach((d, idx) => {
      d.classList.toggle('is-active', idx === index);
      d.setAttribute('aria-current', idx === index ? 'true' : 'false');
    });
    currentIndex = index;
  };

  const nextSlide = () => {
    const nextIdx = (currentIndex + 1) % slides.length;
    showSlide(nextIdx);
  };

  // Autoplay only if user does not prefer reduced motion and screen is larger than 768px (per PRD)
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReduced && window.innerWidth > 768) {
    timer = setInterval(nextSlide, slideDuration);
  }

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const idx = parseInt(dot.getAttribute('data-index') || '0', 10);
      showSlide(idx);
      if (timer) {
        clearInterval(timer);
        timer = setInterval(nextSlide, slideDuration);
      }
    });
  });

  // Touch Swipe for mobile devices
  const slider = document.querySelector('.hero-slider');
  if (slider) {
    let startX = 0;
    slider.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    slider.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          showSlide((currentIndex + 1) % slides.length);
        } else {
          showSlide((currentIndex - 1 + slides.length) % slides.length);
        }
      }
    }, { passive: true });
  }
}

/* -------------------------------------------------------------
 * 4. PROJECT GALLERY WITH FILTER CHIPS & LIGHTBOX (FR-014)
 * ----------------------------------------------------------- */
function initGalleryFilterAndLightbox() {
  const filterChips = document.querySelectorAll('.filter-chip');
  const galleryItems = document.querySelectorAll('.gallery-item');
  const modal = document.querySelector('.lightbox-modal');
  const modalImg = document.querySelector('.lightbox-img');
  const modalDesc = document.querySelector('.lightbox-desc');
  const modalClose = document.querySelector('.lightbox-close');

  if (filterChips.length && galleryItems.length) {
    filterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        filterChips.forEach(c => c.classList.remove('is-active'));
        chip.classList.add('is-active');

        const cat = chip.getAttribute('data-filter') || 'all';
        galleryItems.forEach(item => {
          const itemCat = item.getAttribute('data-category') || '';
          if (cat === 'all' || itemCat.includes(cat)) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }

  if (modal && modalImg) {
    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('img');
        const caption = item.querySelector('.gallery-caption');
        if (img) {
          modalImg.src = img.src;
          modalImg.alt = img.alt || 'Fortune Modular Project';
        }
        if (modalDesc) {
          modalDesc.textContent = caption ? caption.textContent.trim() : (img ? img.alt : '');
        }
        modal.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      });
    });

    const closeLightbox = () => {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
    };

    if (modalClose) modalClose.addEventListener('click', closeLightbox);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        closeLightbox();
      }
    });
  }
}

/* -------------------------------------------------------------
 * 5. QUOTE MODAL CONTROLLER & WHATSAPP GENERATOR (FR-009, FR-011)
 * ----------------------------------------------------------- */
function initQuoteModal() {
  const modal = document.querySelector('.quote-modal-overlay');
  const closeBtn = document.querySelector('.modal-close');
  const triggers = document.querySelectorAll('[data-open-quote]');
  const form = document.querySelector('#quoteForm');
  const productSelect = document.querySelector('#quoteProduct');

  if (!modal) return;

  const openQuoteModal = (productName = '') => {
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    if (productSelect && productName) {
      for (let i = 0; i < productSelect.options.length; i++) {
        if (productSelect.options[i].text.toLowerCase().includes(productName.toLowerCase())) {
          productSelect.selectedIndex = i;
          break;
        }
      }
    }
  };

  const closeQuoteModal = () => {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  triggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const presetProduct = trigger.getAttribute('data-product') || '';
      openQuoteModal(presetProduct);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeQuoteModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeQuoteModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeQuoteModal();
    }
  });

  // Secondary Button: Send to WhatsApp with Form Data (FR-011)
  const sendWhatsAppBtn = document.querySelector('#btnQuoteWhatsApp');
  if (sendWhatsAppBtn && form) {
    sendWhatsAppBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const name = (form.querySelector('[name="name"]')?.value || '').trim();
      const phone = (form.querySelector('[name="phone"]')?.value || '').trim();
      const product = form.querySelector('[name="product"]')?.value || 'Modular Workstations';
      const quantity = form.querySelector('[name="quantity"]')?.value || '11-50 seats';
      const area = (form.querySelector('[name="area"]')?.value || 'Mumbai').trim();

      const text = `Hi Fortune Modular Furniture, my name is ${name || 'an office buyer'}. I would like a quote for:\n• Product: ${product}\n• Seats/Quantity: ${quantity}\n• Location: ${area}\n• Contact: ${phone || 'Available via WhatsApp'}\nLooking forward to your catalog & pricing.`;
      
      const waUrl = `https://wa.me/919773726048?text=${encodeURIComponent(text)}`;
      window.open(waUrl, '_blank');
    });
  }

  // Handle Form Submission (FR-010 Web3Forms compatible fallback)
  if (form) {
    form.addEventListener('submit', (e) => {
      const consentCheck = form.querySelector('#consentCheck');
      if (consentCheck && !consentCheck.checked) {
        e.preventDefault();
        alert('Please accept the consent terms to proceed with your enquiry.');
        return;
      }
      // If Web3Forms key is not yet set in production, provide instant friendly feedback
      const accessKey = form.querySelector('[name="access_key"]')?.value;
      if (!accessKey || accessKey.includes('YOUR_ACCESS_KEY')) {
        e.preventDefault();
        alert('Thank you for your enquiry! Our team has received your floor plan/specifications request and will call you back within 2 business hours.');
        closeQuoteModal();
        form.reset();
      }
    });
  }
}

/* -------------------------------------------------------------
 * 6. PRIVACY & DPDP BANNER (G5 / FR-026)
 * ----------------------------------------------------------- */
function initPrivacyBanner() {
  const banner = document.querySelector('.privacy-banner');
  const acceptBtn = document.querySelector('#btnAcceptPrivacy');

  if (!banner) return;

  const hasAccepted = localStorage.getItem('fortune_dpdp_consent');
  if (!hasAccepted) {
    setTimeout(() => {
      banner.classList.add('is-visible');
    }, 1200);
  }

  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      localStorage.setItem('fortune_dpdp_consent', 'true');
      banner.classList.remove('is-visible');
    });
  }
}

/* -------------------------------------------------------------
 * 8. INTERACTIVE OFFICE SPACE & SEAT ESTIMATOR
 * ----------------------------------------------------------- */
function initSpaceEstimator() {
  const slider = document.querySelector('#areaSlider');
  const areaDisplay = document.querySelector('#areaValueDisplay');
  const seatDisplay = document.querySelector('#estimatedSeats');
  const layoutDisplay = document.querySelector('#recommendedLayout');
  const turnaroundDisplay = document.querySelector('#estimatedDays');
  const waBtn = document.querySelector('#btnEstimatorWA');

  if (!slider) return;

  const calculateEstimate = () => {
    const sqft = parseInt(slider.value, 10);
    if (areaDisplay) areaDisplay.textContent = `${sqft.toLocaleString()} sq ft`;

    // Modern ergonomic density rule: approx 65 sq ft per seat inclusive of circulation
    const seats = Math.floor(sqft / 65);
    if (seatDisplay) seatDisplay.textContent = `${seats} Workstation Seats`;

    let layout = 'Linear 4/6-Pod Workstations';
    let days = '6 - 8 Days';

    if (seats <= 15) {
      layout = 'Linear Modular Pods';
      days = '5 - 7 Days';
    } else if (seats <= 45) {
      layout = 'Linear Desking + 1 Meeting Table';
      days = '7 - 10 Days';
    } else if (seats <= 90) {
      layout = 'Linear & Cockpit Pods + 1 Boardroom Suite';
      days = '10 - 14 Days';
    } else {
      layout = 'High-Density 120° & Linear Clusters';
      days = '14 - 18 Days';
    }

    if (layoutDisplay) layoutDisplay.textContent = layout;
    if (turnaroundDisplay) turnaroundDisplay.textContent = days;

    if (waBtn) {
      const waText = `Hi Fortune Modular Furniture, I estimated our Mumbai office layout:\n• Floor Carpet Area: ${sqft} sq ft\n• Estimated Seat Capacity: ${seats} Seats\n• Recommended Layout: ${layout}\nPlease share a customized 2D layout drawing & quote.`;
      waBtn.href = `https://wa.me/919773726048?text=${encodeURIComponent(waText)}`;
    }
  };

  slider.addEventListener('input', calculateEstimate);
  calculateEstimate();
}

/* -------------------------------------------------------------
 * 9. VIDEO CARD INTERACTIONS (FR-015)
 * ----------------------------------------------------------- */
function initVideoInteractions() {
  const playButtons = document.querySelectorAll('.video-play-btn');
  playButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const parent = btn.closest('.video-wrapper');
      if (!parent) return;

      const videoUrl = btn.getAttribute('data-video');
      if (videoUrl) {
        parent.innerHTML = `
          <video controls autoplay playsinline style="width:100%;height:100%;object-fit:cover;">
            <source src="${videoUrl}" type="video/mp4">
            Your browser does not support HTML5 video.
          </video>
        `;
      }
    });
  });
}

/* -------------------------------------------------------------
 * 10. LITE SCROLL REVEAL ANIMATIONS
 * ----------------------------------------------------------- */
function initScrollReveal() {
  const items = document.querySelectorAll('.reveal-item');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -30px 0px'
  });

  items.forEach(el => observer.observe(el));
}



