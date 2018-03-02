/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import angular from 'angular';


/**
 * @disabledngdoc directive
 * @name ngMango.directive:maPlotly
 * @restrict 'E'
 * @scope
 *
 * @description Displays a plotly.js chart
 *
 * @param {object[]} plotly-data Array of plotly traces
 * @param {object=} plotly-layout Plotly layout object
 * 
 **/

class PlotlyController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$scope', '$element', 'maRequireQ']; }
    
    constructor($scope, $element, maRequireQ) {
        this.$scope = $scope;
        this.$element = $element;
        this.element = $element[0];
        
        this.plotlyPromise = maRequireQ(['plotly'], (plotly) => plotly);
    }
    
    $onInit() {
        this.plotlyPromise.then(plotly => {
            plotly.newPlot(this.element, this.plotlyData || [], this.plotlyLayout);
        });
    }
    
    $onChanges(changes) {
        if (changes.plotlyData && !changes.plotlyData.isFirstChange() || changes.plotlyLayout && !changes.plotlyLayout.isFirstChange()) {
            this.element.data = this.plotlyData;
            this.element.layout = this.plotlyLayout;
            this.plotlyPromise.then(plotly => {
                plotly.redraw(this.element);
            });
        }
    }
}

plotlyDirective.$inject = [];
function plotlyDirective() {
    return {
        restrict: 'E',
        scope: {},
        controller: PlotlyController,
        bindToController: {
            plotlyData: '<',
            plotlyLayout: '<?'
        }
    };
}

export default plotlyDirective;


