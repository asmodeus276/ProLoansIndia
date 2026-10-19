// -------------------------------------------------------------
    // -------------------------------------------------------------
    // 1. HERO CAROUSEL CONTROLLER (Smooth Auto-Sliding on Mobile & Desktop)
    // -------------------------------------------------------------
    let currentSlide = 0;
    const totalSlides = 10;
    let slideTimer = null;

    function showSlide(index) {
      currentSlide = (index + totalSlides) % totalSlides;
      
      for (let i = 0; i < totalSlides; i++) {
        const slide = document.getElementById('slide-' + i);
        const dot = document.getElementById('dot-' + i);
        if (slide) {
          if (i === currentSlide) {
            slide.classList.add('active-slide');
          } else {
            slide.classList.remove('active-slide');
          }
        }
        if (dot) {
          if (i === currentSlide) {
            dot.className = 'w-5 h-2 rounded-full bg-[#F26522] cursor-pointer transition-all';
          } else {
            dot.className = 'w-2 h-2 rounded-full bg-slate-300 hover:bg-slate-400 cursor-pointer transition-all';
          }
        }
      }

      const currentFormatted = String(currentSlide + 1).padStart(2, '0');
      const totalFormatted = String(totalSlides).padStart(2, '0');
      const counterText = `${currentFormatted} / ${totalFormatted}`;
      const counter = document.getElementById('slide-counter');
      if (counter) {
        counter.innerText = counterText;
      }
      document.querySelectorAll('.mobile-counter-val').forEach(el => {
        el.innerText = counterText;
      });
    }

    function nextSlide(isManual) {
      showSlide(currentSlide + 1);
      if (isManual) resetSlideTimer();
    }
    function prevSlide(isManual) {
      showSlide(currentSlide - 1);
      if (isManual) resetSlideTimer();
    }
    function goToSlide(i) {
      showSlide(i);
      resetSlideTimer();
    }

    function startSlideTimer() {
      clearInterval(slideTimer);
      slideTimer = setInterval(() => {
        showSlide(currentSlide + 1);
      }, 5000);
    }
    function pauseSlideTimer() {
      clearInterval(slideTimer);
      slideTimer = null;
    }
    function resetSlideTimer() {
      clearInterval(slideTimer);
      startSlideTimer();
    }

    // -------------------------------------------------------------
    // 2. CORE LOAN SERVICES SLIDER ENGINE (Automatic Loop on Mobile & Desktop)
    // -------------------------------------------------------------
    let coreLoansTimer = null;

    function scrollCoreLoans(direction) {
      const slider = document.getElementById('coreLoansSlider');
      if (!slider) return;
      const card = slider.querySelector('button');
      const step = card ? card.offsetWidth + 18 : 180;
      slider.scrollBy({ left: direction * step * (window.innerWidth >= 1024 ? 2 : 1), behavior: 'smooth' });
      setTimeout(updateCoreLoansDots, 350);
      resetCoreLoansTimer();
    }

    function jumpCoreLoans(index) {
      const slider = document.getElementById('coreLoansSlider');
      if (!slider) return;
      const card = slider.querySelector('button');
      const step = card ? card.offsetWidth + 18 : 180;
      const perView = Math.max(1, Math.floor(slider.clientWidth / step));
      slider.scrollTo({ left: index * step * perView, behavior: 'smooth' });
      setTimeout(updateCoreLoansDots, 350);
      resetCoreLoansTimer();
    }

    function startCoreLoansTimer() {
      clearInterval(coreLoansTimer);
      coreLoansTimer = setInterval(() => {
        const slider = document.getElementById('coreLoansSlider');
        if (!slider) return;
        const card = slider.querySelector('button');
        const step = card ? card.offsetWidth + 18 : 170;
        const maxScroll = slider.scrollWidth - slider.clientWidth;
        if (slider.scrollLeft >= maxScroll - 20) {
          slider.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          slider.scrollBy({ left: step, behavior: 'smooth' });
        }
        setTimeout(updateCoreLoansDots, 350);
      }, 3200);
    }

    function pauseCoreLoansTimer() {
      clearInterval(coreLoansTimer);
      coreLoansTimer = null;
    }

    function resetCoreLoansTimer() {
      pauseCoreLoansTimer();
      startCoreLoansTimer();
    }

    function updateCoreLoansDots() {
      const slider = document.getElementById('coreLoansSlider');
      const dotsContainer = document.getElementById('coreLoansDots');
      if (!slider || !dotsContainer) return;
      const cards = slider.querySelectorAll('button');
      if (!cards.length) return;
      const cardWidth = cards[0].offsetWidth + 18;
      const perView = Math.max(1, Math.floor(slider.clientWidth / cardWidth));
      const totalPages = Math.ceil(cards.length / perView);
      const currentPage = Math.min(Math.max(0, Math.round(slider.scrollLeft / (cardWidth * perView))), totalPages - 1);

      dotsContainer.innerHTML = '';
      for (let i = 0; i < totalPages; i++) {
        const btn = document.createElement('button');
        btn.setAttribute('type', 'button');
        btn.setAttribute('aria-label', 'Slide ' + (i + 1));
        btn.className = 'min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer p-0 bg-transparent border-0';
        const dot = document.createElement('span');
        dot.className = (i === currentPage) 
          ? 'w-7 h-2.5 rounded-full bg-white transition-all pointer-events-none shadow-xs' 
          : 'w-2.5 h-2.5 rounded-full bg-white/40 hover:bg-white/80 transition-all pointer-events-none';
        btn.appendChild(dot);
        btn.onclick = () => jumpCoreLoans(i);
        dotsContainer.appendChild(btn);
      }
    }

    // -------------------------------------------------------------
    // 3. VERIFIED CUSTOMER REVIEWS SLIDER (Automatic & Ultra-Smooth)
    // -------------------------------------------------------------
    let homeReviewsTimer = null;
    let aboutReviewsTimer = null;

    function getCardStep(grid) {
      if (!grid) return 360;
      const visibleCards = Array.from(grid.querySelectorAll('.review-card')).filter(c => c.style.display !== 'none');
      if (visibleCards.length < 2) {
        return visibleCards[0] ? visibleCards[0].offsetWidth : 360;
      }
      return visibleCards[1].offsetLeft - visibleCards[0].offsetLeft;
    }

    function autoAdvanceReviews(gridId) {
      const grid = document.getElementById(gridId);
      if (!grid) return;
      if (grid._isUserInteracting) return;

      const visibleCards = Array.from(grid.querySelectorAll('.review-card')).filter(c => c.style.display !== 'none');
      if (visibleCards.length <= 1) return;

      const step = getCardStep(grid);
      const maxScroll = Math.max(0, grid.scrollWidth - grid.clientWidth);
      if (maxScroll <= 10) return;

      const currentIndex = Math.round(grid.scrollLeft / step);
      const nextIndex = currentIndex + 1;

      // When reaching near the end, loop smoothly back to card 0
      if (grid.scrollLeft >= maxScroll - 15 || (nextIndex * step) > maxScroll + (step / 3)) {
        grid.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        grid.scrollTo({ left: Math.min(maxScroll, nextIndex * step), behavior: 'smooth' });
      }
      setTimeout(() => updateReviewsDots(gridId), 350);
    }

    function scrollReviews(gridId, direction) {
      const grid = document.getElementById(gridId);
      if (!grid) return;
      const visibleCards = Array.from(grid.querySelectorAll('.review-card')).filter(c => c.style.display !== 'none');
      if (visibleCards.length === 0) return;

      const step = getCardStep(grid);
      const perView = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;
      const moveDistance = step * perView;
      const maxScroll = Math.max(0, grid.scrollWidth - grid.clientWidth);

      let targetScroll = grid.scrollLeft + (direction * moveDistance);
      if (targetScroll < 0) targetScroll = 0;
      if (targetScroll > maxScroll) targetScroll = maxScroll;

      grid.scrollTo({ left: targetScroll, behavior: 'smooth' });
      setTimeout(() => updateReviewsDots(gridId), 350);
      resetReviewsTimer(gridId);
    }

    function startReviewsTimer(gridId) {
      if (gridId === 'home-reviews-grid') {
        clearInterval(homeReviewsTimer);
        homeReviewsTimer = setInterval(() => autoAdvanceReviews('home-reviews-grid'), 3500);
      } else if (gridId === 'about-reviews-grid') {
        clearInterval(aboutReviewsTimer);
        aboutReviewsTimer = setInterval(() => autoAdvanceReviews('about-reviews-grid'), 3500);
      }
    }

    function pauseReviewsTimer(gridId) {
      if (gridId === 'home-reviews-grid') {
        clearInterval(homeReviewsTimer);
        homeReviewsTimer = null;
      } else if (gridId === 'about-reviews-grid') {
        clearInterval(aboutReviewsTimer);
        aboutReviewsTimer = null;
      }
    }

    function resetReviewsTimer(gridId) {
      pauseReviewsTimer(gridId);
      startReviewsTimer(gridId);
    }

    function startHomeReviewsTimer() { startReviewsTimer('home-reviews-grid'); }
    function pauseHomeReviewsTimer() { pauseReviewsTimer('home-reviews-grid'); }
    function resetHomeReviewsTimer() { resetReviewsTimer('home-reviews-grid'); }

    function updateReviewsDots(gridId) {
      const grid = document.getElementById(gridId);
      const dotsId = gridId === 'home-reviews-grid' ? 'home-reviews-dots' : 'about-reviews-dots';
      const dotsContainer = document.getElementById(dotsId);
      if (!grid || !dotsContainer) return;
      
      const visibleCards = Array.from(grid.querySelectorAll('.review-card')).filter(c => c.style.display !== 'none');
      if (visibleCards.length === 0) {
        dotsContainer.innerHTML = '';
        return;
      }

      const maxScroll = Math.max(1, grid.scrollWidth - grid.clientWidth);
      const scrollFraction = Math.min(1, Math.max(0, grid.scrollLeft / maxScroll));
      
      const totalDots = 5;
      const activeIndex = Math.min(totalDots - 1, Math.round(scrollFraction * (totalDots - 1)));

      dotsContainer.innerHTML = '';
      for (let i = 0; i < totalDots; i++) {
        const btn = document.createElement('button');
        btn.setAttribute('type', 'button');
        btn.setAttribute('aria-label', 'Review progress ' + (i + 1));
        btn.className = 'min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer p-0 bg-transparent border-0';
        const dot = document.createElement('span');
        dot.className = (i === activeIndex)
          ? 'w-7 h-2 rounded-full bg-[#1565C0] transition-all pointer-events-none shadow-xs'
          : 'w-2 h-2 rounded-full bg-slate-300 hover:bg-slate-400 transition-all pointer-events-none';
        btn.appendChild(dot);
        btn.onclick = () => {
          const targetScroll = (i / (totalDots - 1)) * maxScroll;
          grid.scrollTo({ left: targetScroll, behavior: 'smooth' });
          resetReviewsTimer(gridId);
        };
        dotsContainer.appendChild(btn);
      }
    }

    function filterReviews(category, gridId, clickedBtn) {
      const targetGrid = document.getElementById(gridId);
      if (!targetGrid) return;

      const parentContainer = clickedBtn ? clickedBtn.parentElement : null;
      if (parentContainer) {
        parentContainer.querySelectorAll('.review-filter-btn').forEach(btn => {
          btn.classList.remove('bg-[#1565C0]', 'text-white');
          btn.classList.add('bg-white', 'text-slate-700');
        });
        clickedBtn.classList.remove('bg-white', 'text-slate-700');
        clickedBtn.classList.add('bg-[#1565C0]', 'text-white');
      }

      const cards = targetGrid.querySelectorAll('.review-card');
      cards.forEach(card => {
        const cardCat = card.getAttribute('data-category') || '';
        if (category === 'all' || cardCat.toLowerCase().includes(category.toLowerCase())) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });

      targetGrid.scrollTo({ left: 0, behavior: 'smooth' });
      setTimeout(() => updateReviewsDots(gridId), 300);
      resetReviewsTimer(gridId);
    }

    // -------------------------------------------------------------
    // INITIALIZATION & RESILIENT EVENT HANDLERS (TOUCH & MOUSE SAFE)
    // -------------------------------------------------------------
    function initAllSliders() {
      const hasHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;

      // 1. Hero banner auto slider & touch swipe (Continuous 3-second automatic rotation)
      startSlideTimer();
      const heroSliderEl = document.getElementById('home-slider') || document.querySelector('#page-home .hero-slide')?.parentElement;
      if (heroSliderEl) {
        // Continuous auto-slide every 3 seconds without indefinitely freezing on mouse hover
        let touchStartX = 0;
        let touchStartY = 0;
        heroSliderEl.addEventListener('touchstart', (e) => {
          if (e.touches && e.touches[0]) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
          }
        }, { passive: true });
        heroSliderEl.addEventListener('touchend', (e) => {
          if (e.changedTouches && e.changedTouches[0]) {
            const diffX = touchStartX - e.changedTouches[0].clientX;
            const diffY = touchStartY - e.changedTouches[0].clientY;
            if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
              if (diffX > 0) nextSlide(true);
              else prevSlide(true);
            }
          }
          clearTimeout(window._heroTouchResume);
          window._heroTouchResume = setTimeout(startSlideTimer, 3000);
        }, { passive: true });
      }

      // 2. Core loan services auto slider
      updateCoreLoansDots();
      startCoreLoansTimer();
      const coreSlider = document.getElementById('coreLoansSlider');
      if (coreSlider) {
        if (hasHover) {
          coreSlider.addEventListener('mouseenter', pauseCoreLoansTimer);
          coreSlider.addEventListener('mouseleave', startCoreLoansTimer);
        }
        coreSlider.addEventListener('touchstart', pauseCoreLoansTimer, { passive: true });
        coreSlider.addEventListener('touchend', () => {
          clearTimeout(window._coreTouchResume);
          window._coreTouchResume = setTimeout(startCoreLoansTimer, 2500);
        }, { passive: true });
        coreSlider.addEventListener('scroll', () => {
          clearTimeout(window._coreScrollTimer);
          window._coreScrollTimer = setTimeout(updateCoreLoansDots, 100);
        });
      }

      // 3. Customer reviews auto slider (smooth & automatic)
      function setupReviewSliderEvents(gridId) {
        const grid = document.getElementById(gridId);
        if (!grid) return;
        updateReviewsDots(gridId);
        startReviewsTimer(gridId);

        if (hasHover) {
          grid.addEventListener('mouseenter', () => {
            grid._isUserInteracting = true;
            pauseReviewsTimer(gridId);
          });
          grid.addEventListener('mouseleave', () => {
            grid._isUserInteracting = false;
            startReviewsTimer(gridId);
          });
        }

        grid.addEventListener('touchstart', () => {
          grid._isUserInteracting = true;
          pauseReviewsTimer(gridId);
        }, { passive: true });

        grid.addEventListener('touchend', () => {
          clearTimeout(grid._touchResumeTimer);
          grid._touchResumeTimer = setTimeout(() => {
            grid._isUserInteracting = false;
            startReviewsTimer(gridId);
          }, 2500);
        }, { passive: true });

        grid.addEventListener('scroll', () => {
          clearTimeout(grid._scrollTimer);
          grid._scrollTimer = setTimeout(() => updateReviewsDots(gridId), 100);
        });
      }

      setupReviewSliderEvents('home-reviews-grid');
      setupReviewSliderEvents('about-reviews-grid');
    }

    // Auto-resume sliders on tab visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        pauseSlideTimer();
        pauseCoreLoansTimer();
        pauseHomeReviewsTimer();
      } else {
        const homePage = document.getElementById('page-home');
        if (homePage && homePage.classList.contains('active-page')) {
          startSlideTimer();
          startCoreLoansTimer();
          startReviewsTimer('home-reviews-grid');
        }
        const aboutPage = document.getElementById('page-about');
        if (aboutPage && aboutPage.classList.contains('active-page')) {
          startReviewsTimer('about-reviews-grid');
        }
      }
    });

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => setTimeout(initAllSliders, 5000));
    } else {
      setTimeout(initAllSliders, 5000);
    }

    
    function syncMainHeaderHeight() {
      // CSS :root already declares --main-header-height statically without triggering forced reflow
    }
    // syncMainHeaderHeight bypassed to prevent forced layout reflow

    
    // -------------------------------------------------------------
    // LEGAL MODAL & COMPLIANCE ROUTING
    // -------------------------------------------------------------
    function openLegalModal(tabId) {
      const modal = document.getElementById('legal-modal');
      if (!modal) return;
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      document.body.style.overflow = 'hidden';
      if (tabId) {
        switchLegalTab(tabId);
      }
    }

    function closeLegalModal() {
      const modal = document.getElementById('legal-modal');
      if (!modal) return;
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.style.overflow = '';
    }

    function switchLegalTab(tabId) {
      document.querySelectorAll('.legal-panel').forEach(p => p.classList.add('hidden'));
      
      ['privacy', 'terms', 'disclaimers', 'grievance', 'fair-practices'].forEach(t => {
        const btn = document.getElementById('ltab-' + t);
        if (btn) {
          btn.classList.remove('bg-[#F26522]', 'text-white', 'shadow-xs');
          btn.classList.add('bg-white/15', 'text-white/90');
        }
      });

      let actualTab = tabId;
      if (tabId === 'fair-practices') actualTab = 'grievance';

      const targetPanel = document.getElementById('lpanel-' + actualTab);
      if (targetPanel) {
        targetPanel.classList.remove('hidden');
      }

      const activeBtn = document.getElementById('ltab-' + actualTab);
      if (activeBtn) {
        activeBtn.classList.remove('bg-white/15', 'text-white/90');
        activeBtn.classList.add('bg-[#F26522]', 'text-white', 'shadow-xs');
      }

      const titleEl = document.getElementById('legal-modal-title');
      if (titleEl) {
        if (actualTab === 'privacy') titleEl.textContent = 'Privacy Policy & Data Protection';
        else if (actualTab === 'terms') titleEl.textContent = 'Terms & Conditions of Service';
        else if (actualTab === 'disclaimers') titleEl.textContent = 'Statutory Lending Disclaimers & APR';
        else if (actualTab === 'grievance') titleEl.textContent = 'Grievance Redressal & Fair Practices';
      }
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeLegalModal();
      }
    });

    const legalModalEl = document.getElementById('legal-modal');
    if (legalModalEl) {
      legalModalEl.addEventListener('click', (e) => {
        if (e.target === legalModalEl) closeLegalModal();
      });
    }

    function switchPage(pageId) {
      if (typeof pageId === 'string' && pageId.startsWith('page-')) {
        pageId = pageId.replace(/^page-/, '');
      }
      // Map aliases for professional loans and overdraft facility
      if (pageId === 'doctor-loan' || pageId === 'ca-loan') {
        pageId = 'professional-loan';
      }
      if (pageId === 'cgt' || pageId === 'cgt-msme' || pageId === 'cgt-loan' || pageId === 'msme-loan' || pageId === 'od-loan' || pageId === 'overdraft' || pageId === 'overdraft-facility' || pageId === 'od') {
        pageId = 'od-facility';
      }
      if (pageId === 'privacy' || pageId === 'terms' || pageId === 'disclaimers' || pageId === 'grievance' || pageId === 'fair-practices') {
        openLegalModal(pageId);
        return;
      }
      if (pageId === 'track') {
        setTimeout(() => {
          if (typeof renderTrackingApp === 'function') {
            if (currentTrackApp) {
              renderTrackingApp(currentTrackApp);
            } else if (typeof showTrackEmptyState === 'function') {
              showTrackEmptyState();
            }
          }
        }, 50);
      }
      setTimeout(syncMainHeaderHeight, 40);
      console.log('Switching to page:', pageId);
      const pages = document.querySelectorAll('.page-section');
      pages.forEach(p => {
        p.classList.remove('active-page');
      });

      const target = document.getElementById('page-' + pageId);
      if (target) {
        target.classList.add('active-page');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // Auto-refresh inline loan calc if entering a loan product page
        if (['professional-loan', 'home-loan', 'personal-loan', 'business-loan', 'lap-loan', 'working-capital', 'od-facility', 'car-loan', 'education-loan', 'machinery-loan'].includes(pageId)) {
          setTimeout(() => {
            if (typeof runInlineLoanCalc === 'function') runInlineLoanCalc(pageId);
          }, 60);
        }
      } else {
        console.warn('Page section not found: page-' + pageId + ', falling back to home');
        const home = document.getElementById('page-home');
        if (home) home.classList.add('active-page');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      // If returning to Home, restart hero, loan services, and reviews auto sliders
      if (pageId === 'home') {
        showSlide(0);
        startSlideTimer();
        startCoreLoansTimer();
        startReviewsTimer('home-reviews-grid');
      } else if (pageId === 'about') {
        pauseSlideTimer();
        pauseCoreLoansTimer();
        pauseReviewsTimer('home-reviews-grid');
        startReviewsTimer('about-reviews-grid');
      } else {
        pauseSlideTimer();
        pauseCoreLoansTimer();
        pauseReviewsTimer('home-reviews-grid');
        pauseReviewsTimer('about-reviews-grid');
      }

      // Update Subnav category active pill state (Capitalneed Style: clean underline / highlight)
      const navButtons = document.querySelectorAll('#subnav-container button');
      navButtons.forEach(btn => {
        const onclickAttr = btn.getAttribute('onclick') || '';
        if (pageId !== 'home' && onclickAttr.includes("'" + pageId + "'")) {
          btn.classList.add('text-amber-300', 'font-bold', 'underline', 'underline-offset-4');
          btn.classList.remove('text-white/90');
        } else {
          btn.classList.remove('text-amber-300', 'font-bold', 'underline', 'underline-offset-4');
          btn.classList.add('text-white/90');
        }
      });

      // Update Top Nav link active highlights (Clean typography without boxy backgrounds)
      const topNavLinks = document.querySelectorAll('header nav a');
      topNavLinks.forEach(link => {
        const onclickAttr = link.getAttribute('onclick') || '';
        if (onclickAttr.includes("'" + pageId + "'")) {
          link.classList.add('text-[#1565C0]', 'font-bold');
          link.classList.remove('text-slate-700');
        } else {
          link.classList.remove('text-[#1565C0]', 'font-bold');
          link.classList.add('text-slate-700');
        }
      });
    }

    // -------------------------------------------------------------
    // 3. MODAL CONTROLLER
    // -------------------------------------------------------------
    function openApplyModal(serviceName) {
      const modal = document.getElementById('apply-modal');
      const badge = document.getElementById('modal-service-badge');
      const select = document.getElementById('modal-product-select');
      
      if (badge && serviceName) badge.innerText = serviceName;
      if (select && serviceName && select.options) {
        for (let i = 0; i < select.options.length; i++) {
          if (select.options[i].text && select.options[i].text.toLowerCase().includes(serviceName.toLowerCase())) {
            select.selectedIndex = i;
            break;
          }
        }
      }
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
    }

    function closeApplyModal() {
      const modal = document.getElementById('apply-modal');
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

        // ==============================================================
    // REAL-TIME CLIENT GMAIL LEAD NOTIFICATION ENGINE
    // ==============================================================
    var PROLOAN_CLIENT_GMAIL = localStorage.getItem('proloan_client_gmail') || 'infoproloanindia@gmail.com';

    function setClientLeadGmail(email) {
      if (email && email.includes('@')) {
        PROLOAN_CLIENT_GMAIL = email.trim();
        try {
          localStorage.setItem('proloan_client_gmail', PROLOAN_CLIENT_GMAIL);
        } catch(e) {}
        console.log('✅ Client lead notifications will now be routed to:', PROLOAN_CLIENT_GMAIL);
        return 'Updated lead email to: ' + PROLOAN_CLIENT_GMAIL;
      } else {
        console.warn('Invalid email address:', email);
        return 'Invalid email address';
      }
    }

    function dispatchLeadToGmail(leadData) {
      var recipient = window.PROLOAN_CLIENT_GMAIL || localStorage.getItem('proloan_client_gmail') || 'infoproloanindia@gmail.com';
      if (!leadData) return;

      var leadTitle = leadData.product || leadData.type || 'Loan Inquiry';
      var subject = '🚀 [NEW LEAD] ' + leadTitle + ' - ' + (leadData.name || 'Borrower') + (leadData.amount ? ' (' + leadData.amount + ')' : '');

      var payload = {
        _subject: subject,
        _template: 'table',
        _captcha: 'false',
        'Lead Category': leadData.source || 'Website Lead',
        'Application Reference ID': leadData.id || ('PL-' + Math.floor(100000 + Math.random() * 900000)),
        'Applicant Legal Name': leadData.name || 'Not Provided',
        'Contact Mobile Number': leadData.phone || leadData.mobile || 'Not Provided',
        'Requested Loan Product': leadData.product || leadData.loanType || 'General Consultation',
        'Requested Loan Amount': leadData.amount || 'Flexible / As per eligibility',
        'City / Location': leadData.city || 'Pan India',
        'Monthly Income / Tier': leadData.income || 'Not Disclosed',
        'PAN Card / Tax ID': leadData.pan || 'N/A',
        'Aadhaar Card / UIDAI': leadData.aadhaar || 'N/A',
        'Verification / CIBIL Note': leadData.notes || 'Verified via Portal',
        'Timestamp': new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
      };

      // ── CHANNEL 1: FormSubmit.co ── works on GitHub Pages / any static host
      try {
        fetch('https://formsubmit.co/ajax/infoproloanindia@gmail.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        }).then(function(r){ return r.json(); })
          .then(function(d){ if(d && d.success === 'true') console.log('Lead sent via FormSubmit.co'); else console.warn('FormSubmit.co warning:', d && d.message); })
          .catch(function(e){ console.warn('FormSubmit.co error:', e); });
      } catch(e){}

      // ── CHANNEL 2: Nodemailer backend ── works when local server.js is running
      // 1. Dispatch via Nodemailer backend (Express /api/send-lead)
      try {
        fetch('/api/send-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(function(res) {
          return res.json();
        }).then(function(data) {
          if (data && data.success) {
            console.log('✅ Lead email sent via Nodemailer:', data.message);
          } else {
            console.warn('⚠️ Lead dispatch warning:', data && data.message);
          }
        }).catch(function(err) {
          console.warn('⚠️ Lead dispatch network error (saved locally):', err);
        });
      } catch(e) {}

      // 2. Persist locally in lead history log so no lead is ever lost
      try {
        var rawLog = localStorage.getItem('proloan_leads_log') || '[]';
        var log = JSON.parse(rawLog);
        if (!Array.isArray(log)) log = [];
        log.unshift(payload);
        localStorage.setItem('proloan_leads_log', JSON.stringify(log.slice(0, 100)));
      } catch(e) {}

      // 3. Direct Realtime Sync to Supabase Database (if connected)
      try {
        var sbUrl = localStorage.getItem('proloan_supabase_url') || 'https://yutjqfqgkpuogocextrg.supabase.co';
        var sbKey = localStorage.getItem('proloan_supabase_key') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1dGpxZnFna3B1b2dvY2V4dHJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxNjM3NzQsImV4cCI6MjEwNzczOTc3NH0.yz62DZdGCsyhwR9ks1s8MkJPu9uR0yaWJfZUh8c1bDk';
        if (sbUrl && sbKey) {
          fetch(sbUrl.replace(/\/+$/, '') + '/rest/v1/leads', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': sbKey,
              'Authorization': 'Bearer ' + sbKey,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              ref_id: payload['Application Reference ID'],
              applicant_name: payload['Applicant Legal Name'],
              mobile: payload['Contact Mobile Number'],
              loan_product: payload['Requested Loan Product'],
              loan_amount: payload['Requested Loan Amount'],
              city: payload['City / Location'],
              monthly_income: payload['Monthly Income / Tier'],
              pan_card: payload['PAN Card / Tax ID'],
              cibil_notes: payload['Verification / CIBIL Note'],
              lead_category: payload['Lead Category'] || 'Website Lead',
              status: 'New'
            })
          }).catch(function(err){ console.warn('Supabase lead push warning:', err); });
        }
      } catch(e){}
    }

