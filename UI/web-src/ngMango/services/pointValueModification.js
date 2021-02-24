/**
 * Copyright (C) 2020 RadixIot. All rights reserved.
 * @author Mert Cingöz
 */

import angular from 'angular';

class pointValueModificationFactory {
    static get $$ngIsClass() {
        return true;
    }

    static get $inject() {
        return ['$http'];
    }

    constructor($http) {
        const baseUrl = '/rest/latest/point-value-modification';

        class pointValueModification {
            static import(file, params) {
                return $http({
                    data: file,
                    params,
                    method: 'POST',
                    url: `${baseUrl}/import`,
                    headers: {
                        'Content-Type': 'text/csv'
                    },
                    timeout: 0
                }).then((response) => response.data);
            }
        }
        return pointValueModification;
    }
}

export default pointValueModificationFactory;
