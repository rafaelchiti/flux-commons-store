jest.autoMockOff()

var Store = require('../lib/store');
var ActualDispatcher = require('flux').Dispatcher;
var Dispatcher = jest.genMockFromModule('flux').Dispatcher;

describe('Store', function() {

  describe('with a mocked dispatcher', () => {

    it('registers with the dispatcher', () => {
      var dispatcher = new Dispatcher();
      var store = new Store(dispatcher);
      expect(dispatcher.register).toBeCalled();
    });

  });

  describe('with a real dispatcher', () => {
    var dispatcher, store, handler;

    beforeEach(() => {
      dispatcher = new ActualDispatcher();
      store = new Store(dispatcher);
      handler = jest.genMockFn();
    });

    it('#constructor sets a valid token', () => {
      store = new Store(dispatcher);
      expect(store.dispatcherToken()).toBeDefined();
    });

    it('#listenToAction matches an action using strings', () => {
      var action = 'Action 1';

      store.listenToAction(action, handler);

      dispatcher.dispatch(action);

      expect(handler.mock.calls[0][0]).toBe('Action 1');
    });

    it('#listenToAction does not match different string actions', () => {
      store.listenToAction('action 1', handler);

      dispatcher.dispatch('action 2');

      expect(handler).not.toBeCalled();
    });

    it('#listenToAction matches object actions by reference', () => {
      var action = {};
      var payload = {action: action};

      store.listenToAction(action, handler);
      dispatcher.dispatch(payload);
      expect(handler.mock.calls[0][0]).toBe(payload);
    });

    it('#listenToAction does not match different object references', () => {
      var action1 = {key: 'value'};
      var action2 = {key: 'value'};

      store.listenToAction(action1, handler);

      var payload = {action: action2};
      dispatcher.dispatch(payload);

      expect(handler).not.toBeCalled();
    });

    it('#listenToAction doesnt match when the payload.action is not set', () => {
      var action = {};
      var payload = {actionType: action};

      store.listenToAction(action, handler);

      dispatcher.dispatch(payload);

      expect(handler).not.toBeCalled();
    });

    it('#listenTo matches using a custom key in the payload', () => {
      var actionType = {};
      var payload = {actionType: actionType};

      store.listenTo('actionType', actionType, handler);

      dispatcher.dispatch(payload);

      expect(handler.mock.calls[0][0]).toBe(payload);
    });

    it('#listenToMatchingAction matches an action with a custom matcher', () => {
      var payload = {action: {someTag: 'tag'}};
      var matcher = (payload) => payload.action.someTag === 'tag';

      store.listenToMatchingAction(matcher, handler);

      dispatcher.dispatch(payload);

      expect(handler.mock.calls[0][0]).toBe(payload);
    });

    it('#listenToAction emits a change event when matching an action', () => {
      var changeListener = jest.genMockFn();

      store.listenToAction('action', handler);
      store.addChangeListener(changeListener);
      dispatcher.dispatch('action');

      expect(changeListener).toBeCalled();
    })

    it('#handler does not emit a change event when setSilent is called', () => {
      var changeListener = jest.genMockFn();
      store.addChangeListener(changeListener);

      handler = (payload, setSilent) => setSilent();

      store.listenToAction('action', handler);
      dispatcher.dispatch('action');

      expect(changeListener).not.toBeCalled();
    })

    it('#listenToAction fails when trying to listen to an undefined action', () => {
      expect(() => store.listenToAction(null, {})).toThrow();
    });

    it('#listenToAction fails when trying to listen to an action with a undefined handler', () => {
      expect(() => store.listenToAction({}, null)).toThrow();
    });

  });

});