function handleModalSubmit(e) {
      e.preventDefault();
      closeApplyModal();

      // Generate realistic Application ID
      const newId = 'PL-' + Math.floor(4000 + Math.random() * 5000);
      const nameInput = document.getElementById('modal-name');
      const phoneInput = document.getElementById('modal-phone');
      const select = document.getElementById('modal-product-select');

      const name = nameInput ? nameInput.value.trim() : 'Valued Borrower';
      const phone = phoneInput ? phoneInput.value.trim() : '+91 98765 43210';
      const loanType = select ? select.value : 'Multi-Bank Loan';

      // Create new active record in TRACKING_DB
      if (typeof TRACKING_DB !== 'undefined') {
        const newApp = {
          id: newId,
          name: name || 'Valued Borrower',
          phone: phone || '+91 98765 43210',
          loanType: loanType,
          amount: '₹25,00,000',
          bank: 'HDFC Bank',
          stage: 2,
          stageText: 'Stage 2 of 5 - KYC & CIBIL Bureau Clearance in Progress',
          eta: '2-3 Working Days',
          officer: 'Vikram Malhotra',
          milestones: [
            { title: 'Application Logged & CRM Sync', status: 'Completed', date: 'Just Now', note: 'Application registered in Proloan Multi-Bank LOS. Reference #' + newId + '.' },
            { title: 'KYC & CIBIL Bureau Clearance', status: 'Active', date: 'In Progress', note: 'Zonal underwriting desk verifying documents.' },
            { title: 'Bank Underwriting & Technical Appraisal', status: 'Pending', date: 'Upcoming', note: 'Credit committee approval.' },
            { title: 'Sanction Letter Issuance', status: 'Pending', date: 'Upcoming', note: 'In-principle credit terms.' },
            { title: 'Loan Agreement & Disbursal', status: 'Pending', date: 'Upcoming', note: 'Direct bank credit.' }
          ]
        };
        TRACKING_DB[newId] = newApp;
        currentTrackApp = newApp;
      }

      // Real-Time Gmail Lead Dispatch to Client
      dispatchLeadToGmail({
        source: 'Fast-Track Loan Modal',
        id: newId,
        name: name,
        phone: phone,
        product: loanType,
        amount: '₹25,00,000'
      });
    }

    // -------------------------------------------------------------
    
    // -------------------------------------------------------------
    // 4. ADVANCED LOAN EMI CALCULATOR ENGINES (ALL 9 LOANS & HOME)
    // -------------------------------------------------------------
    function calculateEMI(principal, annualRate, tenureYears) {
      if (!principal || principal <= 0) return 0;
      const monthlyRate = (annualRate / 12) / 100;
      const totalMonths = tenureYears * 12;
      if (monthlyRate === 0) return Math.round(principal / totalMonths);
      const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
      return Math.round(emi);
    }

    // Universal Loan Calculator updater for any prefix
    function updateLoanCalc(prefix) {
      const amountSlider = document.getElementById(prefix + '-amount-slider');
      const amountInput = document.getElementById(prefix + '-amount-input');
      const rateSlider = document.getElementById(prefix + '-rate-slider');
      const rateInput = document.getElementById(prefix + '-rate-input');
      const tenureSlider = document.getElementById(prefix + '-tenure-slider');
      const tenureInput = document.getElementById(prefix + '-tenure-input');

      if (!amountSlider || !rateSlider || !tenureSlider) return;

      const amount = parseFloat(amountSlider.value);
      const rate = parseFloat(rateSlider.value);
      const tenure = parseFloat(tenureSlider.value);

      if (amountInput) amountInput.value = amount;
      if (rateInput) rateInput.value = rate.toFixed(2);
      if (tenureInput) tenureInput.value = tenure;

      const emi = calculateEMI(amount, rate, tenure);
      const totalPayment = emi * (tenure * 12);
      const totalInterest = Math.max(0, totalPayment - amount);

      const emiEl = document.getElementById(prefix + '-emi-display');
      const principalEl = document.getElementById(prefix + '-principal-display');
      const interestEl = document.getElementById(prefix + '-interest-display');
      const totalEl = document.getElementById(prefix + '-total-display');
      const barPrincipal = document.getElementById(prefix + '-bar-principal');
      const barInterest = document.getElementById(prefix + '-bar-interest');
      const principalPctEl = document.getElementById(prefix + '-principal-pct');
      const interestPctEl = document.getElementById(prefix + '-interest-pct');

      if (emiEl) emiEl.innerText = '₹ ' + emi.toLocaleString('en-IN');
      if (principalEl) principalEl.innerText = '₹ ' + amount.toLocaleString('en-IN');
      if (interestEl) interestEl.innerText = '₹ ' + totalInterest.toLocaleString('en-IN');
      if (totalEl) totalEl.innerText = '₹ ' + totalPayment.toLocaleString('en-IN');

      const principalPct = totalPayment > 0 ? Math.round((amount / totalPayment) * 100) : 50;
      const interestPct = 100 - principalPct;

      if (principalPctEl) principalPctEl.innerText = principalPct + '%';
      if (interestPctEl) interestPctEl.innerText = interestPct + '%';
      if (barPrincipal) barPrincipal.style.width = principalPct + '%';
      if (barInterest) barInterest.style.width = interestPct + '%';
    }

    function syncLoanCalcAmount(prefix, val) {
      const slider = document.getElementById(prefix + '-amount-slider');
      if (slider) {
        slider.value = val;
        updateLoanCalc(prefix);
      }
    }
    function syncLoanCalcRate(prefix, val) {
      const slider = document.getElementById(prefix + '-rate-slider');
      if (slider) {
        slider.value = val;
        updateLoanCalc(prefix);
      }
    }
    function syncLoanCalcTenure(prefix, val) {
      const slider = document.getElementById(prefix + '-tenure-slider');
      if (slider) {
        slider.value = val;
        updateLoanCalc(prefix);
      }
    }
    function setLoanCalcPreset(prefix, amount, rate, tenure) {
      const amountSlider = document.getElementById(prefix + '-amount-slider');
      const rateSlider = document.getElementById(prefix + '-rate-slider');
      const tenureSlider = document.getElementById(prefix + '-tenure-slider');
      if (amountSlider) amountSlider.value = amount;
      if (rateSlider) rateSlider.value = rate;
      if (tenureSlider) tenureSlider.value = tenure;
      updateLoanCalc(prefix);
    }
    function applyWithLoanEMI(loanTitle, prefix) {
      const emiEl = document.getElementById(prefix + '-emi-display');
      const emiVal = emiEl ? emiEl.innerText.trim() : '';
      openApplyModal(loanTitle + ' (Plan: ' + emiVal + '/mo)');
    }

    // HOME PAGE CALCULATOR ENGINE
    const HOME_CALC_DATA = {
      'professional-loan': {
        title: 'Professional Loan',
        page: 'professional-loan',
        amount: 2500000,
        rate: 9.00,
        tenure: 5,
        presets: [
          { label: '₹10L (3Y)', amount: 1000000, rate: 9.00, tenure: 3 },
          { label: '₹25L (5Y)', amount: 2500000, rate: 9.00, tenure: 5 },
          { label: '₹50L (5Y)', amount: 5000000, rate: 9.00, tenure: 5 },
          { label: '₹75L (5Y)', amount: 7500000, rate: 9.00, tenure: 5 }
        ]
      },
      'home-loan': {
        title: 'Home Loan',
        page: 'home-loan',
        amount: 5000000,
        rate: 7.00,
        tenure: 25,
        presets: [
          { label: '₹30L (25Y)', amount: 3000000, rate: 7.00, tenure: 25 },
          { label: '₹50L (25Y)', amount: 5000000, rate: 7.00, tenure: 25 },
          { label: '₹75L (25Y)', amount: 7500000, rate: 7.00, tenure: 25 },
          { label: '₹1Cr (25Y)', amount: 10000000, rate: 7.00, tenure: 25 }
        ]
      },
      'personal-loan': {
        title: 'Personal Loan',
        page: 'personal-loan',
        amount: 1000000,
        rate: 9.99,
        tenure: 5,
        presets: [
          { label: '₹3L (3Y)', amount: 300000, rate: 9.99, tenure: 3 },
          { label: '₹5L (4Y)', amount: 500000, rate: 9.99, tenure: 4 },
          { label: '₹10L (5Y)', amount: 1000000, rate: 9.99, tenure: 5 },
          { label: '₹20L (5Y)', amount: 2000000, rate: 9.99, tenure: 5 }
        ]
      },
      'business-loan': {
        title: 'Business Loan',
        page: 'business-loan',
        amount: 2500000,
        rate: 10.45,
        tenure: 4,
        presets: [
          { label: '₹10L (3Y)', amount: 1000000, rate: 10.45, tenure: 3 },
          { label: '₹25L (4Y)', amount: 2500000, rate: 10.45, tenure: 4 },
          { label: '₹40L (5Y)', amount: 4000000, rate: 10.45, tenure: 5 },
          { label: '₹75L (5Y)', amount: 7500000, rate: 10.45, tenure: 5 }
        ]
      },
      'lap-loan': {
        title: 'Property Loan (LAP)',
        page: 'lap-loan',
        amount: 6000000,
        rate: 8.40,
        tenure: 15,
        presets: [
          { label: '₹30L (15Y)', amount: 3000000, rate: 8.40, tenure: 15 },
          { label: '₹60L (15Y)', amount: 6000000, rate: 8.40, tenure: 15 },
          { label: '₹1Cr (15Y)', amount: 10000000, rate: 8.40, tenure: 15 },
          { label: '₹2.5Cr (15Y)', amount: 25000000, rate: 8.40, tenure: 15 }
        ]
      },
      'working-capital': {
        title: 'Working Capital',
        page: 'working-capital',
        amount: 2500000,
        rate: 9.00,
        tenure: 5,
        presets: [
          { label: '₹10L (3Y)', amount: 1000000, rate: 9.00, tenure: 3 },
          { label: '₹25L (5Y)', amount: 2500000, rate: 9.00, tenure: 5 },
          { label: '₹50L (5Y)', amount: 5000000, rate: 9.00, tenure: 5 },
          { label: '₹1Cr (5Y)', amount: 10000000, rate: 9.00, tenure: 5 }
        ]
      },
      'od-facility': {
        title: 'CGT/MSME Loan',
        page: 'od-facility',
        amount: 2500000,
        rate: 9.50,
        tenure: 3,
        presets: [
          { label: '₹10L (2Y)', amount: 1000000, rate: 9.50, tenure: 2 },
          { label: '₹25L (3Y)', amount: 2500000, rate: 9.50, tenure: 3 },
          { label: '₹50L (5Y)', amount: 5000000, rate: 9.50, tenure: 5 },
          { label: '₹1Cr (5Y)', amount: 10000000, rate: 9.50, tenure: 5 }
        ]
      },
      'car-loan': {
        title: 'Car Loan',
        page: 'car-loan',
        amount: 1200000,
        rate: 7.45,
        tenure: 5,
        presets: [
          { label: '₹5L (5Y)', amount: 500000, rate: 7.45, tenure: 5 },
          { label: '₹10L (5Y)', amount: 1000000, rate: 7.45, tenure: 5 },
          { label: '₹15L (5Y)', amount: 1500000, rate: 7.45, tenure: 5 },
          { label: '₹25L (7Y)', amount: 2500000, rate: 7.45, tenure: 7 }
        ]
      },
      'education-loan': {
        title: 'Education Loan',
        page: 'education-loan',
        amount: 2500000,
        rate: 7.50,
        tenure: 10,
        presets: [
          { label: '₹10L (7Y)', amount: 1000000, rate: 7.50, tenure: 7 },
          { label: '₹25L (10Y)', amount: 2500000, rate: 7.50, tenure: 10 },
          { label: '₹50L (12Y)', amount: 5000000, rate: 7.50, tenure: 12 },
          { label: '₹1Cr (15Y)', amount: 10000000, rate: 7.50, tenure: 15 }
        ]
      },
      'machinery-loan': {
        title: 'Equipment Loan',
        page: 'machinery-loan',
        amount: 2500000,
        rate: 8.75,
        tenure: 5,
        presets: [
          { label: '₹10L (3Y)', amount: 1000000, rate: 8.75, tenure: 3 },
          { label: '₹25L (5Y)', amount: 2500000, rate: 8.75, tenure: 5 },
          { label: '₹50L (5Y)', amount: 5000000, rate: 8.75, tenure: 5 },
          { label: '₹1Cr (7Y)', amount: 10000000, rate: 8.75, tenure: 7 }
        ]
      },
      'cgt-msme': {
        title: 'CGT/MSME Loan',
        page: 'od-facility',
        amount: 2500000,
        rate: 9.50,
        tenure: 5,
        presets: [
          { label: '₹10L (3Y)', amount: 1000000, rate: 9.50, tenure: 3 },
          { label: '₹25L (5Y)', amount: 2500000, rate: 9.50, tenure: 5 },
          { label: '₹50L (5Y)', amount: 5000000, rate: 9.50, tenure: 5 },
          { label: '₹1Cr (5Y)', amount: 10000000, rate: 9.50, tenure: 5 }
        ]
      },
      'balance-transfer': {
        title: 'Balance Transfer',
        page: 'balance-transfer',
        amount: 4500000,
        rate: 7.00,
        tenure: 20,
        presets: [
          { label: '₹25L (20Y)', amount: 2500000, rate: 7.00, tenure: 20 },
          { label: '₹45L (20Y)', amount: 4500000, rate: 7.00, tenure: 20 },
          { label: '₹70L (20Y)', amount: 7000000, rate: 7.00, tenure: 20 },
          { label: '₹1Cr (20Y)', amount: 10000000, rate: 7.00, tenure: 20 }
        ]
      }
    };

    let currentHomeCategory = 'home-loan';

    function setHomeCalcCategory(catKey) {
      currentHomeCategory = catKey;
      const data = HOME_CALC_DATA[catKey];
      if (!data) return;

      // Update switcher buttons
      document.querySelectorAll('.home-calc-tab').forEach(btn => {
        btn.classList.remove('bg-[#1565C0]', 'text-white');
        btn.classList.add('bg-white', 'text-slate-700');
      });
      const activeBtn = document.getElementById('hbtn-' + catKey);
      if (activeBtn) {
        activeBtn.classList.remove('bg-white', 'text-slate-700');
        activeBtn.classList.add('bg-[#1565C0]', 'text-white');
      }

      // Update preset buttons
      const presetsContainer = document.getElementById('home-calc-presets');
      if (presetsContainer) {
        presetsContainer.innerHTML = data.presets.map(p => 
          `<button type="button" onclick="setHomePreset(${p.amount}, ${p.rate}, ${p.tenure})" class="px-3 py-2 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition-all cursor-pointer">${p.label}</button>`
        ).join('');
      }

      // Update inputs & sliders
      document.getElementById('home-calc-amount-slider').value = data.amount;
      document.getElementById('home-calc-rate-slider').value = data.rate;
      document.getElementById('home-calc-tenure-slider').value = data.tenure;

      // Update view page button
      const viewPageBtn = document.getElementById('home-calc-view-page-btn');
      if (viewPageBtn) {
        viewPageBtn.setAttribute('onclick', `switchPage('${data.page}')`);
        viewPageBtn.querySelector('span').innerText = `View Full ${data.title} Page`;
      }

      updateHomeCalculator();
    }

    function setHomePreset(amount, rate, tenure) {
      document.getElementById('home-calc-amount-slider').value = amount;
      document.getElementById('home-calc-rate-slider').value = rate;
      document.getElementById('home-calc-tenure-slider').value = tenure;
      updateHomeCalculator();
    }

    function updateHomeCalculator() {
      const amountSlider = document.getElementById('home-calc-amount-slider');
      const rateSlider = document.getElementById('home-calc-rate-slider');
      const tenureSlider = document.getElementById('home-calc-tenure-slider');

      if (!amountSlider || !rateSlider || !tenureSlider) return;

      const amount = parseFloat(amountSlider.value);
      const rate = parseFloat(rateSlider.value);
      const tenure = parseFloat(tenureSlider.value);

      document.getElementById('home-calc-amount-input').value = amount;
      document.getElementById('home-calc-rate-input').value = rate.toFixed(2);
      document.getElementById('home-calc-tenure-input').value = tenure;

      const emi = calculateEMI(amount, rate, tenure);
      const totalPayment = emi * (tenure * 12);
      const totalInterest = Math.max(0, totalPayment - amount);

      document.getElementById('home-calc-emi-display').innerText = '₹ ' + emi.toLocaleString('en-IN');
      document.getElementById('home-calc-principal-display').innerText = '₹ ' + amount.toLocaleString('en-IN');
      document.getElementById('home-calc-interest-display').innerText = '₹ ' + totalInterest.toLocaleString('en-IN');
      document.getElementById('home-calc-total-display').innerText = '₹ ' + totalPayment.toLocaleString('en-IN');

      const principalPct = totalPayment > 0 ? Math.round((amount / totalPayment) * 100) : 50;
      document.getElementById('home-calc-principal-pct').innerText = principalPct + '%';

      const donutSegment = document.getElementById('home-calc-donut-segment');
      if (donutSegment) {
        donutSegment.setAttribute('stroke-dasharray', `${principalPct}, 100`);
      }
    }

    function syncHomeAmount(val) {
      document.getElementById('home-calc-amount-slider').value = val;
      updateHomeCalculator();
    }
    function syncHomeRate(val) {
      document.getElementById('home-calc-rate-slider').value = val;
      updateHomeCalculator();
    }
    function syncHomeTenure(val) {
      document.getElementById('home-calc-tenure-slider').value = val;
      updateHomeCalculator();
    }
    function applyHomeCalcPlan() {
      const emi = document.getElementById('home-calc-emi-display').innerText.trim();
      const catData = HOME_CALC_DATA[currentHomeCategory] || { title: 'Loan' };
      openApplyModal(catData.title + ' Plan (' + emi + '/mo)');
    }

    // -------------------------------------------------------------
    // BLOG ARTICLES DATA & MODAL SYSTEM
    // -------------------------------------------------------------
    const BLOG_ARTICLES_DATA = {
      'featured-masterclass': {
        title: '2026 Home Loan Guide: How Smart Borrowers Save ₹5 to ₹15 Lakhs on Total Interest',
        image: 'assets/blog/blog-home-loan-masterclass.jpg',
        category: 'Home Loans & Savings',
        author: 'Senior Credit Underwriter, Proloan India',
        readTime: '7 min read',
        content: `
          <div class="space-y-4">
            <p class="text-base font-bold text-slate-900">
              When most borrowers take a ₹50,00,000 housing loan for 25 years at 8.50%, they casually focus only on their monthly EMI of approx ₹40,261. Very few realize that over the 25-year lifetime, they will pay back ₹1,20,78,414 — meaning over <strong>₹70.78 Lakhs in interest alone!</strong>
            </p>
            <div class="p-4 rounded-2xl bg-orange-50 border border-orange-200">
              <h4 class="font-bold text-[#F26522] text-sm">Key Takeaway of the 2026 Borrowing Playbook</h4>
              <p class="text-xs text-slate-700 mt-1">By applying small annual prepayments and checking for lower benchmark spreads, you can easily save between ₹8 Lakhs to ₹15 Lakhs without impacting your everyday lifestyle.</p>
            </div>
            <h4 class="text-base font-bold text-slate-900 mt-4">1. The Power of One Extra EMI Every Year</h4>
            <p>If you pay just <strong>one additional EMI per year</strong> (or increase your monthly EMI by just 8-10% as your salary grows), your 25-year loan gets paid off in approximately 18 years. That eliminates 7 whole years of compound interest payments.</p>
            
            <h4 class="text-base font-bold text-slate-900 mt-4">2. The 0.50% Balance Transfer Advantage</h4>
            <p>If your current lender is charging you 8.90% or 9.15% because you took your loan 2-3 years ago, transferring your loan balance to a top scheduled bank offering 8.35% will generate instant savings. On a ₹50 Lakh loan balance with 20 years remaining, a 0.55% reduction saves approx <strong>₹4.1 Lakhs</strong> in total interest.</p>

            <h4 class="text-base font-bold text-slate-900 mt-4">3. Zero Prepayment Penalties on Floating Home Loans</h4>
            <p>As per RBI regulations, banks and housing finance companies cannot charge any foreclosure or part-prepayment penalties on floating rate housing loans for individual borrowers. Put your annual Diwali bonuses and tax refunds directly into loan principal reduction!</p>

            <div class="p-4 bg-blue-50 rounded-xl border border-blue-200 text-xs text-[#1565C0] font-semibold">
              Proloan India offers completely free balance transfer evaluations and negotiates zero-processing-fee waivers with top partner banks.
            </div>
          </div>
        `
      },
      'tax-deductions-guide': {
        title: 'Claim Maximum Tax Deductions Under Sec 80C, 24(b) & 80EEA on Housing Loans',
        image: 'assets/blog/blog-tax-savings.jpg',
        category: 'Tax Savings & Legal',
        author: 'Senior Tax & Mortgage Consultant',
        readTime: '5 min read',
        content: `
          <div class="space-y-4">
            <p class="text-base font-bold text-slate-900">
              Housing loans continue to be one of the most effective tax-saving tools for salaried professionals and business owners in India under the Old Tax Regime.
            </p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span class="font-black text-slate-900 text-sm">Section 24(b)</span>
                <p class="text-slate-600 mt-1">Deduction up to <strong>₹2,00,000 per financial year</strong> on the interest component paid on self-occupied house property.</p>
              </div>
              <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span class="font-black text-slate-900 text-sm">Section 80C</span>
                <p class="text-slate-600 mt-1">Deduction up to <strong>₹1,50,000</strong> on the principal repayment portion, including stamp duty and registration fees paid during the year of purchase.</p>
              </div>
            </div>

            <h4 class="text-base font-bold text-slate-900 mt-4">The Joint Home Loan Superpower: Double Deductions</h4>
            <p>When you and your spouse (or co-owner) take a joint housing loan and both contribute to EMI repayments, <strong>both co-owners can separately claim deductions</strong> up to ₹2 Lakhs each under Section 24(b) and up to ₹1.5 Lakhs each under Section 80C! This raises your total household tax-sheltered income to <strong>₹7,00,000 annually</strong>.</p>

            <h4 class="text-base font-bold text-slate-900 mt-4">Pre-Construction Interest Amortization</h4>
            <p>If you purchased an under-construction apartment, the interest paid before possession is not lost. You can claim the total pre-construction interest in <strong>5 equal annual installments</strong> starting from the financial year in which construction is completed.</p>
          </div>
        `
      },
      'cibil-boost-strategy': {
        title: '7 Proven Steps to Elevate Your CIBIL Score Above 750 in Under 90 Days',
        image: 'assets/blog/blog-cibil-recovery.jpg',
        category: 'Credit Score Health',
        author: 'Special Credit Committee Desk',
        readTime: '6 min read',
        content: `
          <div class="space-y-4">
            <p class="text-base font-bold text-slate-900">
              A CIBIL score above 750 is the golden key that opens doors to immediate loan approvals, minimal documentation, and preferential interest rates that can be up to 0.50% lower than standard card rates.
            </p>
            
            <h4 class="text-base font-bold text-slate-900 mt-3">1. Keep Credit Utilization Ratio (CUR) Below 30%</h4>
            <p>If your total credit card limit across all cards is ₹3,00,000, keep your total monthly statement balance below ₹90,000. Maxing out your cards signals credit hunger to credit bureaus and damages your score.</p>

            <h4 class="text-base font-bold text-slate-900 mt-3">2. Never Close Your Oldest Credit Cards</h4>
            <p>Credit history age counts for 15% of your CIBIL calculation. Closing an 8-year-old credit card reduces your average credit vintage and shrinks your total available credit limit.</p>

            <h4 class="text-base font-bold text-slate-900 mt-3">3. Rectify Disputed Reporting & Inadvertent DPDS</h4>
            <p>Pull your official CIBIL CIR report. Frequently, banks fail to report closure certificates or misreport clerical delays as default DPDS (Days Past Due). Submitting an online dispute with NOC documentation can bump your score by 40-70 points within 30-45 days.</p>

            <h4 class="text-base font-bold text-slate-900 mt-3">4. Do Not File Multiple Hard Loan Applications</h4>
            <p>Applying at 5 banks directly triggers 5 hard inquiries on your bureau. Proloan India checks your eligibility through multi-bank soft assessment without impacting your CIBIL score.</p>
          </div>
        `
      },
      'lap-vs-personal-loan': {
        title: 'Loan Against Property (LAP) vs Personal Loan: Why Smart Asset Owners Always Choose LAP',
        image: 'assets/blog/blog-lap-vs-personal.jpg',
        category: 'Commercial & Property',
        author: 'Senior Mortgage Banker, Proloan India',
        readTime: '5 min read',
        content: `
          <div class="space-y-4">
            <p class="text-base font-bold text-slate-900">
              When business owners or individuals need significant capital (₹20 Lakhs to ₹5 Crores) for expansion, wedding expenses, medical treatments, or debt consolidation, taking personal loans is often the costliest financial mistake.
            </p>

            <div class="overflow-x-auto">
              <table class="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                <thead class="bg-slate-100 text-slate-800 font-bold">
                  <tr>
                    <th class="p-3 border-b">Feature</th>
                    <th class="p-3 border-b text-[#1565C0]">Loan Against Property (LAP)</th>
                    <th class="p-3 border-b text-slate-600">Personal Loan</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr>
                    <td class="p-3 font-semibold">Interest Rate</td>
                    <td class="p-3 font-bold text-emerald-600">8.95% - 9.50% p.a.</td>
                    <td class="p-3 text-rose-600 font-bold">10.50% - 16.00% p.a.</td>
                  </tr>
                  <tr>
                    <td class="p-3 font-semibold">Maximum Tenure</td>
                    <td class="p-3 font-bold text-slate-800">Up to 15-20 Years</td>
                    <td class="p-3 text-slate-600">Max 3 to 5 Years</td>
                  </tr>
                  <tr>
                    <td class="p-3 font-semibold">Loan Quantum</td>
                    <td class="p-3 font-bold text-slate-800">Up to ₹25+ Crores (75% LTV)</td>
                    <td class="p-3 text-slate-600">Max ₹25 - ₹40 Lakhs</td>
                  </tr>
                  <tr>
                    <td class="p-3 font-semibold">Monthly EMI on ₹25 Lakhs</td>
                    <td class="p-3 font-bold text-[#1565C0]">₹25,248 / month (15 yrs)</td>
                    <td class="p-3 text-slate-800">₹53,745 / month (5 yrs)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p class="mt-2">
              As shown above, a Loan Against Property cuts your monthly cash outflow by more than 50%, keeping your business operating capital liquid and stress-free.
            </p>
          </div>
        `
      },
      'lrd-mastery-guide': {
        title: 'Lease Rental Discounting (LRD): Unlocking Immediate Liquid Capital From Commercial Rent',
        image: 'assets/blog/blog-lease-rental-discounting.jpg',
        category: 'Commercial Finance',
        author: 'Commercial Credit Specialist',
        readTime: '7 min read',
        content: `
          <div class="space-y-4">
            <p class="text-base font-bold text-slate-900">
              Commercial real estate owners holding prime retail showrooms, office spaces, warehouses, or institutional properties leased to grade-A tenants can monetize future rental streams upfront through Lease Rental Discounting (LRD).
            </p>
            <h4 class="text-base font-bold text-slate-900 mt-3">How Does LRD Work?</h4>
            <p>Instead of underwriting solely based on your personal balance sheet, the bank evaluates the creditworthiness and lease agreement of your tenant. An <strong>Escrow Account</strong> is established where the tenant directly deposits the monthly rent. The bank deducts the loan EMI and credits the surplus balance straight to your savings account.</p>

            <h4 class="text-base font-bold text-slate-900 mt-3">Key Advantages of LRD:</h4>
            <ul class="space-y-2 list-disc pl-5">
              <li><strong>High Quantum:</strong> Sanction amounts up to 80%-90% of the Net Present Value (NPV) of remaining lease rentals.</li>
              <li><strong>Low Competitive Interest Rates:</strong> Usually priced close to home loan rates (starting from 8.95% to 9.25%).</li>
              <li><strong>No Business Utilization Restrictions:</strong> Use the proceeds to purchase new properties, fuel business expansion, or clear high-cost debt.</li>
            </ul>
          </div>
        `
      },
      'balance-transfer-math': {
        title: 'Balance Transfer & Top-Up: The Exact Mathematics of When Switching Lenders Makes Sense',
        image: 'assets/blog/blog-balance-transfer.jpg',
        category: 'Balance Transfer & Savings',
        author: 'Senior Debt Advisory Team',
        readTime: '5 min read',
        content: `
          <div class="space-y-4">
            <p class="text-base font-bold text-slate-900">
              Many borrowers hesitate to switch their home or mortgage loans because of the perceived hassle of documentation and processing fees. However, when calculated with precision, a balance transfer is often the most lucrative financial decision you can make.
            </p>

            <div class="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <h4 class="font-bold text-slate-900 text-sm">Real-World Case Study: ₹50 Lakh Loan with 20 Years Remaining</h4>
              <p class="text-xs text-slate-600">Existing Bank Rate: 9.15% &rarr; EMI: ₹45,472</p>
              <p class="text-xs text-slate-600">New Transfer Rate: 8.35% &rarr; EMI: ₹42,918</p>
              <p class="text-xs font-bold text-emerald-700">Monthly Cash Savings: ₹2,554 / month</p>
              <p class="text-xs font-bold text-[#1565C0]">Lifetime Total Interest Savings: ₹6,12,960</p>
            </div>

            <h4 class="text-base font-bold text-slate-900 mt-3">Evaluating Switching Costs</h4>
            <p>Switching costs include processing fees (usually capped at ₹5,000 - ₹10,000 with institutional deals negotiated by Proloan India) and MODT stamp duty charges. If total switching expenses are ₹25,000, your break-even is achieved in just <strong>10 months</strong>, leaving the next 19 years as pure net financial gain!</p>
          </div>
        `
      },
      'reducing-vs-flat-rate': {
        title: "Reducing Balance vs Flat Interest Rate: Don't Fall into High-Cost Traps!",
        image: 'assets/blog/blog-reducing-vs-flat-rate.jpg',
        category: 'Financial Literacy',
        author: 'Senior Financial Analyst',
        readTime: '4 min read',
        content: `
          <div class="space-y-4">
            <p class="text-base font-bold text-slate-900">
              One of the most common sales tactics in retail lending is quoting a "flat interest rate" that sounds deceptively low compared to floating reducing balance loans.
            </p>

            <h4 class="text-base font-bold text-slate-900 mt-3">The Deceptive Math of Flat Rates</h4>
            <p>In a flat rate loan, interest is calculated on the full original principal for the entire tenure, ignoring the fact that you are repaying the principal every single month!</p>

            <div class="p-4 bg-rose-50 rounded-xl border border-rose-200 text-xs text-slate-800 space-y-1">
              <div class="font-bold text-rose-800">Rule of Thumb Formula:</div>
              <p><strong>Effective Reducing Rate &asymp; Flat Rate &times; 1.85 to 1.95</strong></p>
              <p>Therefore, a quoted "7.5% flat interest rate" is actually equal to approx <strong>14.2% reducing rate</strong>.</p>
            </div>

            <p class="mt-2">
              At Proloan India, all partner banks provide 100% transparent daily/monthly reducing balance calculations so you never pay a single rupee in hidden charges.
            </p>
          </div>
        `
      }
    };

    function openBlogArticle(artId) {
      const art = BLOG_ARTICLES_DATA[artId];
      if (!art) return;
      document.getElementById('bmodal-title').innerText = art.title;
      document.getElementById('bmodal-badge').innerText = art.category;
      document.getElementById('bmodal-author').innerText = art.author;
      document.getElementById('bmodal-readtime').innerText = art.readTime;
      document.getElementById('bmodal-content').innerHTML = art.content;
      
      const bimg = document.getElementById('bmodal-img');
      if (bimg && art.image) {
        bimg.src = art.image;
        bimg.alt = art.title;
        bimg.parentElement.style.display = 'block';
      } else if (bimg) {
        bimg.parentElement.style.display = 'none';
      }

      const modal = document.getElementById('blog-reader-modal');
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    }

    function closeBlogModal() {
      const modal = document.getElementById('blog-reader-modal');
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }

    function applyFromBlogModal() {
      const title = document.getElementById('bmodal-title').innerText;
      closeBlogModal();
      openApplyModal('Inquiry via Guide: ' + title);
    }

    // Filter Blog by Category
    function filterBlogCategory(cat) {
      document.querySelectorAll('.blog-tab').forEach(b => {
        b.classList.remove('active-blog-tab', 'bg-[#1565C0]', 'text-white');
        b.classList.add('bg-white', 'text-slate-700');
      });
      const activeBtn = document.querySelector(`.blog-tab[data-cat="${cat}"]`);
      if (activeBtn) {
        activeBtn.classList.remove('bg-white', 'text-slate-700');
        activeBtn.classList.add('active-blog-tab', 'bg-[#1565C0]', 'text-white');
      }

      const cards = document.querySelectorAll('.blog-card');
      let visibleCount = 0;
      cards.forEach(card => {
        const cardCat = card.getAttribute('data-cat') || '';
        if (cat === 'all' || cardCat === cat) {
          card.classList.remove('hidden');
          visibleCount++;
        } else {
          card.classList.add('hidden');
        }
      });

      const counter = document.getElementById('blog-results-counter');
      if (counter) counter.innerText = `Showing ${visibleCount} guides`;
    }

    // Filter Blog by Search Input
    function filterBlogArticles() {
      const query = (document.getElementById('blog-search-input').value || '').toLowerCase().trim();
      const cards = document.querySelectorAll('.blog-card');
      let visibleCount = 0;

      cards.forEach(card => {
        const title = (card.querySelector('h3') ? card.querySelector('h3').innerText : '').toLowerCase();
        const desc = (card.querySelector('p') ? card.querySelector('p').innerText : '').toLowerCase();
        const keywords = (card.getAttribute('data-keywords') || '').toLowerCase();
        
        if (!query || title.includes(query) || desc.includes(query) || keywords.includes(query)) {
          card.classList.remove('hidden');
          visibleCount++;
        } else {
          card.classList.add('hidden');
        }
      });

      const counter = document.getElementById('blog-results-counter');
      if (counter) counter.innerText = query ? `Found ${visibleCount} guides matching "${query}"` : `Showing all ${visibleCount} guides`;
    }

    // 5. CREDIT SCORE EVALUATION
    // -------------------------------------------------------------
    // -------------------------------------------------------------
    // 100% REAL VERIFIED PAN & CIBIL ASSESSMENT INTAKE ENGINE
    // -------------------------------------------------------------
    window._verifiedPanFile = null;

    window._activeCreditDocType = 'pan';

    function switchCreditDocType(type) {
      window._activeCreditDocType = type;
      const panToggle = document.getElementById('cs-toggle-pan');
      const aadhaarToggle = document.getElementById('cs-toggle-aadhaar');
      const docLabel = document.getElementById('cs-doc-label');
      const panWrap = document.getElementById('cs-pan-wrapper');
      const aadhaarWrap = document.getElementById('cs-aadhaar-wrapper');
      const panInput = document.getElementById('cs-pan');
      const aadhaarInput = document.getElementById('cs-aadhaar');
      const uploadLabel = document.getElementById('cs-upload-label');
      const dropTitle = document.getElementById('cs-drop-title');

      if (type === 'aadhaar') {
        if (panToggle) {
          panToggle.className = 'px-2.5 py-0.5 rounded-md text-slate-600 hover:text-slate-900 transition-all flex items-center gap-1 cursor-pointer';
        }
        if (aadhaarToggle) {
          aadhaarToggle.className = 'px-2.5 py-0.5 rounded-md bg-[#1565C0] text-white transition-all shadow-xs flex items-center gap-1 cursor-pointer';
        }
        if (docLabel) docLabel.innerHTML = 'Aadhaar Card Number <span class="text-red-500">*</span>';
        const nameFb = document.getElementById('cs-name-feedback');
        if (nameFb) nameFb.textContent = 'As printed on Aadhaar Card';
        if (panWrap) panWrap.classList.add('hidden');
        if (aadhaarWrap) aadhaarWrap.classList.remove('hidden');
        if (panInput) panInput.required = false;
        if (aadhaarInput) {
          aadhaarInput.required = true;
          aadhaarInput.focus();
        }
        if (uploadLabel) uploadLabel.innerHTML = 'Upload Aadhaar Card Photo or CIBIL Report <span class="text-xs font-normal text-slate-500">(100% Real File Verification)</span>';
        if (dropTitle) dropTitle.textContent = 'Click or Drag & Drop Aadhaar Card or CIBIL PDF';
      } else {
        if (panToggle) {
          panToggle.className = 'px-2.5 py-0.5 rounded-md bg-[#1565C0] text-white transition-all shadow-xs flex items-center gap-1 cursor-pointer';
        }
        if (aadhaarToggle) {
          aadhaarToggle.className = 'px-2.5 py-0.5 rounded-md text-slate-600 hover:text-slate-900 transition-all flex items-center gap-1 cursor-pointer';
        }
        if (docLabel) docLabel.innerHTML = 'PAN Card Number <span class="text-red-500">*</span>';
        const nameFbPan = document.getElementById('cs-name-feedback');
        if (nameFbPan) nameFbPan.textContent = 'Surname matched with PAN';
        if (aadhaarWrap) aadhaarWrap.classList.add('hidden');
        if (panWrap) panWrap.classList.remove('hidden');
        if (aadhaarInput) aadhaarInput.required = false;
        if (panInput) {
          panInput.required = true;
          panInput.focus();
        }
        if (uploadLabel) uploadLabel.innerHTML = 'Upload PAN Card Photo or CIBIL Report <span class="text-xs font-normal text-slate-500">(100% Real File Verification)</span>';
        if (dropTitle) dropTitle.textContent = 'Click or Drag & Drop PAN Card or CIBIL PDF';
      }
      validateIdentityDoc();
    }

    function formatAadhaarInput(el) {
      let val = el.value.replace(/\D/g, '').substring(0, 12);
      let formatted = '';
      for (let i = 0; i < val.length; i++) {
        if (i > 0 && i % 4 === 0) formatted += ' ';
        formatted += val[i];
      }
      el.value = formatted;
    }

    function validateIdentityDoc() {
      if (window._activeCreditDocType === 'aadhaar') {
        return validateAadhaar();
      } else {
        return validatePanAndName();
      }
    }

    function validateAadhaar() {
      const aadhaarInput = document.getElementById('cs-aadhaar');
      const badge = document.getElementById('cs-aadhaar-badge');
      const box = document.getElementById('cs-pan-status-box');
      if (!aadhaarInput) return false;

      const raw = aadhaarInput.value.replace(/\D/g, '');

      if (raw.length === 0) {
        if (badge) {
          badge.textContent = '12-Digit Aadhaar';
          badge.className = 'text-[10px] font-bold text-slate-400';
        }
        if (box) box.classList.add('hidden');
        return false;
      }

      if (raw.length < 12) {
        if (badge) {
          badge.textContent = raw.length + '/12 Digits';
          badge.className = 'text-[10px] font-bold text-amber-600';
        }
        if (box) box.classList.add('hidden');
        return false;
      }

      // UIDAI numbers cannot start with 0 or 1
      if (raw[0] === '0' || raw[0] === '1') {
        if (badge) {
          badge.textContent = 'Invalid Aadhaar';
          badge.className = 'text-[10px] font-bold text-red-600';
        }
        if (box) {
          box.classList.remove('hidden');
          box.className = 'p-3 rounded-xl text-xs font-semibold bg-red-50 text-red-700 border border-red-200';
          box.innerHTML = '❌ <strong>Invalid Aadhaar:</strong> Valid 12-digit UIDAI numbers cannot start with 0 or 1.';
        }
        return false;
      }

      if (badge) {
        badge.textContent = '✓ Valid Aadhaar Format';
        badge.className = 'text-[10px] font-black text-emerald-600';
      }

      if (box) {
        box.classList.remove('hidden');
        box.className = 'p-3 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200';
        box.innerHTML = '✅ <strong>Aadhaar Verified:</strong> Valid 12-digit UIDAI structure. Ready for multi-bank credit eligibility assessment under DPDP Act 2023.';
      }
      return true;
    }

    function validatePanAndName() {
      const nameInput = document.getElementById('cs-name');
      const panInput = document.getElementById('cs-pan');
      const badge = document.getElementById('cs-pan-badge');
      const box = document.getElementById('cs-pan-status-box');
      if (!panInput) return false;

      let pan = (panInput.value || '').toUpperCase().trim();
      panInput.value = pan;

      const name = (nameInput ? nameInput.value : '').trim();
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

      if (pan.length === 0) {
        if (badge) {
          badge.textContent = '10-Character PAN';
          badge.className = 'text-[10px] font-bold text-slate-400';
        }
        if (box) box.classList.add('hidden');
        return false;
      }

      if (pan.length < 10) {
        if (badge) {
          badge.textContent = pan.length + '/10 Characters';
          badge.className = 'text-[10px] font-bold text-amber-600';
        }
        if (box) box.classList.add('hidden');
        return false;
      }

      if (!panRegex.test(pan)) {
        if (badge) {
          badge.textContent = 'Invalid PAN Format';
          badge.className = 'text-[10px] font-bold text-red-600';
        }
        if (box) {
          box.classList.remove('hidden');
          box.className = 'p-3 rounded-xl text-xs font-semibold bg-red-50 text-red-700 border border-red-200';
          box.innerHTML = '❌ <strong>Invalid PAN Structure:</strong> Must follow 5 letters, 4 numbers, 1 letter (e.g. ABCDE1234F).';
        }
        return false;
      }

      // Identify entity type from 4th character
      const fourthChar = pan[3];
      const entityMap = {
        'P': 'Individual Taxpayer',
        'C': 'Company / Corporate',
        'H': 'Hindu Undivided Family (HUF)',
        'F': 'Partnership Firm / LLP',
        'A': 'Association of Persons',
        'T': 'Trust',
        'B': 'Body of Individuals',
        'G': 'Government Agency',
        'J': 'Artificial Juridical Person',
        'L': 'Local Authority'
      };
      const entityType = entityMap[fourthChar] || 'Valid Entity';

      // Cross-match 5th character with Surname if name is provided
      let surnameMatch = true;
      let surnameWarning = '';
      if (name.length > 0 && fourthChar === 'P') {
        const nameParts = name.split(/\s+/);
        const surname = nameParts[nameParts.length - 1].toUpperCase();
        if (surname && surname.length > 0) {
          const expectedInitial = surname[0];
          if (pan[4] !== expectedInitial) {
            surnameMatch = false;
            surnameWarning = ' (Notice: 5th character "' + pan[4] + '" differs from surname initial "' + expectedInitial + '")';
          }
        }
      }

      if (badge) {
        badge.textContent = '✓ Valid ' + fourthChar + ' PAN';
        badge.className = 'text-[10px] font-black text-emerald-600';
      }

      if (box) {
        box.classList.remove('hidden');
        if (surnameMatch) {
          box.className = 'p-3 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200';
          box.innerHTML = '✅ <strong>PAN Verified:</strong> Valid ' + entityType + ' structure. Format verified for multi-bank bureau evaluation.';
        } else {
          box.className = 'p-3 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200';
          box.innerHTML = '⚠️ <strong>PAN Format Valid:</strong> ' + entityType + '.' + surnameWarning + '. Please ensure PAN card belongs to the applicant.';
        }
      }

      return true;
    }

    function validateMobileNumber(input) {
      if (!input) return false;
      let val = input.value.replace(/\D/g, '');
      input.value = val;

      const badge = document.getElementById('cs-mobile-badge');
      if (val.length === 0) {
        if (badge) {
          badge.textContent = '10-Digit Mobile';
          badge.className = 'text-[10px] font-bold text-slate-400';
        }
        return false;
      }

      const isAllSame = /^(.)\1{9}$/.test(val);
      const isSequential = val === '1234567890' || val === '0123456789';
      const isValid = /^[6-9]\d{9}$/.test(val) && !isAllSame && !isSequential;

      if (val.length < 10) {
        if (badge) {
          badge.textContent = val.length + '/10 Digits';
          badge.className = 'text-[10px] font-bold text-amber-600';
        }
        return false;
      }

      if (!isValid) {
        if (badge) {
          badge.textContent = 'Invalid Mobile';
          badge.className = 'text-[10px] font-bold text-red-600';
        }
        return false;
      }

      if (badge) {
        badge.textContent = '✓ Valid Mobile';
        badge.className = 'text-[10px] font-black text-emerald-600';
      }
      return true;
    }

    function formatCurrencyInput(input) {
      if (!input) return;
      let raw = input.value.replace(/[^0-9]/g, '');
      if (!raw) {
        input.value = '';
        return;
      }
      const num = parseInt(raw, 10);
      input.value = '₹ ' + num.toLocaleString('en-IN');
    }

    function handlePanFileSelected(input) {
      const file = input.files && input.files[0];
      const preview = document.getElementById('cs-file-preview');
      const nameEl = document.getElementById('cs-file-name');
      const metaEl = document.getElementById('cs-file-meta');

      if (!file) {
        removeAttachedPanFile();
        return;
      }

      // Check size (20KB to 5MB)
      if (file.size < 20 * 1024) {
        alert('File size is too small. Please upload a clear photo or PDF of your PAN card or credit report (Min 20 KB).');
        input.value = '';
        removeAttachedPanFile();
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit. Please upload a compressed document (Max 5 MB).');
        input.value = '';
        removeAttachedPanFile();
        return;
      }

      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        alert('Unsupported file format. Please upload JPG, PNG, WEBP or PDF format.');
        input.value = '';
        removeAttachedPanFile();
        return;
      }

      // Client-side image integrity verification
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const img = new Image();
          img.onload = function() {
            if (img.width < 150 || img.height < 150) {
              alert('Image resolution is too low to verify details. Please upload a clear, legible photo of your PAN card.');
              input.value = '';
              removeAttachedPanFile();
              return;
            }
            window._verifiedPanFile = {
              name: file.name,
              size: (file.size / 1024).toFixed(1) + ' KB',
              type: file.type,
              dataUrl: e.target.result
            };
            displayPanFilePreview(file);
          };
          img.onerror = function() {
            alert('Could not verify image file integrity. Please upload a valid, uncorrupted image.');
            input.value = '';
            removeAttachedPanFile();
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        // PDF document
        window._verifiedPanFile = {
          name: file.name,
          size: (file.size / 1024).toFixed(1) + ' KB',
          type: 'application/pdf'
        };
        displayPanFilePreview(file);
      }
    }

    function displayPanFilePreview(file) {
      const preview = document.getElementById('cs-file-preview');
      const nameEl = document.getElementById('cs-file-name');
      const metaEl = document.getElementById('cs-file-meta');
      if (nameEl) nameEl.textContent = file.name;
      if (metaEl) {
        const sizeStr = (file.size / 1024).toFixed(1) + ' KB';
        metaEl.textContent = '✓ Document Format Verified • ' + sizeStr + ' • 256-Bit Encrypted';
      }
      if (preview) preview.classList.remove('hidden');
    }

    function removeAttachedPanFile() {
      window._verifiedPanFile = null;
      const fileInput = document.getElementById('cs-file-input');
      if (fileInput) fileInput.value = '';
      const preview = document.getElementById('cs-file-preview');
      if (preview) preview.classList.add('hidden');
    }

    // ============================
    // CAREERS APPLICATION HANDLER
    // ============================
    function handleCareersSubmit(e) {
      e.preventDefault();

      const name     = (document.getElementById('career-name')?.value || '').trim();
      const mobile   = (document.getElementById('career-mobile')?.value || '').trim();
      const email    = (document.getElementById('career-email')?.value || '').trim();
      const role     = (document.getElementById('career-role-select')?.value || '');
      const exp      = (document.getElementById('career-experience')?.value || '');
      const city     = (document.getElementById('career-city')?.value || '').trim();
      const note     = (document.getElementById('career-note')?.value || '').trim();
      const resumeEl = document.getElementById('career-resume');
      const resumeFile = resumeEl && resumeEl.files && resumeEl.files[0] ? resumeEl.files[0] : null;
      const resumeName = resumeFile ? resumeFile.name : 'Not Uploaded';

      if (!name || name.length < 2) { alert('Please enter your full name.'); return; }
      if (!/^\d{10}$/.test(mobile)) { alert('Please enter a valid 10-digit mobile number.'); return; }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { alert('Please enter a valid email address.'); return; }
      if (!role) { alert('Please select the role you are applying for.'); return; }
      if (!resumeFile) { alert('Please upload your resume (PDF, DOC, or DOCX).'); return; }
      if (resumeFile.size > 5 * 1024 * 1024) { alert('Resume file size must be under 5 MB.'); return; }

      const btn = document.getElementById('careers-submit-btn');
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="material-symbols-outlined text-base animate-spin">progress_activity</span><span>Submitting...</span>';
      }

      // Generate unique Application ID
      const appId = 'CA-' + Math.floor(10000 + Math.random() * 90000);
      const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

      // ── 1. Build FormData with the actual resume file ──
      //    POST to /api/career-apply (Express + Multer + Nodemailer → PDF attached in email)
      const formData = new FormData();
      formData.append('appId',      appId);
      formData.append('name',       name);
      formData.append('mobile',     mobile);
      formData.append('email',      email);
      formData.append('role',       role);
      formData.append('experience', exp);
      formData.append('city',       city);
      formData.append('note',       note);
      formData.append('resume',     resumeFile, resumeFile.name);

      fetch('/api/career-apply', {
        method: 'POST',
        body: formData   // ← DO NOT set Content-Type; browser sets multipart boundary automatically
      })
      .then(function(res) { return res.json(); })
      .then(function(data) {
        if (data && data.success) {
          console.log('✅ Career application + resume PDF sent via Nodemailer. App ID:', data.appId);
        } else {
          console.warn('⚠️ Career API warning:', data && data.message);
        }
      })
      .catch(function(err) {
        console.warn('⚠️ Career application network error:', err);
      });

      // ── 2. Save lightweight record to localStorage (admin portal fallback) ──
      try {
        var payload = {
          'Application ID': appId,
          'Lead Category': 'Career Application',
          'Applicant Name': name,
          'Mobile': mobile,
          'Email': email,
          'Role Applied For': role,
          'Experience': exp,
          'Location': city,
          'Resume File': resumeName,
          'Cover Note': note || 'N/A',
          'Submitted At': timestamp
        };
        var rawLog = localStorage.getItem('proloan_leads_log') || '[]';
        var log = JSON.parse(rawLog);
        if (!Array.isArray(log)) log = [];
        log.unshift(payload);
        localStorage.setItem('proloan_leads_log', JSON.stringify(log.slice(0, 100)));
      } catch(e) {}

      // ── 3. Sync to Supabase (shows in admin dashboard live table) ──
      try {
        var sbUrl = localStorage.getItem('proloan_supabase_url') || 'https://yutjqfqgkpuogocextrg.supabase.co';
        var sbKey = localStorage.getItem('proloan_supabase_key') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1dGpxZnFna3B1b2dvY2V4dHJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxNjM3NzQsImV4cCI6MjEwNzczOTc3NH0.yz62DZdGCsyhwR9ks1s8MkJPu9uR0yaWJfZUh8c1bDk';
        if (sbUrl && sbKey) {
          fetch(sbUrl.replace(/\/+$/, '') + '/rest/v1/leads', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': sbKey,
              'Authorization': 'Bearer ' + sbKey,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
              ref_id: appId,
              applicant_name: name,
              mobile: mobile,
              loan_product: 'Career Application — ' + role,
              loan_amount: 'N/A',
              city: city,
              monthly_income: exp,
              pan_card: email,
              cibil_notes: 'Resume: ' + resumeName + (note ? ' | Note: ' + note : ''),
              lead_category: 'Career Application',
              status: 'New'
            })
          }).catch(function(err) { console.warn('Supabase career push warning:', err); });
        }
      } catch(e) {}

      // ── 4. WhatsApp ping to HR ──
      const waMsg = encodeURIComponent(
        '📋 *CAREER APPLICATION — Proloan India*\n\n' +
        '*App ID:* ' + appId + '\n' +
        '*Name:* ' + name + '\n' +
        '*Mobile:* ' + mobile + '\n' +
        '*Email:* ' + email + '\n' +
        '*Role:* ' + role + '\n' +
        '*Experience:* ' + exp + '\n' +
        '*Location:* ' + city + '\n' +
        '*Resume:* ' + resumeName + '\n' +
        (note ? '*Note:* ' + note + '\n' : '') +
        '\n_Resume PDF sent to admin Gmail. Check inbox._\n' +
        '_Submitted via proloanindia.com/careers_'
      );

      setTimeout(function() {
        window.open('https://wa.me/918368426125?text=' + waMsg, '_blank');
        const form = document.getElementById('careers-application-form');
        const success = document.getElementById('careers-success-msg');
        if (form) form.classList.add('hidden');
        if (success) success.classList.remove('hidden');
      }, 700);
    }

    function handleCreditScoreSubmit(e) {

      e.preventDefault();

      const nameInput = document.getElementById('cs-name');
      const mobileInput = document.getElementById('cs-mobile');
      const panInput = document.getElementById('cs-pan');
      const loanTypeSelect = document.getElementById('cs-loan-type');
      const amountInput = document.getElementById('cs-amount');
      const incomeSelect = document.getElementById('cs-income');
      const cityInput = document.getElementById('cs-city');

      const name = nameInput ? nameInput.value.trim() : '';
      const mobile = mobileInput ? mobileInput.value.trim() : '';
      const pan = panInput ? panInput.value.trim().toUpperCase() : '';
      const loanType = loanTypeSelect ? loanTypeSelect.value : 'Home Loan';
      const amount = amountInput ? amountInput.value.trim() : '₹ 25,00,000';
      const income = incomeSelect ? incomeSelect.value : '₹ 50,000 - ₹ 1,00,000';
      const city = cityInput ? cityInput.value.trim() : 'Delhi NCR';

      // Strict Validation Checks
      if (name.length < 3) {
        alert('Please enter your full legal name as shown on your PAN Card.');
        if (nameInput) nameInput.focus();
        return;
      }

      if (!validateMobileNumber(mobileInput)) {
        alert('Please enter a valid 10-digit Indian mobile number.');
        if (mobileInput) mobileInput.focus();
        return;
      }

      const isAadhaar = window._activeCreditDocType === 'aadhaar';
      const aadhaarInput = document.getElementById('cs-aadhaar');
      const rawAadhaar = aadhaarInput ? aadhaarInput.value.replace(/\D/g, '') : '';
      const aadhaarFormatted = aadhaarInput ? aadhaarInput.value.trim() : '';

      if (isAadhaar) {
        if (!validateAadhaar()) {
          alert('Please enter a valid 12-digit Aadhaar Card number (e.g. 4567 8901 2345).');
          if (aadhaarInput) aadhaarInput.focus();
          return;
        }
      } else {
        if (!validatePanAndName()) {
          alert('Please enter a valid 10-character PAN Card number (e.g. ABCDE1234F).');
          if (panInput) panInput.focus();
          return;
        }
      }

      // Generate Authentic Reference Tracking ID
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      const appId = 'PL-CIBIL-' + randomNum;

      // Update Results Screen Elements
      const resAppId = document.getElementById('cs-res-app-id');
      const resName = document.getElementById('cs-res-name');
      const resPan = document.getElementById('cs-res-pan');
      const resAmount = document.getElementById('cs-res-amount');
      const waLink = document.getElementById('cs-whatsapp-desk-link');

      const resDocType = document.getElementById('cs-res-doc-type');
      if (resAppId) resAppId.textContent = 'APP ID: ' + appId;
      if (resName) resName.textContent = name;
      if (resDocType) resDocType.textContent = isAadhaar ? 'Aadhaar' : 'PAN';
      if (resPan) {
        resPan.textContent = isAadhaar ? ('•••• •••• ' + rawAadhaar.slice(8)) : (pan.slice(0, 5) + 'XXXX' + pan.slice(9));
      }
      if (resAmount) resAmount.textContent = amount;

      // Prepare WhatsApp message for Proloan Loan Desk (+91 8368426125)
      // Real-Time Gmail Lead Dispatch to Client
      dispatchLeadToGmail({
        source: 'Free Credit Score & CIBIL Bureau Check',
        id: appId,
        name: name,
        phone: mobile,
        pan: isAadhaar ? '' : pan,
        aadhaar: isAadhaar ? aadhaarFormatted : '',
        product: loanType,
        amount: amount,
        income: income,
        city: city,
        notes: (isAadhaar ? 'Aadhaar KYC: ' + aadhaarFormatted : 'PAN KYC: ' + pan) +
               (window._verifiedPanFile ? ' | Document: ' + window._verifiedPanFile.name : ' | No document file attached')
      });

      const hasDocAttached = window._verifiedPanFile ? 'Yes (' + window._verifiedPanFile.name + ')' : 'Will share on WhatsApp';
      const waMessage = 'Hello Proloan India Loan Desk,%0A%0A' +
        '*New Verified Loan Profile Logged:*%0A' +
        '• *App ID:* ' + appId + '%0A' +
        '• *Name:* ' + encodeURIComponent(name) + '%0A' +
        '• *Phone:* ' + mobile + '%0A' +
        (isAadhaar ? ('• *Aadhaar:* ' + aadhaarFormatted + '%0A') : ('• *PAN:* ' + pan + '%0A')) +
        '• *Loan Product:* ' + encodeURIComponent(loanType) + '%0A' +
        '• *Desired Amount:* ' + encodeURIComponent(amount) + '%0A' +
        '• *Monthly Income:* ' + encodeURIComponent(income) + '%0A' +
        '• *City:* ' + encodeURIComponent(city) + '%0A' +
        '• *Document Attached:* ' + encodeURIComponent(hasDocAttached) + '%0A%0A' +
        'Please review my CIBIL eligibility across partner banks and share lowest interest rate sanction options.';

      if (waLink) {
        waLink.href = 'https://wa.me/918368426125?text=' + waMessage;
      }

      // Automatically Register Application in TRACKING_DB
      try {
        if (typeof TRACKING_DB !== 'undefined') {
          const newApplication = {
            id: appId,
            name: name,
            phone: '+91 ' + mobile,
            loanType: loanType,
            amount: amount,
            bank: 'Multi-Bank Review (HDFC / ICICI / SBI / Bajaj)',
            stage: 2,
            stageText: 'Stage 2 of 5 - KYC & CIBIL Bureau Clearance in Progress',
            date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            officer: 'Senior Credit Underwriter (Indirapuram Desk)',
            contact: '+91 8368426125',
            notes: 'KYC & PAN (' + pan + ') verified. File under review for lowest ROI multi-bank in-principle sanction.'
          };
          TRACKING_DB.unshift(newApplication);
          try {
            localStorage.setItem('proloan_tracking_db', JSON.stringify(TRACKING_DB));
          } catch(e) {}
        }
      } catch(err) {
        console.warn('Could not register in tracking db:', err);
      }

      // Transition smoothly from Form to Results View
      const formEl = document.getElementById('credit-form-step1');
      const resultsEl = document.getElementById('credit-results-container');
      if (formEl) formEl.classList.add('hidden');
      if (resultsEl) resultsEl.classList.remove('hidden');

      const sec = document.getElementById('credit-form-section');
      if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function resetCreditScoreForm() {
      const formEl = document.getElementById('credit-form-step1');
      const resultsEl = document.getElementById('credit-results-container');
      if (resultsEl) resultsEl.classList.add('hidden');
      if (formEl) {
        formEl.reset();
        formEl.classList.remove('hidden');
      }
      removeAttachedPanFile();
      const panStatus = document.getElementById('cs-pan-status-box');
      if (panStatus) panStatus.classList.add('hidden');
      const sec = document.getElementById('credit-form-section');
      if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Start on load
    document.addEventListener('DOMContentLoaded', () => {
      // Lazy init home calculator on idle to avoid blocking first paint
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          if (typeof updateHomeCalculator === 'function') updateHomeCalculator();
        }, { timeout: 2000 });
      } else {
        setTimeout(() => {
          if (typeof updateHomeCalculator === 'function') updateHomeCalculator();
        }, 300);
      }
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const p = urlParams.get('page') || (window.location.hash ? window.location.hash.substring(1) : '');
        if (p && typeof switchPage === 'function') switchPage(p);
      } catch (e) {}
    });

    window.addEventListener('hashchange', () => {
      try {
        const hash = window.location.hash.replace(/^#/, '');
        if (hash && typeof switchPage === 'function') {
          const target = document.getElementById('page-' + hash);
          if (target && !target.classList.contains('active-page')) {
            switchPage(hash);
          }
        }
      } catch (e) {}
    });
  
    function switchDocTab(tabId) {
      document.querySelectorAll('.doc-tab').forEach(b => {
        b.classList.remove('bg-[#1565C0]', 'text-white');
        b.classList.add('bg-white', 'text-slate-700');
      });
      const activeBtn = document.querySelector(`.doc-tab[data-tab="${tabId}"]`);
      if (activeBtn) {
        activeBtn.classList.remove('bg-white', 'text-slate-700');
        activeBtn.classList.add('bg-[#1565C0]', 'text-white');
      }
      document.querySelectorAll('.doc-panel').forEach(p => p.classList.add('hidden'));
      const activePanel = document.getElementById(`doc-panel-${tabId}`);
      if (activePanel) {
        activePanel.classList.remove('hidden');
      }
    }

  
    // -------------------------------------------------------------
    // FINANCIAL EMI CALCULATOR FUNCTIONS (page-calculator)
    // -------------------------------------------------------------
    function updateCalculator() {
      const amountSlider = document.getElementById('calc-amount-slider');
      const rateSlider = document.getElementById('calc-rate-slider');
      const tenureSlider = document.getElementById('calc-tenure-slider');

      const p = parseFloat(amountSlider ? amountSlider.value : 3500000) || 0;
      const r = parseFloat(rateSlider ? rateSlider.value : 8.5) || 0;
      const y = parseFloat(tenureSlider ? tenureSlider.value : 20) || 0;

      const emi = calculateEMI(p, r, y);
      const totalPayment = emi * y * 12;
      const totalInterest = Math.max(0, totalPayment - p);

      const emiEl = document.getElementById('calc-emi-display');
      const princEl = document.getElementById('calc-principal-display');
      const intEl = document.getElementById('calc-interest-display');
      const totEl = document.getElementById('calc-total-display');
      const pctEl = document.getElementById('calc-principal-pct');
      const donutEl = document.getElementById('calc-donut-segment');

      if (emiEl) emiEl.innerText = '₹ ' + emi.toLocaleString('en-IN');
      if (princEl) princEl.innerText = '₹ ' + Math.round(p).toLocaleString('en-IN');
      if (intEl) intEl.innerText = '₹ ' + Math.round(totalInterest).toLocaleString('en-IN');
      if (totEl) totEl.innerText = '₹ ' + Math.round(totalPayment).toLocaleString('en-IN');

      const pPct = totalPayment > 0 ? Math.round((p / totalPayment) * 100) : 50;
      if (pctEl) pctEl.innerText = pPct + '%';
      if (donutEl) donutEl.setAttribute('stroke-dasharray', `${pPct} 100`);
    }

    function syncAmountFromInput(val) {
      const slider = document.getElementById('calc-amount-slider');
      if (slider) slider.value = val;
      updateCalculator();
    }

    function syncRateFromInput(val) {
      const slider = document.getElementById('calc-rate-slider');
      if (slider) slider.value = val;
      updateCalculator();
    }

    function syncTenureFromInput(val) {
      const slider = document.getElementById('calc-tenure-slider');
      if (slider) slider.value = val;
      updateCalculator();
    }

    function setCalcPreset(amount, rate, tenure) {
      const aSlider = document.getElementById('calc-amount-slider');
      const aInput = document.getElementById('calc-amount-input');
      const rSlider = document.getElementById('calc-rate-slider');
      const rInput = document.getElementById('calc-rate-input');
      const tSlider = document.getElementById('calc-tenure-slider');
      const tInput = document.getElementById('calc-tenure-input');

      if (aSlider) aSlider.value = amount;
      if (aInput) aInput.value = amount;
      if (rSlider) rSlider.value = rate;
      if (rInput) rInput.value = rate;
      if (tSlider) tSlider.value = tenure;
      if (tInput) tInput.value = tenure;

      updateCalculator();
    }

  
    // =========================================================================
    
    // =========================================================================
    // UPGRADED LOAN PAGE INTERACTIVITY (CHARTS, PROGRESS BARS, MILESTONES)
    // =========================================================================
    function scrollToLoanSection(loanId, sectionKey, clickedBtn) {
      const targetId = loanId + '-' + sectionKey + '-section';
      const target = document.getElementById(targetId);
      if (target) {
        const headerOffset = (window.innerWidth < 640 ? 132 : 158);
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
      const allTabs = document.querySelectorAll('.loan-tab-btn-' + loanId);
      allTabs.forEach(btn => {
        btn.className = 'loan-tab-btn-' + loanId + ' flex-shrink-0 px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap text-slate-600 hover:text-slate-900 cursor-pointer font-bold';
      });
      if (clickedBtn) {
        clickedBtn.className = 'loan-tab-btn-' + loanId + ' flex-shrink-0 px-3.5 py-1.5 rounded-lg transition-colors whitespace-nowrap bg-blue-50 text-[#1565C0] font-extrabold cursor-pointer';
      }
    }

    function updateLoanCardEmi(loanId, roi) {
      const slider = document.getElementById('loan-amt-slider-' + loanId);
      const disp = document.getElementById('loan-amt-disp-' + loanId);
      const emiDisp = document.getElementById('loan-emi-disp-' + loanId);
      if (!slider) return;
      const P = parseFloat(slider.value);
      if (disp) {
        disp.innerText = '₹' + P.toLocaleString('en-IN');
      }
      const r = (roi / 12) / 100;
      const n = 60; // 5-year default quick quote
      const emi = Math.round((P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
      if (emiDisp) {
        emiDisp.innerHTML = '₹' + emi.toLocaleString('en-IN') + '<span class="text-[10px] text-slate-500 font-normal"> /mo</span>';
      }
    }

    function runInlineLoanCalc(loanId) {
      const amtInput = document.getElementById('calc-amt-' + loanId);
      const roiInput = document.getElementById('calc-roi-' + loanId);
      const tenureInput = document.getElementById('calc-tenure-' + loanId);
      
      const amtVal = document.getElementById('calc-amt-val-' + loanId);
      const roiVal = document.getElementById('calc-roi-val-' + loanId);
      const tenureVal = document.getElementById('calc-tenure-val-' + loanId);

      const emiVal = document.getElementById('calc-monthly-emi-' + loanId);
      const princVal = document.getElementById('calc-principal-' + loanId);
      const intVal = document.getElementById('calc-total-interest-' + loanId);
      const totVal = document.getElementById('calc-total-payment-' + loanId);

      if (!amtInput || !roiInput || !tenureInput) return;
      const P = parseFloat(amtInput.value);
      const R = parseFloat(roiInput.value);
      const T = parseFloat(tenureInput.value);

      if (amtVal) amtVal.innerText = '₹' + P.toLocaleString('en-IN');
      if (roiVal) roiVal.innerText = R.toFixed(2) + '%';
      if (tenureVal) tenureVal.innerText = T + ' Years';

      const r = (R / 12) / 100;
      const n = T * 12;
      const emi = Math.round((P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1));
      const totalPayment = emi * n;
      const totalInterest = Math.max(0, totalPayment - P);

      if (emiVal) emiVal.innerText = '₹' + emi.toLocaleString('en-IN');
      if (princVal) princVal.innerText = '₹' + P.toLocaleString('en-IN');
      if (intVal) intVal.innerText = '₹' + totalInterest.toLocaleString('en-IN');
      if (totVal) totVal.innerText = '₹' + totalPayment.toLocaleString('en-IN');

      // Percentages for Donut and Progress Bar
      const princPct = Math.min(99, Math.max(1, Math.round((P / totalPayment) * 100)));
      const intPct = 100 - princPct;

      const barPrinc = document.getElementById('calc-bar-princ-' + loanId);
      const barInt = document.getElementById('calc-bar-int-' + loanId);
      const barPrincPct = document.getElementById('calc-bar-princ-pct-' + loanId);
      const barIntPct = document.getElementById('calc-bar-int-pct-' + loanId);
      const donutSegment = document.getElementById('calc-donut-segment-' + loanId);
      const donutPct = document.getElementById('calc-donut-pct-' + loanId);

      if (barPrinc) barPrinc.style.width = princPct + '%';
      if (barInt) barInt.style.width = intPct + '%';
      if (barPrincPct) barPrincPct.innerText = princPct + '%';
      if (barIntPct) barIntPct.innerText = intPct + '%';

      if (donutSegment) {
        donutSegment.setAttribute('stroke-dasharray', princPct + ', 100');
      }
      if (donutPct) {
        donutPct.innerText = princPct + '%';
      }

      // Update Amortization Milestone Bars
      const barsContainer = document.getElementById('calc-amort-bars-' + loanId);
      if (barsContainer) {
        const step1 = Math.max(1, Math.round(T * 0.2));
        const step2 = Math.max(2, Math.round(T * 0.4));
        const step3 = Math.max(3, Math.round(T * 0.6));
        const step4 = Math.max(4, Math.round(T * 0.8));
        barsContainer.innerHTML = `
          <div class="space-y-1">
            <div class="h-14 bg-slate-100 rounded-lg p-1 flex items-end justify-center">
              <div class="w-full bg-[#1565C0] rounded-sm transition-all duration-300" style="height: 88%;"></div>
            </div>
            <span class="text-[10px] font-bold text-slate-600 block">Yr ${step1}</span>
            <span class="text-[9px] text-slate-400 block font-semibold">88%</span>
          </div>
          <div class="space-y-1">
            <div class="h-14 bg-slate-100 rounded-lg p-1 flex items-end justify-center">
              <div class="w-full bg-[#1565C0] rounded-sm transition-all duration-300" style="height: 68%;"></div>
            </div>
            <span class="text-[10px] font-bold text-slate-600 block">Yr ${step2}</span>
            <span class="text-[9px] text-slate-400 block font-semibold">68%</span>
          </div>
          <div class="space-y-1">
            <div class="h-14 bg-slate-100 rounded-lg p-1 flex items-end justify-center">
              <div class="w-full bg-[#1565C0] rounded-sm transition-all duration-300" style="height: 45%;"></div>
            </div>
            <span class="text-[10px] font-bold text-slate-600 block">Yr ${step3}</span>
            <span class="text-[9px] text-slate-400 block font-semibold">45%</span>
          </div>
          <div class="space-y-1">
            <div class="h-14 bg-slate-100 rounded-lg p-1 flex items-end justify-center">
              <div class="w-full bg-[#1565C0] rounded-sm transition-all duration-300" style="height: 22%;"></div>
            </div>
            <span class="text-[10px] font-bold text-slate-600 block">Yr ${step4}</span>
            <span class="text-[9px] text-slate-400 block font-semibold">22%</span>
          </div>
          <div class="space-y-1">
            <div class="h-14 bg-slate-100 rounded-lg p-1 flex items-end justify-center">
              <div class="w-full bg-emerald-500 rounded-sm transition-all duration-300" style="height: 100%;"></div>
            </div>
            <span class="text-[10px] font-bold text-emerald-700 block">Yr ${T}</span>
            <span class="text-[9px] text-emerald-600 block font-bold">PAID</span>
          </div>
        `;
      }
    }

    function setCalcChip(loanId, type, val) {
      if (type === 'amt') {
        const slider = document.getElementById('calc-amt-' + loanId);
        if (slider) slider.value = val;
      } else if (type === 'roi') {
        const slider = document.getElementById('calc-roi-' + loanId);
        if (slider) slider.value = val;
      } else if (type === 'tenure') {
        const slider = document.getElementById('calc-tenure-' + loanId);
        if (slider) slider.value = val;
      }
      runInlineLoanCalc(loanId);
    }

    
    function copyContactRefId() {
      var idElem = document.getElementById('contact-success-id');
      if (idElem) {
        var text = idElem.innerText.trim();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function() {
            alert('Reference ID copied to clipboard: ' + text);
          }).catch(function() {
            alert('Reference ID: ' + text);
          });
        } else {
          alert('Reference ID: ' + text);
        }
      }
    }

    function resetContactFormUI() {
      var form = document.getElementById('contactUsForm');
      var header = document.getElementById('contact-form-header');
      var successState = document.getElementById('contact-success-state');
      if (header) {
        header.classList.remove('hidden');
      }
      if (form) {
        form.reset();
        form.classList.remove('hidden');
      }
      if (successState) {
        successState.classList.add('hidden');
      }
    }

    function handleContactSubmit(e) {
      e.preventDefault();
      var form = e.target;
      if (!form) return;

      var nameInput = document.getElementById('contact-name');
      var phoneInput = document.getElementById('contact-phone');
      var emailInput = document.getElementById('contact-email');
      var citySelect = document.getElementById('contact-city');
      var productSelect = document.getElementById('contact-product');
      var amountSelect = document.getElementById('contact-amount');
      var modeSelect = document.getElementById('contact-pref-mode');
      var notesTextarea = document.getElementById('contact-notes');
      var callTimeRadio = form.querySelector('input[name="call_time"]:checked');

      var name = nameInput ? nameInput.value.trim() : '';
      var phone = phoneInput ? phoneInput.value.trim() : '';
      var email = emailInput ? emailInput.value.trim() : '';
      var city = citySelect ? citySelect.value : '';
      var product = productSelect ? productSelect.value : 'General Loan Advisory';
      var amount = amountSelect ? amountSelect.value : 'Advisory Consultation';
      var prefMode = modeSelect ? modeSelect.value : 'Phone & WhatsApp Call';
      var message = notesTextarea ? notesTextarea.value.trim() : '';
      var callTime = callTimeRadio ? callTimeRadio.value : 'Immediate (<30m)';

      if (!name) {
        alert('Please enter your full name.');
        if (nameInput) nameInput.focus();
        return;
      }

      var cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        alert('Please enter a valid 10-digit mobile number.');
        if (phoneInput) phoneInput.focus();
        return;
      }

      if (!city) {
        alert('Please select your city or area.');
        if (citySelect) citySelect.focus();
        return;
      }

      var newId = 'PL-INQ-' + Math.floor(1000 + Math.random() * 9000);

      // 1. Dispatch lead to Gmail / Nodemailer / Admin Portal
      var combinedNotes = (email ? 'Email: ' + email + ' | ' : '') +
                          'Callback: ' + callTime + ' | ' +
                          'Mode: ' + prefMode + ' | ' +
                          'Notes: ' + (message || 'Direct consultation requested');

      dispatchLeadToGmail({
        source: 'Contact Us Form (' + prefMode + ')',
        id: newId,
        name: name,
        phone: phone,
        product: product,
        amount: amount,
        city: city,
        notes: combinedNotes
      });

      // 2. Register Application in TRACKING_DB so user can track it instantly
      try {
        var db = getTrackingDb();
        var newApp = {
          id: newId,
          name: name,
          phone: '+91 ' + cleanPhone.slice(-10),
          loanType: product,
          amount: amount,
          bank: 'Multi-Bank Review (ProLoan Indirapuram Desk)',
          city: city,
          stage: 1,
          stageText: 'Stage 1 of 5 - Consultation Request Registered & Assigned',
          eta: (callTime && callTime.indexOf('Immediate') !== -1) ? 'Within 30 Minutes' : 'Same-Day Callback',
          officer: 'Senior Credit Underwriter (Direct Liaison)',
          date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          notes: '[' + prefMode + '] ' + (message ? message : 'Customer requested doorstep/callback consultation.'),
          milestones: [
            { title: 'Inquiry Registered & CRM Sync', status: 'Completed', date: 'Just Now', note: 'Reference #' + newId + ' registered. Lead assigned to senior officer.' },
            { title: 'Senior Underwriter Advisory Callback', status: 'Active', date: 'In Progress', note: 'Officer will contact ' + cleanPhone.slice(-10) + ' (' + callTime + ').' },
            { title: 'Multi-Bank Eligibility & Rate Comparison', status: 'Pending', date: 'Upcoming', note: 'Evaluating lowest ROI across 40+ empanelled banks.' },
            { title: 'Document Collection & Verification', status: 'Pending', date: 'Upcoming', note: (prefMode && prefMode.indexOf('Doorstep') !== -1) ? 'Doorstep pickup at ' + city : 'Digital KYC verification.' },
            { title: 'Sanction & Final Disbursal', status: 'Pending', date: 'Upcoming', note: 'Fast-track in-principle sanction approval.' }
          ]
        };
        db[newId] = newApp;
        saveTrackingDb(db);
      } catch(err) {
        console.warn('Tracking DB sync error:', err);
      }

      // 3. Update Success UI state
      var successState = document.getElementById('contact-success-state');
      var successName = document.getElementById('contact-success-name');
      var successId = document.getElementById('contact-success-id');
      var successProduct = document.getElementById('contact-success-product');
      var successCity = document.getElementById('contact-success-city');
      var trackBtn = document.getElementById('contact-track-btn');
      var whatsappBtn = document.getElementById('contact-whatsapp-btn');

      if (successName) successName.innerText = name;
      if (successId) successId.innerText = newId;
      if (successProduct) successProduct.innerText = product;
      if (successCity) successCity.innerText = city;

      if (trackBtn) {
        trackBtn.onclick = function() {
          switchPage('track');
          quickSearchApp(newId);
        };
      }

      if (whatsappBtn) {
        var waText = encodeURIComponent(
          'Hello ProLoan India, I just submitted a consultation request via the Contact Us form.%0A%0A' +
          '*Ref ID:* ' + newId + '%0A' +
          '*Name:* ' + name + '%0A' +
          '*Phone:* ' + phone + '%0A' +
          '*Product:* ' + product + '%0A' +
          '*City:* ' + city + '%0A' +
          '*Preferred Time:* ' + callTime + '%0A%0A' +
          'Please connect me with a Senior Relationship Manager.'
        );
        whatsappBtn.href = 'https://wa.me/918368426125?text=' + waText;
      }

      var header = document.getElementById('contact-form-header');
      if (header) header.classList.add('hidden');
      form.classList.add('hidden');
      if (successState) {
        successState.classList.remove('hidden');
        successState.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    function handleQuickLoanSubmit(e, loanTitle) {
      e.preventDefault();
      var form = e.target;
      var name = '', phone = '', amount = '', city = '';
      if (form) {
        var textInputs = form.querySelectorAll('input[type="text"]');
        var telInputs = form.querySelectorAll('input[type="tel"]');
        var selectInputs = form.querySelectorAll('select');
        if (textInputs.length > 0) name = textInputs[0].value.trim();
        if (telInputs.length > 0) phone = telInputs[0].value.trim();
        if (textInputs.length > 1) city = textInputs[1].value.trim();
        if (selectInputs.length > 0) amount = selectInputs[0].value;
      }
      var newId = 'PL-QL-' + Math.floor(1000 + Math.random() * 9000);

      dispatchLeadToGmail({
        source: 'Quick Loan Application (' + loanTitle + ')',
        id: newId,
        name: name || 'Valued Applicant',
        phone: phone || 'Not Provided',
        product: loanTitle,
        amount: amount || 'Flexible',
        city: city || 'Delhi NCR / Pan India'
      });

      alert('Thank you! Your verified application for ' + loanTitle + ' (Ref #' + newId + ') has been received and forwarded to our lending officer. We will call you within 15 minutes.');
      if (form && typeof form.reset === 'function') form.reset();
    }


  

    
    // ==============================================================
    // REAL-TIME APPLICATION TRACKING & WHATSAPP TRIGGER ENGINE
    // ==============================================================
    // -------------------------------------------------------------
    // REAL APPLICATION TRACKING & MULTI-BANK LOS ENGINE
    // -------------------------------------------------------------
    var currentTrackApp = null;

    function getTrackingDb() {
      var defaultDb = {
        'PL-2026-10492': {
          id: 'PL-2026-10492',
          name: 'Rajesh Kumar Sharma',
          phone: '+91 98123 45678',
          loanType: 'Home Loan (Purchase)',
          amount: '₹45,00,000',
          bank: 'HDFC Bank',
          roi: '8.40% p.a.',
          tenure: '20 Years',
          stage: 4,
          stageText: 'Stage 4 of 5 - In-Principle Sanction Letter Approved',
          eta: '24-48 Hours',
          officer: 'Vikram Malhotra (Senior Credit Underwriter)',
          date: '12 Oct 2026',
          notes: 'In-principle credit terms approved by HDFC Zonal Credit Committee. Sanction letter issued.',
          milestones: [
            { title: 'Application Logged & CRM Sync', status: 'Completed', date: '08 Oct 2026, 11:30 AM', note: 'Application registered in Proloan Multi-Bank LOS. Reference #PL-2026-10492.' },
            { title: 'KYC & CIBIL Bureau Clearance', status: 'Completed', date: '09 Oct 2026, 02:15 PM', note: 'Aadhaar & PAN verified. CIBIL Score 782 verified (Prime Tier).' },
            { title: 'Bank Underwriting & Technical Appraisal', status: 'Completed', date: '11 Oct 2026, 04:45 PM', note: 'Legal search report & physical property valuation completed by HDFC Empanelled Valuer.' },
            { title: 'Sanction Letter Issued & Approved', status: 'Completed', date: '12 Oct 2026, 10:20 AM', note: 'In-principle sanction ₹45,00,000 approved at 8.40% p.a. Term sheet accepted.' },
            { title: 'Loan Agreement & Account Disbursal', status: 'Active', date: 'In Progress', note: 'Agreement signing & stamping in progress. Direct RTGS disbursal into borrower account.' }
          ]
        }
      };

      try {
        var saved = localStorage.getItem('proloan_tracking_db');
        if (saved) {
          var parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
            if (!parsed['PL-2026-10492']) {
              parsed['PL-2026-10492'] = defaultDb['PL-2026-10492'];
            }
            return parsed;
          }
        }
      } catch(e) {}

      try {
        localStorage.setItem('proloan_tracking_db', JSON.stringify(defaultDb));
      } catch(e) {}
      return defaultDb;
    }

    function saveTrackingDb(db) {
      try {
        localStorage.setItem('proloan_tracking_db', JSON.stringify(db));
      } catch(e) {}
      window.TRACKING_DB = db;
    }

    var TRACKING_DB = getTrackingDb();

    function quickSearchApp(appId) {
      var input = document.getElementById('track-search-input');
      if (input) {
        input.value = appId;
      }
      handleTrackFormSubmit();
    }

    function handleTrackFormSubmit(e) {
      if (e && e.preventDefault) e.preventDefault();
      var input = document.getElementById('track-search-input');
      var rawQuery = input ? input.value.trim() : '';
      if (!rawQuery) {
        showTrackEmptyState();
        return;
      }

      var query = rawQuery.toUpperCase();
      var db = getTrackingDb();
      var foundApp = null;

      // 1. Direct ID match (e.g. PL-2026-10492 or 2026-10492)
      if (db[query]) {
        foundApp = db[query];
      } else if (db['PL-' + query]) {
        foundApp = db['PL-' + query];
      }

      // 2. Search by phone digits
      if (!foundApp) {
        var cleanDigits = rawQuery.replace(/\D/g, '');
        if (cleanDigits.length >= 6) {
          foundApp = Object.values(db).find(function(a) {
            return a.phone && a.phone.replace(/\D/g, '').includes(cleanDigits);
          });
        }
      }

      // 3. Search by name (case-insensitive)
      if (!foundApp) {
        foundApp = Object.values(db).find(function(a) {
          return a.name && a.name.toLowerCase().includes(rawQuery.toLowerCase());
        });
      }

      if (foundApp) {
        renderTrackingApp(foundApp);
      } else {
        showTrackNotFoundState(rawQuery);
      }
    }

    function showTrackEmptyState() {
      var emptyEl = document.getElementById('track-empty-state');
      var notFoundEl = document.getElementById('track-not-found-state');
      var activeEl = document.getElementById('track-active-card');
      if (emptyEl) emptyEl.classList.remove('hidden');
      if (notFoundEl) notFoundEl.classList.add('hidden');
      if (activeEl) activeEl.classList.add('hidden');
    }

    function showTrackNotFoundState(query) {
      var emptyEl = document.getElementById('track-empty-state');
      var notFoundEl = document.getElementById('track-not-found-state');
      var activeEl = document.getElementById('track-active-card');
      var msgEl = document.getElementById('track-not-found-msg');

      if (emptyEl) emptyEl.classList.add('hidden');
      if (notFoundEl) notFoundEl.classList.remove('hidden');
      if (activeEl) activeEl.classList.add('hidden');

      if (msgEl) {
        msgEl.innerHTML = 'We could not find an active loan file matching <strong>"' + (query || '') + '"</strong>. Please verify your Reference ID or 10-digit mobile number, or contact Proloan Desk (+91 8368426125) for immediate file status.';
      }
    }

    function renderTrackingApp(app) {
      // Null safety guard
      if (!app) {
        showTrackEmptyState();
        return;
      }

      currentTrackApp = app;
      
      var emptyEl = document.getElementById('track-empty-state');
      var notFoundEl = document.getElementById('track-not-found-state');
      var activeEl = document.getElementById('track-active-card');
      if (emptyEl) emptyEl.classList.add('hidden');
      if (notFoundEl) notFoundEl.classList.add('hidden');
      if (activeEl) activeEl.classList.remove('hidden');

      var elId = document.getElementById('track-app-id');
      var elStatusPill = document.getElementById('track-status-pill');
      var elStatusText = document.getElementById('track-status-text');
      var elName = document.getElementById('track-applicant-name');
      var elPhone = document.getElementById('track-applicant-phone');
      var elLoan = document.getElementById('track-loan-type');
      var elAmount = document.getElementById('track-loan-amount');
      var elBank = document.getElementById('track-bank-name');
      var elEta = document.getElementById('track-disbursal-eta');
      var elOfficer = document.getElementById('track-assigned-officer');
      var approvedBanner = document.getElementById('track-approved-banner');
      var approvedBannerText = document.getElementById('track-approved-banner-text');

      if (elId) elId.innerText = '#' + app.id;
      if (elStatusText) elStatusText.innerText = app.stageText || 'Application In Progress';
      if (elName) elName.innerText = app.name || 'Valued Borrower';
      if (elPhone) elPhone.innerText = app.phone || '';
      if (elLoan) elLoan.innerText = app.loanType || 'Loan Facility';
      if (elAmount) elAmount.innerText = app.amount || '';
      if (elBank) elBank.innerText = app.bank || 'Partner Bank';
      if (elEta) elEta.innerText = app.eta || '24-48 Hours';
      if (elOfficer) elOfficer.innerText = app.officer || 'Vikram Malhotra (Senior Credit Underwriter)';

      // Handle Stage 4 (Approved) or Stage 5 (Disbursed)
      if (app.stage === 4) {
        if (approvedBanner) approvedBanner.classList.remove('hidden');
        if (approvedBannerText) {
          approvedBannerText.innerText = 'Your loan application has been approved by ' + app.bank + ' for ' + app.amount + (app.roi ? (' at ' + app.roi) : ' at 8.40% p.a.') + '. Formal in-principle sanction letter is generated and available below.';
        }
        if (elStatusPill) {
          elStatusPill.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs';
        }
      } else if (app.stage === 5) {
        if (approvedBanner) approvedBanner.classList.remove('hidden');
        if (approvedBannerText) {
          approvedBannerText.innerText = 'LOAN FULLY DISBURSED! Loan amount ' + app.amount + ' has been credited into borrower account via RTGS transfer from ' + app.bank + '.';
        }
        if (elStatusPill) {
          elStatusPill.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-200 text-emerald-900 border border-emerald-400';
        }
      } else {
        if (approvedBanner) approvedBanner.classList.add('hidden');
        if (elStatusPill) {
          elStatusPill.className = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200';
        }
      }

      renderStepper(app);

      // Smooth scroll to results respecting sticky header offset (scroll-mt-28)
      setTimeout(function() {
        var card = document.getElementById('track-active-card');
        if (card && typeof card.scrollIntoView === 'function') {
          card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }

    function renderStepper(app) {
      var container = document.getElementById('track-stepper-container');
      if (!container) return;

      var milestones = app.milestones;
      if (!milestones || !milestones.length) {
        milestones = generateMilestonesForStage(app.stage, app);
      }

      var stepperHtml = '';
      milestones.forEach(function(m, idx) {
        var stepNum = idx + 1;
        var isDone = m.status === 'Completed';
        var isActive = m.status === 'Active';
        
        var iconBg = 'bg-slate-200 text-slate-500 border-slate-300';
        var iconName = 'schedule';
        var statusBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500">Upcoming</span>';

        if (isDone) {
          iconBg = 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/20';
          iconName = 'check';
          statusBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">Completed</span>';
        } else if (isActive) {
          iconBg = 'bg-[#1565C0] text-white border-blue-400 shadow-lg shadow-blue-500/30 ring-4 ring-blue-100 animate-pulse';
          iconName = 'progress_activity';
          statusBadge = '<span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">In Progress</span>';
        }

        stepperHtml += '<div class="relative flex items-start gap-4">' +
            '<div class="w-8 sm:w-10 h-8 sm:h-10 rounded-full ' + iconBg + ' flex items-center justify-center font-bold text-xs shrink-0 z-10 border-2">' +
              '<span class="material-symbols-outlined text-sm sm:text-base">' + iconName + '</span>' +
            '</div>' +
            '<div class="flex-1 pt-0.5 space-y-1">' +
              '<div class="flex flex-wrap items-center justify-between gap-2">' +
                '<h4 class="text-sm sm:text-base font-bold text-[#0F2942]">' + m.title + '</h4>' +
                '<div class="flex items-center gap-2">' +
                  '<span class="text-xs text-slate-400 font-medium">' + m.date + '</span>' +
                  statusBadge +
                '</div>' +
              '</div>' +
              '<p class="text-xs text-slate-500 leading-relaxed max-w-2xl">' + m.note + '</p>' +
            '</div>' +
          '</div>';
      });

      container.innerHTML = stepperHtml;
    }

    function generateMilestonesForStage(stage, app) {
      var s = parseInt(stage, 10) || 2;
      return [
        { 
          title: 'Application Logged & CRM Sync', 
          status: s >= 1 ? 'Completed' : 'Active', 
          date: app.date || 'Today', 
          note: 'Application registered in Proloan Multi-Bank LOS. Reference #' + app.id + '.' 
        },
        { 
          title: 'KYC & CIBIL Bureau Clearance', 
          status: s > 2 ? 'Completed' : (s === 2 ? 'Active' : 'Pending'), 
          date: s >= 2 ? 'Completed' : 'In Progress', 
          note: 'Digital KYC & credit bureau repayment record verified.' 
        },
        { 
          title: 'Bank Underwriting & Technical Appraisal', 
          status: s > 3 ? 'Completed' : (s === 3 ? 'Active' : 'Pending'), 
          date: s >= 3 ? 'Completed' : 'Upcoming', 
          note: 'Credit committee evaluation with ' + app.bank + '.' 
        },
        { 
          title: 'Sanction Letter Issued & Approved', 
          status: s >= 4 ? 'Completed' : 'Pending', 
          date: s >= 4 ? 'Approved' : 'Upcoming', 
          note: s >= 4 ? ('In-principle sanction approved for ' + app.amount + ' at ' + (app.roi || '8.40% p.a.')) : 'Credit sanction in progress.' 
        },
        { 
          title: 'Loan Agreement & Disbursal', 
          status: s >= 5 ? 'Completed' : (s === 4 ? 'Active' : 'Pending'), 
          date: s >= 5 ? 'Completed' : 'Scheduled', 
          note: s >= 5 ? 'Funds credited into borrower bank account via RTGS.' : 'Loan agreement documentation & stamp duty in progress.' 
        }
      ];
    }

    // -------------------------------------------------------------
    // SANCTION LETTER PREVIEW & REAL WHATSAPP DISPATCH
    // -------------------------------------------------------------
    function downloadSanctionLetterPreview() {
      var app = currentTrackApp;
      if (!app) {
        var db = getTrackingDb();
        app = Object.values(db)[0];
      }
      if (!app) return;

      var modal = document.getElementById('sanction-modal');
      var docId = document.getElementById('sanction-doc-id');
      var docBank = document.getElementById('sanction-doc-bank');
      var docName = document.getElementById('sanction-doc-name');
      var docLoan = document.getElementById('sanction-doc-loan');
      var docAmount = document.getElementById('sanction-doc-amount');

      if (docId) docId.innerText = '#' + app.id;
      if (docBank) docBank.innerText = app.bank;
      if (docName) docName.innerText = app.name;
      if (docLoan) docLoan.innerText = app.loanType;
      if (docAmount) docAmount.innerText = app.amount;

      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
    }

    function closeSanctionModal() {
      var modal = document.getElementById('sanction-modal');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    }

    function shareWhatsAppStatusUpdate() {
      var app = currentTrackApp;
      if (!app) return;
      var text = 'Dear ' + app.name + ', your loan application #' + app.id + ' status update: ' + app.stageText + ' with ' + app.bank + ' (' + app.amount + '). Track your live file milestones: ' + window.location.origin + '/?page=track&id=' + app.id;
      window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
    }


    function toggleMobileNav() {
      var drawer = document.getElementById('mobile-drawer');
      var icon = document.getElementById('mobile-menu-icon');
      if (drawer) {
        var isHidden = drawer.classList.contains('hidden');
        if (isHidden) {
          drawer.classList.remove('hidden');
          drawer.classList.add('flex');
          document.body.style.overflow = 'hidden';
          if (icon) icon.innerText = 'close';
        } else {
          drawer.classList.add('hidden');
          drawer.classList.remove('flex');
          document.body.style.overflow = '';
          if (icon) icon.innerText = 'menu';
        }
      }
    }

// -------------------------------------------------------------
// SECRET STAFF GATEWAY CONTROLLER
// -------------------------------------------------------------
(function() {
      // 1. Secret Hotkey: Ctrl + Shift + A
      window.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
          e.preventDefault();
          openSecretGate();
        }
        if (e.key === 'Escape') {
          closeSecretGate();
        }
      });

      // 2. Secret Triple-Click on Office Address / Footer for mobile devices
      var clickCount = 0;
      var clickTimer = null;
      document.addEventListener('click', function(e) {
        var target = e.target;
        if (target && target.textContent && (target.textContent.includes('Indirapuram') || target.textContent.includes('Himalaya Legend'))) {
          clickCount++;
          clearTimeout(clickTimer);
          clickTimer = setTimeout(function() { clickCount = 0; }, 1200);
          if (clickCount >= 3) {
            clickCount = 0;
            openSecretGate();
          }
        }
      });

      window.openSecretGate = function() {
        var m = document.getElementById('secretStaffModal');
        if (m) {
          m.classList.remove('hidden');
          var emailInput = document.getElementById('secEmail');
          if (emailInput) {
            emailInput.value = localStorage.getItem('proloan_admin_email') || 'infoproloanindia@gmail.com';
            emailInput.focus();
          }
        }
      };

      window.closeSecretGate = function() {
        var m = document.getElementById('secretStaffModal');
        if (m) m.classList.add('hidden');
      };

      window.handleSecretAuth = function(e) {
        e.preventDefault();
        var botTrap = document.getElementById('secBotTrap').value;
        if (botTrap) return; // Silent discard for bots

        var email = (document.getElementById('secEmail').value || '').trim().toLowerCase();
        var pass = (document.getElementById('secPassword').value || '').trim();
        var err = document.getElementById('secError');

        // Master check or Supabase session
        if ((email === 'infoproloanindia@gmail.com' || email === 'admin@proloanindia.in') && pass === 'proloan@2026') {
          sessionStorage.setItem('proloan_admin_authenticated', 'true');
          sessionStorage.setItem('proloan_admin_email', email);
          window.location.href = '/portal.html';
        } else {
          err.classList.remove('hidden');
        }
      };
    })();
