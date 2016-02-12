import { Bullhorn } from './Bullhorn';
import { Deferred } from './Deferred';
import { Cache } from './Cache';
import { QueryString } from './QueryString';

function toFieldNotation(str) {
    let strarr = str.split('.'),
        len = strarr.length;

    let result = strarr.join('(');
    for(let i=1; i < len; i++){
        result += ')';
    }
    return result;
}

function EnsureUnique(arr) {
    let a = arr.concat();
    for(let i = 0; i < a.length; ++i) {
        for(let j = i + 1; j < a.length; ++j) {
            if(a[i] === a[j]) a.splice(j, 1);
        }
    }
    return a;
}

export class Meta {
    constructor(endpoint, parser){
        this.endpoint = endpoint;
        this.all = [];
        this.cache = {};
        this.parser = parser;
        this.parameters = {
            fields: '*',
            meta: 'full'
        };
    }

    defaultMetaParser(data) {
		let list = [],
			interceptor = new Deferred();

		setTimeout( () => {
            for ( let item of data ) {
				if(item.name == 'id') item.readOnly = true;
				if(item.name == 'address') item.readOnly = false;
				if(item.name == 'dateAdded') item.readOnly = true;
				if(item.name == 'timeUnits') item.readOnly = true;
				if(!item.label) item.label = item.name.capitalize();

				item.sortable = ['COMPOSITE', 'TO_MANY', 'TO_ONE'].indexOf(item.type.toUpperCase()) == -1;
				item.searchField = item.name;

				if(['TO_MANY', 'TO_ONE'].indexOf(item.type.toUpperCase()) > -1 && !item.optionsUrl){
					item.optionsUrl = Bullhorn.http().host + 'options/' + item.associatedEntity.entity;
				}

				if(item.optionsUrl && item.options) {
					delete item.options;
				}
				if((['SELECT', 'CHECKBOX', 'RADIO'].indexOf(item.inputType) > -1) && !(item.options || item.optionsUrl)) {
					item.options = (item.dataType == 'Boolean') ? [{
						label: "True",
						value: true
					}, {
						label: "False",
						value: false
					}] : [{
						label: "True",
						value: 1
					}, {
						label: "False",
						value: 0
					}];
				}
				if(['isDeleted'].indexOf(item.name) < 0) list.push(item);
			}
			interceptor.resolve(list);
		},10);

		return interceptor;
	}

    fields(...args) {
		this.parameters.fields = args[0] instanceof Array ? args[0] : args;
		return this;
	}

	type(value) {
		this.parameters.meta = value;
		return this;
	}

	params(object) {
		this.parameters = Object.merge(this.parameters, object);
		return this;
	}

	field(name){
		var interceptor = new Deferred(),
			result = this.lookup(name, this.cache);

		if( !result ) {
			let f = toFieldNotation(name);
			Bullhorn.http().get(this.endpoint, {fields: f, meta:'full'})
                .then( (response) => {
					let obj = {},
						names = name.split('.'),
						property = names.shift();

					obj[property] = response.fields[0];
					let item = this.lookup(name, obj);

					interceptor.resolve(item);
				});
		} else {
			setTimeout(() => {
				interceptor.resolve(result);
			}, 10);
		}

		return interceptor;
	}

	lookup(name, data){
		let names = name.split('.'),
			property = names.shift(),
			item = data[property];

		if ( item.type === 'COMPOSITE' ) {
            for ( let prop in names ) {
                for ( let field of item.fields ) {
                    if(prop === field.name) {
                        item = field;
                        return;
                    }
                }
            }
		} else {
            for ( let prop in names ) {
                for ( let field of item.associatedEntity.fields ) {
                    if(prop === field.name) {
						item = field;
						return;
					}
                }
            }
        }

		if (item.name !== names[names.length-1]) {
            return null;
        }

		return item;
	}

	get() {
		let interceptor = new Deferred(),
			plid = Cache.get('PrivateLabel'),
			name = this.entity + '-' + plid;

		var success = function(response) {
			me.entity = response.entity;
			me.entityLabel = response.label;
			me.parse(response.fields).then(function(){
				interceptor.resolve(response);
			});
		};

		var failure = function(message) {
			interceptor.reject(message);
		};

		if ( Cache.has(name) ) {
			success( Cache.get(name) );
		} else {
			Bullhorn.http().get(this.endpoint, this.parameters).then( function(response){
				Cache.put(name, response);
				success(response);
			}, failure );
		}

		return interceptor.promise();
	}

