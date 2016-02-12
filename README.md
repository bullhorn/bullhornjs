# BullhornJS

BullhornJS is a micro-library that makes it easy to use the Bullhorn REST APIs in JavaScript applications.
BullhornJS allows you to easily login into Bullhorn using OAuth, and to manipulate your Bullhorn data using a simple
API.

This is an early version. I appreciate any feedback, comments, and help if you think this library is useful.

### Key Characteristics

- No jQuery dependency
- Plain JavaScript
- Works transparently in the browser
- Simple API to manipulate data (create, update, delete, upsert)

### Installation

##### NPM

    npm install --save bullhornjs

##### Bower

    bower install --save bullhornjs

### Usage

1. Initialize
```
var bullhorn = new Bullhorn({
    BhRestToken: '~BULLHORN_REST_TOKEN~',
    restUrl: '~BULLHORN_REST_URL~',
});
```

2. Check if logged in:
```
bullhorn.isLoggedIn()
    .then(function(success){
        alert('Login success: ' + success);
    })
    .catch(function(error){
        alert('Error: ' + error.message);
    });
```

3. Invoke a function: Search(), Query(), Entity(), Meta():
```
// Most functions are all fluent (ie. they return 'this')
var job = new Entity('entity/JobOrder').fields('title');
// the 'fields' function created a getter and setter for 'title'
job.title = 'My New Job';
job.save(); //returns a promise
```

4. Use a convenience method: CandidateSearch(), JobOrder(), ContactMeta(), etc...:
```
// This command creates the convenience functions
Bullhorn.initDefaults();
// Now you can use them
var job = new Job().fields('title'); //works the same as above
job.get(123).then(function(response){
    console.log('Job Title is ', job.title);
});
```

### Sample App

Check out the demo in the `demo` folder. To run the demo:

```
> git clone https://github.com/bullhorn/bullhornjs.git
> cd bullhornjs
> npm install
> npm run bundle
> npm install -g http-server
> http-server
```

open `localhost:8080/demo` in your browser

### Server

Because the browser should not know your `CLIENT_ID` or `CLIENT_SECRET` your will need to handle the OAuth flow separately then have the server provide the `BhRestToken` and `restUrl` to the client.
