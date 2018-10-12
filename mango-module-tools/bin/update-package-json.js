#!/usr/bin/env node

const [,, ...args] = process.argv;
const readPom = require('./readPom');
const updatePackage = require('./updatePackage');
const path = require('path');

const rootDirectory = path.resolve('.');

readPom(rootDirectory).then(pom => {
    return updatePackage(pom, rootDirectory, true);
});
