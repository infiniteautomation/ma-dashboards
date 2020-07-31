/**
 * @copyright 2020 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

eventBusFactory.$inject = [];
function eventBusFactory() {

    const SINGLE_LEVEL_WILDCARD = '+';
    const MULTI_LEVEL_WILDCARD = '#';
    const PATH_SEPARATOR = '/';

    class EventBusEvent extends CustomEvent {
        constructor(topic) {
            super(topic);
        }
    }

    class Topic {
        constructor(parent) {
            this.parent = parent;
            this.subscribers = new Set();
            this.subtopics = new Map();
        }

        createSubtopic(name) {
            let subtopic = this.subtopics.get(name);
            if (!subtopic) {
                subtopic = new Topic(this);
                this.subtopics.set(name, subtopic);
            }
            return subtopic;
        }

        subscribe(path, listener) {
            if (!path.length) {
                this.subscribers.add(listener);
            } else {
                const subtopic = this.createSubtopic(path[0]);
                subtopic.subscribe(path.slice(1), listener);
            }
        }

        unsubscribe(path, listener) {
            if (!path.length) {
                return this.subscribers.delete(listener);
            } else {
                const subtopic = this.subtopics.get(path[0]);
                if (subtopic) {
                    const deleted = subtopic.unsubscribe(path.slice(1), listener);
                    if (deleted && subtopic.isEmpty()) {
                        this.subtopics.delete(path[0]);
                    }
                    return deleted;
                }
            }
            return false;
        }

        isEmpty() {
            return !this.subscribers.size && !this.subtopics.size;
        }

        publish(path, event, args) {
            if (!path.length) {
                this.publishToSubscribers(event, args);
            } else {
                const subtopic = this.subtopics.get(path[0]);
                if (subtopic) {
                    subtopic.publish(path.slice(1), event, args);
                }
                const singleLevelWildcardTopic = this.subtopics.get(SINGLE_LEVEL_WILDCARD);
                if (singleLevelWildcardTopic) {
                    singleLevelWildcardTopic.publish(path.slice(1), event, args);
                }
                const multiLevelWildcardTopic = this.subtopics.get(MULTI_LEVEL_WILDCARD);
                if (multiLevelWildcardTopic) {
                    multiLevelWildcardTopic.publishToSubscribers(event, args);
                }
            }
        }

        publishToSubscribers(event, args) {
            for (const subscriber of this.subscribers) {
                subscriber.call(undefined, event, ...args);
            }
        }
    }

    /**
     * @ngdoc service
     * @name ngMangoServices.maEventBus
     * @description
     * Provides a generic event bus instance which can be shared and used amongst services and components
     */
    class EventBus {
        constructor() {
            this.topic = new Topic();
        }

        /**
         * @ngdoc method
         * @methodOf ngMangoServices.maEventBus
         * @name subscribe
         *
         * @description
         * Subscribes a listener callback to a topic. Topic levels are separated by a / character
         * and may contain a single-level wildcard (+) or a multi-level wildcard (#, at the end only).
         *
         * @param {string} topic Topic name
         * @param {function} listener Listener callback, invoked when a matching event is published. The first argument
         * is always an Event followed by the arguments passed to the publish method
         * @returns {function} Unsubscribe function, calling this function will unsubscribe the listener
         */
        subscribe(topic, listener) {
            const path = topic.split(PATH_SEPARATOR);
            const i = path.indexOf(MULTI_LEVEL_WILDCARD);
            if (i >= 0 && i < path.length - 1) {
                throw new Error('Multi-level wildcard can only be at end of topic');
            }

            this.topic.subscribe(path, listener);
            return () => {
                this.topic.unsubscribe(path, listener);
            };
        }

        /**
         * @ngdoc method
         * @methodOf ngMangoServices.maEventBus
         * @name unsubscribe
         *
         * @description
         * Unsubscribes a listener callback for a topic.
         *
         * @param {string} topic Topic name, must be exactly the same as the topic that was supplied when listener was
         * subscribed
         * @param {function} listener Listener callback
         * @returns {boolean} true if the listener was successfully removed
         */
        unsubscribe(topic, listener) {
            const path = topic.split(PATH_SEPARATOR);
            return this.topic.unsubscribe(path, listener);
        }

        /**
         * @ngdoc method
         * @methodOf ngMangoServices.maEventBus
         * @name publish
         *
         * @description
         * Unsubscribes a listener callback for a topic.
         *
         * @param {string} topic Topic name, cannot contain wildcards
         * @param {*} args arbitrary number of arguments which will be passed to the listeners (after the event argument)
         */
        publish(topic, ...args) {
            let event;
            if (topic instanceof Event) {
                event = topic;
                topic = event.type;
            } else {
                event = new EventBusEvent(topic);
            }

            const path = topic.split(PATH_SEPARATOR);
            this.topic.publish(path, event, args);
        }
    }

    return new EventBus();
}

export default eventBusFactory;
