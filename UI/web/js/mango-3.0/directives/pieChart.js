/**
 * @copyright 2016 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['amcharts/pie', 'jquery'], function(AmCharts, $) {
'use strict';

function pieChart($http) {
    return {
        restrict: 'E',
        replace: true,
        scope: {
          values: '=',
          valueLabels: '=?',
          options: '=?'
        },
        template: '<div class="amchart"></div>',
        link: function ($scope, $element, attributes) {
            var options = $.extend(defaultOptions(), $scope.options);
            var chart = AmCharts.makeChart($element[0], options);
            
            var labelFn = createLabelFn();
            $scope.$watchCollection('valueLabels', function(value) {
                labelFn = createLabelFn(value);
            });

            $scope.$watchCollection('values', function(newValue, oldValue) {
                var values = $.extend(true, [], newValue);
                
                for (var i = 0; i < values.length; i++) {
                    var item = values[i];
                    
                    if (item.runtime) {
                        item.id = item.value;
                        item.value = item.runtime / 1000;
                        delete item.runtime;
                    }
                    
                    labelFn(item);
                }
                
                chart.dataProvider = values;
                chart.validateData();
            });
            
            function createLabelFn(labels) {
                return function(item) {
                    var label = labels && labels[item.id] || {};
                    
                    item.text = typeof label === 'string' ? label : label.text || item.text || item.id;
                    item.color = label.color || label.colour || item.color || item.colour;
                };
            }
        }
    };
}

function defaultOptions() {
    return {
        type: "pie",
        theme: "light",
        dataProvider: [],
        valueField: "value",
        titleField: "text",
        colorField: "color",
        balloon:{
            fixedPosition:true
        },
        'export': {
          enabled: true
        }
    };
}

pieChart.inject = ['$http'];
return pieChart;

}); // define
