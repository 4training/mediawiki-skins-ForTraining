/* this is copied from collapsibleTabs.js - somehow I couldn't figure out how to register this correctly as a separate js file */
(function ($) {
  var rtl = $("html").attr("dir") === "rtl";
  $.fn.collapsibleTabs = function (options) {
    // return if the function is called on an empty jquery object
    if (!this.length) {
      return this;
    }
    // Merge options into the defaults
    var settings = $.extend({}, $.collapsibleTabs.defaults, options);

    this.each(function () {
      var $el = $(this);
      // add the element to our array of collapsible managers
      $.collapsibleTabs.instances = $.collapsibleTabs.instances.add($el);
      // attach the settings to the elements
      $el.data("collapsibleTabsSettings", settings);
      // attach data to our collapsible elements
      $el.children(settings.collapsible).each(function () {
        $.collapsibleTabs.addData($(this));
      });
    });

    // if we haven't already bound our resize handler, bind it now
    if (!$.collapsibleTabs.boundEvent) {
      $(window).on(
        "resize",
        mw.util.debounce(500, function () {
          $.collapsibleTabs.handleResize();
        })
      );
      $.collapsibleTabs.boundEvent = true;
    }

    // call our resize handler to setup the page
    $.collapsibleTabs.handleResize();
    return this;
  };
  $.collapsibleTabs = {
    instances: $([]),
    boundEvent: null,
    defaults: {
      expandedContainer: "#p-views ul",
      collapsedContainer: "#p-cactions ul",
      collapsible: "li.collapsible",
      shifting: false,
      expandCondition: function (eleWidth) {
        // If there are at least eleWidth + 1 pixels of free space, expand.
        // We add 1 because .width() will truncate fractional values but .offset() will not.
        return $.collapsibleTabs.calculateTabDistance() >= eleWidth + 1;
      },
      collapseCondition: function () {
        // If there's an overlap, collapse.
        return $.collapsibleTabs.calculateTabDistance() < 0;
      },
    },
    addData: function ($collapsible) {
      var settings = $collapsible.parent().data("collapsibleTabsSettings");
      if (settings) {
        $collapsible.data("collapsibleTabsSettings", {
          expandedContainer: settings.expandedContainer,
          collapsedContainer: settings.collapsedContainer,
          expandedWidth: $collapsible.width(),
          prevElement: $collapsible.prev(),
        });
      }
    },
    getSettings: function ($collapsible) {
      var settings = $collapsible.data("collapsibleTabsSettings");
      if (!settings) {
        $.collapsibleTabs.addData($collapsible);
        settings = $collapsible.data("collapsibleTabsSettings");
      }
      return settings;
    },
    handleResize: function () {
      $.collapsibleTabs.instances.each(function () {
        var $el = $(this),
          data = $.collapsibleTabs.getSettings($el);

        if (data.shifting) {
          return;
        }

        // if the two navigations are colliding
        if (
          $el.children(data.collapsible).length > 0 &&
          data.collapseCondition()
        ) {
          $el.trigger("beforeTabCollapse");
          // move the element to the dropdown menu
          $.collapsibleTabs.moveToCollapsed(
            $el.children(data.collapsible + ":last")
          );
        }

        // if there are still moveable items in the dropdown menu,
        // and there is sufficient space to place them in the tab container
        if (
          $(data.collapsedContainer + " " + data.collapsible).length > 0 &&
          data.expandCondition(
            $.collapsibleTabs.getSettings(
              $(data.collapsedContainer).children(data.collapsible + ":first")
            ).expandedWidth
          )
        ) {
          // move the element from the dropdown to the tab
          $el.trigger("beforeTabExpand");
          $.collapsibleTabs.moveToExpanded(
            data.collapsedContainer + " " + data.collapsible + ":first"
          );
        }
      });
    },
    moveToCollapsed: function (ele) {
      var outerData,
        expContainerSettings,
        target,
        $moving = $(ele);

      outerData = $.collapsibleTabs.getSettings($moving);
      if (!outerData) {
        return;
      }
      expContainerSettings = $.collapsibleTabs.getSettings(
        $(outerData.expandedContainer)
      );
      if (!expContainerSettings) {
        return;
      }
      expContainerSettings.shifting = true;

      // Remove the element from where it's at and put it in the dropdown menu
      target = outerData.collapsedContainer;
      $moving
        .css("position", "relative")
        .css(rtl ? "left" : "right", 0)
        .animate({ width: "1px" }, "normal", function () {
          var data, expContainerSettings;
          $(this).hide();
          // add the placeholder
          $(
            '<span class="placeholder" style="display: none;"></span>'
          ).insertAfter(this);
          $(this)
            .detach()
            .prependTo(target)
            .data("collapsibleTabsSettings", outerData);
          $(this).attr("style", "display: list-item;");
          data = $.collapsibleTabs.getSettings($(ele));
          if (data) {
            expContainerSettings = $.collapsibleTabs.getSettings(
              $(data.expandedContainer)
            );
            if (expContainerSettings) {
              expContainerSettings.shifting = false;
              $.collapsibleTabs.handleResize();
            }
          }
        });
    },
    moveToExpanded: function (ele) {
      var data,
        expContainerSettings,
        $target,
        expandedWidth,
        $moving = $(ele);

      data = $.collapsibleTabs.getSettings($moving);
      if (!data) {
        return;
      }
      expContainerSettings = $.collapsibleTabs.getSettings(
        $(data.expandedContainer)
      );
      if (!expContainerSettings) {
        return;
      }
      expContainerSettings.shifting = true;

      // grab the next appearing placeholder so we can use it for replacing
      $target = $(data.expandedContainer).find("span.placeholder:first");
      expandedWidth = data.expandedWidth;
      $moving
        .css("position", "relative")
        .css(rtl ? "right" : "left", 0)
        .css("width", "1px");
      $target.replaceWith(
        $moving
          .detach()
          .css("width", "1px")
          .data("collapsibleTabsSettings", data)
          .animate({ width: expandedWidth + "px" }, "normal", function () {
            $(this).attr("style", "display: block;");
            var data, expContainerSettings;
            data = $.collapsibleTabs.getSettings($(this));
            if (data) {
              expContainerSettings = $.collapsibleTabs.getSettings(
                $(data.expandedContainer)
              );
              if (expContainerSettings) {
                expContainerSettings.shifting = false;
                $.collapsibleTabs.handleResize();
              }
            }
          })
      );
    },
    /**
     * Returns the amount of horizontal distance between the two tabs groups
     * (#left-navigation and #right-navigation), in pixels. If negative, this
     * means that the tabs overlap, and the value is the width of overlapping
     * parts.
     *
     * Used in default expandCondition and collapseCondition.
     *
     * @return {Numeric} distance/overlap in pixels
     */
    calculateTabDistance: function () {
      var $leftTab, $rightTab, leftEnd, rightStart;

      // In RTL, #right-navigation is actually on the left and vice versa.
      // Hooray for descriptive naming.
      if (!rtl) {
        $leftTab = $("#left-navigation");
        $rightTab = $("#right-navigation");
      } else {
        $leftTab = $("#right-navigation");
        $rightTab = $("#left-navigation");
      }

      leftEnd = $leftTab.offset().left + $leftTab.width();
      rightStart = $rightTab.offset().left;

      return rightStart - leftEnd;
    },
  };
})(jQuery);

