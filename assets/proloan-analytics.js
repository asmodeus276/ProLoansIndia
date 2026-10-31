/**
 * Proloan India - Universal Analytics, Ads & Attribution Engine
 * Tracks GA4, Meta Pixel, Google Ads Conversions, UTM attribution & Deep Linking
 */
(function() {
  'use strict';

  // 1. CONFIGURATION (Override via window or localStorage)
  var GA4_ID = window.PROLOAN_GA4_ID || localStorage.getItem('proloan_ga4_id') || 'G-XXXXXXXXXX';
  var META_PIXEL_ID = window.PROLOAN_META_PIXEL_ID || localStorage.getItem('proloan_meta_pixel_id') || '';
  var GOOGLE_ADS_ID = window.PROLOAN_GOOGLE_ADS_ID || localStorage.getItem('proloan_google_ads_id') || '';
  var GOOGLE_ADS_CONVERSION_LABEL = window.PROLOAN_GOOGLE_ADS_LABEL || localStorage.getItem('proloan_google_ads_label') || '';

  // 2. UTM ATTRIBUTION CAPTURE
  function captureUtmParams() {
    try {
      var urlParams = new URLSearchParams(window.location.search);
      var utmFields = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid'];
      var utmData = {};
      var hasUtm = false;

      utmFields.forEach(function(field) {
        var val = urlParams.get(field);
        if (val) {
          utmData[field] = val;
          hasUtm = true;
        }
      });

      if (hasUtm) {
        sessionStorage.setItem('proloan_utm_attribution', JSON.stringify(utmData));
        localStorage.setItem('proloan_last_utm', JSON.stringify(utmData));
      }
    } catch (e) {
      console.warn('[Analytics] UTM capture warning:', e);
    }
  }

  // Helper to retrieve current attribution string for leads
  window.getProloanAttributionString = function() {
    try {
      var utmStr = sessionStorage.getItem('proloan_utm_attribution') || localStorage.getItem('proloan_last_utm');
      if (!utmStr) return '';
      var utm = JSON.parse(utmStr);
      var parts = [];
      if (utm.utm_source) parts.push('Source: ' + utm.utm_source);
      if (utm.utm_campaign) parts.push('Campaign: ' + utm.utm_campaign);
      if (utm.utm_term) parts.push('Keyword: ' + utm.utm_term);
      if (utm.gclid) parts.push('Google Ads Click (GCLID)');
      if (utm.fbclid) parts.push('Meta Ads Click (FBCLID)');
      return parts.length ? ' [' + parts.join(' | ') + ']' : '';
    } catch (_) {
      return '';
    }
  };

  // 3. TRACKING EVENT DISPATCHERS
  window.proloanTrackEvent = function(eventName, params) {
    params = params || {};
    params.send_to_crm = true;
    params.page_location = window.location.href;

    // GA4 dispatch
    if (typeof window.gtag === 'function') {
      try {
        window.gtag('event', eventName, params);
      } catch (e) {}
    }

    // Google Ads conversion dispatch
    if (eventName === 'generate_lead' && GOOGLE_ADS_ID && GOOGLE_ADS_CONVERSION_LABEL) {
      if (typeof window.gtag === 'function') {
        try {
          window.gtag('event', 'conversion', {
            send_to: GOOGLE_ADS_ID + '/' + GOOGLE_ADS_CONVERSION_LABEL,
            value: params.value || 1000.0,
            currency: 'INR'
          });
        } catch (e) {}
      }
    }

    // Meta Pixel dispatch
    if (typeof window.fbq === 'function') {
      try {
        if (eventName === 'generate_lead') {
          window.fbq('track', 'Lead', {
            content_name: params.loan_type || params.product || 'Loan Application',
            value: params.value || 1000.0,
            currency: 'INR'
          });
        } else if (eventName === 'contact_call' || eventName === 'contact_whatsapp') {
          window.fbq('trackCustom', eventName, params);
        }
      } catch (e) {}
    }

    console.log('📊 [Proloan Analytics] Event:', eventName, params);
  };

  // 4. DEEP-LINKING FROM ADS (e.g. ?loan=doctor-loan&apply=1)
  function handleAdDeepLinks() {
    try {
      var params = new URLSearchParams(window.location.search);
      var loan = params.get('loan') || params.get('product');
      var apply = params.get('apply');

      if (loan) {
        var pageMap = {
          'doctor': 'professional-loan',
          'doctor-loan': 'professional-loan',
          'professional': 'professional-loan',
          'home': 'home-loan',
          'home-loan': 'home-loan',
          'business': 'business-loan',
          'business-loan': 'business-loan',
          'msme': 'business-loan',
          'lap': 'lap-loan',
          'lap-loan': 'lap-loan',
          'property': 'lap-loan',
          'working-capital': 'working-capital',
          'od': 'od-facility',
          'cgtmse': 'od-facility',
          'machinery': 'machinery-loan',
          'car': 'car-loan',
          'education': 'education-loan'
        };

        var targetPage = pageMap[loan.toLowerCase()];
        if (targetPage && typeof window.switchPage === 'function') {
          setTimeout(function() {
            window.switchPage(targetPage);
          }, 300);
        }
      }

      if (apply === '1' || apply === 'true') {
        setTimeout(function() {
          if (typeof window.openApplyModal === 'function') {
            window.openApplyModal('Google Ad Lead');
          }
        }, 600);
      }
    } catch (e) {}
  }

  // 5. AUTOMATIC CLICK TRACKING (Call, WhatsApp, Forms)
  function setupAutoTracking() {
    document.addEventListener('click', function(e) {
      var target = e.target.closest('a');
      if (!target) return;

      var href = target.getAttribute('href') || '';

      // Track Phone Calls
      if (href.indexOf('tel:') === 0) {
        window.proloanTrackEvent('contact_call', {
          destination: href.replace('tel:', ''),
          cta_text: target.innerText ? target.innerText.trim() : 'Call Button'
        });
      }

      // Track WhatsApp Clicks
      if (href.indexOf('wa.me') !== -1 || href.indexOf('whatsapp.com') !== -1) {
        window.proloanTrackEvent('contact_whatsapp', {
          cta_location: target.getAttribute('title') || 'WhatsApp Floating Button',
          cta_text: target.innerText ? target.innerText.trim() : 'WhatsApp'
        });
      }
    }, true);
  }

  // Initialize immediately
  captureUtmParams();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      setupAutoTracking();
      handleAdDeepLinks();
    });
  } else {
    setupAutoTracking();
    handleAdDeepLinks();
  }
})();

