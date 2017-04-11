/**
 * Deferred Ajax Reqeuests.
 * 
 *   Helpful to sych when making API Requests
 * 
 * 
 * Copyright (C) 2014 Infinite Automation Software. All rights reserved.
 * @author Terry Packer
 */

function DeferredAjax(opts ) {
    this.deferred = $.Deferred();
}
DeferredAjax.prototype = {
        
        invoke: function() {

            var self = this, data = {
                xid : self.xid
            };
            console.log("Making request for [" + self.xid + "]");
        
            return $.ajax(
                    {
                        url : "/rest/v1/pointValues/" + self.xid + ".json?from=" +
                                self.from + "&to=" + self.to
                    }).done(function(data) {
                for (var i = 0; i < data.length; i++) {
                    var entry = {
                        date : data[i].time
                    };
                    entry[self.xid] = data[i].value;
                    self.dataProvider.push(entry);
                }
                self.deferred.resolve();
            });
        }

};
DeferredAjax.prototype.promise = function() {
    return this.deferred.promise();
};