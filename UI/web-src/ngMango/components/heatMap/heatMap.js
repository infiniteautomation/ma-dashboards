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
        this.$element[0].classList.add('ma-heat-map-daily');
        this.transitionDuration = 1000;
        this.valueKey = 'value';
    }
    
    $onChanges(changes) {
        let minMaxChanged = changes.minValueAttr || changes.maxValueAttr || changes.autoScale;
        if (minMaxChanged) {
            if (this.autoScale) {
                if (Array.isArray(this.pointValues) && this.pointValues.length) {
                    this.autoScaleMinMax();
                } else {
                    this.minValue = 0;
                    this.maxValue = 0;
                }
            } else {
                this.minValue = this.minValueAttr;
                this.maxValue = this.maxValueAttr;
            }
        }
        
        if (!minMaxChanged && changes.pointValues && this.autoScale) {
            if (Array.isArray(this.pointValues) && this.pointValues.length) {
                this.autoScaleMinMax();
                minMaxChanged = true;
            }
        }
        
        const colorsChanged = minMaxChanged || changes.colors;
        
        // graph already created
        if (this.svg) {
            if (colorsChanged) {
                this.updateColorScale();
            }
            if (changes.pointValues || changes.groupBy) {
                this.updateAxis();
            }
            if (colorsChanged || changes.pointValues || changes.groupBy) {
                this.updateGraph();
            }
        }
        
        if (changes.groupBy) {
            switch (this.groupBy.toLowerCase()) {
            case 'day':
            case 'days':
                this.$element[0].classList.remove('ma-heat-map-weekly');
                this.$element[0].classList.add('ma-heat-map-daily');
                break;
            case 'week':
            case 'weeks':
                this.$element[0].classList.remove('ma-heat-map-daily');
                this.$element[0].classList.add('ma-heat-map-weekly');
                break;
            default:
                this.$element[0].classList.remove('ma-heat-map-daily');
                this.$element[0].classList.remove('ma-heat-map-weekly');
            }
        }
    }
    
    autoScaleMinMax() {
        this.minValue = this.pointValues.reduce((min, v) => v[this.valueKey] < min ? v[this.valueKey] : min, Number.POSITIVE_INFINITY);
        this.maxValue = this.pointValues.reduce((max, v) => v[this.valueKey] > max ? v[this.valueKey] : max, Number.NEGATIVE_INFINITY);
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
        const margins = Object.assign({top: 20, right: 20, bottom: 0, left: 60}, this.margins);
        const width = bbox.width;
        const height = bbox.height;

        const d3 = this.d3;
        const svg = this.svg = d3.select(this.$element[0])
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        const graphWidth = width - (margins.left + margins.right);
        const graphHeight = height - (margins.top + margins.bottom);
        
        this.graph = svg.append('g')
            .attr('class', 'ma-heat-map-graph')
            .attr('transform', `translate(${margins.left}, ${margins.top})`);

        this.xScale = d3.scaleBand()
            .range([0, graphWidth]);
        
        this.xAxis = svg.append('g')
            .attr('transform', `translate(${margins.left}, ${margins.top})`)
            .attr('class', 'ma-heat-map-x-axis');

        this.yScale = d3.scaleBand()
            .range([0, graphHeight]);

        this.yAxis = svg.append('g')
            .attr('transform', `translate(${margins.left}, ${margins.top})`)
            .attr('class', 'ma-heat-map-y-axis');

        this.tooltip = svg.append('g')
            .attr('class', 'ma-heat-map-tooltip')
            .style('opacity', 0)
            .style('pointer-events', 'none');
        
        this.tooltip.append('rect')
            .attr('fill', 'black')
            .attr('width', 100)
            .attr('height', 50)
            .attr('rx', 5)
            .attr('ry', 5)
            .attr('x', 10)
            .attr('y', 10)
            .attr('stroke', 'currentColor');
        
        const text = this.tooltip.append('text')
            .attr('fill', 'currentColor')
            .attr('y', 15);

        text.append('tspan')
            .attr('class', 'ma-heat-map-tooltip-time')
            .attr('x', 15)
            .attr('dy', '1em');
        text.append('tspan')
            .attr('class', 'ma-heat-map-tooltip-value')
            .attr('x', 15)
            .attr('dy', '1em');
        
        this.updateColorScale();
        this.updateAxis();
        this.updateGraph();
    }
    
    updateColorScale() {
        const d3 = this.d3;
        
        if (typeof this.colorScaleExp === 'function') {
            this.colorScale = this.colorScaleExp({$d3: d3})
                .domain([this.maxValue, this.minValue]);
        } else if (Array.isArray(this.colors) && this.colors.length > 1) {
            const increment = (this.maxValue - this.minValue) / (this.colors.length - 1);
            const domain = this.colors.map((v, i) => this.minValue + i * increment);
            this.colorScale = d3.scaleLinear()
                .domain(domain)
                .range(this.colors)
                .clamp(true);
        } else {
            this.colorScale = d3.scaleSequential(d3.interpolateSpectral)
                .domain([this.maxValue, this.minValue])
                .clamp(true);
        }
    }
    
    formatX(value) {
        if (typeof this.axisFormatX === 'function') {
            return this.axisFormatX({$value: value});
        }
        return value.format(this.groupBy.startsWith('day') ? 'l' : 'YYYY-w');
    }
    
    formatY(value) {
        if (typeof this.axisFormatY === 'function') {
            return this.axisFormatY({$value: value});
        }
        return value.format(this.groupBy.startsWith('day') ? 'LT' : 'ddd LT');
    }
    
    updateAxis() {
        const d3 = this.d3;

        // setup the X axis
        
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
            return this.formatX(startTime);
        });

        this.xScale.domain(xDomain);
        this.xAxis.call(d3.axisTop(this.xScale).tickSizeOuter(0));
        
        // setup the Y axis
        
        const yStart = moment(0).utc().utcOffset(0).startOf(this.groupBy);
        const yEnd = moment(yStart).add(1, this.groupBy);
        const yDuration = yEnd - yStart;

        let numRows = 48;
        if (this.rows) {
            numRows = this.rows;
        } else if (Array.isArray(this.pointValues) && this.pointValues.$options && this.pointValues.$options.rollupInterval) {
            // automatically set the number of rows based on the rollup interval used
            const rollupInterval = this.pointValues.$options.rollupInterval;
            try {
                const [interval, units] = rollupInterval.trim().split(/\s+/);
                const rollupDuration = moment.duration(Number.parseInt(interval, 10), units);
                numRows = Math.floor(yDuration / rollupDuration);
            } catch (e) {}
        } else if (Array.isArray(this.pointValues) && this.pointValues.length > 1) {
            // automatically set the number of rows based on the time difference between two point values
            const diff = this.pointValues[1].timestamp - this.pointValues[0].timestamp;
            numRows = Math.floor(yDuration / diff);
        }
        
        const yDomain = Array(numRows).fill().map((v, i) => {
            const ms = yDuration / numRows * i;
            return this.formatY(moment(yStart + ms).utc().utcOffset(0));
        });
        
        this.yScale.domain(yDomain);
        this.yAxis.call(d3.axisLeft(this.yScale).tickSizeOuter(0));
    }
    
    updateGraph() {
        const d3 = this.d3;
        
        const pointValues = Array.isArray(this.pointValues) ? this.pointValues : [];
        
        const rects = this.graph.selectAll('rect')
            .data(pointValues, pv => pv.timestamp);
        
        rects.exit().remove();

        const svgElement = this.svg.node();

        const newRects = rects.enter()
            .append('rect')
            .attr('shape-rendering', 'crispEdges')
            .on('mouseover', (pv, i, rects) => {
                d3.select(rects[i])
                    .attr('stroke', 'currentColor')
                    .raise();

                const value = pv[this.valueKey];
                const rendered = this.valueKey !== 'value' ? pv[this.valueKey + '_rendered'] : pv.rendered;
                const time = this.setTimezone(moment(pv.timestamp));
                
                this.tooltip.style('opacity', 1);
                
                this.tooltip.select('tspan.ma-heat-map-tooltip-time')
                    .text(time.format('ll LT'));
                this.tooltip.select('tspan.ma-heat-map-tooltip-value')
                    .text(rendered);
                
                const dims = this.tooltip.select('text').node().getBoundingClientRect();
                this.tooltip.select('rect')
                    .attr('width', dims.width + 10)
                    .attr('height', dims.height + 10);
            })
            .on('mousemove', (pv, i, rects) => {
                const [x, y] = d3.mouse(svgElement);
                this.tooltip.style('transform', `translate(${x}px, ${y}px)`);
            })
            .on('mouseleave', (pv, i, rects) => {
                d3.select(rects[i])
                    .attr('stroke', null);
                this.tooltip.style('opacity', 0);
            });

        const xBandWidth = this.xScale.bandwidth() * 1.03;
        const yBandWidth = this.yScale.bandwidth() * 1.03;

        // can split this up into updates just for value or just for scale updates
        rects.merge(newRects)
            .attr('transform', pv => {
                const time = this.setTimezone(moment(pv.timestamp));
                const x = this.xScale(this.formatX(time));
                const y = this.yScale(this.formatY(time));
                return `translate(${x}, ${y})`;
            })
            .attr('width', xBandWidth)
            .attr('height', yBandWidth)
            .transition()
                .duration(this.transitionDuration)
                .style('fill', pv => this.colorScale(pv[this.valueKey]));
    }
}

export default {
    controller: HeatMapController,
    bindings: {
        timezone: '@?',
        utcOffset: '<?',
        groupBy: '@?',
        rows: '<?',
        autoScale: '<?',
        pointValues: '<',
        minValueAttr: '<?minValue',
        maxValueAttr: '<?maxValue',
        transitionDuration: '<?',
        axisFormatX: '&?',
        axisFormatY: '&?',
        valueKey: '@?',
        margins: '<?',
        colors: '<?',
        colorScaleExp: '&?colorScale'
    }
};
