R("../lib/bundle", function (err, index) {
    var $ = function(ref) {
        return document.querySelector(ref);
    }

    if (err) {
        console.error(err);
        return;
    }
    // use the exports object as needed
    var Bullhorn = index.Bullhorn;
    var connection;

    function connect() {
        console.log('Connected');
        connection = new Bullhorn(JSON.parse(document.querySelector('[name="config"]').value));
        Bullhorn.initDefaults();
    }

    function describeCandidates(){
        var meta = new CandidateMeta().fields('id','name','mobile','address');
        meta.get().then(function(response){
            // You can access data from the http `response` or from `meta` directly
            output(syntaxHighlight(JSON.stringify(response, undefined, 4)));
        });
    }
    function getCandidates() {
    	var candidates = new CandidateSearch().fields('id','name','mobile','address').query('isDeleted:0 AND NOT name:[* TO *]').sort('-dateAdded').params({showTotalMatched: true, meta: 'full', count:25});
    	candidates.get().then(function(response){
            // You can access data from the http `response` or from `candidates` directly
    		output(syntaxHighlight(JSON.stringify(response, undefined, 4)));
    	});
    }
    function getContacts() {
    	var contacts = new ContactSearch().fields('id','name','mobile','address').query('isDeleted:0 AND NOT occupation:[* TO *]').sort('-dateAdded').params({showTotalMatched: true, meta: 'full', count:25});
    	contacts.get().then(function(response){
            // You can access data from the http `response` or from `contacts` directly
    		output(syntaxHighlight(JSON.stringify(response, undefined, 4)));
    	});
    }
    function findCandidate() {
    	var candidates = new CandidateSearch().fields('id','name','mobile','address').query('isDeleted:0 AND NOT name:[* TO *]').sort('-dateAdded').params({showTotalMatched: true, meta: 'full', count:25});
    	candidates.get().then(function(response){
            var candidate = new Candidate().fields('id','name','mobile','address');
            // You can access data from the http `response` or from `candidate` directly
            candidate.get(response.data[0].id).then( function(entity) {
                output(syntaxHighlight(JSON.stringify(entity, undefined, 4)));
            });
    	});
    }

    $('.connect').onclick = connect;
    $('.candidatemeta').onclick = describeCandidates;
    $('.candidates').onclick = getCandidates;
    $('.contacts').onclick = getContacts;
    $('.candidate').onclick = findCandidate;

    function output(inp) {
        var content = document.querySelector('.content');
        if( content.firstChild )
            content.removeChild(content.firstChild);

        $('.content').appendChild(document.createElement('pre')).innerHTML = inp;
    }

    function syntaxHighlight(json) {
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }

    var textAreas = document.getElementsByTagName('textarea');
    Array.prototype.forEach.call(textAreas, function(elem) {
        elem.placeholder = elem.placeholder.replace(/\\n/g, '\n');
    });
});
