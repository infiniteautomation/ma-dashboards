/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import moment from 'moment-timezone';
import heatMapTemplate from './heatMap.html';
import heatMapTooltip from './heatMapTooltip.html';
import './heatMap.css';

const arrayReduceToMap = function(fn) {
    return this.reduce((map, v, i, array) => {
        const value = fn(v, i, array);
        if (value != null) {
            map.set(v, value);
        }
        return map;
    }, new Map());
};

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
        this.showTooltipAttr = true;
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
            if (changes.legend) {
                this.updateSvg();
            } else {
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
        if (this.showTooltipAttr && !this.tooltipElement) {
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
        } else if (!this.showTooltipAttr && this.tooltipElement) {
            this.tooltipElement.remove();
            this.tooltipScope.$destroy();
            delete this.tooltipElement;
            delete this.tooltipScope;
        }
        
        if (this.tooltipElement && this.showTooltipAttr === 'static') {
            this.tooltipElement.css('transform', '');
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

        const defaultLegend = {height: 20, width: '50%', position: 'bottom', ticks: 10};
        if (this.legend) {
            if (this.legend.position === 'right') {
                defaultLegend.height = '50%';
                defaultLegend.width = 20;
            }
        }
        
        const legend = this.legendOpts = Object.assign(defaultLegend, this.legend);
        const legendWidthPx = this.parsePercentage(legend.width, width);
        const legendHeightPx = this.parsePercentage(legend.height, height);
        
        const defaultMargins = {top: 20, right: 20, bottom: legendHeightPx + 40, left: 60};
        if (legend.position === 'right') {
            defaultMargins.bottom = 0;
            defaultMargins.right = legendWidthPx + 50;
        }
        
        const margins = Object.assign(defaultMargins, this.margins);

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
        
        svg.select('g.ma-heat-map-x-axis')
            .attr('transform', `translate(${margins.left}, ${margins.top})`);

        this.yScale = d3.scaleBand()
            .range([0, graphHeight]);

        svg.select('g.ma-heat-map-y-axis')
            .attr('transform', `translate(${margins.left}, ${margins.top})`);

        if (legend.position === 'right') {
            legend.x = width - legendWidthPx - 30;
            legend.y = height / 2 - legendHeightPx / 2;
            legend.axisX = legendWidthPx;
            legend.axisY = 0;
            legend.axisRange = [0, legendHeightPx];
            legend.gradientX = '0';
            legend.gradientY = '100%';
        } else {
            // bottom
            legend.x = width / 2 - legendWidthPx / 2;
            legend.y = height - legendHeightPx - 20;
            legend.axisX = 0;
            legend.axisY = legendHeightPx;
            legend.axisRange = [0, legendWidthPx];
            legend.gradientX = '100%';
            legend.gradientY = '0';
        }
        
        this.legendAxisScale = d3.scaleLinear().range(legend.axisRange);

        svg.select('g.ma-heat-map-legend')
            .attr('transform', `translate(${legend.x}, ${legend.y})`)
            .select('rect')
                .attr('width', legend.width)
                .attr('height', legend.height);
        
        svg.select('g.ma-heat-map-legend-axis')
            .attr('transform', `translate(${legend.axisX}, ${legend.axisY})`);

        svg.select('#ma-heat-map-legend-gradient')
            .attr('x2', legend.gradientX)
            .attr('y2', legend.gradientY);

        this.updateColorScale();
        this.updateAxis();
        this.updateGraph();
        
        this.watchForResize();
    }
    
    parsePercentage(value, relativeTo) {
        if (typeof value !== 'string') return value;
        
        const matches = /(\d+)%/.exec(value);
        if (matches) {
            return Number.parseInt(matches[1], 10) / 100 * relativeTo;
        }
        
        return value;
    }
    
    watchForResize() {
        // already setup
        if (this.resizeObserver || this.resizeInterval) return;

        /* globals ResizeObserver */
        if (typeof ResizeObserver === 'function') {
            this.resizeObserver = new ResizeObserver(entries => {
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
        
        // update the linear gradient stops
        
        const numStops = 100;
        const stopsData = Array(numStops + 1).fill().map((v, i) => i / numStops);
        
        // create a linear scale that maps [0,1] to the color scale's domain
        const legendScale = d3.scaleLinear()
            .domain([0, 1])
            .range([this.minValue, this.maxValue]);
        
        const stops = this.svg.select('#ma-heat-map-legend-gradient')
            .selectAll('stop')
            .data(stopsData);

        stops.exit().remove();
        const newStops = stops.enter().append('stop');
        
        stops.merge(newStops)
            .attr('offset', d => `${d * 100}%`)
            .attr('stop-color', d => this.colorScale(legendScale(d)));
        
        // setup the legend axis
        
        this.legendAxisScale.domain([this.minValue, this.maxValue]);
        
        let legendAxis;
        if (this.legendOpts.position === 'right') {
            legendAxis = this.d3.axisRight(this.legendAxisScale);
        } else {
            // bottom
            legendAxis = this.d3.axisBottom(this.legendAxisScale);
        }
        legendAxis.ticks(this.legendOpts.ticks);
        
        this.svg.select('g.ma-heat-map-legend-axis')
            .call(legendAxis);
    }
    
    formatX(value, index) {
        if (typeof this.axisFormatX === 'function') {
            return this.axisFormatX({$value: value, $index: index, $columns: this.columns});
        }
        
        if (this.groupBy.startsWith('day')) {
            if (index % 7 === 0) {
                return value.format('l');
            }
        } else {
            return value.format('YYYY-w');
        }
    }
    
    formatY(value, index) {
        if (typeof this.axisFormatY === 'function') {
            return this.axisFormatY({$value: value, $index: index, $rows: this.rows});
        }
        
        if (this.groupBy.startsWith('day')) {
            // we want 8 tick marks i.e. every 3 hrs
            if (index % Math.ceil(this.rows / 8) === 0) {
                return value.format('LT');
            }
        } else {
            // we want 7 tick marks i.e. every 1 day
            if (index % Math.ceil(this.rows / 7) === 0) {
                return value.format('ddd');
            }
        }
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

        this.columns = Math.ceil(to.diff(from, this.groupBy, true));
        const xDomain = Array(this.columns).fill().map((v, i) => {
            return moment(from).add(i, this.groupBy).startOf(this.groupBy);
        });

        this.xDomainFormat = this.groupBy.startsWith('day') ? 'YYYY-MM-DD' : 'YYYY-w';
        this.xScale.domain(xDomain.map(m => m.format(this.xDomainFormat)));
        
        const xScaleMomentDomain = this.xScale.copy()
            .domain(xDomain);

        const xDomainFormatted = arrayReduceToMap.call(xDomain, (v, i) => this.formatX(v, i));
        const xAxis = d3.axisTop(xScaleMomentDomain)
            .tickValues(xDomain.filter(v => xDomainFormatted.has(v)))
            .tickFormat(v => xDomainFormatted.get(v))
            .tickSizeOuter(0);
        
        this.svg.select('g.ma-heat-map-x-axis')
            .call(xAxis);
        
        // setup the Y axis
        
        const yStart = moment(0).utc().utcOffset(0).startOf(this.groupBy);
        const yEnd = moment(yStart).add(1, this.groupBy);
        const yDuration = yEnd - yStart;

        this.rows = 48;
        if (this.rowsAttr) {
            this.rows = this.rowsAttr;
        } else if (Array.isArray(this.pointValues) && this.pointValues.$options && this.pointValues.$options.rollupInterval) {
            // automatically set the number of rows based on the rollup interval used
            const rollupInterval = this.pointValues.$options.rollupInterval;
            try {
                const [interval, units] = rollupInterval.trim().split(/\s+/);
                const rollupDuration = moment.duration(Number.parseInt(interval, 10), units);
                this.rows = Math.floor(yDuration / rollupDuration);
            } catch (e) {}
        } else if (Array.isArray(this.pointValues) && this.pointValues.length > 1) {
            // automatically set the number of rows based on the time difference between two point values
            const diff = this.pointValues[1].timestamp - this.pointValues[0].timestamp;
            this.rows = Math.floor(yDuration / diff);
        }
        
        const yDomain = Array(this.rows).fill().map((v, i) => {
            const ms = yDuration / this.rows * i;
            return moment(yStart + ms).utc().utcOffset(0);
        });
        
        this.yDomainFormat = this.groupBy.startsWith('day') ? 'HH:mm' : 'dd HH:mm';
        this.yScale.domain(yDomain.map(m => m.format(this.yDomainFormat)));
        
        const yScaleMomentDomain = this.yScale.copy()
            .domain(yDomain);

        const yDomainFormatted = arrayReduceToMap.call(yDomain, (v, i) => this.formatY(v, i));
        const yAxis = d3.axisLeft(yScaleMomentDomain)
            .tickValues(yDomain.filter(v => yDomainFormatted.has(v)))
            .tickFormat(v => yDomainFormatted.get(v))
            .tickSizeOuter(0);

        this.svg.select('g.ma-heat-map-y-axis')
            .call(yAxis);
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
            .on('mouseover', (pointValue, i, rects) => {
                const rectElement = rects[i];
                if (rectElement.nextSibling) {
                    elementPositions.set(rectElement, rectElement.nextSibling);
                }
                
                d3.select(rectElement)
                    .attr('stroke', 'currentColor')
                    .raise();

                this.showTooltip(pointValue, rects[i]);
            })
            .on('mousemove', (pointValue, i, rects) => {
                this.moveTooltip(pointValue, rects[i]);
            })
            .on('mouseleave', (pointValue, i, rects) => {
                const rectElement = rects[i];
                
                // move the element back to its previous location
                const prevPosition = elementPositions.get(rectElement);
                if (prevPosition) {
                    rectElement.parentNode.insertBefore(rectElement, prevPosition);
                }
                
                d3.select(rectElement)
                    .attr('stroke', null);

                this.hideTooltip(pointValue, rects[i]);
            });

        // increase the size a little for a bit of overlap, stops black banding
        const xBandWidth = this.xScale.bandwidth() * 1.03;
        const yBandWidth = this.yScale.bandwidth() * 1.03;

        rects.merge(newRects)
            .attr('transform', pv => {
                const time = this.setTimezone(moment(pv.timestamp));
                const x = this.xScale(time.format(this.xDomainFormat));
                const y = this.yScale(time.format(this.yDomainFormat));
                return `translate(${x}, ${y})`;
            })
            .attr('width', xBandWidth)
            .attr('height', yBandWidth)
            .transition()
                .duration(this.transitionDuration)
                .style('fill', pv => this.colorScale(pv[this.valueKey]));
    }
    
    showTooltip(pointValue, rect) {
        if (!this.tooltipElement) return;

        const value = pointValue[this.valueKey];
        const rendered = this.valueKey !== 'value' ? pointValue[this.valueKey + '_rendered'] : pointValue.rendered;
        const time = this.setTimezone(moment(pointValue.timestamp));
        
        this.tooltipScope.$applyAsync(() => {
            Object.assign(this.tooltipScope, {
                $pointValue: pointValue,
                $value: value,
                $rendered: rendered,
                $time: time
            });
        });

        this.moveTooltip(pointValue, rect);
        this.tooltipElement.css('visibility', 'visible');
    }
    
    hideTooltip(pointValue, rect) {
        if (!this.tooltipElement) return;
        
        this.tooltipElement.css('visibility', 'hidden');
    }
    
    moveTooltip(pointValue, rect) {
        if (!this.tooltipElement || this.showTooltipAttr === 'static') return;
        
        let [containerX, containerY] = this.d3.mouse(this.$element[0]);
        let [rectX, rectY] = this.d3.mouse(rect);
        let x = containerX - rectX;
        let y = containerY - rectY;
        const additionalOffset = 5;
        
        const tooltipBox = this.tooltipElement[0].getBoundingClientRect();
        const rectBox = rect.getBoundingClientRect();

        if (x < this.width / 2) {
            x += rectBox.width + additionalOffset;
        } else {
            x -= tooltipBox.width + additionalOffset;
        }

        if (y < this.height / 2) {
            y += rectBox.height + additionalOffset;
        } else {
            y -= tooltipBox.height + additionalOffset;
        }
        
        this.tooltipElement.css('transform', `translate(${x}px, ${y}px)`);
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
        rowsAttr: '<?rows',
        autoScale: '<?',
        pointValues: '<',
        minValueAttr: '<?minValue',
        maxValueAttr: '<?maxValue',
        transitionDuration: '<?',
        axisFormatX: '&?',
        axisFormatY: '&?',
        valueKey: '@?',
        margins: '<?',
        legend: '<?',
        colors: '<?',
        colorScaleExp: '&?colorScale',
        showTooltipAttr: '<?showTooltip'
    }
};
