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
                if (Array.isArray(this.pointValues)) {
                    this.createGraph();
                }
            });
        });

        this.minValue = 0;
        this.maxValue = 100;
        this.groupBy = 'day';
    }
    
    $onChanges(changes) {
        if (changes.pointValues && this.autoScale) {
            if (Array.isArray(this.pointValues) && this.pointValues.length) {
                this.minValue = this.pointValues.reduce((min, v) => v.value < min ? v.value : min, Number.POSITIVE_INFINITY);
                this.maxValue = this.pointValues.reduce((max, v) => v.value > max ? v.value : max, Number.NEGATIVE_INFINITY);
            } else {
                this.minValue = 0;
                this.maxValue = 100;
            }
        }
        
        if (changes.pointValues || changes.groupBy) {
            if (Array.isArray(this.pointValues) && !this.svg && this.d3) {
                this.createGraph();
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
        const graph = svg.append('g')
            .attr('class', 'ma-heat-map-graph')
            .attr('transform', `translate(${margins.left}, ${margins.top})`);

        const from = this.setTimezone(moment(this.pointValues[0].timestamp)).startOf(this.groupBy);
        const to = this.setTimezone(moment(this.pointValues[this.pointValues.length - 1].timestamp));
        const numColumns = Math.ceil(to.diff(from, this.groupBy, true));
        
        const xDomain = Array(numColumns).fill().map((v, i) => {
            const startTime = moment(from).add(i, this.groupBy).startOf(this.groupBy);
            return startTime.format('l');
        });

        const yStart = moment(0).utc().utcOffset(0).startOf(this.groupBy);
        const yEnd = moment(yStart).add(1, this.groupBy);
        const yDomain = Array(this.rows).fill().map((v, i) => {
            const ms = (yEnd - yStart) / this.rows * i;
            return moment(yStart + ms).utc().utcOffset(0).format('LT');
        });
        
        const xScale = d3.scaleBand()
            .domain(xDomain)
            .range([0, graphWidth]);
        
        svg.append('g')
            .attr('transform', `translate(${margins.left}, ${margins.top + graphHeight})`)
            .attr('class', 'ma-heat-map-x-axis')
            .call(d3.axisBottom(xScale).tickSizeOuter(0))
        .selectAll('text')
            .style('text-anchor', 'start')
            .style('transform-origin', '0 1em')
            .style('transform', 'rotate(45deg)');

        const yScale = d3.scaleBand()
            .domain(yDomain)
            .range([0, graphHeight]);

        svg.append('g')
            .attr('transform', `translate(${margins.left}, ${margins.top})`)
            .attr('class', 'ma-heat-map-y-axis')
            .call(d3.axisLeft(yScale).tickSizeOuter(0));
        
        const colorScale = d3.scaleSequential(d3.interpolateSpectral)
            .domain([this.maxValue, this.minValue]);

        const xBandWidth = xScale.bandwidth();
        const yBandWidth = yScale.bandwidth();
        
        graph.selectAll()
            .data(this.pointValues, pv => pv.timestamp)
            .enter()
            .append('rect')
            .attr('transform', pv => {
                const time = this.setTimezone(moment(pv.timestamp));
                const x = xScale(time.format('l'));
                const y = yScale(time.format('LT'));
                return `translate(${x}, ${y})`;
            })
            .attr('width', xBandWidth)
            .attr('height', yBandWidth)
            .style('fill', pv => colorScale(pv.value));
    }
    
    updateGraph() {
        if (!this.svg) {
            
        }
    }
    
    getXDomain() {
        
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
        maxValue: '<?'
    }
};
