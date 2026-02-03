/**
 * User Menu Toggle System
 * Handles both desktop dropdown and mobile slide-in menu for logged-in users
 */

(function() {
  'use strict';

  // Get all necessary DOM elements
  const mobileUserMenuTrigger = document.getElementById('mobile-user-menu-trigger');
  const mobileUserMenu = document.getElementById('mobile-user-menu');
  const mobileUserMenuOverlay = document.getElementById('mobile-user-menu-overlay');
  const mobileUserMenuClose = document.getElementById('mobile-user-menu-close');

  const desktopUserMenuTrigger = document.getElementById('desktop-user-menu-trigger');
  const desktopUserMenu = document.getElementById('desktop-user-menu');

  // State tracking
  let isMobileMenuOpen = false;
  let isDesktopMenuOpen = false;

  /**
   * Toggle Mobile User Menu
   */
  function toggleMobileUserMenu() {
    isMobileMenuOpen = !isMobileMenuOpen;

    if (isMobileMenuOpen) {
      // Open mobile menu
      mobileUserMenu.classList.remove('translate-x-full');
      mobileUserMenu.classList.add('translate-x-0');
      mobileUserMenuOverlay.classList.remove('hidden');

      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Close mobile menu
      mobileUserMenu.classList.add('translate-x-full');
      mobileUserMenu.classList.remove('translate-x-0');
      mobileUserMenuOverlay.classList.add('hidden');

      // Restore body scroll
      document.body.style.overflow = '';
    }
  }

  /**
   * Close Mobile User Menu
   */
  function closeMobileUserMenu() {
    if (isMobileMenuOpen) {
      toggleMobileUserMenu();
    }
  }

  /**
   * Toggle Desktop User Menu
   */
  function toggleDesktopUserMenu() {
    isDesktopMenuOpen = !isDesktopMenuOpen;

    if (isDesktopMenuOpen) {
      desktopUserMenu.classList.remove('hidden');
    } else {
      desktopUserMenu.classList.add('hidden');
    }
  }

  /**
   * Close Desktop User Menu
   */
  function closeDesktopUserMenu() {
    if (isDesktopMenuOpen) {
      isDesktopMenuOpen = false;
      desktopUserMenu.classList.add('hidden');
    }
  }

  /**
   * Close all menus
   */
  function closeAllMenus() {
    closeMobileUserMenu();
    closeDesktopUserMenu();
  }

  /**
   * Handle clicks outside of menus
   */
  function handleClickOutside(event) {
    // Check desktop dropdown
    if (isDesktopMenuOpen &&
      desktopUserMenuTrigger &&
      desktopUserMenu &&
      !desktopUserMenuTrigger.contains(event.target) &&
      !desktopUserMenu.contains(event.target)) {
      closeDesktopUserMenu();
    }
  }

  /**
   * Handle escape key to close menus
   */
  function handleEscapeKey(event) {
    if (event.key === 'Escape') {
      closeAllMenus();
    }
  }

  /**
   * Handle window resize - close menus when switching between mobile/desktop
   */
  let resizeTimer;
  function handleResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      closeAllMenus();
    }, 150);
  }

  /**
   * Initialize event listeners
   */
  function init() {
    // Mobile menu triggers
    if (mobileUserMenuTrigger) {
      mobileUserMenuTrigger.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMobileUserMenu();
      });
    }

    if (mobileUserMenuClose) {
      mobileUserMenuClose.addEventListener('click', closeMobileUserMenu);
    }

    if (mobileUserMenuOverlay) {
      mobileUserMenuOverlay.addEventListener('click', closeMobileUserMenu);
    }

    // Desktop menu trigger
    if (desktopUserMenuTrigger) {
      desktopUserMenuTrigger.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleDesktopUserMenu();
      });
    }

    // Global event listeners
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    window.addEventListener('resize', handleResize);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();