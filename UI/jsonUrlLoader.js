/**
 * @copyright 2019 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

const loaderUtils = require('loader-utils');
const ptr = require('json-ptr');

const defaultOptions = {
    parse: content => JSON.parse(content),
    serialize: content => JSON.stringify(content),
    exportAsJs: true,
    publicPath: '',
    targets: data => []
};

const loadModule = function(request) {
    return new Promise((resolve, reject) => {
        this.loadModule(request, (error, source, sourceMap, module) => {
            if (error) {
                reject(error);
            } else {
                resolve({source, sourceMap, module});
            }
        });
    });
};

const transformUrl = function(value) {
    const request = loaderUtils.urlToRequest(value);
    return loadModule.call(this, request).then(({source, sourceMap, module}) => {
        const assets = module.buildInfo.assets;
        if (assets && Object.keys(assets).length) {
            const urls = Object.keys(assets);
            if (urls.length) {
                return urls[0];
            }
        }
        return Promise.reject('No assets');
    });
};

/**
 * JSON URL loader accepts a JSON object and transforms relative URLs contained in the JSON to public paths
 * with the Webpack hash etc. The properties to be transformed are specified by an array of JSON pointers returned
 * by the targets option. The files specified by the URLS must be handled by file-loader.
 */
const jsonUrlLoader = function(content, map, meta) {
    const callback = this.async();
    const options = Object.assign({}, defaultOptions, loaderUtils.getOptions(this));

    const parsed = options.parse(content);
    const targets = options.targets(parsed, ptr);
    
    const promises = targets.map(p => {
        const pointer = ptr.create(p);
        const value = pointer.get(parsed);
        if (loaderUtils.isUrlRequest(value)) {
            return transformUrl.call(this, value).then(newValue => {
                pointer.set(parsed, options.publicPath + newValue);
            });
        }
    });
    
    Promise.all(promises).then(() => {
        const serialized = options.serialize(parsed);
        const result = options.exportAsJs ? `module.exports = ${serialized};` : serialized;
        callback(null, result, map, meta);
    }, error => {
        callback(error);
    });
};

module.exports = jsonUrlLoader;
module.exports.raw = true;