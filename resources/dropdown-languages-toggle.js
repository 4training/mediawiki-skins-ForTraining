/**
 * Translation languages dropdown functionality
 */
(function() {
  'use strict';

  // Fix the margin-top of the language dropdown button when PDF and ODT indicators are present
  // This is only for older browsers that don't support CSS ':has()'
  document.addEventListener('DOMContentLoaded', function() {
    const hasPdfIndicator = document.getElementById('mw-indicator-a_pdf');
    const hasOdtIndicator = document.getElementById('mw-indicator-c_odt');
    const langBtn = document.querySelector('.language-dropdown-btn');

    if ((hasPdfIndicator || hasOdtIndicator) && langBtn) {
      langBtn.style.marginTop = '-40px';
    }
  });

  function initLanguageDropdown() {
    const dropdownButtons = document.querySelectorAll('.language-dropdown-btn');

    dropdownButtons.forEach(function(button) {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        const list = this.nextElementSibling;
        const isExpanded = this.getAttribute('aria-expanded') === 'true';

        // Toggle dropdown
        this.setAttribute('aria-expanded', !isExpanded);
        list.hidden = isExpanded;

        // Close dropdown when clicking outside
        if (!isExpanded) {
          document.addEventListener('click', function closeDropdown(event) {
            if (!button.contains(event.target) && !list.contains(event.target)) {
              button.setAttribute('aria-expanded', 'false');
              list.hidden = true;
              document.removeEventListener('click', closeDropdown);
            }
          });
        }
      });

      // Close on Escape key
      button.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          const list = this.nextElementSibling;
          this.setAttribute('aria-expanded', 'false');
          list.hidden = true;
        }
      });
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguageDropdown);
  } else {
    initLanguageDropdown();
  }
})();