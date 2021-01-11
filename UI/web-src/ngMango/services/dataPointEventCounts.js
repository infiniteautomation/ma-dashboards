/**
 * @copyright 2020 {@link http://RadixIot.com|Radix IoT} All rights reserved.
 * @author Pier Puccini
 */

dataPointEventCountsFactory.$inject = ['maRestResource', 'maRqlBuilder'];
function dataPointEventCountsFactory(RestResource, RqlBuilder) {
    class PointEventCounts extends RestResource {
        static get baseUrl() {
            return '/rest/latest/events/data-point-event-counts';
        }

        static query(postBody, opts = {}, queryObject) {
            opts.resourceInfo = { resourceMethod: 'query' };
            const params = {};
            if (queryObject) {
                const rqlQuery = queryObject.toString();
                if (rqlQuery) {
                    params.rqlQuery = rqlQuery;
                }
            }
            return this.http(
                {
                    url: this.baseUrl,
                    method: 'POST',
                    params,
                    data: postBody
                },
                opts
            ).then((response) => {
                if (opts.responseType != null) {
                    return response.data;
                }
                const items = response.data.items.map((item) => new this(item));
                items.$total = response.data.total;
                return items;
            });
        }

        static buildQuery() {
            const builder = new RqlBuilder();
            builder.query = (postBody, opts) => {
                const queryNode = builder.build();
                return this.query(postBody, opts, queryNode);
            };
            return builder;
        }
    }

    return PointEventCounts;
}

export default dataPointEventCountsFactory;