	parse(fielddata) {
		let data = {},
			interceptor = new Deferred();

		//var list = (this.parser) ? this.parser(fields) : this.defaultMetaParser(fields);
		let p = this.parser || this.defaultMetaParser;
		p.apply(this, [fielddata])
         .then((list) => {
			list.sort((a, b) => {
				try {
					if(a.label.toUpperCase() > b.label.toUpperCase()) return 1;
					if(b.label.toUpperCase() > a.label.toUpperCase()) return -1;
				} catch(e) {
					//Do nothing
				}
				return 0;
			});
			for ( let item of list ) {
            	(function(obj, field, readOnly) {
					if(!obj.cache.hasOwnProperty(field)) {
						Object.defineProperty(obj, field, {
							get: function() {
								return obj.cache[field];
							},
							set: function(value) {
								obj.cache[field] = value;
							},
							configurable: true,
							enumerable: true
						});
					}
				})(me, item.name, item.readOnly);
				data[item.name] = item;
			}
			this.all = list;
			this.cache = data;

			interceptor.resolve(data);
		});
		return interceptor;
	}

	extract(data) {
		if(!this.cache) return [];
		let cache = this.cache,
			result = [];
        for ( let item of data ) {
			let meta = cache[item];
			if(meta) {
				if (meta.name == 'id' ){
					result.unshift(meta);
				} else if (meta.name == '_score') {
					result.insertAt(meta,1) || result.push(meta);
				}
				else result.push(meta);
			}
		}
		return result;
	}

	expand(data, toManyCount) {
		let result = {};

		toManyCount = toManyCount || 0;
		//console.log('expanding', fields, me);
		for ( let field of data) {
			let name = field.split('.')[0],
                sub = field.split('.')[1],
                definition = this.cache[name];

			if(definition) {
				if(definition.associatedEntity) {
					//if(['TO_MANY'].indexOf(definition.type) > -1) name += '['+toManyCount+']';
					if(['appointments', 'approvedPlacements', 'placements', 'interviews', 'sendouts', 'submissions', 'webResponses', 'notes', 'clientContacts', 'changeRequests', 'tasks', 'workHistory', 'references', 'educations', 'jobOrders'].indexOf(definition.name) > -1) name += '[0]';

					result[name] = result[name] || { properties: [] };

					switch(definition.associatedEntity.entity) {
						case 'ClientContact':
						case 'CorporateUser':
						case 'Candidate':
						case 'Lead':
						case 'Person':
							result[name].properties.push('id', 'firstName', 'lastName');
							break;
						case 'Opportunity':
						case 'JobOrder':
							result[name].properties.push('id', 'title');
							break;
						case 'Placement':
						case 'JobSubmission':
						case 'Sendout':
							result[name].properties.push('id', 'jobOrder', 'candidate');
							break;
						case 'PlacementCommission':
							result[name].properties.push('id', 'user(id,name)', 'commissionPercentage');
							break;
						case 'PlacementChangeRequest':
							result[name].properties.push('id', 'requestType');
							break;
						case 'Note':
							result[name].properties.push('id', 'action', 'dateAdded');
							break;
						case 'Appointment':
							result[name].properties.push('id');
							break;
						case 'Task':
							result[name].properties.push('id', 'subject', 'isCompleted');
							break;
						case 'CandidateEducation':
							result[name].properties.push('id', 'degree');
							break;
						case 'CandidateWorkHistory':
							result[name].properties.push('id', 'companyName');
							break;
						case 'CandidateCertification':
							result[name].properties.push('id', 'certification(id,name)');
							break;
						case 'CandidateReference':
							result[name].properties.push('id', 'referenceFirstName','referenceLastName');
							break;
						case 'WorkersCompensationRate':
							result[name].properties.push('id', 'rate', 'compensation(code,name)');
							break;
						default:
							result[name].properties.push('id', 'name');
							break;
						}
					if(sub) {
						switch(sub) {
							case 'owner':
								result[name].properties.push(sub+'(id,firstName,lastName)');
								break;
							case 'department':
								result[name].properties.push(sub+'(id,name)');
								break;
							case 'parentClientCorporation':
								result[name].properties.push(sub+'(id,name)');
								break;
							default:
								result[name].properties.push(sub);
								break;
							}
					}
				} else {
					result[name] = result[name] || { properties: [] };
					if(sub) {
						result[name].properties.push(sub);
					}
				}
			}
		}

		var output = [];
        for ( let key in result ) {
            let value = result[key];
            if (value.properties.length > 0 && key !== 'address') {
				output.push( key + '(' + EnsureUnique(value.properties).join(',') + ')' );
			} else {
				output.push( key );
            }
        }
		return output;
	}
}
