import { Deferred } from './Deferred';
import { Query } from './Query';

export class Search extends Query {
	constructor(endpoint) {
		super(endpoint);
        this.WHERE = 'query';
        this.ORDER = 'sort';
		this.parameters = {
			fields: ['id'],
			sort: ['-dateAdded'],
			start: 0,
			count: 10
		};
	}
}
