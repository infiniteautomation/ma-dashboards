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
        
        if (!this.contextPoints) {
            this.contextPoints = [];
        } else if (this.contextPoints.length > 0) {
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

        this.maPoint.rql({query: this.getRqlQuery()}).$promise.then(points => {
            this.contextTable.forEach(item => {
                item.point = points.filter(point =>  point.xid === item[this.getContextVarXidName()] )[0];
            });
        });
    }

    getRqlQuery() {
        let ids = '';
        
        this.contextPoints.forEach((point, idx, array) => {
            if (idx === array.length - 1){ 
                ids += point[this.getContextVarXidName()];
            } else {
                ids += point[this.getContextVarXidName()] + ',';
            }
        });

        return '&in(xid' + (ids ? ',' + ids : '') +')';
    }

    selectContextPoint() {
        const context = {
            point: this.contextPoint,
            variableName: '',
            contextUpdate: false
        };

        context[this.getContextVarXidName()] = this.contextPoint.xid;

        this.contextTable.push(context);
        this.setViewValue();
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