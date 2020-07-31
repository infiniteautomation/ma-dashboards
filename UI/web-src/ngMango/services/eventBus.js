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

        subscribe(path, callback) {
            if (!path.length) {
                this.subscribers.add(callback);
            } else {
                const subtopic = this.createSubtopic(path[0]);
                subtopic.subscribe(path.slice(1), callback);
            }
        }

        unsubscribe(path, callback) {
            if (!path.length) {
                return this.subscribers.delete(callback);
            } else {
                const subtopic = this.subtopics.get(path[0]);
                if (subtopic) {
                    const deleted = subtopic.unsubscribe(path.slice(1), callback);
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

    class EventBus {
        constructor() {
            this.topic = new Topic();
        }

        splitPath(path) {
            return path.split(PATH_SEPARATOR);
        }

        subscribe(topic, callback) {
            const path = this.splitPath(topic);
            const i = path.indexOf(MULTI_LEVEL_WILDCARD);
            if (i >= 0 && i < path.length - 1) {
                throw new Error('Multi-level wildcard can only be at end of topic');
            }

            this.topic.subscribe(path, callback);
            return () => {
                this.topic.unsubscribe(path, callback);
            };
        }

        unsubscribe(topic, callback) {
            const path = this.splitPath(topic);
            return this.topic.unsubscribe(path, callback);
        }

        publish(topic, ...args) {
            let event;
            if (topic instanceof Event) {
                event = topic;
                topic = event.type;
            } else {
                event = new EventBusEvent(topic);
            }

            const path = this.splitPath(topic);
            this.topic.publish(path, event, args);
        }
    }

    return new EventBus();
}

export default eventBusFactory;
