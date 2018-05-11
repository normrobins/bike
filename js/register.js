/*
 * register page
 */

$(document).ready (function () {
	// isLoggedIn.php out=none, in=ret_status, ret_msg, isLoggedIn (yes/no), username
	$.post (server + "isLoggedIn.php")
	.done (function (response) {
		var resp = $.parseJSON (response);
		if (resp[0] == "OK" && resp[2]=="yes") {
			$('#register-btn').hide ();
		}
		else {
			$('#register-btn').show ();
		}
	})
	.fail (function (response) {
		$('#register-msg').html ("Error").show ();
		$('#register-btn').hide ();
	});

	/* how to load google api without exposing KEY????

	$.getJSON (server + 'googlePlacesAutocompleteKey.json', function (data) {
		var script = document.createElement ('script');
		script.setAttribute ('type', 'text/javascript');
		// script.setAttribute ('defer', 'defer');
		// script.setAttribute ('async', 'async');
		script.setAttribute ('src','https://maps.googleapis.com/maps/api/js?key=' + data + '&callback=initAutocomplete');
		document.getElementsByTagName("head")[0].appendChild(script);

	});
	*/

	// get user attributes - age, gender, ability
	// [OK|NOTOK,message],[[id,gender],[id,gender]..],[[id,age],...],[[id,ability],...]
	$.post (server + 'getUserAttributes.php')
	.done (function (response) {
		var resp = $.parseJSON(response);
		if (resp[0][0] == 'OK') {
			// select-gender
			var arr = resp[1];
			for (x = 0; x < arr.length; x++) {
				$('#select-gender').append($('<option/>', { 
					value: arr[x][0],
					text : arr[x][1] 
				}));
			}  
	
			// select-ages
			arr = resp[2];
			for (x = 0; x < arr.length; x++) {
				$('#select-age').append($('<option/>', { 
					value: arr[x][0],
					text : arr[x][1] 
				}));
			}
			// select-ability
			arr = resp[3];
			for (x = 0; x < arr.length; x++) {
				$('#select-ability').append($('<option/>', { 
					value: arr[x][0],
					text : arr[x][1] 
				}));
			}
		
		} else {
			// resp=NOTOK
			$('#register-msg').html ('Error getting attributes').show();
			$('#register-btn').hide();
		}
	})
	.fail (function () {
		$('#register-msg').html ('Failed to get attributes').show();
		$('#register-btn').hide();
	});

	// Bike Manufacturers typeahead
	var bike_manufacturers = new Bloodhound({
		datumTokenizer: Bloodhound.tokenizers.whitespace,
		queryTokenizer: Bloodhound.tokenizers.whitespace,
		/*
		prefetch: {
			url: 'server/bike_manufacturers.json',
			cache: false 
			}
			*/
		remote: {
			url: './server/getBikeManufacturers.php?q=',
			prepare: function (query, settings) {
				settings.url += encodeURIComponent($('#bike-manufacturer-input').val());
				return settings;
			},
			cache: false
		}
	});

	$('#bike-manufacturer .typeahead').typeahead({
				hint: true,
				highlight: true,
				minLength: 2
			},
			{
				// name: 'name',
				display: 'value',
				source: bike_manufacturers.ttAdapter()
				// source: bike_manufacturers
			}
	);

	// Bike Models typeahead
	var bike_models = new Bloodhound({
		datumTokenizer: Bloodhound.tokenizers.whitespace,
		queryTokenizer: Bloodhound.tokenizers.whitespace,
		/*
		prefetch: {
			url: 'server/bike_manufacturers.json',
			cache: false 
			}
		*/
		remote: {
			url: './server/getBikeModels.php?man=',
			prepare: function (query, settings) {
				settings.url += encodeURIComponent($('#bike-manufacturer-input').val());
				settings.url += '&mod=';
				settings.url += encodeURIComponent($('#bike-model-input').val());
				return settings;
			},
			cache: false
		}
	});

	$('#bike-model .typeahead').typeahead({
				hint: true,
				highlight: true,
				minLength: 1
			},
			{
				// name: 'name',
				display: 'value',
				source: bike_models.ttAdapter()
				// source: bike_models
			}
	);
	return false;
});

// register a user

