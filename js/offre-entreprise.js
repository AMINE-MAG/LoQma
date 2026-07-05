/**
 * LoQma — Offre Entreprise
 * Quote request form management and interactivity
 * 
 * Manages:
 * - Quote request modal (open/close)
 * - Form validation (client-side)
 * - Form submission (POST to /api/quote-request)
 * - Analytics tracking
 * - Keyboard accessibility (ESC to close, Tab navigation)
 */

// ⚙️ API Configuration
// Determines the API endpoint based on the current environment
function getApiBase() {
  // In local development, frontend runs on localhost:5000 and backend on localhost:3000
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    // For local development, point to backend on port 3000
    return 'http://localhost:3000';
  }
  
  // In production, use relative path (same domain)
  return '';
}

const API_BASE = getApiBase();

class QuoteModal {
  constructor() {
    this.modal = document.getElementById('quote-modal');
    this.overlay = this.modal.querySelector('.modal__overlay');
    this.closeBtn = this.modal.querySelector('.modal__close');
    this.form = document.getElementById('quote-form');
    this.submitBtn = document.getElementById('submit-btn');
    this.serviceSelect = document.getElementById('service_selected');
    this.serviceCategoryInput = document.getElementById('service_category');
    this.successMsg = document.getElementById('form-success');
    
    this.initEventListeners();
  }

