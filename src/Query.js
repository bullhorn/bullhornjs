import { Bullhorn } from './Bullhorn';
import { Deferred } from './Deferred';
import { QueryString } from './QueryString';


export class Query {
	constructor(endpoint) {
        this.endpoint = endpoint;
        this.records = [];
        this._page = 0;
        this.WHERE = 'where';
        this.ORDER = 'orderBy';
        this.parameters = {
			fields: ['id'],
			start: 0,
			count: 10
		};
	}

	fields(...args) {
		this.parameters.fields = args[0] instanceof Array ? args[0] : args;
		return this;
	}

	sort(...args) {
		this.parameters[this.ORDER] = args[0] instanceof Array ? args[0] : args;
		return this;
	}

	query(value) {
		this.parameters[this.WHERE] = value;
		return this;
	}

	count(value) {
		this.parameters.count = value;
		return this;
	}

	page(value) {
		this._page = value;
		this.parameters.start = this.parameters.count * value;
		return this;
	}

	nextpage() {
		this.page(++this._page);
		return this.run(true);
	}

	params(object) {
		this.parameters = Object.assign(this.parameters, object);
		return this;
	}

    get(add) {
        return this.run(add);
    }

	run(add) {
    	let interceptor = new Deferred();
        let request;
		//BH-15325: Akamai has a query string limit.
		let too_long = new QueryString('', this.parameters).toString().length > 8000;
		if ( too_long ) {
			request = Bullhorn.http().post(this.endpoint, this.parameters)
		} else {
			request = Bullhorn.http().get(this.endpoint, this.parameters)
        }

        request
            .then( (response) => {
    			if(add) this.records = this.records.concat(response.data);
    			else this.records = response.data;
    			interceptor.resolve(response);
    		})
            .catch( (message) => {
    			interceptor.reject(message);
    		});

		return interceptor;
	}

}