function register () {
	// show message to say it is working
	$('#register-msg').html ('Registering...').show ();

	// check fields
	var username = $.trim ($('#username').val());
	var password = $.trim ($('#password').val());
	var password1 = $.trim ($('#password1').val());
	var firstname = $.trim ($('#firstname').val());
	var lastname = $.trim ($('#lastname').val());
	var email = $.trim ($('#email').val());
	var phone = $.trim ($('#phone').val());
	var location = $('#location').val();
	var lat = $('#location').data('lat');
	var lng = $('#location').data('lng');
	var age = $('#select-age').val();
	var gender = $('#select-gender').val();
	var ability = $('#select-ability').val();
	var bike_manufacturer = $.trim ($('#bike-manufacturer-input').val());
	var bike_model = $.trim ($('#bike-model-input').val());
	var bike_year = $.trim ($('#bike-year-input').val());
	var bio = $.trim ($('#bio').val());
	var agree = ($('#agree-btn').prop('checked') ? true : false );

	if (password != password1) {
		$('#register-msg').html("Passwords don't match").show();
		return false;
	}

	var err = false;
	var err_msg = "Check: ";
	if (username.length == 0) {err_msg+="Username"; err=true;}
	if (password.length == 0) {if(err) {err_msg+=", ";}err_msg+="Password"; err=true;}
	// if (password1.length == 0) {if(err) {err_msg+=", ";}err_msg+="Password Re-enter"; err=true;}
	if (firstname.length == 0) {if(err) {err_msg+=", ";}err_msg+="Firstname"; err=true;}
	if (lastname.length == 0) {if(err) {err_msg+=", ";}err_msg+="Lastname"; err=true;}
	if ((location == '') || (lat == '0') || (lng == '0')) {if(err) {err_msg+=", ";}err_msg+="Location"; err=true;}
	if (email.length == 0) {if(err) {err_msg+=", ";}err_msg+="Email"; err=true;}
	if (!agree) {if(err) {err_msg+=", ";}err_msg+="AGREE TO TERMS"; err=true;}
	
	if (!validateEmail(email)) {
		if (err) {err_msg += ', ';}
		err_msg += 'Email format';
		err = true;
	}
	if (err) {
		$('#register-msg').html(err_msg).show();
		return false;
	}

	// data seems OK register.php returns status OK|NOTOK, message
	$.post (server + "register.php", {username:username,
				password:password,
				firstname:firstname,
				lastname:lastname,
				email:email,
				phone:phone,
				location:location,
				lat:lat,
				lng:lng,
				age:age,
				gender:gender,
				ability:ability,
				bio:bio,
				bike_manufacturer:bike_manufacturer,
				bike_model:bike_model,
				bike_year:bike_year
				})
	.done (function (response) {
		try {
			var resp = $.parseJSON (response);
			if (resp[0] == "OK") {
				$('#register-msg').html ('A validation email has been sent to you. <span class="highlight-warning">Check your spam folder as well</span>').show ();
			} else {
				$('#register-msg').html ('NOTOK:' + resp[1]).show ();
			}
		} catch (e) {
			alert (response);
		}
	})
	.fail (function (response) {
		$('#register-msg').html ("Darn. Something went wrong").show ();
	});

	return false;
}

function initAutocomplete() {
	var map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: -33.8688, lng: 151.2195},
		zoom: 13,
		mapTypeId: 'roadmap'
	});

	// Create the search box and link it to the UI element.
	var input = document.getElementById('location');
	var searchBox = new google.maps.places.SearchBox(input);

	// ####### commented out this line so the input control can display without a map
	// map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

	// Bias the SearchBox results towards current map's viewport.
	/*********
	map.addListener('bounds_changed', function() {
		searchBox.setBounds(map.getBounds());
	});

	*/
	// var markers = [];

	// Listen for the event fired when the user selects a prediction and retrieve
	// more details for that place.
	searchBox.addListener('places_changed', function() {
		var places = searchBox.getPlaces();

		if ((!places) || (places.length == 0)) {
			$('#location').data('lat','0');
			$('#location').data('lng','0');
			return;
		}

		// store latlng in pac-input data
		var lat = places[0].geometry.location.lat();
		var lng = places[0].geometry.location.lng();
		$('#location').data('lat',lat);
		$('#location').data('lng',lng);

		/*
		// Clear out the old markers.
		markers.forEach(function(marker) {
			marker.setMap(null);
		});
		markers = [];

		// For each place, get the icon, name and location.
		var bounds = new google.maps.LatLngBounds();
		places.forEach(function(place) {
			if (!place.geometry) {
				console.log("Returned place contains no geometry");
				return;
			}
			var icon = {
				url: place.icon,
				size: new google.maps.Size(71, 71),
				origin: new google.maps.Point(0, 0),
				anchor: new google.maps.Point(17, 34),
				scaledSize: new google.maps.Size(25, 25)
			};

			// Create a marker for each place.
			markers.push(new google.maps.Marker({
				map: map,
				icon: icon,
				title: place.name,
				position: place.geometry.location
			}));

			if (place.geometry.viewport) {
				// Only geocodes have viewport.
				bounds.union(place.geometry.viewport);
			} else {
				bounds.extend(place.geometry.location);
			}
		});
		map.fitBounds(bounds);
		*/
	});
}
