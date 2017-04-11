/**
 * Javascript Objects Used for Grouping Data Points from 
 * the Point Hierarchy.  
 * 
 * 
 * Copyright (C) 2014 Infinite Automation Software. All rights reserved.
 * @author Terry Packer
 */

define(['jquery', './dataPointGroup'], function($, DataPointGroup) {
"use strict";

/**
 * Point Hierarchy Grouper, 
 * 
 * DataPointGroupConfiguration.matchBy can be one of ['All', 'Folder', 'DataPoint']
 * DataPointGroupConfiguration.matchConfig.mat
 * @param dataPoints
 * @param options
 * @returns
 */
var PointHierarchyGrouper = function(root, groupConfigurations, onGroup, options){
    
    this.root = root;
    this.groupConfigurations = groupConfigurations;
    this.onGroup = onGroup;
    
    
    for(var i in options) {
        this[i] = options[i];
    }
    
    //Ensure we have some basic properties initialized
    if(this.groupConfigurations === null)
        this.groupConfigurations = []; 
    if(this.pointHierarchyMap === null)
        this.pointHierarchyMap = {};
    if(this.dataPoints === null)
        this.dataPoints = [];
    
    //Build the map and get all points
    this.loadAllPoints();
    
};

PointHierarchyGrouper.prototype = {
        dataPoints: null, //List of all data points to group
        
        groupConfigurations: null, //List of DataPointGroupConfiguration 
        groups: null, //List of DataPointGroup
        labels: null, //List of GroupLabel
       
        root: null, //The Root node of the Point Hierarchy
        pointHierarchyMap: null, //Map of folder IDs to Folder
        /**
         * Add a DataPointGroupConfiguration
         */
        addGroupConfiguration: function(configuration){
            this.groupConfigurations.push(configuration);
        },
        
        /**
         * Called on formation of a group
         * @param DataPointGroup
         */
        onGroup: function(dataPointGroup){
            //No Op Override
        },
        
        /**
         * Create a list of GroupLabels 
         */
        group: function(){
            //Loop over all the configs and create groups
            for(var i in this.groupConfigurations){
                
                var groupConfig = this.groupConfigurations[i];
                if(groupConfig.groupBy == 'All'){ //Match All Points
                    //Use all points for this group
                    //Create label first
                    var label;
                    if(groupConfig.label !== null){
                        label = groupConfig.label;
                    }else{
                        label = 'All'; //Just in case
                    }
                    //Push points into new array
                    var points = [];
                    points.push.apply(points, this.dataPoints);
                    //Fire OnGroup
                    this.onGroup(new DataPointGroup(label, points));
                }else{
                    //Loop over all data points and create a group with them
                    var groupsMap = {}; //Create a map to build all groups in
                    for(var j=0; j < this.dataPoints.length; j++){
                        var dataPoint = this.dataPoints[j];
                        //Loop over our match configurations and see if our point matches any
                        for(var k=0; k<groupConfig.matchConfigurations.length; k++){
                            var matchConfiguration = groupConfig.matchConfigurations[k];
                            
                            if(groupConfig.groupBy == 'Folder'){ //Group By Folder
                                this.matchByFolder(dataPoint, groupsMap, matchConfiguration, groupConfig);
                            }else if(groupConfig.groupBy == 'DataPoint'){ //Match By Point Information
                               this.matchByDataPoint(dataPoint, groupsMap, matchConfiguration, groupConfig); 
                            }
                        }// end for all match configuration in this Group Configuration
                        
                    }//end for all data points
                    //Fire on Group for all new groups
                    for(var l in groupsMap){
                        this.onGroup(groupsMap[l]);
                    }
                }//End else matching over points
            }//end for all configs
  
        },
        
        /**
         * Match a data point using the folder attributes
         * 
         * @param dataPoint - Data Point Summary
         * @param groupsMap - Map for Building groups
         * @param matchConfiguration - GroupMatchConfiguration
         * @param groupConfiguration - DataPointGroupConfiguration
         */
        matchByFolder: function(dataPoint, groupsMap, matchConfiguration, groupConfiguration){
            var group, label, match;
            
            //Special case for path
            if(matchConfiguration.matchAttribute == "path"){
                
                //Search the point hierarchy by path
                var path = this.getPointHierarchyPath(dataPoint);
                
                match = false;
                if(matchConfiguration.regex !== null){
                    if(path.match(matchConfiguration.regex) !== null){
                         //Had a match
                         group = groupsMap[path];
                         if(!group){
                            //Create new group and add this point
                            //Create Label First
                            if(groupConfiguration.label === null){
                                if(groupConfiguration.labelAttribute == "path")
                                    label = path;
                                else
                                    label = this.pointHierarchyMap[dataPoint.pointFolderId][groupConfiguration.labelAttribute];

                            }else{
                                label = groupConfiguration.label;
                            }
                            
                            group = new DataPointGroup(label, []);
                            groupsMap[path] = group;
                         }
                         //Add to existing group
                        group.dataPoints.push(dataPoint);
                    }  
                }else{
                    group = groupsMap[path];
                    if(group === null){
                        //Create Label First
                        if(groupConfiguration.label === null){
                            if(groupConfiguration.labelAttribute == "path")
                                label = path;
                            else
                                label = this.pointHierarchyMap[dataPoint.pointFolderId][groupConfiguration.labelAttribute];
                        }else{
                            label = groupConfiguration.label;
                        }
                        //Create new group and add this point
                        group = new DataPointGroup(label, []);
                        groupsMap[path] = group;
                        
                    }
                    //Add to existing group
                    group.dataPoints.push(dataPoint);
                }
            }else{
                //Just matching on name or ID 
                match = true;
                if(matchConfiguration.regex !== null){
                    if(this.pointHierarchyMap[dataPoint.pointFolderId][matchConfiguration.matchAttribute].match(matchConfiguration.regex) !== null){
                        //Did we have a match
                        group = groupsMap[0];
                        if(group === null){
                            //Create new group and add this point
                            //Create Label First
                            if(groupConfiguration.label === null){
                                label = this.pointHierarchyMap[dataPoint.pointFolderId][groupConfiguration.labelAttribute];
                            }else{
                                label = groupConfiguration.label;
                            }
                            
                            group = new DataPointGroup(label, []);
                            groupsMap[0] = group;
                       }
                       //Add to existing group
                       group.dataPoints.push(dataPoint);
                    }  
                }else{
                    group = groupsMap[this.pointHierarchyMap[dataPoint.pointFolderId][matchConfiguration.matchAttribute]];
                    if(group === null){
                        //Create Label First
                        if(groupConfiguration.label === null){
                            label = this.pointHierarchyMap[dataPoint.pointFolderId][groupConfiguration.labelAttribute];
                        }else{
                            label = groupConfiguration.label;
                        }
                        //Create new group and add this point
                        group = new DataPointGroup(label, []);
                        groupsMap[this.pointHierarchyMap[dataPoint.pointFolderId][matchConfiguration.matchAttribute]] = group;
                        
                    }
                    //Add to existing group
                    group.dataPoints.push(dataPoint);
                }
            }  
        },
        
        /**
         * @param dataPoint - Data Point Summary
         * @param groupsMap - Map for Building groups
         * @param matchConfiguration - GroupMatchConfiguration
         * @param groupConfiguration - DataPointGroupConfiguration
         */
        matchByDataPoint: function(dataPoint, groupsMap, matchConfiguration, groupConfiguration){
            var group, label;
            var match = false;
            if(matchConfiguration.regex !== null){
                if(dataPoint[matchConfiguration.matchAttribute].match(matchConfiguration.regex) !== null){
                    //Got a match
                    group = groupsMap[0];
                    if(group === null){
                        //Create new group and add this point
                        //Create Label First
                        if(groupConfiguration.label === null){
                            label = dataPoint[groupConfiguration.labelAttribute];
                        }else{
                            label = groupConfiguration.label;
                        }
                        
                        group = new DataPointGroup(label, []);
                        groupsMap[0] = group;
                    }
                    //Add to existing group
                    group.dataPoints.push(dataPoint);
                }
            }else{
                group = groupsMap[dataPoint[matchConfiguration.matchAttribute]];
                if(group === null){
                    //Create Label First
                    if(groupConfiguration.label === null){
                        label = dataPoint[groupConfiguration.labelAttribute];
                    }else{
                        label = groupConfiguration.label;
                    }
                    //Create new group and add this point
                    group = new DataPointGroup(label, []);
                    groupsMap[dataPoint[matchConfiguration.matchAttribute]] = group;
                    
                }
                //Add to existing group
                group.dataPoints.push(dataPoint);
            }
        },
        
        
        /*Helper Functions to traverse the P.H. */
        /**
         * Get the path for a given point
         * @param dataPoint - DataPointSummary object
         */
        getPointHierarchyPath: function(summary){
            var paths = [];
            this.findPointInSubfolders(summary, this.root, paths);
            var result = "/";
            if(paths.length == 1)
                return result; //Hack for root folder 
            
            //Paths in reverse order so go backwards
            for(var i=paths.length-2; i>=0; i--)
                result = result + paths[i] + "/";
            return result;
        },
        
        /**
         * Recursively check the folders for points
         * @param summary - DataPointSummary
         * @param folder - Folder
         * @paths array of string paths
         */
        findPointInSubfolders: function(summary, folder, paths){
            var found = false;
            var i;
            for(i in folder.points){
                if(folder.points[i].xid == summary.xid){
                    found = true;
                    break;
                }
            }
            
            //If we didn't find it check subfolders
            if(!found){
                for(i in folder.subfolders){
                    found = this.findPointInSubfolders(summary, folder.subfolders[i], paths);
                    if(found)
                        break;
                }
            }
            
            //If we found it add our path
            if(found)
                paths.push(folder.name);
            
            return found;
        },
        /**
         * Extract all points into the provided array
         * @param folder
         * @param allDataPointSummaries
         */
        loadAllPoints: function(){
            this.loadAllPointsRecursively(this.root);
        },
        
        /**
         * Extract all points into the provided array
         * @param folder
         * @param allDataPointSummaries
         */
        loadAllPointsRecursively: function(folder){
            var _this = this;
            $.each(folder.points, function() {
                _this.dataPoints.push(this);
            });
            
            //Save into lookup
            this.pointHierarchyMap[folder.id] = folder;
            
            $.each(folder.subfolders, function() {
                _this.loadAllPointsRecursively(this);
           });
        }
};

return PointHierarchyGrouper;

}); // close define
