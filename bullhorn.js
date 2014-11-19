Object.defineProperty(Object.prototype, 'each', {
	enumerable: false,
	configurable: false,
	writable: false,
	value: function(callback, scope) {
		for(var key in this) {
			callback.call(scope, this[key], key);
		}
		return this;
	}
});

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

function extend() {
	var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false,
		toString = Object.prototype.toString,
		hasOwn = Object.prototype.hasOwnProperty,
		push = Array.prototype.push,
		slice = Array.prototype.slice,
		trim = String.prototype.trim,
		indexOf = Array.prototype.indexOf,
		class2type = {
			"[object Boolean]": "boolean",
			"[object Number]": "number",
			"[object String]": "string",
			"[object Function]": "function",
			"[object Array]": "array",
			"[object Date]": "date",
			"[object RegExp]": "regexp",
			"[object Object]": "object"
		},
		jQuery = {
			isFunction: function(obj) {
				return jQuery.type(obj) === "function"
			},
			isArray: Array.isArray ||
			function(obj) {
				return jQuery.type(obj) === "array"
			},
			isWindow: function(obj) {
				return obj != null && obj == obj.window
			},
			isNumeric: function(obj) {
				return !isNaN(parseFloat(obj)) && isFinite(obj)
			},
			type: function(obj) {
				return obj == null ? String(obj) : class2type[toString.call(obj)] || "object"
			},
			isPlainObject: function(obj) {
				if(!obj || jQuery.type(obj) !== "object" || obj.nodeType) {
					return false
				}
				try {
					if(obj.constructor && !hasOwn.call(obj, "constructor") && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
						return false
					}
				} catch(e) {
					return false
				}
				var key;
				for(key in obj) {}
				return key === undefined || hasOwn.call(obj, key)
			}
		};
	if(typeof target === "boolean") {
		deep = target;
		target = arguments[1] || {};
		i = 2;
	}
	if(typeof target !== "object" && !jQuery.isFunction(target)) {
		target = {}
	}
	if(length === i) {
		target = this;
		--i;
	}
	for(i; i < length; i++) {
		if((options = arguments[i]) != null) {
			for(name in options) {
				src = target[name];
				copy = options[name];
				if(target === copy) {
					continue
				}
				if(deep && copy && (jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
					if(copyIsArray) {
						copyIsArray = false;
						clone = src && jQuery.isArray(src) ? src : []
					} else {
						clone = src && jQuery.isPlainObject(src) ? src : {};
					}
					// WARNING: RECURSION
					target[name] = extend(deep, clone, copy);
				} else if(copy !== undefined) {
					target[name] = copy;
				}
			}
		}
	}
	return target;
}

Object.merge = extend;

Object.defineProperty(Array.prototype, 'each', {
	enumerable: false,
	configurable: false,
	writable: false,
	value: function(callback, scope) {
		for(var i = 0, l = this.length; i < l; i++) {
			callback.call(scope, this[i], i, this);
		}
	}
});

if(typeof String.prototype.endsWith !== 'function') {
	String.prototype.endsWith = function(suffix) {
		return this.indexOf(suffix, this.length - suffix.length) !== -1;
	};
}

(function(root, undefined) {
	var Deferred = function() {
		var dfd, resolved = null,
			resolvedArgs, prm, doneFns = [],
			failFns = [],
			progressFns = [],
			cancelled = false;

		prm = {
			done: function(fn) {
				if(typeof fn == 'function') {
					if(resolved === null) {
						doneFns.push(fn);
					} else if(resolved === true) {
						fn.apply(root, resolvedArgs);
					}
				}
				return prm;
			},
			fail: function(fn) {
				if(typeof fn == 'function') {
					if(resolved === null) {
						failFns.push(fn);
					} else if(resolved === false) {
						fn.apply(root, resolvedArgs);
					}
				}
				return prm;
			},
			progress: function(fn) {
				if(typeof fn == 'function') {
					if(resolved === null) {
						progressFns.push(fn);
					}
				}
				return prm;
			},
			cancel: function(){
				cancelled = true;
				return prm;
			},
			then: function(doneFn, failFn, progressFn) {
				prm.done(doneFn);
				prm.progress(progressFn);
				prm.fail(failFn);
				return prm;
			}
		};

		dfd = {
			promise: function() {
				return prm;
			},
			resolve: function() {
				if( cancelled ) return;
				resolved = true;
				resolvedArgs = Array.prototype.slice.call(arguments);
				doneFns.forEach(function(fn) {
					fn.apply(root, resolvedArgs);
				});
			},
			reject: function() {
				if( cancelled ) return;
				resolved = false;
				resolvedArgs = Array.prototype.slice.call(arguments);
				failFns.forEach(function(fn) {
					fn.apply(root, resolvedArgs);
				});
			},
			notify: function() {
				if( cancelled ) return;
				var progressArgs = Array.prototype.slice.call(arguments);
				progressFns.forEach(function(fn) {
					fn.apply(root, progressArgs);
				});
			},
			resolved: function() {
				return resolved;
			}
		};
		return dfd;
	};

	Deferred.all = function(){
		var deferred = new Deferred(),
			promises = (arguments[0] instanceof Array) ? arguments[0] : Array.prototype.slice.call(arguments),
			count = promises.length,
			responses = [],
			checkAll = function(resp, i){
				count--;
				responses[i] = resp;
				if( count === 0 ) {
					deferred.resolve.apply(root, responses);
				} else {
					deferred.notify.apply(root, responses);
				}
			};

		promises.forEach(function(promise, p){
			promise.then(
				function(response){
					checkAll(response, p);
				},
				function(e){
					deferred.reject(e);
					checkAll(null, p);
				}
			);
		});

		return deferred.promise();
	};

	window.Deferred = Deferred;
	window.defer = function() {
		return new Deferred();
	};
})(this);

var XHR = window.XMLHttpRequest ||
function() {
	try {
		return new ActiveXObject("Msxml2.XMLHTTP.6.0");
	} catch(e1) {}
	try {
		return new ActiveXObject("Msxml2.XMLHTTP.3.0");
	} catch(e2) {}
	try {
		return new ActiveXObject("Msxml2.XMLHTTP");
	} catch(e3) {}
	throw new Error("This browser does not support XMLHttpRequest.");
};

var callbacks = {
	counter: 0
};

function toQueryString(url, params) {
	if(!params) return url;
	var parts = [];
	params.each(function(value, key) {
		if(value instanceof Array) parts.push(key + '=' + encodeURIComponent(value.join(',')));
		else parts.push(key + '=' + encodeURIComponent(value));
	});
	return url + ((url.indexOf('?') == -1) ? '?' : '&') + parts.join('&');
}

var HttpService = (function(XHR, callbacks) {
	var msie = false; //(/msie (\d+)/.exec(lowercase(navigator.userAgent));
	var _headers = {
		common: {
			'Accept': 'application/json, text/plain, */*'
		},
		post: {
			'Content-Type': 'application/json;charset=utf-8'
		},
		put: {
			'Content-Type': 'application/json;charset=utf-8'
		}
	};

	var callback = function() {
		var name = '_' + (callbacks.counter++).toString(36);
		return name;
	}

	function HttpService(host, globals) {
		this.host = host;
		this.globals = globals || {};
	}

	HttpService.prototype._execute = function(method, path, parameters, data, headers, responseType) {
		var http = new XHR(),
			deferred = new Deferred(),
			parameters = parameters || {},
			url = (path.indexOf('//') > -1) ? path : this.host + path;

		for(key in this.globals) {
			parameters[key] = this.globals[key];
		}
		var endpoint = toQueryString(url, parameters);

		http.open(method, endpoint, true);

		headers && headers.each(function(value, key) {
			if(value) http.setRequestHeader(key, value);
		});

		http.onreadystatechange = function() {
			if(http.readyState == 4) {
				if(http.status == 200) {
					deferred.resolve(JSON.parse(http.response || http.responseText));
				} else {
					deferred.reject(JSON.parse(http.response || http.responseText));
				}
			}
		}
		if(responseType) http.responseType = responseType;

		http.send(JSON.stringify(data));

		return deferred.promise();
	}

	HttpService.prototype.get = function(path, parameters) {
		return this._execute("GET", path, parameters || {}, null, _headers.common);
	}

	HttpService.prototype.post = function(path, data, parameters) {
		return this._execute("POST", path, parameters, data, _headers.post);
	}

	HttpService.prototype.put = function(path, data, parameters) {
		return this._execute("PUT", path, parameters, data, _headers.put);
	}

	HttpService.prototype.remove = function(path, parameters) {
		return this._execute("DELETE", path, parameters, null, _headers.common);
	}

	HttpService.prototype.jsonp = function(path, parameters, data) {
		var script = window.document.createElement('script'),
			deferred = new Deferred(),
			url = (path.indexOf('//') > -1) ? path : this.host + path,
			parameters = parameters || {},
			cbid = callback();

		for(key in this.globals) {
			parameters[key] = this.globals[key];
		}
		parameters.callback = 'callbacks.' + cbid;
		callbacks[cbid] = function(data) {
			window.document.body.removeChild(script);
			if(data) {
				deferred.resolve(data);
			} else {
				deferred.reject();
			}
			delete callbacks[cbid];
			for (var prop in script) {
				delete script[prop];
			}
		};

		script.type = 'text/javascript';
		script.src = toQueryString(url, parameters);
		if(msie) {
			script.onreadystatechange = function() {
				if(/loaded|complete/.test(script.readyState)) {
					//console.log('Loaded', script.readyState );
				}
			};
		} else {
			script.onerror = function() {
				callbacks[cbid](null);
			};
		}

		window.document.body.appendChild(script);
		return deferred.promise();
	}

	return HttpService;
})(XHR, callbacks);

/// BULLHORN STARTS HERE
(function(root) {
	var http;

	var Cache = {
		put: function(key, value) {
			//localStorage.removeItem(key);
			localStorage.setItem(key, JSON.stringify(value));
			return value;
		},
		get: function(key){
			var value = localStorage.getItem(key);
			if(value){
				return JSON.parse(value);
			}
			return null;
		},
		has: function(key){
			var value = localStorage.getItem(key);
			if(value){
				return JSON.parse(value);
			}
			return false;
		}
	};

	function Bullhorn() {}

	Bullhorn.prototype.authenticate = function(oauth) {
		// OAUTH SUPPORT
		var me = this,
			params = {},
			interceptor = Deferred();

		window.location.search.replace(
		new RegExp("([^?=&]+)(=([^&]*))?", "g"), function($0, $1, $2, $3) {
			params[decodeURIComponent($1)] = decodeURIComponent($3);
		});
		if(params['BhRestToken'] && params['restUrl']) {
			Cache.put('BhRestToken', params.BhRestToken);
			if(params.restUrl.endsWith('//')) params.restUrl = params.restUrl.substr(0, params.restUrl.length - 1);
			Cache.put('restUrl', params.restUrl);
		}

		var token = Cache.get('BhRestToken');
		var endpoint = Cache.get('restUrl');
		var pong = Cache.get('AppData');

		delete params.BhRestToken;
		delete params.restUrl;

		var returnHost = window.location.protocol + '//' + window.location.host + window.location.pathname,
			returnAddress = toQueryString(returnHost, params);

		if(!token || !endpoint) window.location = oauth + '?redirect=' + returnAddress;

		var defaults = { BhRestToken: token };
		if( params.plid ) defaults.privateLabelId = params.plid;

		http = Bullhorn.http = new HttpService(endpoint, defaults);

		function authenticated(data) {
			//Setup Defaults
			CreateMeta('CandidateMeta', 'Candidate');
			CreateMeta('JobMeta', 'JobOrder');
			CreateMeta('ContactMeta', 'ClientContact');
			CreateMeta('CompanyMeta', 'ClientCorporation');
			CreateMeta('JobSearch', 'JobOrder');
			CreateMeta('PlacementMeta', 'Placement');
			CreateMeta('SubmissionMeta', 'JobSubmission');
			CreateMeta('TearsheetMeta', 'Tearsheet');
			CreateMeta('TaskMeta', 'Task');
			CreateMeta('PersonMeta', 'Person');
			CreateMeta('UserMeta', 'CorporateUser');
			CreateMeta('LeadMeta', 'Lead');
			CreateMeta('OpportunityMeta', 'Opportunity');

			CreateSearch('CandidateSearch', 'Candidate');
			CreateSearch('ContactSearch', 'ClientContact');
			CreateSearch('CompanySearch', 'ClientCorporation');
			CreateSearch('JobSearch', 'JobOrder');
			CreateSearch('PlacementSearch', 'Placement');
			CreateSearch('SubmissionSearch', 'JobSubmission');
			CreateSearch('TaskSearch', 'Task');
			CreateSearch('LeadSearch', 'Lead');
			CreateSearch('OpportunitySearch', 'Opportunity');
			CreateSearch('Notes', 'Note');

			CreateQuery('Departments', 'CorporationDepartment');
			CreateQuery('Users', 'CorporateUser');
			CreateQuery('People', 'Person');
			CreateQuery('SubmissionHistories', 'JobSubmissionHistory');
			CreateQuery('Tearsheets', 'Tearsheet');
			CreateQuery('DistributionList', 'DistributionList');
			CreateQuery('Tasks', 'Task');

			CreateEntity('Candidate', 'Candidate');
			CreateEntity('Contact', 'ClientContact');
			CreateEntity('User', 'CorporateUser');
			CreateEntity('Person', 'Person');
			CreateEntity('Company', 'ClientCorporation');
			CreateEntity('Job', 'JobOrder');
			CreateEntity('Placement', 'Placement');
			CreateEntity('Submission', 'JobSubmission');
			CreateEntity('Tearsheet', 'Tearsheet');
			CreateEntity('Task', 'Task');
			CreateEntity('Note', 'Note');
			CreateEntity('Lead', 'Lead');
			CreateEntity('Opportunity', 'Opportunity');

			interceptor.resolve(data);
		}

		if( pong && pong.BhRestToken == token){
			authenticated(pong);
		} else {
			http.get('ping', {}).then(authenticated, function(error) {
				//Authentication Failure
				window.location = oauth + '?redirect=' + returnAddress;
			});
		}
		return interceptor.promise();
	}

	function Meta(endpoint, parser) {
		this.endpoint = endpoint;
		this.all = [];
		this.cache = {};
		this.parser = parser;
		this.parameters = {
			fields: '*',
			meta: 'full'
		};
	}

	Meta.prototype.defaultMetaParser = function(data) {
		var me = this,
				list = [],
				interceptor = new Deferred();

		setTimeout(function(){
			data.forEach(function(item, key) {
				if(item.name == 'id') item.readOnly = true;
				if(item.name == 'address') item.readOnly = false;
				if(item.name == 'dateAdded') item.readOnly = true;
				if(item.name == 'timeUnits') item.readOnly = true;
				if(!item.label) item.label = item.name.capitalize();

				item.sortable = ['COMPOSITE', 'TO_MANY', 'TO_ONE'].indexOf(item.type.toUpperCase()) == -1;
				item.searchField = item.name;

				if(['TO_MANY', 'TO_ONE'].indexOf(item.type.toUpperCase()) > -1 && !item.optionsUrl){
					item.optionsUrl = http.host + 'options/' + item.associatedEntity.entity;
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
			});

			interceptor.resolve(list);
		},10);

		return interceptor.promise();
	}

	Meta.prototype.fields = function() {
		this.parameters.fields = (arguments[0] instanceof Array) ? arguments[0] : Array.prototype.slice.call(arguments);
		return this;
	}

	Meta.prototype.type = function(value) {
		this.parameters.meta = value;
		return this;
	}

	Meta.prototype.params = function(object) {
		this.parameters = Object.merge(this.parameters, object);
		return this;
	}

	Meta.prototype.field = function(name){
		var me = this,
			interceptor = new Deferred(),
			result = this.lookup(name, this.cache);

		if( !result ) {
			var f = toFieldNotation(name);
			http.get(this.endpoint, {fields: f, meta:'full'}).then(
				function(response){
					var obj = {},
						names = name.split('.'),
						property = names.shift();

					obj[property] = response.fields[0];
					var item = me.lookup(name, obj);

					interceptor.resolve(item);
				}
			);
		} else {
			setTimeout(function() {
				interceptor.resolve(result);
			}, 10);
		}

		return interceptor.promise();
	}

	Meta.prototype.lookup = function(name, data){
		var names = name.split('.'),
			property = names.shift(),
			item = data[property];

		if( item.type == 'COMPOSITE' )
			angular.forEach(names, function(prop, i) {
				angular.forEach(item.fields, function(field, i) {
					if(prop == field.name) {
						item = field;
						return;
					}
				});
			});
		else
			angular.forEach(names, function(prop, i) {
				angular.forEach(item.associatedEntity.fields, function(field, i) {
					if(prop == field.name) {
						item = field;
						return;
					}
				});
			});

		if(item.name != names[names.length-1]) return null;

		return item;
	}

	function toFieldNotation(str) {
		var strarr = str.split('.'),
			len = strarr.length,
			result;

		var result = strarr.join('(');
		for(var i=1; i < len; i++){
			result += ')';
		}
	  	return result;
	}

	Meta.prototype.get = function() {
		var me = this,
			interceptor = new Deferred(),
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
			http.get(this.endpoint, this.parameters).then( function(response){
				Cache.put(name, response);
				success(response);
			}, failure );
		}

		return interceptor.promise();
	}

	Meta.prototype.parse = function(fielddata) {
		var me = this,
				data = {},
				interceptor = new Deferred();

		//var list = (this.parser) ? this.parser(fields) : this.defaultMetaParser(fields);
		var p = this.parser || this.defaultMetaParser;
		p.apply(this, [fielddata]).then(function(list){
			list.sort(function(a, b) {
				try {
					if(a.label.toUpperCase() > b.label.toUpperCase()) return 1;
					if(b.label.toUpperCase() > a.label.toUpperCase()) return -1;
				}catch(e){
					//Do nothing
				}
				return 0;
			});

			list.forEach(function(item, key) {
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
			});
			me.all = list;
			me.cache = data;

			interceptor.resolve(data);
		});
		return interceptor.promise();
	}

	Meta.prototype.extract = function(data) {
		if(!this.cache) return [];
		var cache = this.cache,
			result = [];
		data.forEach(function(item, key) {
			var meta = cache[item];
			if(meta) {
				if (meta.name == 'id' ){
					result.unshift(meta);
				} else if (meta.name == '_score') {
					result.insertAt(meta,1) || result.push(meta);
				}
				else result.push(meta);
			}
		});
		return result;
	}

	Meta.prototype.clean = function(data) {
		var me = this,
			result = [];

		data.forEach(function(name, i) {
			var field = clean(name),
				definition = me.cache[field];

			if( definition && result.indexOf(field) < 0 )
				result.push(field);

		});
		return result;
	}

	function EnsureUnique(arr) {
	    var a = arr.concat();
	    for(var i = 0; i < a.length; ++i) {
	        for(var j = i + 1; j < a.length; ++j) {
	            if(a[i] === a[j]) a.splice(j, 1);
	        }
	    }
	    return a;
	}

	Meta.prototype.expand = function(data, toManyCount) {
		var me = this,
			result = {};

		toManyCount = toManyCount || 0;
		//console.log('expanding', fields, me);
		data.forEach(function(field, i) {
			var name = field.split('.')[0], sub = field.split('.')[1];
			var definition = me.cache[name];
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
		});

		var output = [];
		Object.loop(result, function(key, value){
			if(value.properties.length > 0 && key !== 'address')
				output.push( key + '(' + EnsureUnique(value.properties).join(',') + ')' );
			else
				output.push( key );
		});

		return output;
	}

	function Search(endpoint) {
		this.endpoint = endpoint;
		this.records = [];
		this._page = 0;
		this.parameters = {
			fields: ['id'],
			sort: ['-dateAdded'],
			start: 0,
			count: 10
		};
	}

	Search.prototype.fields = function() {
		this.parameters.fields = (arguments[0] instanceof Array) ? arguments[0] : Array.prototype.slice.call(arguments);
		return this;
	}

	Search.prototype.sort = function() {
		this.parameters.sort = (arguments[0] instanceof Array) ? arguments[0] : Array.prototype.slice.call(arguments);
		return this;
	}

	Search.prototype.query = function(value) {
		this.parameters.query = value;
		return this;
	}

	Search.prototype.count = function(value) {
		this.parameters.count = value;
		return this;
	}

	Search.prototype.page = function(value) {
		this._page = value;
		this.parameters.start = this.parameters.count * value;
		return this;
	}

	Search.prototype.nextpage = function() {
		var me = this.page(++this._page);
		return me.run(true);
	}

	Search.prototype.params = function(object) {
		this.parameters = Object.merge(this.parameters, object);
		return this;
	}

	Search.prototype.get = Search.prototype.run = function(add) {
		var me = this,
			interceptor = new Deferred();

		function success(response) {
			if(add) me.records = me.records.concat(response.data);
			else me.records = response.data;
			interceptor.resolve(response);
		}

		function failure(message) {
			interceptor.reject(message);
		}

		//BH-15325: Akamai has a query string limit.
		var too_long = toQueryString('', this.parameters).length > 8000;
		if ( too_long )
			http.post(this.endpoint, this.parameters).then(success, failure);
		else
			http.get(this.endpoint, this.parameters).then(success, failure);

		return interceptor.promise();
	}

	//Query


	function Query(endpoint) {
		this.endpoint = endpoint;
		this.records = [];
		this._page = 0;
		this.parameters = {
			fields: ['id'],
			start: 0,
			count: 10
		};
	}

	Query.prototype.fields = function() {
		this.parameters.fields = (arguments[0] instanceof Array) ? arguments[0] : Array.prototype.slice.call(arguments);
		return this;
	}

	Query.prototype.sort = function() {
		this.parameters.orderBy = (arguments[0] instanceof Array) ? arguments[0] : Array.prototype.slice.call(arguments);
		return this;
	}

	Query.prototype.query = function(value) {
		this.parameters.where = value;
		return this;
	}

	Query.prototype.count = function(value) {
		this.parameters.count = value;
		return this;
	}

	Query.prototype.page = function(value) {
		this._page = value;
		this.parameters.start = this.parameters.count * value;
		return this;
	}

	Query.prototype.nextpage = function() {
		var me = this.page(++this._page);
		return me.run(true);
	}

	Query.prototype.params = function(object) {
		this.parameters = Object.merge(this.parameters, object);
		return this;
	}

	Query.prototype.get = Query.prototype.run = function(add) {
		var me = this,
			interceptor = new Deferred();

		function success(response) {
			if(add) me.records = me.records.concat(response.data);
			else me.records = response.data;
			interceptor.resolve(response);
		}

		function failure(message) {
			interceptor.reject(message);
		}

		//BH-15325: Akamai has a query string limit.
		var too_long = toQueryString('', this.parameters).length > 8000;
		if ( too_long )
			http.post(this.endpoint, this.parameters).then(success, failure);
		else
			http.get(this.endpoint, this.parameters).then(success, failure);

		return interceptor.promise();
	}

	//Entities


	function Entity(endpoint) {
		this.endpoint = endpoint;
		this.data = {};
		this.parameters = {
			fields: ['id']
		};
	}

	Entity.prototype.fields = function() {
		this.parameters.fields = (arguments[0] instanceof Array) ? arguments[0] : Array.prototype.slice.call(arguments);
		for(var i in this.parameters.fields) {
			var field = clean(this.parameters.fields[i]);
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

	Entity.prototype.params = function(object) {
		this.parameters = Object.merge(this.parameters, object);
		return this;
	}

	Entity.prototype.get = function(id) {
		var me = this,
			interceptor = new Deferred();

		me.data.id = id;
		http.get(this.endpoint + id, this.parameters).then(function(response) {
			me.data = Object.merge(me.data, response.data);
			interceptor.resolve(response);
		}, function(message) {
			interceptor.reject(message);
		});

		return interceptor.promise();
	}

	Entity.prototype.many = function(property, fields, params) {
		var me = this,
			interceptor = new Deferred();
		http.get(this.endpoint + me.data.id + '/' + property, Object.merge({
			fields: fields,
			showTotalMatched: true
		}, params)).then(function(response) {
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
			})(me, property);
			me.data[property] = response;
			interceptor.resolve(response);
		}, function(message) {
			interceptor.reject(message);
		});

		return interceptor.promise();
	}

	Entity.prototype.save = function() {
		// Update
		if(this.data.id) return http.post(this.endpoint + this.data.id, this.data);
		// Create
		return http.put(this.endpoint, this.data);
	}

	Entity.prototype.remove = function() {
		return http.remove(this.endpoint + this.data.id, null);
	}

	function clean(name) {
		var cleaned = name.split('.')[0];
		cleaned = cleaned.split('[')[0];
		cleaned = cleaned.split('(')[0];
		return cleaned;
	}


	function cleanUnsafeFields(fields) {
		if( !fields ) return [];
		var _fields = [],
			hasAddress = false,
			hasAddress2 = false,
			hasCandidate = false,
			hasJob = false;
		fields.forEach(function(name, i) {
			var field = clean(name);
			switch(field) {
			case 'jobOrderID':
				_fields.push('id');
				break;
			case 'userID':
				_fields.push('id');
				break;
			case 'candidate':
				if(!hasCandidate) _fields.push('candidate');
				hasCandidate = true;
				break;
			case 'jobOrder':
				if(!hasJob) _fields.push('jobOrder');
				hasJob = true;
				break;
			case 'clientCorporationID':
				_fields.push('id');
				break;
			case 'client_name':
				_fields.push('clientCorporation');
				break;
			case 'address':
				if(!hasAddress) _fields.push('address');
				hasAddress = true;
				break;
			case 'secondaryAddress':
				if(!hasAddress2) _fields.push('secondaryAddress');
				hasAddress2 = true;
				break;
			case 'dateLastNote':
			case 'dateLastModified':
			case 'userCommentID':
			case 'territoryID':
				break;
			default:
				_fields.push(field);
				break;
			}
		});
		return _fields;
	}

	function CreateSearch(name, entity) {
		window[name] = function() {
			return new Search('search/' + entity);
		}
	}

	function CreateQuery(name, entity) {
		window[name] = function() {
			return new Query('query/' + entity);
		}
	}

	function CreateEntity(name, entity) {
		window[name] = function() {
			return new Entity('entity/' + entity + '/');
		}
	}

	function CreateMeta(name, entity) {
		window[name] = function(parser) {
			var m = new Meta('meta/' + entity + '/', parser);
			m.entity = entity;
			return m;
		}
	}

	root.Search = Search;
	root.Query = Query;
	root.Entity = Entity;
	root.Meta = Meta;
	root.Bullhorn = Bullhorn;

})(window);
