/**
* A utility class to manage Query String paramaters, handles encoding and arrays
* @class
* @param {string} url - url to append parameters to
* @param {Object} params - parameter to append to url
*/
export class QueryString {
    constructor(url, params) {
        this.url = url;
        this.parts = [];
        if (params) {
            for( var key in params){
                var value = params[key];
                if (value instanceof Array) {
                    this.parts.push(key + '=' + encodeURIComponent(value.join(',')));
                } else {
                    this.parts.push(key + '=' + encodeURIComponent(value));
                }
            }
        }
    }

	static destruct(location) {
		var url = location.protocol + '//' + location.host + location.pathname,
			params = {};
		location.search.replace(new RegExp('([^?=&]+)(=([^&]*))?', 'g'), function ($0, $1, $2, $3) {
			params[decodeURIComponent($1)] = decodeURIComponent($3);
		});

		return { url, params };
	}
    /**
    * Convert to string
    * @returns {string}
    */
    toString() {
        return this.url + ((this.url.indexOf('?') === -1) ? '?' : '&') + this.parts.join('&');
    }
}
