/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';
/**
 * @ngdoc directive
 * @name ngMango.directive:maEventAudio
 *
 * @description Plays audio files when events are raised. You can configure which audio files play at which level.
 *
 * @param {Object} audio-files An object which maps event levels to audio file urls. Keys are the event level in capitals (e.g. URGENT, LIFE_SAFETY) or DEFAULT
 *
 * @usage
 * <ma-event-audio audio-files="{CRITICAL: '/audio/critical.mp3'"></ma-event-audio>
 *
 **/

class EventAudioController {
    static get $inject() { return ['maEvents', '$scope']; }
    
    constructor(maEvents, $scope) {
        this.maEvents = maEvents;
        this.$scope = $scope;
    }
    
    $onInit() {
        this.maEvents.notificationManager.subscribe((event, mangoEvent) => {
            this.eventRaised(mangoEvent);
        }, this.$scope, ['RAISED']);
    }

    eventRaised(mangoEvent) {
        if (!this.audioFiles) return;
        const file = this.audioFiles[mangoEvent.alarmLevel] || this.audioFiles.DEFAULT;
        if (file) {
            if (this.currentAudio) {
                this.currentAudio.pause();
            }
            
            this.currentAudio = new Audio(file);
            this.currentAudio.play();
        }
    }
}

return {
    bindings: {
        audioFiles: '<'
    },
    controller: EventAudioController
};

}); // define
