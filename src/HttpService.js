import XHR from './XHR';
import { QueryString } from './QueryString';
import { Deferred } from './Deferred';

const HEADERS = {
    COMMON: {
        'Accept': 'application/json, text/plain, */*'
    },
    POST: {
        'Content-Type': 'application/json;charset=utf-8'
    },
    PUT: {
        'Content-Type': 'application/json;charset=utf-8'
    }
};

let callbacks = {
	counter: 0
};

function createCallback() {
    let name = '_' + (callbacks.counter++).toString(36);
    return name;
}

let XMLRequest = XHR();

export class HttpService {

    constructor(host, globals) {
		this.host = host;
		this.globals = globals || {};
	}

	_execute(method, path, parameters = {}, data, headers, responseType) {
		let http = new XMLRequest(),
			deferred = new Deferred(),
			url = (path.indexOf('//') > -1) ? path : this.host + path;

		for(let key in this.globals) {
			parameters[key] = this.globals[key];
		}

        let endpoint = new QueryString(url, parameters).toString();
		http.open(method, endpoint, true);
		if ( headers ) {
            for ( let header in headers ) {
                http.setRequestHeader(header, headers[header]);
            }
		}

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

		return deferred;
	}

	get(path, parameters) {
		return this._execute("GET", path, parameters || {}, null, HEADERS.COMMON);
	}

	post(path, data, parameters) {
		return this._execute("POST", path, parameters, data, HEADERS.POST);
	}

	put(path, data, parameters) {
		return this._execute("PUT", path, parameters, data, HEADERS.PUT);
	}

	remove(path, parameters) {
		return this._execute("DELETE", path, parameters, null, HEADERS.COMMON);
	}

	jsonp(path, parameters = {}, data) {
		let script = window.document.createElement('script'),
			deferred = new Deferred(),
			url = (path.indexOf('//') > -1) ? path : this.host + path,
			cbid = callback();

		for (let key in this.globals) {
			parameters[key] = this.globals[key];
		}
		parameters.callback = 'callbacks.' + cbid;
		callbacks[cbid] = function(data) {
			window.document.body.removeChild(script);
			if (data) {
				deferred.resolve(data);
			} else {
				deferred.reject();
			}
			delete callbacks[cbid];
			for (let prop in script) {
				delete script[prop];
			}
		};

		script.type = 'text/javascript';
		script.src = new QueryString(url, parameters).toString();
		script.onerror = function() {
			callbacks[cbid](null);
		};

		window.document.body.appendChild(script);
		return deferred;
	}
}
