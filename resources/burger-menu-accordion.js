/**
 * Sidebar accordion functionality
 */
(function() {
  'use strict';

  function initSidebarAccordion() {
    const accordionButtons = document.querySelectorAll('[data-accordion-toggle]');

    accordionButtons.forEach(function(button) {
      button.addEventListener('click', function() {
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        const contentId = this.getAttribute('aria-controls');
        const content = document.getElementById(contentId);

        if (!content) return;

        // Toggle this accordion
        this.setAttribute('aria-expanded', !isExpanded);
        content.hidden = isExpanded;

        // Add active class for styling
        this.classList.toggle('active', !isExpanded);

        // Optional: Close other accordions (remove if you want multiple open)
        closeOtherAccordions(this);
      });

      // Keyboard navigation
      button.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      });
    });
  }

  /**
   * Close all accordion sections except the active one
   * Remove this function if you want multiple sections open at once
   */
  function closeOtherAccordions(activeButton) {
    const allButtons = document.querySelectorAll('[data-accordion-toggle]');

    allButtons.forEach(function(button) {
      if (button !== activeButton) {
        const contentId = button.getAttribute('aria-controls');
        const content = document.getElementById(contentId);

        if (content) {
          button.setAttribute('aria-expanded', 'false');
          button.classList.remove('active');
          content.hidden = true;
        }
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebarAccordion);
  } else {
    initSidebarAccordion();
  }
})();