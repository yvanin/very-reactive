# Very Reactive
Very Reactive is a little bridge between the reactive programming JavaScript libs and React.js. It allows to link the React components to Observable collections of RxJs or EventStreams/Properties of Bacon.js, so the components re-render themselves whenever a new item appears in a reactive collection. [See demo](http://yvanin.github.io/very-reactive/).
### RxJs
```javascript
var observable = Rx.Observable...
var component = React.createClass({
    stateFromObservable: {
        source: observable,
        error: function () {
            alert('observable does not work properly');
        },
        completed: function () {
            alert('observable will not produce items anymore');
        }
    },
    render: function() {
        ...
    }
});
```
### Bacon.js
```javascript
var eventStream = $('#btn').asEventStream('click');
var component = React.createClass({
    stateFromEventStream: {
        source: eventStream
    },
    render: function() {
        ...
    }
});
```
### Usage
State of the React's component becomes wired to an Observable/EventStream, you don't need to specify `getInitialState`, but `componentDidMount` will be executed.

After the component is created, the source reactive collection will have a `disposeReactSubscribers()` function which disposes observers/unsubscribes from a reactive collection. Behind the scenes observers are stored in `.reactSubscribers` array of the source.
### License
The MIT License.