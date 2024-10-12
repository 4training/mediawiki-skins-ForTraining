mw.loader.using("mediawiki.util").then(function () {
  console.log("tailwindburger.js loaded");

  $(function () {
    var $mobileMenuTrigger = $("#mobile-menu-trigger");

    if ($mobileMenuTrigger.length) {
      $mobileMenuTrigger.on("click", function () {
        alert("hello");
      });
    }
  });
});
