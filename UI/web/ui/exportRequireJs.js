/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import {require, define} from 'requirejs';
import angular from 'angular';
import sha512 from 'js-sha512';
import papaparse from 'papaparse';
import moment from 'moment-timezone';
import jquery from 'jquery';
import query from 'rql/query';
import ipaddr from 'ipaddr.js';

window.require = require;
window.requirejs = require;
window.define = define;

require.config({
    paths : {
        'modules': '/modules'
    }
});

define('angular', [], () => angular);
define('sha512', [], () => sha512);
define('papaparse', [], () => papaparse);
define('moment', [], () => moment);
define('moment-timezone', [], () => moment);
define('jquery', [], () => jquery);
define('rql/query', [], () => query);
define('ipaddr', [], () => ipaddr);