/* end of collapsibleTabs.js - now the actual functionality of fortraining.js follows */
jQuery(function ($) {
  /* #custom4training */
  $("#mw-panel").height($(document).height());

  /**
   * Focus search input at the very end
   */
  /*$( '#searchInput' ).attr( 'tabindex', $( document ).lastTabIndex() + 1 );*/

  /**
   * Dropdown menu accessibility
   */
  $("div.vectorMenu").each(function () {
    var $el = $(this);
    $el
      .find("> h3 > a")
      .parent()
      .attr("tabindex", "0")
      // For accessibility, show the menu when the h3 is clicked (bug 24298/46486)
      .on("click keypress", function (e) {
        if (e.type === "click" || e.which === 13) {
          $el.toggleClass("menuForceShow");
          e.preventDefault();
        }
      })
      // When the heading has focus, also set a class that will change the arrow icon
      .focus(function () {
        $el.find("> a").addClass("vectorMenuFocus");
      })
      .blur(function () {
        $el.find("> a").removeClass("vectorMenuFocus");
      })
      .find("> a:first")
      // As the h3 can already be focused there's no need for the link to be focusable
      .attr("tabindex", "-1");
  });

  /**
   * Collapsible tabs
   */
  var $cactions = $("#p-cactions"),
    $tabContainer = $("#p-views ul"),
    originalDropdownWidth = $cactions.width();

  // Bind callback functions to animate our drop down menu in and out
  // and then call the collapsibleTabs function on the menu
  $tabContainer
    .bind("beforeTabCollapse", function () {
      // If the dropdown was hidden, show it
      if ($cactions.hasClass("emptyPortlet")) {
        $cactions
          .removeClass("emptyPortlet")
          .find("h3")
          .css("width", "1px")
          .animate({ width: originalDropdownWidth }, "normal");
      }
    })
    .bind("beforeTabExpand", function () {
      // If we're removing the last child node right now, hide the dropdown
      if ($cactions.find("li").length === 1) {
        $cactions.find("h3").animate({ width: "1px" }, "normal", function () {
          $(this).attr("style", "").parent().addClass("emptyPortlet");
        });
      }
    })
    .collapsibleTabs({
      expandCondition: function (eleWidth) {
        // (This looks a bit awkward because we're doing expensive queries as late as possible.)

        var distance = $.collapsibleTabs.calculateTabDistance();
        // If there are at least eleWidth + 1 pixels of free space, expand.
        // We add 1 because .width() will truncate fractional values but .offset() will not.
        if (distance >= eleWidth + 1) {
          return true;
        } else {
          // Maybe we can still expand? Account for the width of the "Actions" dropdown if the
          // expansion would hide it.
          if ($cactions.find("li").length === 1) {
            return distance >= eleWidth + 1 - originalDropdownWidth;
          } else {
            return false;
          }
        }
      },
      collapseCondition: function () {
        // (This looks a bit awkward because we're doing expensive queries as late as possible.)
        // TODO The dropdown itself should probably "fold" to just the down-arrow (hiding the text)
        // if it can't fit on the line?

        // If there's an overlap, collapse.
        if ($.collapsibleTabs.calculateTabDistance() < 0) {
          // But only if the width of the tab to collapse is smaller than the width of the dropdown
          // we would have to insert. An example language where this happens is Lithuanian (lt).
          if ($cactions.hasClass("emptyPortlet")) {
            return (
              $tabContainer.children("li.collapsible:last").width() >
              originalDropdownWidth
            );
          } else {
            return true;
          }
        } else {
          return false;
        }
      },
    });

  // #custom4training
  var $ftMenuIsOpen = true; // ist Menü gerade aus- oder eingeklappt?

  $("#ft-toggle-menu").click(function () {
    if ($ftMenuIsOpen) {
      // wir klappen das Menü ein
      $("#mw-panel").css({ width: "15px" });
      $("#ft-content").css({ "margin-left": "15px" });
      $("#ft-header").css({ "margin-left": "45px" });
      $("#mw-panel")
        .children("div[id != 'ft-toggle-menu']")
        .css({ display: "none" });
      $("#ft-toggle-menu a#ft-closemenu").css({ display: "none" });
      $("#ft-toggle-menu a#ft-openmenu").css({ display: "block" });
      $("#ft-toggle-menu").css({ width: "15px", "margin-left": "0px" });
      $ftMenuIsOpen = false;
    } else {
      // wir klappen das Menü aus
      $("#mw-panel").css({ width: "220px" });
      $("#ft-content").css({ "margin-left": "220px" });
      $("#ft-header").css({ "margin-left": "250px" });
      $("#mw-panel")
        .children("div[id != 'ft-toggle-menu']")
        .css({ display: "block" });
      $("#ft-toggle-menu a#ft-closemenu").css({ display: "block" });
      $("#ft-toggle-menu a#ft-openmenu").css({ display: "none" });
      $("#ft-toggle-menu").css({ width: "20px", "margin-left": "200px" });
      $ftMenuIsOpen = true;
    }
  });
});
