# Flux Commons Store

The missing Store class to use with facebook/flux Dispatcher (https://github.com/facebook/flux).

* NO string matching (no more switch/case with huge constants file full of strings)
* Smart matching, define one handler and match in a generic fashion multiple actions. (i.e: If ANY 402 status code then do something)

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
