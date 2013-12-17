var express = require('express');
var request	= require('request');
var http = require('http');
var path = require('path');

var url = require('url');
var cheerio = require('cheerio'); // builds the DOM tree
var fs = require('fs');
var libxmljs = require('libxmljs');
var xml2js = require('xml2js');
var parser = xml2js.Parser();

var async = require('async');

var custom = require('./custom_functions.js');   // CUSTOM MODULE

// DATABASE DECLARING VARIABLES

// mongoose.connect('mongodb://localhost/test_sid');
var database = require('./database.js');
var mongoose = database.mongoose;
var db = mongoose.connection;

var Country = database.Country;
var Applicant = database.Applicant;
var Inventor = database.Inventor;
var Patent = database.Patent;
var PatentApplicant = database.PatentApplicant;
var PatentInventor = database.PatentInventor;

var app = express();

// all environments

app.configure(function () {
	"use strict";
    app.use(express.static(__dirname + '/public')); 		// set the static files location /public/img will be /img for users
    app.use(express.logger('dev')); 						// log every request to the console
	app.use(express.bodyParser()); 							// pull information from html in POST
	app.use(express.methodOverride()); 						// simulate DELETE and PUT
    app.use(express.json());
    app.use(express.urlencoded());
	app.use(app.router);
});


var server = http.createServer(app);
var io = require('socket.io').listen(server);

server.listen(8080);

var numberFiles = 0;

//io.sockets.emit('number', {numberOfFiles: numberFiles});

app.post('/search', function (req, res){
    "use strict";

	numberFiles = 0;
	var keyword	= req.body.search;	// The search keyword
	var pageLength = 100;	// Number of results per page

	for(var i = 0; i < 15; i++) {	// FROM PAGE 0 TO PAGE 364
		// The results' page URL
		var urlString =	"http://www.patentlens.net/patentlens/expert.html?query=" + keyword + "&stemming=true&language=en&collections=US_B,EP_B,AU_B,US_A,WO_A&publicationFilingDateType=published&publicationFilingDateFrom=2013-01-01&publicationFilingDateTo=2013-11-13&pageLength=" + pageLength + "&sortBy=publication_date&reverse=true&pageNumber="+i;
		var returnTo = url.parse(urlString, true);
		var max = i + 1;
		request(urlString, function(err, resp, body) {
		    if (err) throw err;

		    // We load the DOM tree of the results page into the variable $
		    var $ = cheerio.load(body);
			
			// We get the link of every patent in this loop
		 	$('.searchResult a').each(function(){
		 		// We build the patent Full Text URL
		 		var urlF = "http://www.patentlens.net/patentlens/" + $(this).attr('href');
				var url_parts = url.parse(urlF, true).query;
				var patnum = url_parts.patnums;
				//var urlNew = "http://www.patentlens.net/patentlens/fulltext.html?patnum=" + patnum + "&language=en&query=" + keyword + "&stemming=true&pid=p0";
				var urlNew = "http://www.patentlens.net/patentlens/frontpage.html?patnum=" + patnum + "&language=en&query=" + keyword + "&stemming=true&returnTo=expert.html" + returnTo.search + "&pid=p0";
				urlNew = url.format(urlNew);	//only used with FRONTPAGE (required by returnTo param)
				
				request(urlNew, function(err, resp, body) {
					// We load the DOM tree of the patent page into the variable $$
					$$ = cheerio.load(body);
					numberFiles++;
					var pathFile = __dirname + '/results/result_'+ numberFiles + '.html';
					var $dataRetrieved = $$('.container') + '<div class="idPatent">' + patnum + '</div>' ;
					// The HTML content of the patent page is put into $dataRetrieved then written in the file pathFile/
					fs.writeFile(pathFile, $dataRetrieved, function (err) {
						if (err) throw err;
						console.log("File saved in " + pathFile);
					});
					if (numberFiles < (pageLength * max) ){
						checkSearch = true;
					} else {
						checkSearch = false;
					}
					io.sockets.emit('number', {numberOfFiles: numberFiles, check: checkSearch});
				});
		 	});
		});
	}
	//numberFiles = 0; //io.sockets.emit('number', {numberOfFiles: numberFiles});
	res.json(null);
});

