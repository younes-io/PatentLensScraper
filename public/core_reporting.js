$( document ).ready(function() {
	$('#infoRegionInventor').hide();
	
	$.getJSON( "/inventorspercountry", function ( data ) {
		createMap(data);
	});

	$.getJSON("/keywordsgenerate", function ( data ) {
		createListForWordCloud( data.result );
		createTopTenKeywordsPieChart( data.chart );
	});

	$.getJSON("/toptenauthours", function ( data ) {
		createTopTenAuthoursColumnChart(data);
	});

	var createTopTenKeywordsPieChart = function ( data ) {
		$(function () {
		    $('#toptenkeywords').highcharts({
		        chart: {
		            plotBackgroundColor: null,
		            plotBorderWidth: null,
		            plotShadow: false
		        },
		        credits: {
		        	enabled: false
		        },
		        title: {
		            text: 'Classement des TOP 10 mots-clés'
		        },
		        tooltip: {
		    	    pointFormat: '<b>{series.name}: {point.percentage:.1f}%</b>'
		        },
		        plotOptions: {
		            pie: {
		                allowPointSelect: true,
		                cursor: 'pointer',
		                dataLabels: {
		                    enabled: true,
		                    color: '#000000',
		                    connectorColor: '#000000',
		                    format: '<b>{point.name}</b>: {point.percentage:.1f} %'
		                }
		            }
		        },
		        series: [{
		            type: 'pie',
		            name: '<b>Fréquance du mot-clé</b>',
		            data: data
		        }]
		    });
		});
	}

	var createTopTenAuthoursColumnChart = function ( data ) {
		$('#toptenauthours').highcharts({
		    chart: {
		        type: 'column',
		        margin: [ 50, 50, 100, 80]
		    },
		    credits: {
		    	enabled: false,
		    	href: "https://github.com/younesherlock/PatentLensScraper",
		    	text: "PatentLensScraper"
		    },
		    title: {
		        text: 'Classement des TOP 10 auteurs'
		    },
		    xAxis: {
		        categories: data.categories,
		        labels: {
		            rotation: 0,
		            style: {
		                fontSize: '13px',
		                fontFamily: 'Verdana, sans-serif'
		            }
		        }
		    },
		    yAxis: {
		        min: 0,
		        title: {
		            text: 'Nombre de brevets publiés par auteur'
		        },
		        allowDecimals: false
		    },
		    legend: {
		        enabled: false
		    },
		    tooltip: {
		        pointFormat: 'Nombre de publications: <b>{point.y} brevets</b>',
		    },
		    series: [{
		        name: 'Brevets',
		        data: data.data,
		        dataLabels: {
		            enabled: true,
		            rotation: 0,
		            color: '#FFFFFF',
		            align: 'center',
		            x: 0,
		            y: 20,
		            style: {
		                fontSize: '10px',
		                fontFamily: 'Verdana, sans-serif',
		                textShadow: '0 0 3px black'
		            }
		        }
		    }]
		});
	}

	var createListForWordCloud = function ( data ) {
		WordCloud(
			$('#word_cloud')[0],
			{ 
				list: data
				// gridSize: 8,
				
			} 
		);
	}
	
	var createMap = function ( data ) {
		jQuery('#vmap').vectorMap(
		{
		    map: 'world_en',
		    values: data,
		    backgroundColor: '#a5bfdd',
		    borderColor: '#818181',
		    borderOpacity: 0.25,
		    borderWidth: 1,
		    color: '#f4f3f0',
		    enableZoom: true,
		    hoverColor: '#c9dfaf',
		    hoverOpacity: null,
		    normalizeFunction: 'linear',
		    scaleColors: ['#b6d6ff', '#005ace'],
		    selectedColor: '#c9dfaf',
		    selectedRegion: null,
		    showTooltip: true,
		    onRegionOver: function(element, code, region)
		    {	
		    	var count;
		    	if ( data[code.toLowerCase()] === undefined ) {
		        	count = 0;
		        } else {
		        	count = data[code.toLowerCase()];
		        }
		        $('#pays').html(region);
		        $('#nbrInventeus').html(count);
		        $('#infoRegionInventor').css('font-weight', 'bold').show();
		    }
		});
	}
});