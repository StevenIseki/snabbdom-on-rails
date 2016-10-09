import * as ClientStartup from './clientStartup';
import handleError from './handleError';
import ComponentRegistry from './ComponentRegistry';
import StoreRegistry from './StoreRegistry';
import serverRenderReactComponent from './serverRenderReactComponent';
import buildConsoleReplay from './buildConsoleReplay';
import createReactElement from './createReactElement';
import Authenticity from './Authenticity';
import context from './context';

const ctx = context();

const DEFAULT_OPTIONS = {
  traceTurbolinks: false,
};

ctx.ReactOnRails = {
  /**
   * Main entry point to using the snabbdom-on-rails npm package. This is how snabbdom will be able to
   * find you components for rendering.
   * @param components (key is component name, value is component)
   */
  register(components) {
    ComponentRegistry.register(components);
  },

  /**
   * Allows registration of store generators to be used by multiple components on one Rails
   * view. store generators are functions that take one arg, props, and return a store. Note that
   * the setStore API is different in tha it's the actual store hydrated with props.
   * @param stores (keys are store names, values are the store generators)
   */
  registerStore(stores) {
    if (!stores) {
      throw new Error('Called SnabbdomOnRails.registerStores with a null or undefined, rather than ' +
        'an Object with keys being the store names and the values are the store generators.');
    }

    StoreRegistry.register(stores);
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
  getStore(name, throwIfMissing = true) {
    return StoreRegistry.getStore(name, throwIfMissing);
  },

  /**
   * Set options for SnabbdomOnRails, typically before you call SnabbdomOnRails.register
   * Available Options:
   * `traceTurbolinks: true|false Gives you debugging messages on Turbolinks events
   */
  setOptions(newOptions) {
    if ('traceTurbolinks' in newOptions) {
      this.options.traceTurbolinks = newOptions.traceTurbolinks;
      delete newOptions.traceTurbolinks;
    }

    if (Object.keys(newOptions).length > 0) {
      throw new Error(
        'Invalid options passed to SnabbdomOnRails.options: ', JSON.stringify(newOptions)
      );
    }
  },

  /**
   * Allow directly calling the page loaded script in case the default events that trigger react
   * rendering are not sufficient, such as when loading JavaScript asynchronously with TurboLinks:
   * More details can be found here:
   * https://github.com/shakacode/react_on_rails/blob/master/docs/additional-reading/turbolinks.md
   */
  reactOnRailsPageLoaded() {
    ClientStartup.reactOnRailsPageLoaded();
  },

  /**
   * Returns CSRF authenticity token inserted by Rails csrf_meta_tags
   * @returns String or null
   */

  authenticityToken() {
    return Authenticity.authenticityToken();
  },

  /**
   * Returns header with csrf authenticity token and XMLHttpRequest
   * @param {*} other headers
   * @returns {*} header
   */

  authenticityHeaders(otherHeaders = {}) {
    return Authenticity.authenticityHeaders(otherHeaders);
  },

  // /////////////////////////////////////////////////////////////////////////////
  // INTERNALLY USED APIs
  // /////////////////////////////////////////////////////////////////////////////

  /**
   * Retrieve an option by key.
   * @param key
   * @returns option value
   */
  option(key) {
    return this.options[key];
  },

  /**
   * Allows retrieval of the store generator by name. This is used internally by SnabbdomOnRails after
   * a rails form loads to prepare stores.
   * @param name
   * @returns Redux Store generator function
   */
  getStoreGenerator(name) {
    return StoreRegistry.getStoreGenerator(name);
  },

  /**
   * Allows saving the store populated by Rails form props. Used internally by SnabbdomOnRails.
   * @param name
   * @returns Redux Store, possibly hydrated
   */
  setStore(name, store) {
    return StoreRegistry.setStore(name, store);
  },

  /**
   * Get the component that you registered
   * @param name
   * @returns {name, component, generatorFunction}
   */
  getComponent(name) {
    return ComponentRegistry.get(name);
  },

  /**
   * Used by server rendering by Rails
   * @param options
   */
  serverRenderReactComponent(options) {
    return serverRenderReactComponent(options);
  },

  /**
   * Used by Rails to catch errors in rendering
   * @param options
   */
  handleError(options) {
    return handleError(options);
  },

  /**
   * Used by Rails server rendering to replay console messages.
   */
  buildConsoleReplay() {
    return buildConsoleReplay();
  },

  /**
   * Get an Object containing all registered components. Useful for debugging.
   * @returns {*}
   */
  registeredComponents() {
    return ComponentRegistry.components();
  },

  /**
   * Get an Object containing all registered store generators. Useful for debugging.
   * @returns {*}
   */
  storeGenerators() {
    return StoreRegistry.storeGenerators();
  },

  /**
   * Get an Object containing all hydrated stores. Useful for debugging.
   * @returns {*}
   */
  stores() {
    return StoreRegistry.stores();
  },

  resetOptions() {
    this.options = Object.assign({}, DEFAULT_OPTIONS);
  },
};

ctx.SnabbdomOnRails.resetOptions();

ClientStartup.clientStartup(ctx);

export default ctx.ReactOnRails;