app.post('/xmlconvert', function (req, res){
    "use strict";

	var directoryPath = __dirname + '/results/';
    var times = 0;

	fs.readdir( directoryPath, function( error, files ) {
        if ( error ) {
            console.log("Error listing file contents.");
        } else {
            var arr = ["Title", "Applicants/Inventors", "Inventors", "Applicants", "Assignees", "Agents", "Abstract", "Filing Date", "Publication Date", "Application Number"];
            var pathFileWrite = __dirname + '/XMLresults/results.xml';
            var XMLcontent = "";
            var doc = new libxmljs.Document();
            var pat = doc.node('patents');

            console.log("XML STARTING !!!");
            console.log(directoryPath);

            // This function repeatedly calls itself until the files are all read.
            var readFiles = function(i) {
                if ( i == files.length ) {
                    // we are done.
                    console.log( "Done reading " + (files.length - times -1)  + " files.");

                } else {
                	var nameFile = files[i].match(/^\..*$/gi);

                	if (nameFile !== null) {
                        times++;
                        console.log(times);
                    } else {
                        // ++times; console.log(times + " : " + nameFile);

                        fs.readFile( directoryPath + files[i], function( error, dataF ) {
                            if ( error ) {
                                console.log( "Error reading file. ", error );
                                console.log("ERROR : File => " + files[i]);
                            } else {
                                console.log("Proceeding file... " + files[i] );
                                var $ = cheerio.load(dataF);

                                var idPatent = $('.idPatent').text();
                                var patent = pat.node('patent').attr({num: i}).attr({id: idPatent});

                                // We loop over all the dt nodes
                                $('.container div dl').children().each(function(index, elem){

                                    if ( ( $(this)[0].name == 'dt' ) && ( arr.indexOf($(this).text()) != -1 ) ) {

                                        var key = $(this).text().trim().replace(' ', '').replace('/','And');    // Inventors/Applicants => InventorsAndApplicants
                                        // var array = ["Inventors", "Assignees", "Applicants", "ApplicantsAndInventors"]; // in case there are many inventors OR agents OR Applicants...
                                        var array = new Array("Inventors", "Assignees", "Applicants", "ApplicantsAndInventors");

                                        if( array.indexOf(key) !== -1 ) { // Inventors & Assignees processing
                                            var keyNode = patent.node(key); //Inventors node
                                            
                                            $(this).nextAll().each(function(index, elem){
                                                if ( $(this)[0].name != 'dd') // if we reach an element with a different tagName, we get out of the loop
                                                    return false;

                                                if ( $(this)[0].name == 'dd' ) { // in case the following elements are many and have the same tagName

                                                    var value = $(this).text().trim();// Inventor's value for instance

                                                    // GET FULLNAME
                                                    var fullName = custom.getFullName(value);
                                                    // GET COUNTRY
                                                    var country = custom.getCountry(value);
                                                    
                                                    var namePart = keyNode.name().replace(/.$/,'').replace(/sA/,'A');//.replace(/.*(.)/g,'');   // The inventor tag
                                                    var namePartNode = keyNode.node(namePart);

                                                    namePartNode.node('FullName',fullName);
                                                    namePartNode.node('Country',country);
                                                }
                                            }); 
                                        } else {    // in case the element doesn't have children
                                            var value = $(this).next().text().trim();
                                            value = custom.getValueSingleChild(value, key);
                                            patent.node(key, value);
                                        }   
                                    }
                                });
                                // Finally, we write the XML code into a file
                                XMLcontent = doc.toString();
                                fs.writeFileSync(pathFileWrite, XMLcontent);
                                console.log("Writing XML file... " + files[i] );
                            }
                        });
                    }
                    readFiles(i+1);
                }
            };
            readFiles(1);
        }
    });
	res.json(null);
});

