/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import moment from 'moment-timezone';
import AmCharts from 'amcharts/amcharts';

AmCharts._formatDate = AmCharts.formatDate;
AmCharts.formatDate = function(date, format, chart) {
    return moment(date).format(format);
};

AmCharts._resetDateToMin = AmCharts.resetDateToMin;
AmCharts.resetDateToMin = function(date, period, count, firstDateOfWeek) {
    const m = moment(date);
    switch(period) {
    case 'YYYY':
        m.year(roundDownToNearestX(m.year(), count));
        m.startOf('year');
        break;
    case 'MM':
        m.month(roundDownToNearestX(m.month(), count));
        m.startOf('month');
        break;
    case 'WW':
        m.week(roundDownToNearestX(m.week(), count));
        m.startOf('week');
        break;
    case 'DD':
        //m.date(roundDownToNearestX(m.date(), count));
        m.startOf('day');
        break;
    case 'hh':
        m.hour(roundDownToNearestX(m.hour(), count));
        m.startOf('hour');
        break;
    case 'mm':
        m.minute(roundDownToNearestX(m.minute(), count));
        m.startOf('minute');
        break;
    case 'ss':
        m.second(roundDownToNearestX(m.second(), count));
        m.startOf('second');
        break;
    case 'fff':
        m.millisecond(roundDownToNearestX(m.millisecond(), count));
        break;
    }
    return m.toDate();

    function roundDownToNearestX(a,x) {
        return a - a % x;
    }
};

export default AmCharts;
