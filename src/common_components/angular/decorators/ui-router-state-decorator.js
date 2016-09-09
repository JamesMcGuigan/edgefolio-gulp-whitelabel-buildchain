/**
 * Due to the fact that we have lots of nested states,
 * parent templates can be rendered either from a url refresh into the child state,
 * or a state transition from the parent state
 *
 * This code rewires $state.transitionTo()/$state.go() and $state.href(), such that if a valid state cannot be found
 * the function should be rerun to search parent and child state trees for a valid relative state name.
 *
 * account-setup.formflow.hedge-funds.service-providers.list :  ^.^.investor-breakdown  ->  ^.investor-breakdown
 */
// @src /src/bower_components/angular-ui-router/src/state.js
angular.module("ui.router.state").config(function($provide) {
  $provide.decorator('$state', function($delegate) {
    // Need to reimplement all functions
    var original = {
      href:         $delegate.href,
      transitionTo: $delegate.transitionTo
    };

    var getSearchStates = function(to) {
      if( typeof to !== 'string' ) { return [to]; }

      var search_states = _.unique([
        to,
        to.replace(/^\^\.\^\./,     '^.'),     // ^.^.    -> ^.     - child
        to.replace(/^\^\.(\w)/,     '.$1'),    // ^.a     -> .a     - child
        to.replace(/^\./,           '^.'),     // .       -> ^.     - parent
        to.replace(/^\^\./,         '^.^.'),   // ^.      -> ^.^.   - parent
        to.replace(/^\^\.\^\.\^\./, '^.'),     // ^.^.^.  -> ^.     - grandchild
        to.replace(/^\^\.\^\.(\w)/, '.$1'),    // ^.^.a   -> .a     - grandchild
        to.replace(/^\./,           '^.^.'),   // .       -> ^.^.   - grandparent
        to.replace(/^\^\./,         '^.^.^.')  // ^.      -> ^.^.^. - grandparent
      ]);
      return search_states;
    }

    $delegate.transitionTo = function(to, toParams, options) {
      if( typeof to !== 'string' ) { return original.transitionTo(to, toParams, options); }

      var output, first_exception, fuzzy_to;
      var search_states = getSearchStates(to);

      for( var i=0, n=search_states.length; i<n; i++ ) {
        fuzzy_to = search_states[i];
        try {
          output = original.transitionTo(fuzzy_to, toParams, options);
          break;
        } catch(exception) {
          first_exception = first_exception || exception;
        }
        // Exception was thrown for all elements in the loop
        if( i === n-1 && first_exception ) {
          console.error("ui-router-state-decorator.js: $state.transitionTo: fuzzy state logic FAILED:", $delegate.$current.name, ': ', to, ' -> ', undefined);
          throw first_exception;
        }
      }
      if( to !== fuzzy_to ) {
        console.warn("ui-router-state-decorator.js: $state.transitionTo: fuzzy state logic:", $delegate.$current.name, ': ', to, ' -> ', fuzzy_to);
      }

      return output;
    };

    $delegate.href = function(to, params, options) {
      if( typeof to !== 'string' ) { return original.href(to, params, options); }

      // $state.href('^.edit({ "document_id": "4" })') throws error, so extract parse params into object
      // NOTE: needs to be fully valid JSON, ie double quotes on everything
      var to_parts = String(to).split(/[()]/);
      if( to_parts.length > 1 ) {
        try {
          params = _.extend({}, params, angular.fromJson(to_parts[1]));
          to     = to_parts[0];
        } catch(e) {
          console.error("ui-router-state-decorator.js: $state.href: invalid JSON:", to, to_parts, e);
        }
      }

      var output, first_exception, fuzzy_to;
      var search_states = getSearchStates(to);

      for( var i=0, n=search_states.length; i<n; i++ ) {
        try {
          fuzzy_to = search_states[i];
          output   = original.href(fuzzy_to, params, options);
          if( output ) { break; }
        } catch(e) {} // Error: Path '^.^.^.^.^.management-companies.contact.review' not valid for state 'root.hedge-funds.profile.contact-information'

        // null was thrown for all elements in the loop
        if( i === n-1 && !output ) {
          console.error("ui-router-state-decorator.js: $state.href: fuzzy state logic FAILED:", $delegate.$current.name, ': ', to, ' -> ', undefined);
        }
      }
      if( to !== fuzzy_to ) {
        console.warn("ui-router-state-decorator.js: $state.href: fuzzy state logic:", $delegate.$current.name, ': ', to, ' -> ', fuzzy_to);
      }

      return output;
    };

    return $delegate;
  });
});