app.post('/jsonconvert', function (req, res) {
    "use strict";

    var pathXML = __dirname + '/XMLresults/results.xml';
    var JSONFilePath = __dirname + '/JSONresults/results.json';
    var XMLContent = fs.readFileSync(pathXML, 'utf-8');

    parser.parseString(XMLContent, function (err, result) {
        fs.writeFileSync(JSONFilePath, JSON.stringify(result));
    });
    
    // CREATING THE MONGODB SCHEMA & MODELS
        var JSONContent = fs.readFileSync(JSONFilePath, 'utf-8');
        var data = JSON.parse(JSONContent);
        var patents = data["patents"]["patent"];
        var dataLength = patents.length;
        console.log(dataLength);

        //
        var indexes = custom.range(0, 1005);
        // PATENTS SAVING 
        async.eachSeries(
            indexes,
            function (index, callback) {
                var datePub = patents[index]["PublicationDate"][0].replace('/','-');
                var abstractVal = patents[index]["Abstract"] ? patents[index]["Abstract"][0] : "";
                var patent = new Patent({
                    _id: parseInt(patents[index]["$"]["num"]),
                    title: patents[index]["Title"][0],
                    abstractPatent: abstractVal,
                    publicationDate: new Date(datePub)
                });
                patent.save();
                console.log("Patent #" + index);
                callback();
            },
            function (err) {
                console.log(err);
            }
        );
        // COUNTRIES, APPLICANTS & INVENTORS / PATENTS SAVING
        async.eachSeries(
            indexes,
            function (index, callback) {
                var array = new Array("ApplicantsAndInventors", "Inventors", "Applicants", "Assignees");

                async.eachSeries(
                    array,
                    function (element, callback) {
                        if (element) {
                            var value = element.replace(/.$/,'').replace(/sA/,'A'); // e.g. value === 'ApplicantAndInventor'
                            console.log(value);

                            if( (patents[index] !== undefined) && (patents[index][element] !== undefined) ) {

                                async.eachSeries(
                                    patents[index][element][0][value],
                                    function (elem, callback) {
                                        if (elem) {
                                            // SAVE COUNTRY
                                            Country.findOne({ _id: elem["Country"][0] }, function(err, country){
                                                if(err)
                                                    console.log("Error Country !");
                                                if(country === null) {
                                                    Country({ _id: elem["Country"][0] }).save();
                                                }
                                            });
                                            console.log("Country Added !");
                                            // The function that adds an Applicant + The PatentApplicant
                                            var applicantFunc = function() {
                                                Applicant.findOne({ _id: elem["FullName"][0] }, function(err, applicant){
                                                    if(err)
                                                        console.log("Error Applicant !");
                                                    if(applicant === null || applicant === undefined ) {
                                                        applicant = new Applicant({ _id: elem["FullName"][0], country: elem["Country"][0] });
                                                        applicant.save();
                                                    }
                                                    var num = parseInt(patents[index]["$"]["num"]);
                                                    var datePub = patents[index]["PublicationDate"][0].replace('/','-');
                                                    var pays = elem["Country"][0];
                                                    var patentApplicant = new PatentApplicant({
                                                        patentId: num,
                                                        applicant: applicant["_id"],
                                                        country: pays,
                                                        dateP: new Date(datePub)
                                                    });
                                                    patentApplicant.save();
                                                    console.log("Added Applicant !");
                                                });
                                            }
                                            // The function that adds an Inventor + The PatentInventor
                                            var inventorFunc = function() {
                                                Inventor.findOne({ _id: elem["FullName"][0] }, function(err, inventor){
                                                    if(err)
                                                        console.log("Error Inventor !");
                                                    if(inventor === null || inventor === undefined) {
                                                        var inventor = new Inventor({ _id: elem["FullName"][0], country: elem["Country"][0] });
                                                        inventor.save();
                                                        var num = parseInt(patents[index]["$"]["num"]);
                                                        var pays = elem["Country"][0];
                                                        var patentInventor = new PatentInventor({
                                                            patentId: num,
                                                            country: pays,
                                                            inventor: elem["FullName"][0]
                                                        });
                                                        patentInventor.save();
                                                        console.log("Added Inventor !");
                                                    }
                                                }); 
                                            }

                                            // SAVE INVENTORS & APPLICANTS
                                            switch(value) {
                                                case "ApplicantAndInventor" :
                                                    applicantFunc();
                                                    inventorFunc();
                                                    break;
                                                case "Applicant" :
                                                case "Assignee" :
                                                    applicantFunc();
                                                    break;
                                                case "Inventor" :
                                                    inventorFunc();
                                                    break;
                                            }

                                            console.log("END OF SWITCH !");
                                        }
                                        callback();
                                    },
                                    function (err) {
                                        console.log(err);
                                    }
                                );
                            }
                        }
                        callback();
                    },
                    function (err) {
                        console.log(err);
                    }
                );
                callback();
            },
            function (err) {
                console.log(err);
            }
        ); 
        // 
    

    res.json(null);
});

app.get('/reporting', function (req, res) {
    res.sendfile('./public/reporting.html');
});

app.get('/patentspercountry', function (req, res) {
    // RETRIEVING THE NUMBER OF INVENTORS PER COUNTRY
    Inventor.aggregate([
        {
            $project: {
                // _id: 0, // let's remove bson id's from request's result
                country: 1 // we need this field
            }
        },
        {
            $group: {
                _id: '$country', // grouping key - group by field country
                patentInventorsCount: { $sum: 1 }
            }
        },{
            $sort: {
                patentInventorsCount: -1
            }
        }
    ],  function (err, inventorsPerCountry) {
            console.log("Inventors per Country : " + inventorsPerCountry.length);
            // console.log(inventorsPerCountry);
            //
            var data = {};
            var indexes = custom.range(0, inventorsPerCountry.length - 1);
            async.eachSeries(
                indexes,
                function (index, callback) {
                    var country = inventorsPerCountry[index]["_id"].toLowerCase().toString();
                    data[country] = inventorsPerCountry[index]["patentInventorsCount"].toString();
                    callback();
                },
                function (err) {
                    console.log(err);
                }
            );
            res.json( data );
    });
});

app.get('/keywordsrank', function (req, res) {
    // KEYWORDS RANK
    var data = [];
    var keywords = [];

    Patent.find({}, { title: 1}, function (err, patents) {
    	console.log(patents[48]['title']);

    	var indexes = custom.range(0, patents.length - 1);
    	async.eachSeries(
    		indexes,
    		function (index, callback) {
    			data.push(patents[index]["title"]);
    			// console.log(index);
    			callback();
    		},
    		function (err) {
    			if (err) 
    				console.log(err);

		    	var string = data.join(',');
				string = string.replace(new RegExp(/ /gi), ',');
    			var array = string.replace(new RegExp(/[0-9:\/;()./?\\]/gi), "").toLowerCase().split(" ");
    			var intermediate = array.join(',');
    			res.send(intermediate.split(','));
    		}
    	);
    	
    });
});

app.get('/', function (req, res) {
	res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});