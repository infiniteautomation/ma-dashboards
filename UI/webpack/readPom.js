/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

const path = require('path');
const xml2js = require('xml2js');
const fs = require('fs');

module.exports = function readPom(directory = path.resolve('.')) {
    return new Promise((resolve, reject) => {
        const parser = new xml2js.Parser();
        fs.readFile(path.join(directory, 'pom.xml'), function(err, data) {
            if (err) {
                reject(err);
            } else {
                parser.parseString(data, function (err, result) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            }
        });
    });
}
