import { Deferred } from './Deferred';
import { HttpService } from './HttpService';
import { Cache } from './Cache';
import { Meta } from './Meta';
import { Query } from './Query';
import { Search } from './Search';
import { Entity } from './Entity';

function clean(name) {
	let cleaned = name.split('.')[0];
	cleaned = cleaned.split('[')[0];
	cleaned = cleaned.split('(')[0];
	return cleaned;
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
        let m = new Meta('meta/' + entity + '/', parser);
        m.entity = entity;
        return m;
    }
}

export class Bullhorn {

    constructor(config) {
        this.apiVersion = config.apiVersion || '*';
        if(config.BhRestToken && config.restUrl){
            Cache.put('BhRestToken', config.BhRestToken);
            Cache.put('restUrl', config.restUrl);
        }
    }

	login(token) {
		//Step 3 - Login
		let http = new HttpService(this.loginUrl);
		http.get('/login', {
			access_token: token,
			version: this.apiVersion
		}).then(function (session) {
			Cache.put('BhRestToken', session.BhRestToken);
			Cache.put('restUrl', session.restUrl);
			this.isLoggedIn();
		}.bind(this));
	}

	isLoggedIn(){
		return this.ping();
	}
	/**
	 * Retrieves the HttpService created to connect to the Bullhorn RestApi
	 * @name http
	 * @memberof Application#
	 * @static
	 * @return {HttpService}
	 */
	static http() {
		let BhRestToken = Cache.get('BhRestToken'),
			endpoint = Cache.get('restUrl');

		if(BhRestToken && endpoint){
			return new HttpService(endpoint, { BhRestToken });
		}

		//throw new Error('You must authenticate first before using this service');
        return new HttpService();
	}

	ping() {
		return new Promise((resolve, reject) => {
            let token = Cache.get('BhRestToken'),
                endpoint = Cache.get('restUrl');

            if (token && endpoint) {
                let http = new HttpService(endpoint, { BhRestToken: token });
                http.get('ping', {})
                    .then( (pong) => {
                        //Authentication Success
                        resolve(pong);
                     })
                    .catch( (err) => {
                        //Authentication Failure
                        //window.location = authAddress;
                        reject('Auth Failure', err);
                     });
            } else {
                reject('Auth Failure', 'No BhRestToken is defined');
            }
        });
	}

    static initDefaults(){
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
    }

}
