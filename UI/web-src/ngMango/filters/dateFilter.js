/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

import moment from 'moment-timezone';

/**
 * @ngdoc filter
 * @name ngMangoFilters.filter:maDate
 * @function
 * @param {string} format Moment.js format string or one of the constants from list above
 * @param {string} timezone The timezone to display the date/time in
 *
 * @description Formats a date via MA_DATE_FORMATS, available format strings and their values are:
```
dateTime: 'lll',
shortDateTime: 'l LT',
dateTimeSeconds: 'll LTS',
shortDateTimeSeconds: 'l LTS',
date: 'll',
shortDate: 'l',
time: 'LT',
timeSeconds: 'LTS',
monthDay: 'MMM D',
month: 'MMM',
year: 'YYYY',
iso: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
isoUtc: 'YYYY-MM-DDTHH:mm:ss.SSS[Z]'
```
 */

dateFilterFactory.$inject = ['MA_DATE_FORMATS'];
function dateFilterFactory(mangoDateFormats) {
    return function formatDate(input, format, timezone) {
        if (format === 'isoUtc') {
            timezone = 'utc';
        } else if (format === 'iso' && timezone === 'utc') {
            format = 'isoUtc';
        }

        let m;
        if (input === '' || input == null || (typeof input === 'string' && input.toLowerCase().trim() === 'now')) {
            m = moment().milliseconds(0);
        } else {
            m = moment(input);
        }
        
        if (timezone) {
            m.tz(timezone);
        }
        
        const momentFormat = mangoDateFormats[format] || format || mangoDateFormats.dateTime;
        return m.format(momentFormat);
    };
}

export default dateFilterFactory;
