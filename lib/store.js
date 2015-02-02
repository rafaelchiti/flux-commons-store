var EventEmitter = require('events').EventEmitter;

var CHANGE_EVENT = 'change';

class Store extends EventEmitter {

  constructor(dispatcher) {
    if (dispatcher && dispatcher.register) {
      this._dispatcherToken = dispatcher.register(makePayloadHandler().bind(this));
    }

    this._actions = [];
  }

  listenToAction (action, handler, deferExecution) {
    var action = {action, handler, deferExecution};
    validateActions([action]);
    this._actions.push(action);
  }

  listenToMatchingAction (matcher, handler, deferExecution) {
    this._actions.push({matcher, handler, deferExecution});
  }

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

// Show a developer warning if the action does not have a descriptor or handler.
function validateActions(actions) {
  actions.forEach(function(action) {
    if (!action.matcher && (!action.action || !action.handler)) {
      throw new Error('The action: [' + action.name + ']' +
        ' is not valid, either lacks the action to match or a handler.');
    }
  });
}


function makePayloadHandler() {
  return function(payload) {

    // Execute the last handler found so we can have repeated ones but we always
    // use the last from the list.
    var matchedAction;

    this._actions.forEach(action => {

      if (action.matcher) {
        if (action.matcher(payload.action, payload.params)) {
          matchedAction = action;
        }
      } else {
        if (action.action && (action.action === payload.action)) {
          matchedAction = action;
        }
      }

    });

    // Execute the action that matched (the last one if multiple matches found)
    if (matchedAction) {
      if (!matchedAction.handler) {
        throw new Error('Action provided without a handler');
      }

      matchedAction.handler(payload);


      if (matchedAction.deferExecution) {
        setTimeout(function() {
          this.emitChange();
        }.bind(this), 0);
      } else {
        this.emitChange();
      }
    }

    return true; // No errors needed by promise in Dispatcher
  }
}


module.exports = Store;
