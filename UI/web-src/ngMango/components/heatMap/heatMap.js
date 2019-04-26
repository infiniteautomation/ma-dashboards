/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import moment from 'moment-timezone';
import heatMapTemplate from './heatMap.html';
import heatMapTooltip from './heatMapTooltip.html';
import './heatMap.css';

class HeatMapController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return ['$scope', '$element', '$transclude', '$compile']; }
    
    constructor($scope, $element, $transclude, $compile) {
        this.$scope = $scope;
        this.$element = $element;
        this.$transclude = $transclude;
        this.$compile = $compile;
        
        // jshint unused:false
        let d3Promise = import(/* webpackMode: "lazy", webpackChunkName: "d3" */ 'd3').then(d3 => {
            $scope.$apply(() => {
                this.d3 = d3;
                this.updateSvg();
            });
        });

        this.minValue = 0;
        this.maxValue = 100;
        this.groupBy = 'day';
        this.$element[0].classList.add('ma-heat-map-daily');
        this.transitionDuration = 1000;
        this.valueKey = 'value';
        this.showTooltip = true;
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
        
        this.updateTooltip();
        
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
    
    $onInit() {
    }

    $onDestroy() {
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        if (this.resizeInterval) {
            clearInterval(this.resizeInterval);
        }
    }
    
    updateTooltip() {
        if (this.showTooltip && !this.tooltipElement) {
            const linkFn = ($element, $scope) => {
                $element.css('visibility', 'hidden');
                $element.addClass('ma-heat-map-tooltip');
                this.$element.append($element);
                this.tooltipElement = $element;
                this.tooltipScope = $scope;
            };
            
            if (this.$transclude.isSlotFilled('tooltipSlot')) {
                this.$transclude(linkFn, this.$element, 'tooltipSlot');
            } else {
                this.$compile(heatMapTooltip)(this.$scope.$new(), linkFn);
            }
        } else if (!this.showTooltip && this.tooltipElement) {
            this.tooltipElement.remove();
            this.tooltipScope.$destroy();
            delete this.tooltipElement;
            delete this.tooltipScope;
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

    updateSvg(width, height) {
        if (width == null || height == null) {
            const bbox = this.$element[0].getBoundingClientRect();
            width = bbox.width;
            height = bbox.height;
        }
        
        this.width = width;
        this.height = height;
        
        const margins = Object.assign({top: 20, right: 20, bottom: 0, left: 60}, this.margins);

        const d3 = this.d3;
        const svg = this.svg = d3.select(this.$element[0])
            .select('svg')
            .attr('width', width)
            .attr('height', height);

        const graphWidth = width - (margins.left + margins.right);
        const graphHeight = height - (margins.top + margins.bottom);
        
        this.graph = svg.select('g.ma-heat-map-graph')
            .attr('transform', `translate(${margins.left}, ${margins.top})`);

        this.xScale = d3.scaleBand()
            .range([0, graphWidth]);
        
        this.xAxis = svg.select('g.ma-heat-map-x-axis')
            .attr('transform', `translate(${margins.left}, ${margins.top})`);

        this.yScale = d3.scaleBand()
            .range([0, graphHeight]);

        this.yAxis = svg.select('g.ma-heat-map-y-axis')
            .attr('transform', `translate(${margins.left}, ${margins.top})`);

        this.updateColorScale();
        this.updateAxis();
        this.updateGraph();
        
        this.watchForResize();
    }
    
    watchForResize() {
        // already setup
        if (this.resizeObserver || this.resizeInterval) return;

        /* globals ResizeObserver */
        if (typeof ResizeObserver === 'function') {
            this.resizeObserver = new ResizeObserver(entries => {
                console.log(entries);
                if (this.pendingResize) {
                    clearTimeout(this.pendingResize);
                }
                this.pendingResize = setTimeout(() => {
                    delete this.pendingResize;
                    const contentRect = entries[0].contentRect;
                    this.updateSvg(contentRect.width, contentRect.height);
                }, 500);
            });
            
            this.resizeObserver.observe(this.$element[0]);
        } else {
            this.resizeInterval = setInterval(() => {
                const bbox = this.$element[0].getBoundingClientRect();
                if (bbox.width !== this.width || bbox.height !== this.height) {
                    this.updateSvg(bbox.width, bbox.height);
                }
            }, 1000);
        }
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

        const elementPositions = new WeakMap();

        const newRects = rects.enter()
            .append('rect')
            .attr('shape-rendering', 'crispEdges')
            .on('mouseover', (pv, i, rects) => {
                const rectElement = rects[i];
                if (rectElement.nextSibling) {
                    elementPositions.set(rectElement, rectElement.nextSibling);
                }
                
                d3.select(rectElement)
                    .attr('stroke', 'currentColor')
                    .raise();

                if (this.tooltipElement) {
                    const value = pv[this.valueKey];
                    const rendered = this.valueKey !== 'value' ? pv[this.valueKey + '_rendered'] : pv.rendered;
                    const time = this.setTimezone(moment(pv.timestamp));
                    
                    this.tooltipScope.$applyAsync(() => {
                        Object.assign(this.tooltipScope, {
                            $pointValue: pv,
                            $value: value,
                            $rendered: rendered,
                            $time: time
                        });
                    });
                    
                    this.tooltipElement.css('visibility', 'visible');
                }
            })
            .on('mousemove', (pv, i, rects) => {
                if (this.tooltipElement) {
                    const [x, y] = d3.mouse(this.$element[0]);
                    this.tooltipElement.css('transform', `translate(${x}px, ${y}px)`);
                }
            })
            .on('mouseleave', (pv, i, rects) => {
                const rectElement = rects[i];
                
                // move the element back to its previous location
                const prevPosition = elementPositions.get(rectElement);
                if (prevPosition) {
                    rectElement.parentNode.insertBefore(rectElement, prevPosition);
                }
                
                d3.select(rectElement)
                    .attr('stroke', null);
                
                if (this.tooltipElement) {
                    this.tooltipElement.css('visibility', 'hidden');
                }
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
    template: heatMapTemplate,
    transclude: {
        tooltipSlot: '?maHeatMapTooltip'
    },
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
        colorScaleExp: '&?colorScale',
        showTooltip: '<?'
    }
};