  initEventListeners() {
    // Close modal on overlay click
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });

    // Close modal on close button click
    this.closeBtn.addEventListener('click', () => {
      this.close();
    });

    // Close modal on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('is-active')) {
        this.close();
      }
    });

    // Form submission
    this.form.addEventListener('submit', (e) => {
      this.handleSubmit(e);
    });

    // Service select change - update hidden input
    this.serviceSelect.addEventListener('change', () => {
      this.serviceCategoryInput.value = this.serviceSelect.value;
    });
  }

  /**
   * Open modal with optional pre-filled service
   * @param {string} serviceCategory - Service category ID
   */
  open(serviceCategory = null) {
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Show modal
    this.modal.classList.add('is-active');
    
    // Pre-fill service if provided
    if (serviceCategory) {
      this.serviceSelect.value = serviceCategory;
      this.serviceCategoryInput.value = serviceCategory;
      this.serviceSelect.focus();
    } else {
      document.getElementById('company_name').focus();
    }

    // Track analytics
    window.gtag?.('event', 'open_quote_modal', {
      'service_category': serviceCategory || 'none'
    });
  }

  /**
   * Close modal
   */
  close() {
    // Allow body scroll
    document.body.style.overflow = '';
    
    // Hide modal
    this.modal.classList.remove('is-active');
    
    // Clear success message
    this.successMsg.classList.remove('show');
  }

  /**
   * Reset form to initial state
   */
  reset() {
    this.form.reset();
    this.serviceCategoryInput.value = '';
    
    // Remove error messages
    document.querySelectorAll('.form-error.show').forEach(el => {
      el.classList.remove('show');
    });
    
    // Reset button state
    this.submitBtn.disabled = false;
    this.submitBtn.classList.remove('is-loading');
    this.submitBtn.textContent = 'Envoyer ma demande';
  }

  /**
   * Validate form fields
   * @returns {Object} - Validation result with isValid and errors
   */
  validateForm() {
    const errors = {};
    
    const company_name = this.form.elements['company_name'].value.trim();
    const contact_name = this.form.elements['contact_name'].value.trim();
    const email = this.form.elements['email'].value.trim();
    const phone = this.form.elements['phone'].value.trim();
    const service_selected = this.form.elements['service_selected'].value;
    const service_need = this.form.elements['service_need'].value;
    const decoration_need = this.form.elements['decoration_need'].value;
    const attendees_count = this.form.elements['attendees_count'].value;
    const event_date = this.form.elements['event_date'].value;
    const event_location = this.form.elements['event_location'].value.trim();
    const message = this.form.elements['message'].value.trim();

    // Validate company name
    if (!company_name) {
      errors.company_name = 'Veuillez entrer le nom de votre entreprise.';
    }

    // Validate contact name
    if (!contact_name) {
      errors.contact_name = 'Veuillez entrer votre nom.';
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      errors.email = 'Veuillez entrer votre adresse email.';
    } else if (!emailRegex.test(email)) {
      errors.email = 'Veuillez entrer une adresse email valide.';
    }

    // Validate phone
    if (!phone) {
      errors.phone = 'Veuillez entrer un numéro de téléphone.';
    } else if (phone.replace(/\D/g, '').length < 10) {
      errors.phone = 'Le numéro de téléphone doit contenir au moins 10 chiffres.';
    }

    // Validate service
    if (!service_selected) {
      errors.service_selected = 'Veuillez sélectionner un service.';
    }

    // Validate service need
    if (!service_need) {
      errors.service_need = 'Veuillez sélectionner une option.';
    }

    // Validate decoration need
    if (!decoration_need) {
      errors.decoration_need = 'Veuillez sélectionner une option.';
    }

    // Validate attendees count
    if (!attendees_count) {
      errors.attendees_count = 'Veuillez entrer un nombre de personnes.';
    } else if (Number(attendees_count) < 1) {
      errors.attendees_count = 'Le nombre de personnes doit être supérieur ou égal à 1.';
    }

    // Validate event date
    if (!event_date) {
      errors.event_date = 'Veuillez sélectionner une date d\'évènement.';
    }

    // Validate event location
    if (!event_location) {
      errors.event_location = 'Veuillez entrer le lieu de l\'évènement.';
    }

    // Validate message
    if (!message) {
      errors.message = 'Veuillez entrer un message.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors: errors
    };
  }

  /**
   * Display validation errors
   * @param {Object} errors - Validation errors object
   */
  displayErrors(errors) {
    // Clear all previous errors
    document.querySelectorAll('.form-error.show').forEach(el => {
      el.classList.remove('show');
    });

    // Display new errors
    Object.keys(errors).forEach(fieldName => {
      const field = this.form.elements[fieldName];
      if (!field) return;

      // RadioNodeList is used when multiple controls share one name (e.g. radios).
      if (typeof RadioNodeList !== 'undefined' && field instanceof RadioNodeList) {
        const firstControl = field[0];
        if (!firstControl) return;
        const groupWrapper = firstControl.closest('.form-group');
        const errorEl = groupWrapper ? groupWrapper.querySelector('.form-error') : null;
        if (errorEl) {
          errorEl.textContent = errors[fieldName];
          errorEl.classList.add('show');
        }
        return;
      }

      const errorEl = field.parentElement.querySelector('.form-error');
      if (errorEl) {
        errorEl.textContent = errors[fieldName];
        errorEl.classList.add('show');
      }
    });
  }

  /**
   * Handle form submission
   * @param {Event} e - Submit event
   */
  async handleSubmit(e) {
    e.preventDefault();

    // Validate form
    const validation = this.validateForm();
    if (!validation.isValid) {
      this.displayErrors(validation.errors);
      return;
    }

    // Disable submit button and show loading state
    this.submitBtn.disabled = true;
    this.submitBtn.classList.add('is-loading');
    this.submitBtn.textContent = 'Envoi en cours...';

    // Prepare form data
    const formData = {
      company_name: this.form.elements['company_name'].value.trim(),
      contact_name: this.form.elements['contact_name'].value.trim(),
      email: this.form.elements['email'].value.trim(),
      phone: this.form.elements['phone'].value.trim(),
      service_category: this.form.elements['service_selected'].value,
      service_need: this.form.elements['service_need'].value,
      decoration_need: this.form.elements['decoration_need'].value,
      attendees_count: Number(this.form.elements['attendees_count'].value),
      event_date: this.form.elements['event_date'].value,
      event_location: this.form.elements['event_location'].value.trim(),
      // Backend schema does not store extra fields yet, so append them to message.
      message: `Besoin d'un service: ${this.form.elements['service_need'].value}\nBesoin d'une décoration: ${this.form.elements['decoration_need'].value}\nNombre de personnes: ${this.form.elements['attendees_count'].value}\nDate de l'évènement: ${this.form.elements['event_date'].value}\nLieu de l'évènement: ${this.form.elements['event_location'].value.trim()}\n\n${this.form.elements['message'].value.trim()}`
    };

    // Debug logging
    const apiUrl = `${API_BASE}/api/quote-request`;
    console.log('Submitting form to:', apiUrl);
    console.log('Form data:', formData);

    try {
      // Send POST request to backend
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const data = await response.json();

        // Track success analytics
        window.gtag?.('event', 'form_submit_success', {
          'reference_id': data.referenceId,
          'service_category': formData.service_category
        });

        // Show success message
        this.successMsg.classList.add('show');
        this.submitBtn.textContent = '✓ Envoyé !';

        // Reset form
        this.reset();

        // Close modal after 2 seconds
        setTimeout(() => {
          this.close();
        }, 2000);
      } else {
        const errorData = await response.json();
        const errors = errorData.errors || {};

        console.error('Server error:', errorData);

        // Display server-side errors
        this.displayErrors(errors);

        // Track error analytics
        window.gtag?.('event', 'form_submit_error', {
          'error_code': response.status,
          'service_category': formData.service_category
        });

        // Re-enable submit button
        this.submitBtn.disabled = false;
        this.submitBtn.classList.remove('is-loading');
        this.submitBtn.textContent = 'Envoyer ma demande';
      }
    } catch (error) {
      console.error('Form submission error:', error);

      // Track network error analytics
      window.gtag?.('event', 'form_submit_error', {
        'error_type': 'network_error',
        'error_message': error.message,
        'service_category': formData.service_category
      });

      // Show user-friendly error message with more details
      let errorMsg = 'Une erreur est survenue lors de l\'envoi du formulaire.';
      if (error.message === 'Failed to fetch' || error.message.includes('fetch')) {
        errorMsg += '\n\nLe serveur n\'est pas accessible. Veuillez:\n- Vérifier que le backend est en cours d\'exécution sur http://localhost:3000\n- Vérifier votre connexion Internet\n\nOu contactez-nous par WhatsApp.';
      } else {
        errorMsg += `\n\nErreur: ${error.message}\n\nVeuillez réessayer ou nous contacter par WhatsApp.`;
      }
      alert(errorMsg);

      // Re-enable submit button
      this.submitBtn.disabled = false;
      this.submitBtn.classList.remove('is-loading');
      this.submitBtn.textContent = 'Envoyer ma demande';
    }
  }
}

