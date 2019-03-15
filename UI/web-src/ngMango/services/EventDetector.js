/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import multistateStateTemplate from '../components/eventDetectorEditor/detectorTypes/multistateState.html';
import regexStateTemplate from '../components/eventDetectorEditor/detectorTypes/regexState.html';
import alphanumericStateTemplate from '../components/eventDetectorEditor/detectorTypes/alphanumericState.html';

function eventDetectorProvider() {
    const eventDetectorTypes = [
        {
            type: 'POINT_CHANGE',
            description: 'pointEdit.detectors.change',
            pointEventDetector: true,
            dataTypes: new Set(['BINARY', 'MULTISTATE', 'NUMERIC', 'ALPHANUMERIC'])
        },
        {
            type: 'ALPHANUMERIC_REGEX_STATE',
            description: 'pointEdit.detectors.regexState',
            template: regexStateTemplate,
            pointEventDetector: true,
            dataTypes: new Set(['ALPHANUMERIC'])
        },
        {
            type: 'ALPHANUMERIC_STATE',
            description: 'pointEdit.detectors.state',
            template: alphanumericStateTemplate,
            pointEventDetector: true,
            dataTypes: new Set(['ALPHANUMERIC'])
        },
        {
            type: 'ANALOG_CHANGE',
            description: 'pointEdit.detectors.analogChange',
            pointEventDetector: true,
            dataTypes: new Set(['NUMERIC'])
        },
        {
            type: 'HIGH_LIMIT',
            description: 'pointEdit.detectors.highLimit',
            pointEventDetector: true,
            dataTypes: new Set(['NUMERIC'])
        },
        {
            type: 'LOW_LIMIT',
            description: 'pointEdit.detectors.lowLimit',
            pointEventDetector: true,
            dataTypes: new Set(['NUMERIC'])
        },
        {
            type: 'RANGE',
            description: 'pointEdit.detectors.range',
            pointEventDetector: true,
            dataTypes: new Set(['NUMERIC'])
        },
        {
            type: 'BINARY_STATE',
            description: 'pointEdit.detectors.state',
            pointEventDetector: true,
            dataTypes: new Set(['BINARY'])
        },
        {
            type: 'MULTISTATE_STATE',
            description: 'pointEdit.detectors.state',
            template: multistateStateTemplate,
            pointEventDetector: true,
            dataTypes: new Set(['MULTISTATE'])
        },
        {
            type: 'NEGATIVE_CUSUM',
            description: 'pointEdit.detectors.negCusum',
            pointEventDetector: true,
            dataTypes: new Set(['NUMERIC'])
        },
        {
            type: 'NO_CHANGE',
            description: 'pointEdit.detectors.noChange',
            pointEventDetector: true,
            dataTypes: new Set(['BINARY', 'MULTISTATE', 'NUMERIC', 'ALPHANUMERIC'])
        },
        {
            type: 'NO_UPDATE',
            description: 'pointEdit.detectors.noUpdate',
            pointEventDetector: true,
            dataTypes: new Set(['BINARY', 'MULTISTATE', 'NUMERIC', 'ALPHANUMERIC'])
        },
        {
            type: 'POSITIVE_CUSUM',
            description: 'pointEdit.detectors.posCusum',
            pointEventDetector: true,
            dataTypes: new Set(['NUMERIC'])
        },
        {
            type: 'SMOOTHNESS',
            description: 'pointEdit.detectors.smoothness',
            pointEventDetector: true,
            dataTypes: new Set(['NUMERIC'])
        },
        {
            type: 'STATE_CHANGE_COUNT',
            description: 'pointEdit.detectors.changeCount',
            pointEventDetector: true,
            dataTypes: new Set(['BINARY', 'MULTISTATE', 'ALPHANUMERIC'])
        }
    ];
    
    this.registerEventDetectorType = function(type) {
        const existing = eventDetectorTypes.find(t => t.type === type.type);
        if (existing) {
            console.error('Tried to register event detector type twice', type);
            return;
        }
        eventDetectorTypes.push(type);
    };
    
    this.$get = eventDetectorFactory;

    eventDetectorFactory.$inject = ['maRestResource', '$injector', '$q', '$templateCache', 'maPoint'];
    function eventDetectorFactory(RestResource, $injector, $q, $templateCache, Point) {
    
        const eventDetectorBaseUrl = '/rest/v2/full-event-detectors';
        const eventDetectorWebSocketUrl = '/rest/v2/websocket/full-event-detectors';
        const eventDetectorXidPrefix = 'ED_';
        
        const eventDetectorTypesByName = Object.create(null);
        eventDetectorTypes.forEach(eventDetectorType => {
            eventDetectorTypesByName[eventDetectorType.type] = eventDetectorType;
            
            // put the templates in the template cache so we can ng-include them
            if (eventDetectorType.template && !eventDetectorType.templateUrl) {
                eventDetectorType.templateUrl = `eventDetectors.${eventDetectorType.type}.html`;
                $templateCache.put(eventDetectorType.templateUrl, eventDetectorType.template);
            }
            
            Object.freeze(eventDetectorType);
        });

        Object.freeze(eventDetectorTypes);
        Object.freeze(eventDetectorTypesByName);
        
        let maDialogHelper;
        if ($injector.has('maDialogHelper')) {
            maDialogHelper = $injector.get('maDialogHelper');
        }
        
    	const defaultProperties = {
	        detectorType: 'POINT_CHANGE',
	        alarmLevel: 'NONE'
    	};
    
        class EventDetector extends RestResource {
            static get defaultProperties() {
                return defaultProperties;
            }
            
            static get baseUrl() {
                return eventDetectorBaseUrl;
            }
            
            static get webSocketUrl() {
                return eventDetectorWebSocketUrl;
            }
            
            static get xidPrefix() {
                return eventDetectorXidPrefix;
            }
            
            static deleteAllForPoint(xid, opts = {}) {
                return this.http({
                    url: this.baseUrl + '/data-point/' + encodeURIComponent(xid),
                    method: 'DELETE'
                }, opts).then(response => {
                    return response.data;
                });
            }
            
            static findPointDetector(options = {}) {
                if (!(isFinite(options.sourceId) && options.sourceId > 0)) {
                    return $q.reject(new Error('Invalid data point ID'));
                }
                
                const queryPromise = this.buildQuery()
                    .eq('sourceTypeName', 'DATA_POINT')
                    .eq('dataPointId', options.sourceId)
                    .query();
                
                return queryPromise.then(eventDetectors => {
                    let detector = eventDetectors.find(ed => {
                       const typeMatches = ed.detectorType === options.detectorType;
                       if (options.alarmLevel) {
                           return ed.alarmLevel === options.alarmLevel && typeMatches;
                       }
                       return typeMatches;
                    });
                    
                    if (!detector) {
                        detector = new this({
                            alarmLevel: 'WARNING',
                            sourceTypeName: 'DATA_POINT',
                            rtnApplicable: true
                        });
                    }
                    
                    return Object.assign(detector, options);
                });
            }
            
            static findAndUpdate(detector = {}, notify = false) {
                return this.findPointDetector(detector).then(detector => {
                    const type = detector.detectorType;
                    if ((type === 'LOW_LIMIT' || type === 'HIGH_LIMIT') && detector.hasOwnProperty('limit') && detector.limit == null ||
                            type === 'BINARY_STATE' && detector.hasOwnProperty('state') && detector.state == null) {
                        if (detector.isNew()) return;
                        return detector.delete();
                    }
                    
                    if (notify) {
                        return detector.saveAndNotify();
                    } else {
                        return detector.save();
                    }
                });
            }
            
            static saveAndNotify(detector) {
                return $q.when(detector).then(detector => {
                    return detector.save();
                }).then(detector => {
                    if (!maDialogHelper) return;
                    maDialogHelper.toastOptions({
                        textTr: ['ui.components.eventDetectorSaved', detector.description]
                    });
                }, error => {
                    if (!maDialogHelper) return;
                    maDialogHelper.toastOptions({
                        textTr: ['ui.components.eventDetectorSaveError', error.mangoStatusText || '' + error],
                        classes: 'md-warn',
                        timeout: 10000
                    });
                });
            }
            
            static detectorTypes() {
                return eventDetectorTypes;
            }
            
            static detectorTypesByName() {
                return eventDetectorTypesByName;
            }
            
            static forDataPoint(point) {
                if (!point) return null;
                
                const detector = new this();
                detector.sourceTypeName = 'DATA_POINT';
                detector.dataPoint = point;
                detector.sourceId = point.id;
                return detector;
            }

            saveAndNotify() {
                return this.constructor.saveAndNotify(this);
            }
            
            initialize(reason) {
                if (this.dataPoint && !(this.dataPoint instanceof Point)) {
                    this.dataPoint = Object.assign(Object.create(Point.prototype), this.dataPoint);
                }
            }
        }
        
        return EventDetector;
    }
}

export default eventDetectorProvider;