/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import moment from 'moment-timezone';


/**
 * @ngdoc filter
 * @name ngMangoFilters.filter:maDate
 * @function
 * @param {string} formatString format string from list above
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
iso: 'YYYY-MM-DDTHH:mm:ss.SSSZ'
```
 */

dateFilterFactory.$inject = ['MA_DATE_FORMATS'];
function dateFilterFactory(mangoDateFormats) {
    return function formatDate(date, format, timezone) {
        if (format === 'isoUtc') {
            timezone = 'utc';
        } else if (format === 'iso' && timezone === 'utc') {
            format = 'isoUtc';
        }
        
        const momentFormat = mangoDateFormats[format] || format || mangoDateFormats.dateTime;
        const m = moment(date);
        if (timezone) {
            m.tz(timezone);
        }
        return m.format(momentFormat);
    };
}

export default dateFilterFactory;
