import {QueryString} from 'bullhornjs';

describe('QueryString', function() {
    it('should add params correctly', function() {
        var query = new QueryString('http://test.com', {
            one: 1,
            two: 'two',
            three: true
        });
        expect(query.toString()).toEqual('http://test.com?one=1&two=two&three=true');
    });
});
