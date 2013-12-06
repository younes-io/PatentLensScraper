var express = require('express');
var request	= require('request');
var http 	= require('http');
var path 	= require('path');

var url 	= require('url');
var cheerio = require('cheerio'); // builds the DOM tree
var fs 		= require('fs');
var libxmljs 	= require('libxmljs');


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


var server = http.createServer(app);
var io = require('socket.io').listen(server);

server.listen(8080);

var numberFiles = 0;

//io.sockets.emit('number', {numberOfFiles: numberFiles});

app.post('/search', function(req, res){

	numberFiles = 0;
	var keyword	= req.body.search;	// The search keyword
	var pageLength = 10;	// Number of results per page

	for(var i = 0; i < 2; i++) {	// FROM PAGE 0 TO PAGE 364
		// The results' page URL
		var urlString =	"http://www.patentlens.net/patentlens/expert.html?query=" + keyword + "&stemming=true&language=en&collections=US_B,EP_B,AU_B,US_A,WO_A&publicationFilingDateType=published&publicationFilingDateFrom=2013-01-01&publicationFilingDateTo=2013-11-13&pageLength=" + pageLength + "&sortBy=publication_date&reverse=true&pageNumber="+i;
		var returnTo = url.parse(urlString, true);
		var max = i + 1;
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

app.post('/xmlconvert', function(req, res){

	 numberFiles = 20;
	var arr = ["Title", "Applicants/Inventors", "Inventors", "Applicants", "Assignees", "Agents", "Abstract", "Filing Date", "Publication Date", "IPC", "Application Number", "Application Number", "PCT Publication"];
	console.log("XML STARTING !!!");
	console.log(numberFiles);

	var doc = new libxmljs.Document();
	var pat = doc.node('patents');
	for(var i = 1; i <= numberFiles; i++){

		var pathFile = __dirname + '/results/result_'+ i +'.html';
		var pathFileWrite = __dirname + '/XMLresults/results.xml';

		var XMLcontent = "";

		fs.readFile(pathFile, 'utf8', function (err, data) {
		  	if (err) throw err;

		  	$ = cheerio.load(data);

		  	var idPatent = $('.idPatent').text();
		  	var patent = pat.node('patent').attr({num: ++i-numberFiles-1}).attr({id: idPatent});

		  	$('.container div dl').children().each(function(index, elem){

		  		if( ( $(this)[0].name == 'dt' ) && ( arr.indexOf($(this).text()) != -1 ) ) {

		  			var key = $(this).text().trim().replace(' ', '').replace('/','And');

		  			var array = ["Inventors", "Assignees", "Agents", "Applicants", "ApplicantsAndInventors"];

		  			if( array.indexOf(key) !=-1 ) {	// Inventors & Assignees processing
		  				var keyNode = patent.node(key);	//Inventors node
		  				
			  			$(this).nextAll().each(function(index, elem){
			  				if( $(this)[0].name != 'dd') return false;
			  				if( $(this)[0].name == 'dd' ) {
			  					var value = $(this).text().trim();// Inventor's value for instance
			  					var country = value.match(/\(.*\)/gi).toString().replace('(','').replace(')','');	// => US
			  					var fullName = value.match(/^[^\d]*,/gi).toString().trim().replace(/,$/gi,'');	//Full name of Inventor / Agent...
				  				var address = value.match(/,[^,]*\(.{2}\)/gi).toString().replace(/^./gi,'').replace(/.{4}$/gi,'').trim();
				  				var namePart = keyNode.name().replace(/.$/,'').replace(/sA/,'A');//.replace(/.*(.)/g,'');	// The inventor tag
				  				keyNode.node(namePart, value);	
			  				}
			  			});	
		  			} else {
		  				var value = $(this).next().text().trim();
		  				patent.node(key, value);
		  			}	
		  		}
		  	});

			XMLcontent = doc.toString();
			fs.writeFileSync(pathFileWrite, XMLcontent);
			console.log("Processing file...");
		});
	}
	res.json(null);
});

app.get('/', function(req, res) {
	res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});