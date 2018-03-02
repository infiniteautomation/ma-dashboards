/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';


eventDetectorFactory.$inject = ['maRestResource', '$injector', '$q'];
function eventDetectorFactory(RestResource, $injector, $q) {

    const eventDetectorBaseUrl = '/rest/v2/event-detectors';
    const eventDetectorWebSocketUrl = '/rest/v1/websocket/event-detectors';
    const eventDetectorXidPrefix = 'ED_';
    
    let maDialogHelper;
    if ($injector.has('maDialogHelper')) {
        maDialogHelper = $injector.get('maDialogHelper');
    }
    
	const defaultProperties = {
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
                        durationType: 'SECONDS',
                        alarmLevel: 'WARNING',
                        detectorSourceType: 'DATA_POINT',
                        rtnApplicable: true
                    });
                }
                
                return Object.assign(detector, options);
            });
        }
        
        saveAndNotify() {
            return this.constructor.saveAndNotify(this);
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
    }
    
    return EventDetector;
}

export default eventDetectorFactory;


