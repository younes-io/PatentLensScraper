$( document ).ready(function() {
	$('#infoRegionInventor').hide();

	$.getJSON( "/patentspercountry", function ( data ) {
		WordCloud(
			$('#word_cloud')[0],
			{ 
				list: [['foo', 12], ['bar', 6], ['people', 28], ['smack', 21], ['heyy', 10], ['nice', 2], ['blank', 35]] 
			} 
		);
		console.log("US = " + data["US"]);
		createMap(data);
	});
		
	var createListForWordCloud = function () {
		
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
		        $('#infoRegionInventor').show();
		    }
		});
	}
});