/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import componentTemplate from './scriptContext.html';
import './scriptContext.css';

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
            .limit(xids.length)
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
        if (Array.isArray(contextPoints)) {
            return contextPoints.map(contextPoint => {
                return this.points.get(contextPoint) || {
                    xid: contextPoint[this.xidProp]
                };
            });
        }
    }

    pointsToContextPoints(points) {
        if (Array.isArray(points)) {
            const xidToContextPoint = this.maUtil.createMapObject(this.contextPoints, this.xidProp);
            return points.map(point => {
                const contextPoint = xidToContextPoint[point.xid] || {
                    variableName: '',
                    contextUpdate: false,
                    [this.xidProp]: point.xid
                };
                this.points.set(contextPoint, point);
                return contextPoint;
            });
        }
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