'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _snabbdomJsx = require('snabbdom-jsx');

var _clientStartup = require('./clientStartup');

var ClientStartup = _interopRequireWildcard(_clientStartup);

var _handleError2 = require('./handleError');

var _handleError3 = _interopRequireDefault(_handleError2);

var _ComponentRegistry = require('./ComponentRegistry');

var _ComponentRegistry2 = _interopRequireDefault(_ComponentRegistry);

var _StoreRegistry = require('./StoreRegistry');

var _StoreRegistry2 = _interopRequireDefault(_StoreRegistry);

var _serverRenderComponent = require('./serverRenderComponent');

var _serverRenderComponent2 = _interopRequireDefault(_serverRenderComponent);

var _buildConsoleReplay2 = require('./buildConsoleReplay');

var _buildConsoleReplay3 = _interopRequireDefault(_buildConsoleReplay2);

var _Authenticity = require('./Authenticity');

var _Authenticity2 = _interopRequireDefault(_Authenticity);

var _context = require('./context');

var _context2 = _interopRequireDefault(_context);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/** @jsx html */
var snabbdom = require('snabbdom');

var patch = snabbdom.init([require('snabbdom/modules/class'), require('snabbdom/modules/props'), require('snabbdom/modules/style'), require('snabbdom/modules/eventlisteners')]);

var ctx = (0, _context2.default)();

var DEFAULT_OPTIONS = {
  traceTurbolinks: false
};

ctx.ReactOnRails = {
  /**
   * Main entry point to using the react-on-rails npm package. This is how Rails will be able to
   * find you components for rendering.
   * @param components (key is component name, value is component)
   */
  register: function register(components) {
    _ComponentRegistry2.default.register(components);
  },


  /**
   * Allows registration of store generators to be used by multiple react components on one Rails
   * view. store generators are functions that take one arg, props, and return a store. Note that
   * the setStore API is different in tha it's the actual store hydrated with props.
   * @param stores (keys are store names, values are the store generators)
   */
  registerStore: function registerStore(stores) {
    if (!stores) {
      throw new Error('Called ReactOnRails.registerStores with a null or undefined, rather than ' + 'an Object with keys being the store names and the values are the store generators.');
    }

    _StoreRegistry2.default.register(stores);
  },


  /**
   * Allows retrieval of the store by name. This store will be hydrated by any Rails form props.
   * Pass optional param throwIfMissing = false if you want to use this call to get back null if the
   * store with name is not registered.
   * @param name
   * @param throwIfMissing Defaults to true. Set to false to have this call return undefined if
   *        there is no store with the given name.
   * @returns Redux Store, possibly hydrated
   */
  getStore: function getStore(name) {
    var throwIfMissing = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

    return _StoreRegistry2.default.getStore(name, throwIfMissing);
  },


  /**
   * Set options for ReactOnRails, typically before you call ReactOnRails.register
   * Available Options:
   * `traceTurbolinks: true|false Gives you debugging messages on Turbolinks events
   */
  setOptions: function setOptions(newOptions) {
    if ('traceTurbolinks' in newOptions) {
      this.options.traceTurbolinks = newOptions.traceTurbolinks;
      delete newOptions.traceTurbolinks;
    }

    if (Object.keys(newOptions).length > 0) {
      throw new Error('Invalid options passed to ReactOnRails.options: ', JSON.stringify(newOptions));
    }
  },


  /**
   * Allow directly calling the page loaded script in case the default events that trigger react
   * rendering are not sufficient, such as when loading JavaScript asynchronously with TurboLinks:
   * More details can be found here:
   * https://github.com/shakacode/react_on_rails/blob/master/docs/additional-reading/turbolinks.md
   */
  reactOnRailsPageLoaded: function reactOnRailsPageLoaded() {
    ClientStartup.reactOnRailsPageLoaded();
  },


  /**
   * Returns CSRF authenticity token inserted by Rails csrf_meta_tags
   * @returns String or null
   */

  authenticityToken: function authenticityToken() {
    return _Authenticity2.default.authenticityToken();
  },


  /**
   * Returns header with csrf authenticity token and XMLHttpRequest
   * @param {*} other headers
   * @returns {*} header
   */

  authenticityHeaders: function authenticityHeaders() {
    var otherHeaders = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    return _Authenticity2.default.authenticityHeaders(otherHeaders);
  },


  // /////////////////////////////////////////////////////////////////////////////
  // INTERNALLY USED APIs
  // /////////////////////////////////////////////////////////////////////////////

  /**
   * Retrieve an option by key.
   * @param key
   * @returns option value
   */
  option: function option(key) {
    return this.options[key];
  },


  /**
   * Allows retrieval of the store generator by name. This is used internally by ReactOnRails after
   * a rails form loads to prepare stores.
   * @param name
   * @returns Redux Store generator function
   */
  getStoreGenerator: function getStoreGenerator(name) {
    return _StoreRegistry2.default.getStoreGenerator(name);
  },


  /**
   * Allows saving the store populated by Rails form props. Used internally by ReactOnRails.
   * @param name
   * @returns Redux Store, possibly hydrated
   */
  setStore: function setStore(name, store) {
    return _StoreRegistry2.default.setStore(name, store);
  },


  /**
   * ReactOnRails.render("HelloWorldApp", {name: "Stranger"}, 'app');
   *
   * @param name Name of your registered component
   * @param props Props to pass to your component
   * @param domNodeId
   * @returns {virtualDomElement} Reference to your component's backing instance
   */
  render: function render(name, props, domNodeId) {
    var componentObj = getComponent(name);
    var domNode = document.getElementById(domNodeId);
    return patch(domNode, (0, _snabbdomJsx.html)(componentObj.component, props));
  },


  /**
   * Get the component that you registered
   * @param name
   * @returns {name}
   */
  getComponent: function getComponent(name) {
    return _ComponentRegistry2.default.get(name);
  },


  /**
   * Used by server rendering by Rails
   * @param options
   */
  serverRenderReactComponent: function serverRenderReactComponent(options) {
    return (0, _serverRenderComponent2.default)(options);
  },


  /**
   * Used by Rails to catch errors in rendering
   * @param options
   */
  handleError: function handleError(options) {
    return (0, _handleError3.default)(options);
  },


  /**
   * Used by Rails server rendering to replay console messages.
   */
  buildConsoleReplay: function buildConsoleReplay() {
    return (0, _buildConsoleReplay3.default)();
  },


  /**
   * Get an Object containing all registered components. Useful for debugging.
   * @returns {*}
   */
  registeredComponents: function registeredComponents() {
    return _ComponentRegistry2.default.components();
  },


  /**
   * Get an Object containing all registered store generators. Useful for debugging.
   * @returns {*}
   */
  storeGenerators: function storeGenerators() {
    return _StoreRegistry2.default.storeGenerators();
  },


  /**
   * Get an Object containing all hydrated stores. Useful for debugging.
   * @returns {*}
   */
  stores: function stores() {
    return _StoreRegistry2.default.stores();
  },
  resetOptions: function resetOptions() {
    this.options = Object.assign({}, DEFAULT_OPTIONS);
  }
};

ctx.ReactOnRails.resetOptions();

ClientStartup.clientStartup(ctx);

exports.default = ctx.ReactOnRails;