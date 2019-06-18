/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

/**
 * @ngdoc directive
 * @name ngMango.directive:maEventAudio
 *
 * @description Plays audio files when events are raised. You can configure which audio files play at which level.
 *
 * @param {object} audio-files An object which maps event levels to audio file urls. Keys are the event level in capitals (e.g. URGENT, LIFE_SAFETY) or DEFAULT
 *
 * @usage
 * <ma-event-audio audio-files="{CRITICAL: '/audio/critical.mp3'}"></ma-event-audio>
 *
 **/

const localStorageKey = 'eventAudioPlayerId';

class EventAudioController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maEvents', '$scope', '$window', 'localStorageService', 'maUtil']; }
    
    constructor(maEvents, $scope, $window, localStorageService, maUtil) {
        this.maEvents = maEvents;
        this.$scope = $scope;
        this.$window = $window;
        this.localStorageService = localStorageService;
        this.maUtil = maUtil;
    }
    
    $onInit() {
        this.id = this.maUtil.uuid();
        this.localStorageService.set(localStorageKey, this.id);
        
        this.$scope.$on('$destroy', () => {
            if (this.isCurrentAudioPlayer()) {
                // relinquish control
                this.localStorageService.remove(localStorageKey);
            }
        });
        
        this.maEvents.notificationManager.subscribe((event, mangoEvent) => {
            this.eventRaised(mangoEvent);
        }, this.$scope, ['RAISED']);
    }
    
    isCurrentAudioPlayer() {
        const activeId = this.localStorageService.get(localStorageKey);
        if (activeId == null) {
            this.localStorageService.set(localStorageKey, this.id);
            return true;
        }
        return activeId === this.id;
    }

    eventRaised(mangoEvent) {
        const audioFiles = this.audioFiles || {};
        const readAloudBools = this.readAloud || {};
        
        const file = audioFiles[mangoEvent.alarmLevel] != null ? audioFiles[mangoEvent.alarmLevel] : audioFiles.DEFAULT;
        const readAloud = readAloudBools[mangoEvent.alarmLevel] != null ? readAloudBools[mangoEvent.alarmLevel] : readAloudBools.DEFAULT;
        
        if ((file || readAloud) && this.isCurrentAudioPlayer()) {
            if (this.currentAudio) {
                this.currentAudio.pause();
                delete this.currentAudio;
            }
            
            let promise;
            if (file) {
                const audio = new Audio(file);
                promise = audio.play().then(() => {
                    this.currentAudio = audio;
                }, () => {
                    delete this.currentAudio;
                    return Promise.resolve();
                });
            } else {
                promise = Promise.resolve();
            }
            
            if (readAloud && this.$window.speechSynthesis && this.$window.SpeechSynthesisUtterance) {
                promise.then(() => {
                    const utterance = new this.$window.SpeechSynthesisUtterance(mangoEvent.message);
                    this.$window.speechSynthesis.speak(utterance);
                });
            }
        }
    }
}

export default {
    bindings: {
        audioFiles: '<?',
        readAloud: '<?'
    },
    controller: EventAudioController
};


