var EventEmitter = require('events').EventEmitter;

var CHANGE_EVENT = 'change';

// Base class for Flux Stores.
// Provide out of the box auto-registering with Flux Dispatchers and
// a simple API to register actions/handlers.
class Store extends EventEmitter {

  constructor(dispatcher) {
    if (dispatcher && !dispatcher.register) {
      throw new Error('The dispatcher provided does not have a register method');
    }

    if (dispatcher && dispatcher.register) {
      this._dispatcherToken = dispatcher.register(makePayloadHandler().bind(this));
    }

    this._actionListeners = [];
  }

  // Register a listener that will be used to analize each action dispatched
  // by asking for the 'action' property inside the payload and comparing it
  // with the action provided here. If the payload itself is the action it will
  // also match properly.
  //
  // See listenTo for docs on the other arguments.
  //
  listenToAction(action, handler, deferExecution) {
    this.listenTo('action', action, handler, deferExecution);
  }

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
  listenTo(actionKey, action, handler, deferExecution) {
    var actionListener = {actionKey, action, handler, deferExecution};
    validateActionListener(actionListener);
    this._actionListeners.push(actionListener);
  }

  // Register a listener by providing a custom matcher.
  // The matcher must be a function that will be called with the 'payload' as
  // the main argument, a match will be identified when the matcher returns true.
  listenToMatchingAction (matcher, handler, deferExecution) {
    this._actionListeners.push({matcher, handler, deferExecution});
  }

  // The store will automatically emit a change event and call the registered
  // callbacks every time a handler from the list of actionListeners gets
  // executed (unless the handler calls the setSilent helper).
  emitChange() {
    this.emit(CHANGE_EVENT);
  }

  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  }

  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }

  dispatcherToken() {
    return this._dispatcherToken;
  }

}

// Show a very visible error for the developer if the listener is malformed.
function validateActionListener(action) {
  var invalid = !action.action || !action.handler;

  if (invalid) {
    throw new Error(`The action listener provided is not valid, the action
      or the handler are missing.`);
  }
}

// Factory for building the main function requried by
// the Flux/Dispatcher from facebook.
function makePayloadHandler() {

  return function(payload) {

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
        return actionListener.action === payload ||
          actionListener.action === payload[actionListener.actionKey];
      }
    }

    this._actionListeners.forEach(actionListener => {
      if ( isAMatch(actionListener, payload) ) matchedActionListener = actionListener;
    });

    // Execute the handler associated to the action that matched
    if (matchedActionListener) {

      if (!matchedActionListener.handler) {
        throw new Error('Handler not found on the action listener provided.');
      }

      var silent = false;
      var setSilent = () => silent = true;

      matchedActionListener.handler(payload, setSilent);

      if (matchedActionListener.deferExecution && !silent) {
        setTimeout(function() {
          this.emitChange();
        }.bind(this), 0);
      } else if (!silent) {
        this.emitChange();
      }
    }

    return true; // No errors needed by promise in Dispatcher
  }
}


module.exports = Store;
