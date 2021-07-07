/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
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
        
        this.unload = event => {
            this.relinquishAudio();
        };
    }
    
    $onInit() {
        this.id = this.maUtil.uuid();
        this.takeControlOfAudio();
        
        this.$window.addEventListener('unload', this.unload);

        this.maEvents.notificationManager.subscribe((event, mangoEvent) => {
            this.eventRaised(mangoEvent);
        }, this.$scope, ['RAISED']);
    }
    
    $onDestroy() {
        this.$window.removeEventListener('unload', this.unload);
        this.relinquishAudio();
    }
    
    getAudioIds() {
        let ids = this.localStorageService.get(localStorageKey);
        if (!Array.isArray(ids)) {
            ids = [];
        }
        return ids;
    }
    
    takeControlOfAudio() {
        let ids = this.getAudioIds();
        ids.unshift(this.id);
        
        // prevent list growing to more than 10 ids
        ids = ids.slice(0, 10);
        
        this.localStorageService.set(localStorageKey, ids);
    }
    
    relinquishAudio() {
        const ids = this.getAudioIds().filter(id => id !== this.id);
        this.localStorageService.set(localStorageKey, ids);
    }
    
    isCurrentAudioPlayer() {
        const ids = this.getAudioIds();
        return ids[0] === this.id;
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
            
            const promise = Promise.resolve().then(() => {
                if (!file) return;
                
                const audio = this.currentAudio = new Audio(file);
                
                const finished = new Promise((resolve, reject) => {
                    audio.addEventListener('ended', resolve);
                    audio.addEventListener('error', reject);
                });
                
                audio.play();
                
                return finished;
            }).then(null, error => {
                console.error('Error playing event audio', error);
            });

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


