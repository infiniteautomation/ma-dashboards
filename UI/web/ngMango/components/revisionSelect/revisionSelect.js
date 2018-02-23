/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['angular', 'require'], function(angular, require) {
'use strict';

/**
 * @ngdoc directive
 * @name ngMango.directive:maRevisionSelect
 * @restrict 'E'
 * @scope
 *
 * @description Displays a drop down list of revisions from the audit trail.
 *
 * @param {string} key The tag key to display available values for.
 * @param {object=} restrictions Restrictions for other tag keys. The object is a map of tag keys to tag values.
 * @param {boolean=} [select-multiple=false] Set to true in order to enable selecting multiple tag values.
 * 
 **/

class RevisionSelectController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['maAuditTrail']; }
    
    constructor(maAuditTrail) {
        this.maAuditTrail = maAuditTrail;
    }
    
    $onInit() {
        this.ngModelCtrl.$render = () => {
            this.selected = this.ngModelCtrl.$viewValue;
        };
    }
    
    $onChanges(changes) {
        if (this.typeName && this.objectId) {
            this.doQuery();
        }
    }
    
    inputChanged() {
        this.ngModelCtrl.$setViewValue(this.selected);
    }
    
    doQuery() {
        this.values = [];

        const query = this.maAuditTrail.buildQuery()
            .eq('typeName', this.typeName)
            .eq('objectId', this.objectId)
            .sort('-ts');
        
        if (this.limit) {
            query.limit(this.limit);
        }

        this.queryPromise = query.query().then(values => {
            this.values = values;
        }).finally(() => {
            delete this.queryPromise;
        });
    }
}

return {
    bindings: {
        typeName: '@?',
        objectId: '<?',
        limit: '<?',
        optionText: '&?'
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    transclude: {
        label: '?maLabel'
    },
    templateUrl: require.toUrl('./revisionSelect.html'),
    controller: RevisionSelectController,
    designerInfo: {
        translation: 'ui.components.maRevisionSelect',
        icon: 'label',
        attributes: {
            key: {options: ['name', 'device']},
        }
    }
};

}); // define
