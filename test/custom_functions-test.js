var expect = require('chai').expect;
var custom = require('../custom_functions.js');


describe('All tests', function(){
	describe('getCountry() Test', function(){
		var value = "KADAMBI, Geeta, Riddhi IP LLC Patent Agent 43526 Gallegos Avenue Fremont, CA 94539 (US)";
		var country = custom.getCountry(value);
		expect(country).to.equal("US");
	})
});

