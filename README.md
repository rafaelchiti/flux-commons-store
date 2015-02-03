# Flux Commons Store

__Tested__, __Modular__ and __Small__ Flux Store class to use with facebook/flux Dispatcher (https://github.com/facebook/flux).


## Motivation

Migrate from the default proposed 'string' comparison approach:
```js
switch(action.actionType) {
  case TodoConstants.TODO_CREATE:
    break;
  case TodoConstants.TODO_DESTROY:
    break;
  default:
    return true
}
```

to a simpler and more scalable api like:

```js
// Async actions
myStore.listenToAction(Actions.fetchItems, handleFetchingItems);
myStore.listenToAction(Actions.fetchItems.done, handleFetchingItemsDone);
myStore.listenToAction(Actions.fetchItems.fail, handleFetchingItemsFail);

// Generic matchers
var unauthorizedMatcher = (action, params) => params.response.status === 401;
myStore.listenToMatchingAction(unauthorizedMatcher, handleUnauthorized);
```

Also provide the suger needed for listening/emiting changes.

## How?

* The Store class expects a 'Dispatcher' on construction time, being the Dispatcher either the facebook/flux one or a custom one respecting the same interface. (more details, on how to use your own, later). `new Store(dispatcher)`

* Matching actions. The Store will automatically register itself with the Dispatcher provided. In order for the Store to know how to match actions, it will expect that the dispatched 'Payloads' have at least a property named `action` that will contain the `action` that we want to match (being an obj or a literal). On the other hand if you want to implement custom matchers based on the params of the payload then the Store will expect a property `params` inside the payload.


## Store API

### `.listenToAction(action, handler)`
* `action` any js objcet that will be compared with the `payload.action` object by strict equality.
* `handler` the function to execute when there is a 'match', `handler(payload)`

### `.listenToMatchingAction(matcher, handler)`
* `matcher` a function on the way `matcher(action, params)`. The store will check each dispatched payload with this matcher and execute the handler only when the matcher returns true. The `action` and `params` will be read from the payload.

### `.dispatcherToken()`
* returns the token created by the Dispatcher when registering the callback that listens to all the actions flowing through it.

### `.addChangeListener(cb) .removeChangeListener(cb) .emitChange()`
* Expose a event like interface to listen to any change event happening on the store. By default every time a handler is executed in the Store a change event will be emitted.


## Gist with more code and examples

https://gist.github.com/rafaelchiti/915c680b4713c459026d

## More docs to come.

For more details please check the tests and the `store.js` the code is very simple and self explanatory.