/**
 * OffresEnterprise - Main controller class
 * Manages all interactive features on the offre-entreprise page
 */
class OffresEnterprise {
  constructor() {
    this.quoteModal = new QuoteModal();
    this.initEventListeners();
  }

  /**
   * Initialize all event listeners
   */
  initEventListeners() {
    // All "Je demande un devis" buttons
    const quoteButtons = document.querySelectorAll('[data-action="quote"]');
    quoteButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const serviceCategory = button.dataset.service;
        
        // Track analytics
        window.gtag?.('event', 'click_quote_button', {
          'service_category': serviceCategory
        });

        // Open modal with pre-filled service
        this.quoteModal.open(serviceCategory);
      });
    });

    // Shop button for "Autres produits"
    const shopButtons = document.querySelectorAll('[data-action="shop"]');
    shopButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        // Track analytics
        window.gtag?.('event', 'click_shop_button');
      });
    });

    // CTA section button
    const ctaButton = document.querySelector('.cta-section__content .btn--primary');
    if (ctaButton) {
      ctaButton.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Track analytics
        window.gtag?.('event', 'click_cta_button');

        // Open modal without pre-filled service
        this.quoteModal.open();
      });
    }

    // Keyboard accessibility - Tab focus management
    this.setupKeyboardTraps();
  }

  /**
   * Setup keyboard accessibility
   */
  setupKeyboardTraps() {
    // Close modal with ESC key (already handled in QuoteModal)
    
    // Focus trap in modal (optional - Tab should work naturally in HTML structure)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Tab' && this.quoteModal.modal.classList.contains('is-active')) {
        // Allow Tab to work within the modal - browser handles this
        // but we could add custom logic here if needed
      }
    });
  }

  /**
   * Update navigation active state
   */
  updateNavigation() {
    const currentPath = window.location.pathname;
    if (currentPath.includes('offre-entreprise')) {
      const navLinks = document.querySelectorAll('.nav-overlay__link');
      navLinks.forEach(link => {
        if (link.getAttribute('href') === 'offre-entreprise.html' || 
            link.getAttribute('href').includes('offre-entreprise')) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }
  }
}

/**
 * Initialize when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize main controller
  const offresEnterprise = new OffresEnterprise();
  
  // Update navigation state
  offresEnterprise.updateNavigation();

  // Log page view (if GA4 is available)
  window.gtag?.('event', 'page_view', {
    'page_title': 'Offre Entreprise',
    'page_location': window.location.href
  });

  console.log('✓ LoQma Offre Entreprise initialized');
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { QuoteModal, OffresEnterprise };
}
