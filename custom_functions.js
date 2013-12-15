exports.getCountry = function (value) {
    "use strict";
    
	var country = "";

    if ( (country = value.match(/,?\([A-Z]{2}\)$/g)) === null ) {
        country = "00";
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

        value = day + '/' + month + '/' + year;
    }

    return value;
};