/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import moment from 'moment-timezone';
import './heatMap.css';

class HeatMapController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$scope', '$element']; }
    
    constructor($scope, $element) {
        this.$scope = $scope;
        this.$element = $element;
        
        // jshint unused:false
        let d3Promise = import(/* webpackMode: "lazy", webpackChunkName: "d3" */ 'd3').then(d3 => {
            $scope.$apply(() => {
                this.d3 = d3;
                this.createGraph();
            });
        });

        this.minValue = 0;
        this.maxValue = 100;
        this.groupBy = 'day';
        this.transitionDuration = 1000;
    }
    
    $onChanges(changes) {
        let minMaxChanged = changes.minValue || changes.maxValue;
        
        if (changes.pointValues && this.autoScale) {
            if (Array.isArray(this.pointValues) && this.pointValues.length) {
                this.minValue = this.pointValues.reduce((min, v) => v.value < min ? v.value : min, Number.POSITIVE_INFINITY);
                this.maxValue = this.pointValues.reduce((max, v) => v.value > max ? v.value : max, Number.NEGATIVE_INFINITY);
                minMaxChanged = true;
            }
        }
        
        // graph already created
        if (this.svg) {
            if (minMaxChanged) {
                this.updateColorScale();
            }
            
            if (changes.pointValues || changes.groupBy) {
                this.updateAxis();
                this.updateGraph();
            }
        }
    }
    
    setTimezone(m) {
        if (this.timezone) {
            m.tz(this.timezone);
        } else if (Number.isFinite(this.utcOffset)) {
            m.utc().utcOffset(this.utcOffset);
        } else if (this.utcOffset === 'fixed') {
            m.utc().utcOffset(this.fixedUtcOffset);
        }
        return m;
    }

    createGraph() {
        const bbox = this.$element[0].getBoundingClientRect();
        const margins = {top: 0, right: 30, bottom: 60, left: 50};
        const width = bbox.width;
        const height = bbox.height;

        const d3 = this.d3;
        const svg = this.svg = d3.select(this.$element[0])
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .attr('shape-rendering', 'optimizeSpeed');

        const graphWidth = width - (margins.left + margins.right);
        const graphHeight = height - (margins.top + margins.bottom);
        
        this.graph = svg.append('g')
            .attr('class', 'ma-heat-map-graph')
            .attr('transform', `translate(${margins.left}, ${margins.top})`);

        this.xScale = d3.scaleBand()
            .range([0, graphWidth]);
        
        this.xAxis = svg.append('g')
            .attr('transform', `translate(${margins.left}, ${margins.top + graphHeight})`)
            .attr('class', 'ma-heat-map-x-axis');

        this.yScale = d3.scaleBand()
            .range([0, graphHeight]);

        this.yAxis = svg.append('g')
            .attr('transform', `translate(${margins.left}, ${margins.top})`)
            .attr('class', 'ma-heat-map-y-axis');

        this.updateColorScale();
        this.updateAxis();
        this.updateGraph();
    }
    
    updateColorScale() {
        const d3 = this.d3;
        this.colorScale = d3.scaleSequential(d3.interpolateSpectral)
            .domain([this.maxValue, this.minValue])
            .clamp(true);
    }
    
    updateAxis() {
        const d3 = this.d3;

        let from, to;
        if (Array.isArray(this.pointValues) && this.pointValues.length) {
            from = this.setTimezone(moment(this.pointValues[0].timestamp)).startOf(this.groupBy);
            to = this.setTimezone(moment(this.pointValues[this.pointValues.length - 1].timestamp));
        } else {
            from = to = moment(0);
        }
        
        const numColumns = Math.ceil(to.diff(from, this.groupBy, true));
        const xDomain = Array(numColumns).fill().map((v, i) => {
            const startTime = moment(from).add(i, this.groupBy).startOf(this.groupBy);
            return startTime.format('l');
        });
        
        this.xScale.domain(xDomain);
        this.xAxis.call(d3.axisBottom(this.xScale).tickSizeOuter(0));
        
        const yStart = moment(0).utc().utcOffset(0).startOf(this.groupBy);
        const yEnd = moment(yStart).add(1, this.groupBy);
        const yDomain = Array(this.rows).fill().map((v, i) => {
            const ms = (yEnd - yStart) / this.rows * i;
            return moment(yStart + ms).utc().utcOffset(0).format('LT');
        });
        
        this.yScale.domain(yDomain);
        this.yAxis.call(d3.axisLeft(this.yScale).tickSizeOuter(0));
    }
    
    updateGraph() {
        const pointValues = Array.isArray(this.pointValues) ? this.pointValues : [];
        
        const rects = this.graph.selectAll('rect')
            .data(pointValues, pv => pv.timestamp);
        
        rects.exit().remove();

        const newRects = rects.enter()
            .append('rect');

        const xBandWidth = this.xScale.bandwidth();
        const yBandWidth = this.yScale.bandwidth();

        // can split this up into updates just for value or just for scale updates
        rects.merge(newRects)
            .attr('transform', pv => {
                const time = this.setTimezone(moment(pv.timestamp));
                const x = this.xScale(time.format('l'));
                const y = this.yScale(time.format('LT'));
                return `translate(${x}, ${y})`;
            })
            .attr('width', xBandWidth)
            .attr('height', yBandWidth)
            .transition()
                .duration(this.transitionDuration)
                .style('fill', pv => this.colorScale(pv.value));
    }
}

export default {
    controller: HeatMapController,
    bindings: {
        timezone: '@?',
        utcOffset: '<?',
        groupBy: '@?',
        rows: '<',
        autoScale: '<?',
        pointValues: '<',
        minValue: '<?',
        maxValue: '<?',
        transitionDuration: '<?'
    }
};
