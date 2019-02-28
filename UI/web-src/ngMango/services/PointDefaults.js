/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

const defaultProperties = {
    xid: '',
    name: '',
    enabled: true,
    deviceName: '',
    readPermission: '',
    setPermission: '',
    pointFolderId: 0,
    purgeOverride: false,
    pointLocator: {},
    chartColour: '',
    loggingProperties: {
        cacheSize: 1,
        loggingType: 'ON_CHANGE',
        discardExtremeValues: false
    },
    textRenderer: {
        type: 'textRendererPlain',
        suffix: ''
    },
    chartRenderer: {
        type: 'chartRendererNone'
    },
    rollup: 'NONE',
    simplifyType: 'NONE',
    simplifyTolerance: 'NaN',
    simplifyTarget: 1000,
    templateXid: null,
    dataSourceXid: '',
    tags: {}
};

const defaultPropertiesForDataTypes = {
    ALPHANUMERIC: {
        plotType: 'STEP',
        rollup: 'NONE',
        simplifyType: 'NONE',
        loggingProperties: {
            cacheSize: 1,
            loggingType: 'ON_CHANGE',
            tolerance: 0,
            discardExtremeValues: false
        },
        textRenderer: {
            type: 'textRendererPlain',
            suffix: ''
        },
        chartRenderer: {
            type: 'chartRendererTable',
            limit: 10
        }
    },
    BINARY: {
        plotType: 'STEP',
        rollup: 'NONE',
        simplifyType: 'NONE',
        loggingProperties: {
            cacheSize: 1,
            loggingType: 'ON_CHANGE',
            tolerance: 0,
            discardExtremeValues: false
        },
        textRenderer: {
            oneColour: '#00ff00',
            oneLabel: 'one',
            type: 'textRendererBinary',
            zeroColour: '#0000ff',
            zeroLabel: 'zero'
        },
        chartRenderer: {
            type: 'chartRendererTable',
            limit: 10
        }
    },
    MULTISTATE: {
        plotType: 'STEP',
        rollup: 'NONE',
        simplifyType: 'NONE',
        loggingProperties: {
            cacheSize: 1,
            loggingType: 'ON_CHANGE',
            tolerance: 0,
            discardExtremeValues: false
        },
        textRenderer: {
            type: 'textRendererPlain',
            suffix: ''
        },
        chartRenderer: {
            type: 'chartRendererTable',
            limit: 10
        }
    },
    NUMERIC: {
        plotType: 'SPLINE',
        rollup: 'NONE',
        simplifyType: 'NONE',
        loggingProperties: {
            cacheSize: 1,
            loggingType: 'INTERVAL',
            tolerance: 0,
            discardExtremeValues: false,
            intervalLoggingType: 'AVERAGE',
            intervalLoggingPeriod: {
                periods: 1,
                type: 'MINUTES'
            },
            overrideIntervalLoggingSamples: false
        },
        textRenderer: {
            type: 'textRendererAnalog',
            format: '0.00',
            suffix: '',
            useUnitAsSuffix: false
        },
        chartRenderer: {
            type: 'chartRendererImage',
            timePeriod: {
                periods: 1,
                type: 'DAYS'
            }
        }
    },
    IMAGE: {
        rollup: 'NONE',
        simplifyType: 'NONE',
        loggingProperties: {
            cacheSize: 1,
            loggingType: 'ON_CHANGE',
            tolerance: 0,
            discardExtremeValues: false
        },
        textRenderer: {
            type: 'textRendererPlain',
            suffix: ''
        },
        chartRenderer: {
            type: 'chartRendererNone'
        }
    }
};

export {defaultProperties, defaultPropertiesForDataTypes};