import { Bullhorn } from './Bullhorn';
import { Deferred } from './Deferred';
import { QueryString } from './QueryString';

function clean(name) {
	var cleaned = name.split('.')[0];
	cleaned = cleaned.split('[')[0];
	cleaned = cleaned.split('(')[0];
	return cleaned;
}

export class Entity {
	constructor(endpoint) {
		this.endpoint = endpoint;
		this.data = {};
		this.parameters = {
			fields: ['id']
		};
	}

    fields(...args) {
        this.parameters.fields = args[0] instanceof Array ? args[0] : args;
		for(let f of this.parameters.fields) {
			let field = clean(field);
			(function(obj, field) {
				if(!obj.data.hasOwnProperty(field)) {
					Object.defineProperty(obj, field, {
						get: function() {
							return obj.data[field];
						},
						set: function(value) {
							obj.data[field] = value;
						},
						configurable: true,
						enumerable: true
					});
				}
			})(this, field);
		}
		return this;
	}

	params(object) {
		this.parameters = Object.assign(this.parameters, object);
		return this;
	}

	get(id) {
		let	interceptor = new Deferred();
		this.data.id = id;
		Bullhorn.http()
            .get(this.endpoint + id, this.parameters)
            .then((response) => {
    			this.data = Object.assign(this.data, response.data);
    			interceptor.resolve(response);
    		}).catch( (message) => {
    			interceptor.reject(message);
    		});

		return interceptor;
	}

	many(property, fields, params) {
		var me = this,
			interceptor = new Deferred(),
            merged = Object.assign({
    			fields: fields,
    			showTotalMatched: true
    		}, params);

        Bullhorn.http().get(this.endpoint + me.data.id + '/' + property, merged)
            .then((response) => {
                (function(obj, field) {
    				if(!obj.data.hasOwnProperty(field)) {
    					Object.defineProperty(obj, field, {
    						get: function() {
    							return obj.data[field];
    						},
    						set: function(value) {
    							obj.data[field] = value;
    						},
    						configurable: true,
    						enumerable: true
    					});
    				}
    			})(this, property);
    			this.data[property] = response;
    			interceptor.resolve(response);
    		}).catch( (message) => {
    			interceptor.reject(message);
    		});

		return interceptor;
	}

	save() {
		// Update
		if(this.data.id) return Bullhorn.http().post(this.endpoint + this.data.id, this.data);
		// Create
		return Bullhorn.http().put(this.endpoint, this.data);
	}

	remove() {
		return Bullhorn.http().remove(this.endpoint + this.data.id, null);
	}

}
