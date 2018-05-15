/**
 * @copyright 2018 {@link http://infiniteautomation.com|Infinite Automation Systems, Inc.} All rights reserved.
 * @author Jared Wiltshire
 */

import Papa from 'papaparse';

csvConverterFactory.$inject = ['$q'];
function csvConverterFactory($q) {
    
    class CsvConverter {
        static read(csvFile) {
            return $q(resolve => {
                const columnMap = {};
                const convertedRows = [];
                
                let rowNumber = 0;
                
                Papa.parse(csvFile, {
                    skipEmptyLines: true,
                    step: (results, parser) => {
                        results.data.forEach(row => {
                            if (rowNumber === 0) {
                                this.readHeaderRow(columnMap, row);
                            } else {
                                convertedRows.push(this.readRow(columnMap, row));
                            }
                            rowNumber++;
                        });
                    },
                    complete: () => {
                        resolve(convertedRows);
                    }
                });
            });
        }
        
        static readHeaderRow(columnMap, row) {
            row.forEach((headerValue, i) => {
                const path = headerValue.split('/');
                columnMap[i] = path;
            });
        }
        
        static readRow(columnMap, row) {
            const rowResult = {};
            
            row.forEach((value, i) => {
                const path = columnMap[i];
                this.setObjectPath(rowResult, path, value);
            });
            
            return this.convertObjectsToArrays(rowResult);
        }
        
        static setObjectPath(object, path, value) {
            if (value === 'NULL') {
                value = null;
            } else if (value === 'TRUE') {
                value = true;
            } else if (value === 'FALSE') {
                value = false;
            }
            
            path.forEach((propertyName, i, array) => {
                if (i === array.length - 1) {
                    object[propertyName] = value;
                } else {
                    let child = object[propertyName];
                    if (!child) {
                        child = object[propertyName] = {};
                    }
                    object = child;
                }
            });
        }
        
        static convertObjectsToArrays(object) {
            let hasChild = false;
            let allIntegers = true;
            let highestIndex = -1;
            
            Object.keys(object).forEach(propertyName => {
                const value = object[propertyName];
                hasChild = true;

                if (allIntegers) {
                    if (/^\d+$/.test(propertyName)) {
                        const index = parseInt(propertyName, 10);
                        if (index > highestIndex) {
                            highestIndex = index;
                        }
                    } else {
                        allIntegers = false;
                    }
                }

                if (value != null && typeof value === 'object') {
                    object[propertyName] = this.convertObjectsToArrays(value);
                }
            });
            
            if (!hasChild || !allIntegers) {
                return object;
            }
            
            const size = highestIndex + 1;
            const arrayNode = [];

            for (let i = 0; i < size; i++) {
                let value = object[i];
                if (value === undefined) {
                    value = null;
                }
                arrayNode.push(value);
            }

            return arrayNode;
        }
    }
    
    return CsvConverter;
}

export default csvConverterFactory;
