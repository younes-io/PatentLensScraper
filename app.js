var express = require('express');
var app = express();

var url = require('url');
var request = require('request'); // downloads the html source code
var cheerio = require('cheerio'); // builds the DOM tree
var fs = require('fs');

app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static('public'));


var keyword = "RFID";

		/******	SCRAPING PATENT LENS *******/

var j = 0;

for(var i = 0; i < 1; i++) {	// Résultats jusqu'à la page 364
	// URL de la page des résultats
	var urlString =	"http://www.patentlens.net/patentlens/expert.html?query=" + keyword + "&stemming=true&language=en&collections=US_B,EP_B,AU_B,US_A&publicationFilingDateType=published&publicationFilingDateFrom=2010-01-01&publicationFilingDateTo=2013-11-13&pageLength=100&sortBy=publication_date&reverse=true&pageNumber="+i;
	

	request(urlString, function(err, resp, body) {
	    if (err) throw err;

	    // On charge l'arbre DOM de la page de recherche dans la variable $
	    $ = cheerio.load(body);
		
		// Les liens des brevets se trouvent dans des div de classe 'searchResult' : on les parcourt grâce à jQuery.each()
	 	$('.searchResult a').each(function(){
	 		// On construit l'URL du brevet en Full Text
	 		var urlF = "http://www.patentlens.net/patentlens/" + $(this).attr('href');
			var url_parts = url.parse(urlF, true).query;
			var patnum = url_parts.patnums;
			var urlNew = "http://www.patentlens.net/patentlens/fulltext.html?patnum=" + patnum + "&language=en&query=RFID&stemming=true&pid=p0";
			
			request(urlNew, function(err, resp, body) {
				// On charge l'arbre DOM de la page du brevet dans la variable $$
				$$ = cheerio.load(body);

				var pathFile = __dirname + '/results/result_'+ j +'.html';
				var $dataRetrieved = $$('#contents');
				// Le contenu HTML de la page du brevet est stocké dans la varible jQuery $dataRetrieved puis
				// écrit dans le fichier pathFile
				fs.writeFile(pathFile, $dataRetrieved, function (err) {
					if (err) throw err;
					console.log("File saved in " + pathFile);
				});
				j++;
			});
	 	});
	});

}



// app.get('/', function(req, res){
//   res.render('index.html.twig', {titre: "Wrapper"});
// });

app.listen(8080);