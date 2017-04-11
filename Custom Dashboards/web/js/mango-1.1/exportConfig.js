/**
 * Copyright (C) 2015 Infinite Automation Systems, Inc. All rights reserved.
 * http://infiniteautomation.com/
 * @author Jared Wiltshire
 */

define(['amcharts/exporting/amexport', 'amcharts/exporting/canvg', 'amcharts/exporting/rgbcolor', 'amcharts/exporting/filesaver',
        'amcharts/exporting/jspdf', 'amcharts/exporting/jspdf.plugin.addimage'], function() {

var amExport = {
        top         : 0,
        right       : 0,
        exportJPG   : true,
        exportPNG   : true,
        exportSVG   : true,
        exportPFG   : true
};

var amChart = {
    amExport: amExport
};

return amChart;

});
