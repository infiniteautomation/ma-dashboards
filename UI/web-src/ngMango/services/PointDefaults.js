/*
 * Copyright (C) 2021 Radix IoT LLC. All rights reserved.
 */

const defaultProperties = {
    xid: '',
    name: '',
    enabled: true,
    deviceName: '',
    readPermission: '',
    setPermission: '',
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
    rollup: 'NONE',
    simplifyType: 'NONE',
    simplifyTolerance: 'NaN',
    simplifyTarget: 1000,
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
            discardExtremeValues: false,
            intervalLoggingPeriod: {
                periods: 1,
                type: 'MINUTES'
            }
        },
        textRenderer: {
            type: 'textRendererPlain',
            suffix: ''
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
            discardExtremeValues: false,
            intervalLoggingPeriod: {
                periods: 1,
                type: 'MINUTES'
            }
        },
        textRenderer: {
            oneColour: '#00ff00',
            oneLabel: 'one',
            type: 'textRendererBinary',
            zeroColour: '#0000ff',
            zeroLabel: 'zero'
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
            discardExtremeValues: false,
            intervalLoggingPeriod: {
                periods: 1,
                type: 'MINUTES'
            }
        },
        textRenderer: {
            type: 'textRendererPlain',
            suffix: ''
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
        }
    },
    IMAGE: {
        plotType: 'STEP',
        rollup: 'NONE',
        simplifyType: 'NONE',
        loggingProperties: {
            cacheSize: 1,
            loggingType: 'ON_CHANGE',
            tolerance: 0,
            discardExtremeValues: false,
            intervalLoggingPeriod: {
                periods: 1,
                type: 'MINUTES'
            }
        },
        textRenderer: {
            type: 'textRendererNone',
            suffix: ''
        }
    }
};

export {defaultProperties, defaultPropertiesForDataTypes};