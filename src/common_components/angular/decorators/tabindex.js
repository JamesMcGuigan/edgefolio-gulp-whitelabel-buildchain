/**
 *  Make everything clickable on the page nicely tab'able
 *  Also convert any enter key presses into fake click events
 */
angular.module('edgefolio.common-components.routes').run(function($rootScope, $timeout) {

  //// SPEC: Use .tabIndexKeyboardMode for 5s after tab key press, rather than blurOnClick
  //// SPEC: Remove blue border around links when clicking on them
  //// SPEC: Preserve blue borders when tabbing around the page
  //// *[ng-click] handled above
  var actions = {
    // @disabled
    blurOnClick: function(event, parentEvent) {
      //if( _.get(parentEvent, 'type') !== "keypress" && !$(this).is(":input") ) {
      //  $(this).blur();
      //}
    },
    clickOnEnterKey: function(event) {
      if( event.keyCode === 13 ) { // enter
        $(this).add($(this).children()).trigger('click', event); // event received as second argument in $.on()
      }
    },
    _tabIndexKeyboardModeClass:   'tabIndexHideFocusOutline',
    _tabIndexKeyboardModeTimeout: null,
    _tabIndexKeyboardModeDelay:   5 * 1000, // 5 seconds
    tabIndexKeyboardModeOnTab: function(event) {
      // Add .tabIndexKeyboardMode on tab keypress, then remove after 5s
      if( event.keyCode === 9 ) {
        $('body').removeClass('tabIndexHideFocusOutline');
      }
      if( event.keyCode === 9 || event.keyCode === 13 ) { // pressing tab or enter will reset the fade timeout
        $timeout.cancel(actions._tabIndexKeyboardModeTimeout);
        actions._tabIndexKeyboardModeTimeout = $timeout(function() {
          $('body').addClass('tabIndexKeyboardMode');
        }, actions._tabIndexKeyboardModeDelay);
      }
    }
  };
  //$('body').on("click", "a, .clickable, button, *[class*='button'], [tabindex]", actions.blurOnClick); // SPEC: disabled
  $('body').on("keydown", "a, .clickable, *[ng-click], button, *[class*='button'], [tabindex]", function(event) {
    actions.clickOnEnterKey(event);
    actions.tabIndexKeyboardModeOnTab(event);
  });
  $('body').addClass("tabIndexHideFocusOutline");


  $rootScope.$on('$viewContentLoaded', function() {
    $timeout(function() {
      var tabindex = 1;

      // Ensure footer links are defined last
      $('header, nav, main, footer').each(function(n, rootNode) {
        var clickables = $(rootNode).find(":input, select, a, *.clickable, *[ng-click], *[ui-sref], button, *[class*='button']").not("*[class*='buttons']");
        clickables.each(function(index, clickable) {
          var $clickable = $(clickable);
          var $parent    = $clickable.parent();
          if( $parent.is(clickables) ) {
            // account for <li><a></a></li> structures, remove node from tabindex
            // and set parent tabindex in final else statement
            $clickable.attr('tabindex', -1);
          }
          else if( $parent.is('li') ) {
            // Autoconvert ul li a.clickable structures into ul li.clickable a
            $clickable.attr('tabindex', -1).removeClass('clickable');
            $parent.attr('tabindex', tabindex++).addClass('clickable');
          } else {
            // This is our default case, just a lone clickable without any implicit structure, so give it the next tabindex
            $clickable.attr('tabindex', tabindex++);
          }
        });
      });

      //$('[ng-click]').off("click.tabindex"   ).on("click.tabindex",    actions.blurOnClick); // SPEC: disabled
      $('[ng-click]').off("keypress.tabindex").on("keypress.tabindex", actions.tabIndexKeyboardModeOnTab);

    }, 500); // small delay to allow page to fully render
  });
});