/**
 * Translation languages dropdown functionality
 */
(function() {
  'use strict';

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