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
    }

    render() {
        this.contextPoints = this.ngModelCtrl.$viewValue;
        this.contextTable = angular.copy(this.contextPoints);
        this.getPoints();
    }

    setViewValue() {
        this.contextPoints = angular.copy(this.contextTable);
        this.contextPoints.forEach(point => delete point.point);

        this.ngModelCtrl.$setViewValue(this.contextPoints);
    }

    getPoints() {
        this.maPoint.rql({query: this.getRqlQuery()}).$promise.then(points => {
            this.contextTable.forEach(item => {
                item.point = points.filter(point =>  point.xid === item.xid )[0];
            });
        });
    }

    getRqlQuery() {
        let ids = '';
        
        this.contextPoints.forEach((point, idx, array) => {
            if (idx === array.length - 1){ 
                ids += point.xid;
            } else {
                ids += point.xid + ',';
            }
        });

        return '&in(xid' + (ids ? ',' + ids : '') +')';
    }

    selectContextPoint() {
        const context = {
            point: this.contextPoint,
            xid: this.contextPoint.xid,
            variableName: ''
        };

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

}

export default {
    bindings: {},
    require: {
        ngModelCtrl: 'ngModel'
    },
    controller: scriptContextController,
    template: componentTemplate
};