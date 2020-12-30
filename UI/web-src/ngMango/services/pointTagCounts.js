/**
 * @copyright 2020 {@link http://RadixIot.com|Radix IoT} All rights reserved.
 * @author Pier Puccini
 */

const MOCK = false;

pointTagCountsFactory.$inject = ['maRestResource', 'maRqlBuilder'];
function pointTagCountsFactory(RestResource, RqlBuilder) {
    class PointTagCounts extends RestResource {
        // static get defaultProperties() {
        //     return {};
        // }

        static get baseUrl() {
            // return '/rest/latest/active-events';
            return '/rest/latest/events/data-point-event-counts';
        }

        // static get webSocketUrl() {
        //     // return '/rest/latest/websocket/active-events';
        //     // return '/rest/latest/events/data-point-event-counts';
        // }

        // static get xidPrefix() {
        //     return 'AE_';
        // }

        static query(queryObject, opts = {}) {
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
                    // TODO: ADD PROPER BODY FROM DATEBAR
                    params: params,
                    data: {
                        from: '2000-01-01T00:00:00.000-10:00',
                        to: null
                    }
                },
                opts
            ).then((response) => {
                if (opts.responseType != null) {
                    return response.data;
                }
                const items = response.data.items.map((item) => {
                    return new this(item);
                });
                items.$total = response.data.total;
                return items;
            });
        }

        static buildQuery() {
            const builder = new RqlBuilder();
            builder.query = (opts) => {
                const queryNode = builder.build();
                return this.query(queryNode, opts);
            };
            return builder;
        }
    }

    class PointTagCountsMock extends PointTagCounts {
        static get baseUrl() {
            return '/rest/latest/json/data/active-events-mock';
        }

        static http(httpConfig, opts = {}) {
            const { resourceMethod, saveType, originalId } = opts.resourceInfo || {};

            // override urls and methods
            switch (resourceMethod) {
                case 'query':
                    httpConfig.url = '/rest/latest/json/query/active-events-mock';
                    break;
                case 'save':
                    httpConfig.method = 'POST';
                    httpConfig.url = `${this.baseUrl}/${this.encodeUriSegment(httpConfig.data.xid)}`;
                    break;
                default:
                    break;
            }

            return super.http(httpConfig, opts).finally((result) => {
                // delete old xid when updating to new xid
                if (resourceMethod === 'save' && saveType === 'update' && httpConfig.data.xid !== originalId) {
                    return this.http({
                        method: 'DELETE',
                        url: `${this.baseUrl}/${this.encodeUriSegment(originalId)}`
                    }).then(
                        (r) => null,
                        (e) => null
                    );
                }
            });
        }
    }

    return MOCK ? PointTagCountsMock : PointTagCounts;
}

export default pointTagCountsFactory;
