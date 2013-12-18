var async = require('async');

exports.getCountry = function (value) {
    "use strict";
    
	var country = "";

    if ( (country = value.match(/,?\([A-Z]{2}\)$/g)) === null ) {
        country = "US";
    } else {
        country = value.match(/,?\([A-Z]{2}\)$/g).toString().replace(',','').replace('(', '').replace(')', '');   // => US
    }

    return country;
};

exports.getFullName = function ( value ) {
    "use strict";
    
	var fullName = "";

    if ( (fullName = value.match(/^[^\d]*,/gi)) === null ) {
            fullName = value.match(/^[^,]*,/gi).toString().trim().replace(/,$/gi, '');
    } else {
        fullName = value.match(/^[^\d]*,/gi).toString().trim().replace(/,$/gi, '');  //Full name of Inventor / Agent...
    }

    return fullName;
};

exports.getValueSingleChild = function( value, key ) {
    "use strict";
    
	var isKeyADate = ( key === 'PublicationDate' || key === 'FilingDate' );
    
    if (isKeyADate) {
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
        var day = value.match(/[^ ]*,/gi).toString().replace(',', '');
        var mon = value.match(/^[A-za-z]{3} /gi).toString().trim();
        var month = months.indexOf(mon) + 1;
        var year = value.match(/[0-9]{4}$/gi);

        value = year + '/' + month + '/' + day;
    }

    return value;
};

exports.titleToKeywords = function ( title ) {
  var keywordsTitle = new Array();
  
  title = title.toLowerCase();
  var string = title.replace(new RegExp(/[^-a-zA-Z, ]/gi), "").replace(',', ' ');
  keywordsTitle = string.split(' ');
  
  return keywordsTitle;
}

exports.range = function (low, high, step) {
  // From: http://phpjs.org/functions
  // +   original by: Waldo Malqui Silva
  // *     example 1: range ( 0, 12 );
  // *     returns 1: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  // *     example 2: range( 0, 100, 10 );
  // *     returns 2: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
  // *     example 3: range( 'a', 'i' );
  // *     returns 3: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i']
  // *     example 4: range( 'c', 'a' );
  // *     returns 4: ['c', 'b', 'a']
  var matrix = [];
  var inival, endval, plus;
  var walker = step || 1;
  var chars = false;

  if (!isNaN(low) && !isNaN(high)) {
    inival = low;
    endval = high;
  } else if (isNaN(low) && isNaN(high)) {
    chars = true;
    inival = low.charCodeAt(0);
    endval = high.charCodeAt(0);
  } else {
    inival = (isNaN(low) ? 0 : low);
    endval = (isNaN(high) ? 0 : high);
  }

  plus = ((inival > endval) ? false : true);
  if (plus) {
    while (inival <= endval) {
      matrix.push(((chars) ? String.fromCharCode(inival) : inival));
      inival += walker;
    }
  } else {
    while (inival >= endval) {
      matrix.push(((chars) ? String.fromCharCode(inival) : inival));
      inival -= walker;
    }
  }

  return matrix;
};

exports.async = async;