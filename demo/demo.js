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

    function getCandidates() {
    	var candidates = new CandidateSearch().fields('id','name','mobile','address').query('isDeleted:0 AND NOT name:[* TO *]').sort('-dateAdded').params({showTotalMatched: true, meta: 'full', count:25});
    	candidates.get().then(function(response){
    		output(syntaxHighlight(JSON.stringify(response, undefined, 4)));
    	});
    }
    function getContacts() {
    	var contacts = new ContactSearch().fields('id','name','mobile','address').query('isDeleted:0 AND NOT occupation:[* TO *]').sort('-dateAdded').params({showTotalMatched: true, meta: 'full', count:25});
    	contacts.get().then(function(response){
    		output(syntaxHighlight(JSON.stringify(response, undefined, 4)));
    	});
    }

    $('.connect').onclick = connect;
    $('.candidates').onclick = getCandidates;
    $('.contacts').onclick = getContacts;

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

});
