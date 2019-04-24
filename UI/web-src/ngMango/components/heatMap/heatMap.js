/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import moment from 'moment-timezone';
import heatMapTemplate from './heatMap.html';
import './heatMap.css';

class HeatMapController {
    static get $$ngIsClass() { return true; }
    static get $inject() { return []; }
    
    constructor() {
        this.minValue = 0;
        this.maxValue = 100;
        this.groupBy = 'day';
        
        this.showLegend = true;
        this.legend = Array(11).fill().map((v, i) => 1 - i * 0.1);
        this.fixedUtcOffset = moment().utcOffset();
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
            this.calcRowsAndCols();
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
    
    calcRowsAndCols() {
        if (!Array.isArray(this.pointValues) || !this.pointValues.length || typeof this.groupBy !== 'string' || !Number.isFinite(this.rows) || this.rows <= 0) {
            this.columns = [];
            return;
        }

        const from = this.setTimezone(moment(this.pointValues[0].timestamp)).startOf(this.groupBy);
        const to = this.setTimezone(moment(this.pointValues[this.pointValues.length - 1].timestamp));
        const numColumns = Math.ceil(to.diff(from, this.groupBy, true));
        
        // TODO use a UTC offset to prevent DST issues here
        const timePerGroup = moment(from).add(1, this.groupBy) - from;
        const timePerRow = timePerGroup / this.rows;
        this.yAxis = Array(this.rows).fill().map((v, i) => {
            const mod = this.groupBy.startsWith('day') ? 6 : 1;
            const time = moment(from + timePerRow * i);
            
            const top = (time - from) / timePerGroup * 100;
            
            let label;
            if (i % mod === 0) {
                label = time.format('LT');
            }
            
            return {
                label,
                timestamp: time.valueOf(),
                style: {
                    top: `${top}%`
                }
            };
        });
        
        this.columns = Array(numColumns).fill().map((v, i) => {
            const startTime = moment(from).add(i, this.groupBy).startOf(this.groupBy);
            const endTime = moment(from).add(i + 1, this.groupBy).startOf(this.groupBy);
            
            const utcOffset = startTime.utcOffset();
            const startTimeNomalized = moment(startTime).utc().utcOffset(utcOffset);
            const endTimeNomalized = moment(startTimeNomalized).add(1, this.groupBy);
            
            const rowTimes = {};

            const rows = this.pointValues.filter(pv => pv.timestamp >= startTime && pv.timestamp < endTime)
                .map(pv => {
                    const height = 100 / this.rows;
                    
                    const rowTime = this.setTimezone(moment(pv.timestamp));
                    
                    // set the top percentage for each cell
                    // results in a gap in the chart for DST jump-forward periods
                    const rowTimeNormalized = moment(rowTime).utcOffset(utcOffset, true);
                    const top = (rowTimeNormalized - startTimeNomalized) / (endTimeNomalized - startTimeNomalized) * 100;

                    let title;
                    if (typeof this.getTitleExp === 'function') {
                        title = this.getTitleExp({$value: pv, $pointValueTime: rowTime});
                    } else {
                        title = rowTime.format('l LT Z') + ' \u2014 ' + pv.rendered;
                    }
                    
                    const row = {
                        pointValue: pv,
                        style: {
                            'background-color': this.getColor(pv.value),
                            height: `${height}%`,
                            top: `${top}%`
                        },
                        title
                    };
                    
                    const existingRow = rowTimes[rowTimeNormalized.valueOf()];
                    if (existingRow) {
                        // DST overlap
                        // Set the overlapping cells to 50% width and put the second period on the right
                        row.style.left = row.style.width = existingRow.style.width = '50%';
                    }
                    rowTimes[rowTimeNormalized.valueOf()] = row;
                    
                    return row;
                });

            const left = i / numColumns * 100;
            const label = this.colHeader(startTime, i);
            
            return {
                timestamp: startTime.valueOf(),
                rows,
                style: {
                    left: `${left}%`
                },
                label
            };
        });
    }
    
    colHeader(startTime, i) {
        const mod = this.groupBy.startsWith('day') ? 7 : 4;
        if (i % mod === 0) {
            return startTime.format('l');
        }
    }

    /**
     * Scale value to the interval [0,1]
     */
    scaleValue(value) {
        if (typeof this.scaleValueExp === 'function') {
            return this.scaleValueExp({$value: value});
        }

        const scaled = (value - this.minValue) / (this.maxValue - this.minValue);
        return Math.min(Math.max(scaled, 0), 1);
    }
    
    /**
     * Returns a color for a point value
     */
    getColor(value) {
        const scaled = this.scaleValue(value);
        
        if (typeof this.getColorExp === 'function') {
            return this.getColorExp({$value: value, $scaled: scaled});
        }
        
        return this.getColorScaled(scaled);
    }
    
    /**
     * Returns a color for a value in the interval [0,1]
     */
    getColorScaled(scaled) {
        return `hsl(${240 - Math.floor(scaled * 240)}, 100%, 50%)`;
    }
}

export default {
    template: heatMapTemplate,
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
        scaleValueExp: '&?scaleValue',
        getColorExp: '&?getColor',
        getTitleExp: '&?getTitle',
        showLegend: '<?'
    }
};
