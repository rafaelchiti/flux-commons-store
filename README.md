# Flux Common Store

Base Store class to use with Flux/Dispatcher from Facebook. The idea is to have a clean
and simple API to interact with the Facebook Dispatcher and register handlers.

## Usage

```js
var Store = require('flux-commons').Store;
var appDispatcher = require('./app_dispatcher');
var Actions = require('./actions');

class MyStore extends Store {
  getItems() {...}
}

var myStore = new MyStore(appDispatcher);

myStore.listenToAction(Actions.fetchItems, handleFetchItems);
myStore.listenToAction(Actions.fetchItems.done, handleFetchItemsDone);
myStore.listenToAction(Actions.fetchItems.fail, handleFetchItemsFail);

function handleFetchItems() { ... } // i.e: Set a flag as loading
function handleFetchItemsDone() { ... } // i.e: Store the list
function handleFetchItemsFail() { ... } // i.e: Show error message

module.exports = myStore;
```

## Matchers

```js
listenToActionWithTags (tags, handler, deferExecution) {
 if (! (tags instanceof Array)) {
   tags = [tags];
 }

 var matcher = function(action, params) {
   var matchedTagsCount = _.intersection(action.tags, tags).length;
   return matchedTagsCount === tags.length;
 };

 this.listenToMatchingAction(matcher,  handler, deferExecution);
}
```
