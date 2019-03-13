/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Luis Güette
 */

import angular from 'angular';
import componentTemplate from './scriptContext.html';

const $inject = Object.freeze(['$scope', 'maPoint']);

class scriptContextController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($scope, maPoint) {
        this.$scope = $scope;
        this.maPoint = maPoint;
    }

    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
        this.contextTable = [];
    }

    render() {
        this.contextPoints = this.ngModelCtrl.$viewValue;
        
        if (!Array.isArray(this.contextPoints) || !this.contextPoints.length) {
            this.contextTable = [];
        } else {
            this.getPoints();
        }
    }

    setViewValue() {
        this.contextPoints = angular.copy(this.contextTable);
        this.contextPoints.forEach(point => delete point.point);

        this.ngModelCtrl.$setViewValue(this.contextPoints);
    }

    getPoints() {
        this.contextTable = angular.copy(this.contextPoints);
        
        const xidProp = this.getContextVarXidName();
        
        return this.maPoint.buildQuery()
            .in('xid', this.contextPoints.map(p => p[xidProp]))
            .query()
            .then(points => {
                this.contextTable.forEach(item => {
                    item.point = points.find(point =>  point.xid === item[xidProp]);
                });
            });
    }

    selectContextPoint() {
        const addedPoint = this.contextPoint;
        const xidProp = this.getContextVarXidName();
        
        // dont allow duplicate xids in table
        if (!addedPoint || this.contextTable.some(c => c[xidProp] === addedPoint.xid)) {
            this.contextPoint = null;
            return;
        }

        this.contextTable.push({
            point: this.contextPoint,
            variableName: '',
            contextUpdate: false,
            [xidProp]: addedPoint.xid
        });
        
        this.setViewValue();
        this.contextPoint = null;
    }

    deleteContextPoint(point) {
        const index = this.contextTable.indexOf(point);

        if (index > -1) {
            this.contextTable.splice(index, 1);
        }

        this.setViewValue();
    }

    getContextVarXidName() {
        return this.contextVarXidName ? this.contextVarXidName : 'xid';
    }

}

export default {
    bindings: {
        contextVarXidName: '<?',
        updatesContext: '<?'
    },
    require: {
        ngModelCtrl: 'ngModel'
    },
    controller: scriptContextController,
    template: componentTemplate
};