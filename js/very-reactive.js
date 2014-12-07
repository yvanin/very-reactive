/* The MIT License
http://opensource.org/licenses/MIT
Copyright (c) 2014 Yuri Vanin
https://github.com/yvanin/very-reactive */

(function (React) {

    'use strict';

    var getInitialState = function () {
        return { data: [] };
    };

    var addReactSubscriber = function (source, subscriber) {
        if (!source.reactSubscribers) {
            source.reactSubscribers = [];
        }
        source.reactSubscribers.push(subscriber);
    };

    var disposeReactSubscribers = function () {
        var i;
        if (this.reactSubscribers) {
            for (i = 0; i < this.reactSubscribers.length; i++) {
                if (this.reactRx && this.reactSubscribers[i].dispose) {
                    this.reactSubscribers[i].dispose();
                }
                if (this.reactBacon && typeof (this.reactSubscribers[i]) == 'function') {
                    this.reactSubscribers[i].call();
                }
            }
            this.reactSubscribers = [];
        } else {
            console.warn('reactSubscribers is missing');
        }
    };

    // RxJs binding
    var bindStateFromObservable = function (spec) {
        if (!spec.stateFromObservable.source || !spec.stateFromObservable.source.subscribe) {
            console.warn('stateFromObservable does not have required property "source" with observable value');
            return;
        }

        var source = spec.stateFromObservable.source;

        spec.getInitialState = getInitialState;

        var oldComponentDidMount = spec.componentDidMount;
        spec.componentDidMount = function () {

            var that = this;
            var observer = source.subscribe(
                function (next) {
                    that.state.data.push(next);
                    that.setState(that.state.data);
                },
                spec.stateFromObservable.error,
                spec.stateFromObservable.completed
            );

            if (oldComponentDidMount) {
                oldComponentDidMount.call(null);
            }

            addReactSubscriber(source, observer);

        };

        source.reactRx = true;
        source.disposeReactSubscribers = disposeReactSubscribers.bind(source);
    };

    // Bacon.js binding
    var bindStateFromEventStream = function (spec) {
        if (!spec.stateFromEventStream.source || !spec.stateFromEventStream.source.subscribe) {
            console.warn('stateFromEventStream does not have required property "source" with observable value');
            return;
        }

        var source = spec.stateFromEventStream.source;

        spec.getInitialState = getInitialState;

        var oldComponentDidMount = spec.componentDidMount;
        spec.componentDidMount = function () {

            var that = this;
            var observer = source.onValue(
                function (next) {
                    that.state.data.push(next);
                    that.setState(that.state.data);
                }
            );

            if (oldComponentDidMount) {
                oldComponentDidMount.call(null);
            }

            addReactSubscriber(source, observer);

        };

        source.reactBacon = true;
        source.disposeReactSubscribers = disposeReactSubscribers.bind(source);
    };

    var init = function () {
        var oldCreateClass = React.createClass;

        React.createClass = function (spec) {
            if (spec) {
                if (spec.stateFromObservable) {
                    bindStateFromObservable(spec);
                } else if (spec.stateFromEventStream) {
                    bindStateFromEventStream(spec);
                }
            }

            return oldCreateClass.call(null, spec);
        };
    };

    if (React) {
        init();
    } else {
        console.error('React is not defined');
    }
})(React);