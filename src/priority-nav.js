/**
 *
 * Name v0.0.1
 * Priority+ pattern navigation that hides menu items based on the viewport width.
 *
 * Structure based on https://github.com/cferdinandi UMD boilerplate
 * Code inspired by http://codepen.io/lukejacksonn/pen/PwmwWV
 *
 * Free to use under the MIT License.
 * http://twitter.com/GijsRoge
 *
 */

(function (root, factory) {
  if ( typeof define === 'function' && define.amd ) {
    define('priorityNav', factory(root));
  } else if ( typeof exports === 'object' ) {
    module.exports = factory(root);
  } else {
    root.priorityNav = factory(root);
  }
})(window || this, function (root) {

  'use strict';

  /**
   * Variables
   */
  var priorityNav = {}; // Object for public APIs
  var breaks = []; // Array to store menu item's that don't fit.
  var supports = !!document.querySelector && !!root.addEventListener; // Feature test
  var settings = {};
  var navWrapper, totalWidth, navMenuWidth, toggleWidth, navMenu, navDropdown;


  /**
   * Default settings
   * @type {{initClass: string, navDropdownClassName: string, navDropdownToggle: string, navWrapper: string, itemToDropdown: Function, itemToNav: Function}}
   */
  var defaults = {
    initClass: 'js-priorityNav',
    navDropdownClassName: 'nav__dropdown',
    navDropdownToggle: 'nav__dropdown-toggle',
    throttleDelay: 500,
    navWrapper: 'nav',
    navMenu: 'nav__menu',
    itemToDropdown: function () {},
    itemToNav: function () {}
  };


  /**
   * A simple forEach() implementation for Arrays, Objects and NodeLists
   * @private
   * @param {Array|Object|NodeList} collection Collection of items to iterate
   * @param {Function} callback Callback function for each iteration
   * @param {Array|Object|NodeList} scope Object/NodeList/Array that forEach is iterating over (aka `this`)
   */
  var forEach = function (collection, callback, scope) {
    if (Object.prototype.toString.call(collection) === '[object Object]') {
      for (var prop in collection) {
        if (Object.prototype.hasOwnProperty.call(collection, prop)) {
          callback.call(scope, collection[prop], prop, collection);
        }
      }
    } else {
      for (var i = 0, len = collection.length; i < len; i++) {
        callback.call(scope, collection[i], i, collection);
      }
    }
  };


  /**
   * Merge defaults with user options
   * @private
   * @param {Object} defaults Default settings
   * @param {Object} options User options
   * @returns {Object} Merged values of defaults and options
   */
  var extend = function ( defaults, options ) {
    var extended = {};
    forEach(defaults, function (value, prop) {
      extended[prop] = defaults[prop];
    });
    forEach(options, function (value, prop) {
      extended[prop] = options[prop];
    });
    return extended;
  };


  /**
   * Debounced resize to throttle execution
   * @param func
   * @param wait
   * @param immediate
   * @returns {Function}
   */
  function debounce(func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };


  /**
   * Check if dropdown ul is already on page before creating it
   * @param navWrapper
   */
  var prepareHtml = function(){
    if (!document.querySelector('.'+settings.navDropdownClassName)){

      // Create nav dropdown if it doesn't already exist
      navDropdown = document.createElement("ul");
      navDropdown.className = settings.navDropdownClassName;
      // Inject dropdown ul after navigation
      navWrapper.appendChild(navDropdown);
    }
  };


  /**
   * Get width
   * @param elem
   * @returns {number}
   */
  priorityNav.calculateWidths =  debounce(function () {
    totalWidth = navWrapper.offsetWidth;
    navMenuWidth = document.querySelector('.'+settings.navMenu).offsetWidth;

    //Check if dropdown button exist
    if(document.querySelector('.'+settings.navDropdownToggle)){
      toggleWidth = document.querySelector('.'+settings.navDropdownToggle).offsetWidth;
    }else{
      toggleWidth = 0;
    }

  },settings.throttleDelay);


  /**
   * Move item to array
   * @param item
   */
  priorityNav.checkIfItFits = debounce(function(item){

    console.log('test');

    calculateWidths();

    if(totalWidth < navMenuWidth + toggleWidth){

      //move item to dropdown
      moveItem('toDropdown');
      //recalculate widths
      priorityNav.calculateWidths()
      //recheck
      priorityNav.checkIfItFits();

    }else{
      if(totalWidth > breaks[breaks.length-1]){
        //move item to menu
        moveItem('toMenu');
        //recheck
        priorityNav.checkIfItFits();
      }
    }
  },settings.throttleDelay);


  /**
   * Move item to dropdown
   */
  var moveItem = function(a){

    if (a === 'toDropdown'){
      //move last child of navigation menu to dropdown
      navDropdown.appendChild(navMenu.lastElementChild);
      //record breakpoints to restore items
      breaks.push(navMenuWidth + toggleWidth);
      //callback
      settings.itemToDropdown();
    }else{

        //move last child of navigation menu to dropdown
        navMenu.appendChild(navDropdown.lastElementChild);
        //remove last breakpoint
        breaks.pop();
        //callback
        settings.itemToNav();
    }
  }

  var getChildrenWidth = function(e){
    var children = e.childNodes;
    for (var i=0; i<children.length; i++) {
      if (children[i].nodeType != 3) {
        console.log(children[i].offsetWidth)
      }
    }
  }


  /**
   * Bind eventlisteners
   */
  var listeners = function(){
    // Calculate navWrapper width when resizing browser
    window.addEventListener('resize', function(){priorityNav.calculateWidths()});
    // Check if an item needs to move
    window.addEventListener('resize', function(){priorityNav.checkIfItFits()});
  };


  /**
   * Destroy the current initialization.
   * @public
   */
  priorityNav.destroy = function () {

    // If plugin isn't already initialized, stop
    if ( !settings ) return;
    // Remove feedback class
    document.documentElement.classList.remove( settings.initClass );
    // Remove settings
    settings = null;
  };


  /**
   * Initialize Plugin
   * @public
   * @param {Object} options User settings
   */
  priorityNav.init = function ( options ) {

    // Feature test.
    if ( !supports ) return;
    // Destroy any existing initializations
    priorityNav.destroy();
    // Merge user options with defaults
    settings = extend( defaults, options || {} );
    // Add class to HTML element to activate conditional CSS
    document.documentElement.classList.add( settings.initClass );

    navWrapper = document.querySelector( settings.navWrapper );
    navMenu = document.querySelector('.'+settings.navMenu );
    navDropdown = document.querySelector('.'+settings.navDropdownClassName);

    // Generated the needed html if it doesn't exist yet.
    prepareHtml();
    // Event listeners
    listeners();
    // Start plugin by calculating navWrapper width
    priorityNav.checkIfItFits();

    getChildrenWidth(navWrapper);

  };


  /**
   * Public APIs
   */
  return priorityNav;

});