/**
 * @copyright 2017 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

define(['moment-timezone'], function(moment) {
'use strict';

dateFilterFactory.$inject = ['mangoDateFormats'];
function dateFilterFactory(mangoDateFormats) {
    return function formatDate(date, format) {
        var momentFormat = mangoDateFormats[format] || format || mangoDateFormats.dateTime;
        return moment(date).format(momentFormat);
    };
}

return dateFilterFactory;

}); // define
