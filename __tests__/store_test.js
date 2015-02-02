jest.autoMockOff()

var Store = require('../lib/store');
var ActualDispatcher = require('flux').Dispatcher;
var Dispatcher = jest.genMockFromModule('flux').Dispatcher;

describe('Store', function() {

  describe('with a mocked dispatcher', () => {

    var dispatcher = new Dispatcher();

    it('registers with the dispatcher', () => {
      var store = new Store(dispatcher);
      expect(dispatcher.register).toBeCalled();
    });

  });

  describe('with a real dispatcher', () => {
    var dispatcher = new ActualDispatcher();
    var store = new Store(dispatcher);
    var action = {key: 'action1'};
    var handler = jest.genMockFn();

    it('gets a valid token', () => {
      expect(store.dispatcherToken()).toBeDefined();
    });

    it('matches an action', () => {
      var payload = {action: action};
      store.listenToAction(action, handler);
      dispatcher.dispatch(payload);

      expect(handler).toBeCalledWith(payload);
    });

    it('matches an action with a custom matcher', () => {
      var payload = {action: {someTag: 'tag'}};
      var matcher = (action, params) => action.someTag === 'tag';
      store.listenToMatchingAction(matcher, handler);

      dispatcher.dispatch(payload);

      expect(handler).toBeCalledWith(payload);
    });

    it('fails when trying to listen to an undefined action', () => {
      expect(() => store.listenToAction(null, {})).toThrow();
    });

    it('fails when trying to listen to an action with a undefined handler', () => {
      expect(() => store.listenToAction({}, null)).toThrow();
    });

  });

});
