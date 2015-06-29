# BullhornJS

BullhornJS is a micro-library that makes it easy to use the Bullhorn REST APIs in JavaScript applications.
BullhornJS allows you to easily login to Bullhorn using OAuth, and to manipulate your Bullhorn data using a simple
API.

This is an early version. I appreciate any feedback, comments, and help if you think this library is useful.

### Key Characteristics

- No jQuery dependency
- Plain JavaScript
- Complete OAuth login workflow
- Works transparently in the browser
- Automatically refreshes OAuth access_token on expiration
- Simple API to manipulate data (create, update, delete, insert)
- CORS or JSONP support

### Usage

1. Initialize (Optional):

    BullhornJS is built to work out of the box with sensible defaults. **You only need to invoke bullhorn.init() if you want to override these defaults**:

    ```
    Bullhorn.init({
        clientId: '~BULLHORN_CLIENT_ID~',
        apiVersion: '*',
        authUrl: 'https://login.bullhorn.com'
    });
    ```

2. Login:
    ```
    bullhorn.authenticate(url).then(
        function(success){
            alert('Login success: ' + success);
        },function(error) {
            alert('Login failed: ' + error);
        });
    ```

3. Invoke a function: Search(), Query(), Entity(), Meta():
    ```
    var job = new Entity('entity/JobOrder').fields('title'); //most functions are all fluent
    job.title = 'My New Job'; //the 'fields' function created a getter and setter for 'title'
    job.save(); //returns a promise
    ```

4. Use a convenience method: CandidateSearch(), JobOrder(), ContactMeta(), etc.:
    ```
    var job = new Job().fields('title'); //works the same as above
    job.get(123).then(function(response){
        console.log('Job Title is ', job.title);
    });
    ```

### Sample App

Create a file named index.html anywhere on your file system:

```
<html>
<body>
<ul id="list"></ul>
<script src="bullhorn.js"></script>
<script>
var login = "BULLHORN_OAUTH_SERVER";
var bh = new Bullhorn();
bh.authenticate(login).then(function(ping){
    var me = Bullhorn.user.id;
    var js = new JobSearch()
        .fields('id', 'title')
        .params({count:20, showTotalMatched:true})
        .query('isDeleted:0 AND owner.id:' + me);

    js.run().then(function(response){
        var totalJobs = response.total;
        var jobs = js.records;
        var str = '';
        jobs.forEach(function(job, i){
            str += '<li>' + job.title + '</li>';
        });
        document.getElementById('list').innerHTML = str;
    });
});
</script>
</body>
</html>
```

### Server

Because of the browser's cross-origin restrictions, your JavaScript application hosted on your own server (or localhost) will not be able to make API calls directly to the *.bullhorn.com domain. The solution is to proxy your API calls through your own server. You can also use your own proxy server to provide an integrated development experience.
