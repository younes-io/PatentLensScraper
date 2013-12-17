$( document ).ready(function() {
	$('#infoRegionInventor').hide();

	$.getJSON( "/patentspercountry", function ( data ) {
		console.log("US = " + data["US"]);
		createMap(data);
	});
		
	$.getJSON("/keywordsgenerate", function ( data ) {
		// alert(data["filePath"]);
		createListForWordCloud( data );
		
	});

	var createListForWordCloud = function ( data ) {
		WordCloud(
			$('#word_cloud')[0],
			{ 
				list: data.result,
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