"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var EventEmitter = require("events").EventEmitter;

var CHANGE_EVENT = "change";

// Base class for Flux Stores.
// Provide out of the box auto-registering with Flux Dispatchers and
// a simple API to register actions/handlers.
var Store = (function (EventEmitter) {
  function Store(dispatcher) {
    if (dispatcher && !dispatcher.register) {
      throw new Error("The dispatcher provided does not have a register method");
    }

    if (dispatcher && dispatcher.register) {
      this._dispatcherToken = dispatcher.register(makePayloadHandler().bind(this));
    }

    this._actionListeners = [];
  }

  _inherits(Store, EventEmitter);

  _prototypeProperties(Store, null, {
    listenToAction: {

      // Register a listener that will be used to analize each action dispatched
      // by asking for the 'action' property inside the payload and comparing it
      // with the action provided here. If the payload itself is the action it will
      // also match properly.
      //
      // See listenTo for docs on the other arguments.
      //
      value: function listenToAction(action, handler, deferExecution) {
        this.listenTo("action", action, handler, deferExecution);
      },
      writable: true,
      configurable: true
    },
    listenTo: {

      // Register a listener and specify where the 'action' lives in the payload.
      // i.e: if you dispatch a payload that has the action inside a property named
      // 'actionType' then you should register the listener here by
      // setting the 'actionKey' to 'actionType'.
      //
      // - deferExecution: if true the emit change on the store will be emitted
      //    on the next tick (do not use this if you are not sure of why you need it)
      //
      // - handler: the handler that will be called when a listener matches the
      //    dispatched action. The handler receives the payload as first argument
      //    and a function setSilent. Call the setSilent fn if you want to avoid
      //    this particular handler from emitting a change on the store.
      //
      value: function listenTo(actionKey, action, handler, deferExecution) {
        var actionListener = { actionKey: actionKey, action: action, handler: handler, deferExecution: deferExecution };
        validateActionListener(actionListener);
        this._actionListeners.push(actionListener);
      },
      writable: true,
      configurable: true
    },
    listenToMatchingAction: {

      // Register a listener by providing a custom matcher.
      // The matcher must be a function that will be called with the 'payload' as
      // the main argument, a match will be identified when the matcher returns true.
      value: function listenToMatchingAction(matcher, handler, deferExecution) {
        this._actionListeners.push({ matcher: matcher, handler: handler, deferExecution: deferExecution });
      },
      writable: true,
      configurable: true
    },
    emitChange: {

      // The store will automatically emit a change event and call the registered
      // callbacks every time a handler from the list of actionListeners gets
      // executed (unless the handler calls the setSilent helper).
      value: function emitChange() {
        this.emit(CHANGE_EVENT);
      },
      writable: true,
      configurable: true
    },
    addChangeListener: {
      value: function addChangeListener(callback) {
        this.on(CHANGE_EVENT, callback);
      },
      writable: true,
      configurable: true
    },
    removeChangeListener: {
      value: function removeChangeListener(callback) {
        this.removeListener(CHANGE_EVENT, callback);
      },
      writable: true,
      configurable: true
    },
    dispatcherToken: {
      value: function dispatcherToken() {
        return this._dispatcherToken;
      },
      writable: true,
      configurable: true
    }
  });

  return Store;
})(EventEmitter);

// Show a very visible error for the developer if the listener is malformed.
function validateActionListener(action) {
  var invalid = !action.action || !action.handler;

  if (invalid) {
    throw new Error("The action listener provided is not valid, the action\n      or the handler are missing.");
  }
}

// Factory for building the main function requried by
// the Flux/Dispatcher from facebook.
function makePayloadHandler() {
  return function (payload) {
    // Execute the last handler found so we can have repeated ones but we always
    // use the last from the list.
    var matchedActionListener;

    // Analyze the payload against an actionListener
    // Either by strict equality or a custom matcher.
    function isAMatch(actionListener, payload) {
      var matcher = actionListener.matcher;

      if (matcher && matcher(payload)) {
        return true;
      } else {
        return actionListener.action === payload || actionListener.action === payload[actionListener.actionKey];
      }
    }

    this._actionListeners.forEach(function (actionListener) {
      if (isAMatch(actionListener, payload)) matchedActionListener = actionListener;
    });

    // Execute the handler associated to the action that matched
    if (matchedActionListener) {
      if (!matchedActionListener.handler) {
        throw new Error("Handler not found on the action listener provided.");
      }

      var silent = false;
      var setSilent = function () {
        return silent = true;
      };

      matchedActionListener.handler(payload, setSilent);

      if (matchedActionListener.deferExecution && !silent) {
        setTimeout((function () {
          this.emitChange();
        }).bind(this), 0);
      } else if (!silent) {
        this.emitChange();
      }
    }

    return true; // No errors needed by promise in Dispatcher
  };
}


module.exports = Store;