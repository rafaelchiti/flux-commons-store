"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var EventEmitter = require("events").EventEmitter;

var CHANGE_EVENT = "change";

var Store = (function (EventEmitter) {
  function Store(dispatcher) {
    if (dispatcher && dispatcher.register) {
      this._dispatcherToken = dispatcher.register(makePayloadHandler().bind(this));
    }

    this._actions = [];
  }

  _inherits(Store, EventEmitter);

  _prototypeProperties(Store, null, {
    listenToAction: {
      value: function listenToAction(action, handler, deferExecution) {
        var action = { action: action, handler: handler, deferExecution: deferExecution };
        validateActions([action]);
        this._actions.push(action);
      },
      writable: true,
      configurable: true
    },
    listenToMatchingAction: {
      value: function listenToMatchingAction(matcher, handler, deferExecution) {
        this._actions.push({ matcher: matcher, handler: handler, deferExecution: deferExecution });
      },
      writable: true,
      configurable: true
    },
    emitChange: {
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

// Show a developer warning if the action does not have a descriptor or handler.
function validateActions(actions) {
  actions.forEach(function (action) {
    if (!action.matcher && (!action.action || !action.handler)) {
      throw new Error("The action: [" + action.name + "]" + " is not valid, either lacks the action to match or a handler.");
    }
  });
}


function makePayloadHandler() {
  return function (payload) {
    // Execute the last handler found so we can have repeated ones but we always
    // use the last from the list.
    var matchedAction;

    this._actions.forEach(function (action) {
      if (action.matcher) {
        if (action.matcher(payload.action, payload.params)) {
          matchedAction = action;
        }
      } else {
        if (action.action && action.action === payload.action) {
          matchedAction = action;
        }
      }
    });

    // Execute the action that matched (the last one if multiple matches found)
    if (matchedAction) {
      if (!matchedAction.handler) {
        throw new Error("Action provided without a handler");
      }

      matchedAction.handler(payload);


      if (matchedAction.deferExecution) {
        setTimeout((function () {
          this.emitChange();
        }).bind(this), 0);
      } else {
        this.emitChange();
      }
    }

    return true; // No errors needed by promise in Dispatcher
  };
}


module.exports = Store;