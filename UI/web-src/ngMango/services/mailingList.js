/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Luis Güette
 */

import angular from 'angular';

MailingListFactory.$inject = ['maRestResource'];
function MailingListFactory(RestResource) {
    
    const baseUrl = '/v2/mailing-lists';
    const xidPrefix = 'ML_';

    const defaultProperties = {
        name: '',
        username: '',
        code: ''
    };


    class mailingListResource extends RestResource {
        static get defaultProperties() {
            return defaultProperties;
        }

        static get baseUrl() {
            return baseUrl;
        }
        
        static get xidPrefix() {
            return xidPrefix;
        }
    }
    
    return mailingListResource;
}

export default MailingListFactory;