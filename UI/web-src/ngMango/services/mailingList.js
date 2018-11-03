/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Luis Güette
 */

MailingListFactory.$inject = ['maRestResource'];
function MailingListFactory(RestResource) {
    
    const baseUrl = '/rest/v2/mailing-lists';
    const webSocketUrl = '/rest/v2/websocket/mailing-lists';
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
        readPermisions: [],
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