/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Luis Güette
 * @author Jared Wiltshire
 */

import componentTemplate from './scriptContext.html';

class scriptContextController {

    static get $inject() { return ['maPoint', 'maUtil']; }
    static get $$ngIsClass() { return true; }

    constructor(maPoint, maUtil) {
        this.maPoint = maPoint;
        this.maUtil = maUtil;
        
        this.xidProp = 'xid';
        
        this.contextPoints = [];
        this.points = new WeakMap();
    }
    
    $onChanges(changes) {
        if (changes && changes.contextVarXidName && this.contextVarXidName) {
            this.xidProp = this.contextVarXidName;
        }
    }

    $onInit() {
        this.ngModelCtrl.$render = () => this.render();
    }

    render() {
        const contextPoints = Array.isArray(this.ngModelCtrl.$viewValue) ? this.ngModelCtrl.$viewValue : [];
        
        const xidToContextPoint = this.maUtil.createMapObject(contextPoints, this.xidProp);
        const xids = Object.keys(xidToContextPoint);

        this.maPoint.buildPostQuery()
            .in('xid', xids)
            .query().then(points => {
                points.forEach(point => {
                    const contextPoint = xidToContextPoint[point.xid];
                    this.points.set(contextPoint, point);
                });
                this.contextPoints = contextPoints;
            }, error => {
                this.contextPoints = contextPoints;
            });
    }

    setViewValue() {
        this.ngModelCtrl.$setViewValue(this.contextPoints.slice());
    }

    deleteContextPoint(index) {
        this.contextPoints.splice(index, 1);
        this.contextPoints = this.contextPoints.slice();
        this.setViewValue();
    }

    contextPointsToPoints(contextPoints) {
        return contextPoints.map(contextPoint => {
            return this.points.get(contextPoint) || {
                xid: contextPoint[this.xidProp]
            };
        });
    }

    pointsToContextPoints(points) {
        return points.map(point => {
            const contextPoint = {
                variableName: '',
                contextUpdate: false,
                [this.xidProp]: point.xid
            };
            this.points.set(contextPoint, point);
            return contextPoint;
        });
    }
    
    getPoint(contextPoint) {
        return this.points.get(contextPoint);
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