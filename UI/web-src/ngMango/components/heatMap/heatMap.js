/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import moment from 'moment-timezone';
import ResizeObserver from '@juggle/resize-observer';
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

/**
 * @ngdoc directive
 * @name ngMango.directive:maHeatMap
 * @restrict 'E'
 * @scope
 *
 * @description Displays a heat map of data point values, useful for visualizing trends in point values over a large period of time.
 * A rollup of 15 minutes, 30 minutes or 1 hour should be used when obtaining point values for use with this component. 
 *
 * @param {pointValue[]} point-values Array of point values to display. Should be obtained with a rollup of 15 min, 30 min or 1 hr, typically averaged
 * @param {boolean=} [auto-scale=false] Automatically determine the minimum and maximum values for the color scale
 * @param {number=} min-value Minimum value for the color scale
 * @param {number=} max-value Maximum value for the color scale
 * * @param {object=} margins Object containing top, bottom, left, right properties to set the margins around the graph in px.
 * e.g. <code>margins="{top: 100, bottom: 0, left: 50, right: 0}"</code>
 * @param {object=} legend Object to control legend creation. Properties include position ('top', 'bottom', 'left', 'right', or 'none'),
 * width (px or percentage string), and height (px or percentage string).
 * e.g. <code>legend="{position: 'right', width: 50, height: '80%'}"</code>
 * @param {string[]=} colors Array of colors to use for the color scale, from lowest (min value) to highest (max value).
 * e.g. <code>colors="['red', '#fff', 'rgb(0,255,0)']"</code>
 * @param {expression=} axis-format-x Expression to render the x axis labels.
 * Available locals are $value (moment.js object), $index (column index) and $columns.
 * e.g. <code>axis-format-x="$value.format('YYYY-MM-DD')"</code>
 * @param {expression=} axis-format-y Expression to render the y axis labels.
 * Available locals are $value (moment.js object), $index (row index) and $rows.
 * e.g. <code>axis-format-y="$value.format('HH:mm')"</code>
 * @param {expression=} color-scale Expression that returns a d3 color scale. Takes precedence over the colors attribute. Available locals are $d3 (d3 library).
 * e.g. <code>color-scale="$d3.scaleSequential($d3.interpolateRainbow).clamp(true)"</code>
 * @param {boolean=} [show-tooltip=true] Controls if the tool tip is shown when hovering over a rectangle
 * @param {number=} rows Number of rows per column, usually automatically determined from the rollup
 * @param {string=} timezone Timezone to use when rendering time, determining the day of the week, start of the day etc
 * @param {number=} utc-offset UTC offset in minutes to use when rendering time
 * @param {string=} [group-by=day] Controls how the point values are grouped into columns, can choose day or week
 * @param {number=} [transition-duration=1000] Duration for the color fade transition, set to 0 to disable
 * @param {string=} [value-key=value] Name of property from which to extract the value from a point value object
 * 
 **/

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
                this.watchForResize();
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
    
    createLegendOptions() {
        const legend = {ticks: 10};
        legend.position = this.legend && this.legend.position || 'bottom';
        
        if (legend.position === 'left' || legend.position === 'right') {
            legend.width = 20;
            legend.height = '50%';
        } else if (legend.position === 'top' || legend.position === 'bottom') {
            legend.width = '50%';
            legend.height = 20;
        }
        
        Object.assign(legend, this.legend);

        const legendWidthPx = this.parsePercentage(legend.width, this.width);
        const legendHeightPx = this.parsePercentage(legend.height, this.height);
        
        if (legend.position === 'left' || legend.position === 'right') {
            legend.extraMargin = legendWidthPx + 50;
            legend.x = legend.position === 'left' ? 30 : this.width - legendWidthPx - 30;
            legend.y = this.height / 2 - legendHeightPx / 2;
            legend.axisX = legend.position === 'left' ? 0 : legendWidthPx;
            legend.axisY = 0;
            legend.axisRange = [0, legendHeightPx];
            legend.gradientX = '0';
            legend.gradientY = '100%';
        } else if (legend.position === 'top' || legend.position === 'bottom') {
            legend.extraMargin = legendHeightPx + 40;
            legend.x = this.width / 2 - legendWidthPx / 2;
            legend.y = legend.position === 'top' ? 20 : this.height - legendHeightPx - 20;
            legend.axisX = 0;
            legend.axisY = legend.position === 'top' ? 0 : legendHeightPx;
            legend.axisRange = [0, legendWidthPx];
            legend.gradientX = '100%';
            legend.gradientY = '0';
        }
        
        return legend;
    }

    updateSvg() {
        const legend = this.legendOpts = Object.assign(this.createLegendOptions(), this.legend);

        const defaultMargins = {top: 20, right: 0, bottom: 0, left: 60};
        if (legend.position && legend.position !== 'none') {
            defaultMargins[legend.position] += legend.extraMargin;
        }
        
        const margins = Object.assign(defaultMargins, this.margins);

        const d3 = this.d3;
        const svg = this.svg = d3.select(this.$element[0])
            .select('svg')
            .attr('width', this.width)
            .attr('height', this.height);

        const graphWidth = this.width - (margins.left + margins.right);
        const graphHeight = this.height - (margins.top + margins.bottom);
        
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

        // setup legend
        
        const legendGroup = svg.select('g.ma-heat-map-legend');
        const legends = [];

        if (legend.position && legend.position !== 'none') {
            legends.push(legend);
            
            this.legendAxisScale = d3.scaleLinear().range(legend.axisRange);
    
            legendGroup
                .attr('transform', `translate(${legend.x}, ${legend.y})`)
                .select('g.ma-heat-map-legend-axis')
                    .attr('transform', `translate(${legend.axisX}, ${legend.axisY})`);
    
            svg.select('#ma-heat-map-legend-gradient')
                .attr('x2', legend.gradientX)
                .attr('y2', legend.gradientY);
        }
        
        const legendRects = legendGroup.selectAll('rect')
            .data(legends);
        
        legendRects.exit().remove();
        
        legendRects.enter().append('rect')
            .style('fill', 'url(#ma-heat-map-legend-gradient)')
            .lower() // put it behind the axis
            .merge(legendRects)
                .attr('width', l => l.width)
                .attr('height', l => l.height);

        this.updateColorScale();
        this.updateAxis();
        this.updateGraph();
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
        let timeout;
        this.resizeObserver = new ResizeObserver(entries => {
            const entry = entries[entries.length - 1];
            const noDimensions = this.width == null || this.height == null;
            
            this.width = entry.contentBoxSize.inlineSize;
            this.height = entry.contentBoxSize.blockSize;
            
            // update the SVG immediately on first run
            if (noDimensions) {
                this.updateSvg();
            } else {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    this.updateSvg();
                }, 200);
            }
        });
        
        this.resizeObserver.observe(this.$element[0]);
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
        
        stops.enter().append('stop')
            .merge(stops)
                .attr('offset', d => `${d * 100}%`)
                .attr('stop-color', d => this.colorScale(legendScale(d)));
        
        // setup the legend axis
        
        this.legendAxisScale.domain([this.minValue, this.maxValue]);

        // remove old axis elements
        this.svg.selectAll('g.ma-heat-map-legend-axis > *').remove();
        
        const position = this.legendOpts.position;
        if (position && position !== 'none') {
            const axisFn = 'axis' + position.charAt(0).toUpperCase() + position.slice(1);
            
            const legendAxis = this.d3[axisFn](this.legendAxisScale)
                .ticks(this.legendOpts.ticks);
            
            this.svg.select('g.ma-heat-map-legend-axis')
                .call(legendAxis);
        }
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
        pointValues: '<',
        autoScale: '<?',
        minValueAttr: '<?minValue',
        maxValueAttr: '<?maxValue',
        margins: '<?',
        legend: '<?',
        colors: '<?',
        colorScaleExp: '&?colorScale',
        showTooltipAttr: '<?showTooltip',
        transitionDuration: '<?',
        axisFormatX: '&?',
        axisFormatY: '&?',
        valueKey: '@?',
        groupBy: '@?',
        rowsAttr: '<?rows',
        timezone: '@?',
        utcOffset: '<?'
    },
    designerInfo: {
        translation: 'ui.components.maHeatMap',
        icon: 'view_module',
        category: 'pointValuesAndCharts',
        attributes: {
            autoScale: {type: 'boolean'}
        },
        size: {
            width: '600px',
            height: '400px'
        }
    }
};
