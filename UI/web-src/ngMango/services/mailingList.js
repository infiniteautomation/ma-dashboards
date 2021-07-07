/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

MailingListFactory.$inject = ['maRestResource'];
function MailingListFactory(RestResource) {
    
    const baseUrl = '/rest/latest/mailing-lists';
    const webSocketUrl = '/rest/latest/websocket/mailing-lists';
    const xidPrefix = 'ML_';

    const defaultProperties = {
        editPermissions: [],
        recipients: [],
        inactiveSchedule: [
            [],
            [],
            [],
            [],
            [],
            [],
            []
        ],
        name: '',
        readPermissions: [],
        receiveAlarmEmails: 'IGNORE',
    };


    class mailingListResource extends RestResource {
        static get defaultProperties() {
            return defaultProperties;
        }

        static get baseUrl() {
            return baseUrl;
        }

        static get webSocketUrl() {
            return webSocketUrl;
        }
        
        static get xidPrefix() {
            return xidPrefix;
        }
    }
    
    return mailingListResource;
}

export default MailingListFactory;
