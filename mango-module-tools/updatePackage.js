/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

const path = require('path');
const fs = require('fs');
const _ = require('lodash');

module.exports = function updatePackage(pom, directory = path.resolve('.')) {
    const packageJsonPath = path.join(directory, 'package.json');
    
    return new Promise((resolve, reject) => {
        fs.readFile(packageJsonPath, 'utf8', (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        });
    }).then(packageJsonString => {
        const packageJson = JSON.parse(packageJsonString);
        const originalPackageJson = _.cloneDeep(packageJson);
        
        if (packageJson.com_infiniteautomation == null) {
            packageJson.com_infiniteautomation = {};
        }
        
        // TODO update main
        
        packageJson.com_infiniteautomation.moduleName = pom.project.name[0];
        packageJson.name = '@infinite-automation/' + pom.project.name[0];
        packageJson.version = pom.project.version[0];
        packageJson.description = pom.project.description[0];

        if (_.isEqual(packageJson, originalPackageJson)) {
            return Promise.resolve(packageJson);
        }
        
        return new Promise((resolve, reject) => {
            const newContents = JSON.stringify(packageJson, null, 2);
            fs.writeFile(packageJsonPath, newContents, error => {
                if (error) {
                    reject(error);
                } else {
                    resolve(packageJson);
                }
            });
        });
    });
};
