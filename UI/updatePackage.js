/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

const path = require('path');
const fs = require('fs');
const packageJson = require('./package.json');

module.exports = function updatePackage(pom) {
    const oldContents = JSON.stringify(packageJson, null, 2);
    
    packageJson.name = pom.project.name[0];
    packageJson.version = pom.project.version[0];
    packageJson.description = pom.project.description[0];

    const newContents = JSON.stringify(packageJson, null, 2);
    if (newContents === oldContents) {
        return Promise.resolve(packageJson);
    }

    return new Promise((resolve, reject) => {
        fs.writeFile(path.join(__dirname, 'package.json'), newContents, error => {
            if (error) {
                reject(error);
            } else {
                resolve(packageJson);
            }
        });
    });
};
