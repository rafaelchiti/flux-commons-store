# Flux Commons Store

Modular, isolated and tested Store class compatible with the facebook/flux dispatcher (https://github.com/facebook/flux).

In contrast with other Flux libraries the idea with flux-commons is to provide small plugable utils/classes or patterns to use in a Flux application.

# About flux-commons-store

Favor object matching and custom matchers over 'String' comparison. When a Flux app starts to grow lots of edge cases end up being very messy and result in a massive amount of strings and constants.

#### This Store has been built to be used with the Facebook/Dispatcher or any other Dispatcher that respect the same interface. ES6 features have been used to build the store, the distribution provided has been transformed to ES5 however we recommend to extend and use it with ES6 classes.

#### IMPORTANT: We restricted the format of the payload dispatched through the Flux/Dispatcher on the way of `{action: action, params: params}`, therefore for this Store to behave properly with listeners and custom matchers we need that actions dispatched through the dispatcher respect that format. (This is going to be change in favor of a flexible approach in the near future).

# Features

* Automatically register the Store with the Dispatcher
* Provide a simple and user friendly interface to define a handler for an action, as well as particular matchers to listen for an action/s.
* Provide the interface for registering to changes, unregister and emmit them.
* Validate common errors when declaring listeners (helpful when developing)


# GOAL

The idea behind this small module was to be able to have a simple API as follows:

```js

// Match specific actions
myStore.listenToAction(Actions.fetchItems, handleFetchingItems);

myStore.listenToAction(Actions.fetchItems.done, handleFetchingItemsDone);

myStore.listenToAction(Actions.fetchItems.fail, handleFetchingItemsFail);

// Generic matchers
var unauthorizedMatcher = (action, params) => params.response.status === 401;

myStore.listenToMatchingAction(unauthorized, handleUnauthorized);
```

# API

### `.listenToAction(action, handler)`

- action: Any Object, it will be matched by '==='
- handler: The function to execute when an action matches the listener..


### `.listenToMatchingAction(matcher, handler)`

- matcher: Function that will be used to evaluate the action that is being dispatched. The matcher will receive the `action` and the `parms` when performing the match.
- handler: The function to execute when an action matches the listener.


### `.addChangeListener(callback)`

- callback: The callback that will be executed when the Store matches and action and performs a change, by default on any matching action a change event is emitted.

### `.removeChangeListener(callback)`

- callback: The callback to remove from the change listeners attached to the 'change' event on the Store.

### `.emitChange()`

Emits a change event and executes the callbacks registered (if any)


# Usage



#### Creating a new Store.

```js
var Store = require('flux-commons-store');
var appDispatcher = require('./app_dispatcher'); // Facebook Dispatcher

class MyStore extends Store {
  // My custom methods for this store
}

// The Store will automatically register itself
// against the Dispatcher provided.
var myStore = new MyStore(appDispatcher);
```

## TODO: More examples to come
