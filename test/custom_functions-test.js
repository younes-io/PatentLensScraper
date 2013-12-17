var expect = require('chai').expect;
var custom = require('../custom_functions.js');


describe('All tests', function(){

	describe('getCountry() Test', function(){
		var value = "KADAMBI, Geeta, Riddhi IP LLC Patent Agent 43526 Gallegos Avenue Fremont, CA 94539 (US)";
		var country = custom.getCountry(value);
		expect(country).to.equal("US");
	});

	describe('getFullName() Test', function(){
		var value = "KADAMBI, Geeta, Riddhi IP LLC Patent Agent 43526 Gallegos Avenue Fremont, CA 94539 (US)";
		var fullName = custom.getFullName(value);
		expect(fullName).to.equal("KADAMBI, Geeta");
	});

	describe('getValueSingleChild() Test#1', function(){
		var value = "METHOD, PROCESS AND SYSTEM TO ATOMICALLY STRUCTURE VARIED DATA AND TRANSFORM INTO CONTEXT ASSOCIATED DATA";
		var result = custom.getValueSingleChild(value, "Title");
		expect(result).to.equal(value);
	});

	describe('getValueSingleChild() Test#2', function(){
		var value = "Oct 26, 2012";
		var result = custom.getValueSingleChild(value, "FilingDate");
		expect(result).to.equal("2012/10/26");
	});
	
});

