/**
 * Module dependencies.
 */

var express = require('express');
var request	= require('request');
var http 	= require('http');
var path 	= require('path');

var url = require('url');
var cheerio = require('cheerio'); // builds the DOM tree
var fs = require('fs');

var app = express();



// all environments

app.configure(function() {
	app.use(express.static(__dirname + '/public')); 		// set the static files location /public/img will be /img for users
	app.use(express.logger('dev')); 						// log every request to the console
	app.use(express.bodyParser()); 							// pull information from html in POST
	app.use(express.methodOverride()); 						// simulate DELETE and PUT
	app.use(express.json());
	app.use(express.urlencoded());
	app.use(app.router);
});

// app.listen(8080);
// console.log("App listening on port 8080");


var server = http.createServer(app);
var io = require('socket.io').listen(server);

server.listen(8080);

var numberFiles = 1;

app.post('/search', function(req, res){

	var keyword	= req.body.search;	//var keyword = "RFID";	// The search keyword
	
	for(var i = 0; i < 2; i++) {	// FROM PAGE 0 TO PAGE 364
		// The results' page URL
		var urlString =	"http://www.patentlens.net/patentlens/expert.html?query=" + keyword + "&stemming=true&language=en&collections=US_B,EP_B,AU_B,US_A&publicationFilingDateType=published&publicationFilingDateFrom=2010-01-01&publicationFilingDateTo=2013-11-13&pageLength=100&sortBy=publication_date&reverse=true&pageNumber="+i;
		
		request(urlString, function(err, resp, body) {
		    if (err) throw err;

		    // We load the DOM tree of the results page into the variable $
		    $ = cheerio.load(body);
			
			// We get the link of every patent in this loop
		 	$('.searchResult a').each(function(){
		 		// We build the patent Full Text URL
		 		var urlF = "http://www.patentlens.net/patentlens/" + $(this).attr('href');
				var url_parts = url.parse(urlF, true).query;
				var patnum = url_parts.patnums;
				var urlNew = "http://www.patentlens.net/patentlens/fulltext.html?patnum=" + patnum + "&language=en&query=" + keyword + "&stemming=true&pid=p0";
				
				request(urlNew, function(err, resp, body) {
					// We load the DOM tree of the patent page into the variable $$
					$$ = cheerio.load(body);

					var pathFile = __dirname + '/results/result_'+ numberFiles +'.html';
					var $dataRetrieved = $$('#contents');
					// The HTML content of the patent page is put into $dataRetrieved then written in the file pathFile/
					fs.writeFile(pathFile, $dataRetrieved, function (err) {
						if (err) throw err;
						console.log("File saved in " + pathFile);
					});
					numberFiles++;
				});
		 	});
		});
	}
});

io.sockets.on('connection', function (socket) {
	socket.on('next', function (data) {
		socket.emit('number', {
			numberOfFiles: numberFiles
		});
	});
});

app.get('/', function(req, res) {
	res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});


