(function () {
  'use strict';

  const clickedElements = new WeakSet();

  function expandAllEditors() {
    const editorElements = document.querySelectorAll("span.editor-info-toggle.editor-expand");

    editorElements.forEach(function(element) {
      if (!clickedElements.has(element)) {
        element.click();
        clickedElements.add(element);
      }
    });
  }

  function initWithMutationObserver() {
    // Expand any existing editors immediately
    expandAllEditors();

    // Watch for new editors being added to the DOM
    const observer = new MutationObserver(function(mutations) {
      expandAllEditors();
    });

    // Start observing the body for changes
    observer.observe(document.body, {
      childList: true,      // Watch for added/removed nodes
      subtree: true,        // Watch all descendants
      attributes: false     // Don't need to watch attribute changes
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWithMutationObserver);
  } else {
    initWithMutationObserver();
  }

})();