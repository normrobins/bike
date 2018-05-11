/*
 * Update Profile page
 * To get typeahead value I can't get .typeahead('val') to work so I take
 * the value of the associated input element instead. Applies to location & bike make and model
 */

$(document).ready (function () {
	// isLoggedIn.php out=none, in=ret_status, ret_msg, isLoggedIn (yes/no), username
	$.post (server + "isLoggedIn.php")
	.done (function (response) {
		var resp = $.parseJSON (response);
		if (resp[0] == "OK" && resp[2]=="yes") {
			setNavbar (true, resp[3], '');
			loadProfile ();
			loadBikeImages ();
		}
		else {
			$('#update-profile-msg').html ("Not logged in").show ();
			setNavbar (false, '', 'Something went wrong');
		}
	})
	.fail (function (response) {
		$('#update-profile-msg').html ("Failed").show ();
		setNavbar (false, '', 'Something failed');
	});

	// handler for delete profile image button
	$('#delete-profile-image-btn').on('click', function (e) {
		if ($(this).data('confirm') == '1') {
			var image_id = $(this).data('image-id');
			if (image_id == '0') {
				$(this).hide();
				return false;
			}
			var caller = $(this);
			$.post(server + "deleteImage.php", {image_id:image_id})
			.done (function(response) {
				var resp = $.parseJSON(response);
				if (resp[0] == 'OK') {
					var img_src = 'img/generic_user.png';
					$('#profile-image').attr('src',img_src);
					$('#profile-image-link').attr('href', '');
					caller.data('image-id','0');
					caller.html('Deleted').fadeOut('slow');
				}
			})
			.fail (function(response) {
				$('#del-btn'+image_id).html('Failed: ' + image_id);
			});
		} else {
			$(this).data('confirm','1');
			$(this).html('<strong>Confirm</strong>');
		}
		return false;
	});

	// append counties to the select-county item - no blank option
	var counties = getCounties(); // returns an array of counties
	$.each(counties, function (index, value) {
		$('#select-county').append($('<option/>', { 
			value: value,
			text : value 
		}));
	});  
	/*
	// constructs the suggestion engine for states (Counties at the moment)
	var states = new Bloodhound({
		datumTokenizer: Bloodhound.tokenizers.whitespace,
		queryTokenizer: Bloodhound.tokenizers.whitespace,
		prefetch: {url: 'server/counties.json',
			cache: false }
		// local: states
	});

	$('#location .typeahead').typeahead({
				hint: true,
				highlight: true,
				minLength: 1
			}, {
				// source: states
				source: states.ttAdapter()
			}
	);
	*/

	// Bike Manufacturers typeahead
	var bike_manufacturers = new Bloodhound({
		datumTokenizer: Bloodhound.tokenizers.whitespace,
		queryTokenizer: Bloodhound.tokenizers.whitespace,
		/*
		prefetch: {
			url: 'server/counties.json',
			cache: false 
			}
		*/
		remote: {
			url: server+'/getBikeManufacturers.php?q=',
			/*
			filter: function (resp) {
				alert(JSON.stringify(resp));
				return (resp);
			},
			*/
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
			url: server+'getBikeModels.php?man=',
			/*
			filter: function (resp) {
				alert (JSON.stringify(resp));
				return resp;
			},
			*/
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
				minLength: 2
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

/*
 * get all bike images for my profile
 * out = nothing
 * in = [[OK|NOTOK,msg],[[img_id, filepath/name][..]]]
 */
function loadBikeImages () {
	$.post(server + "getProfileBikeImages.php")
	.done (function (response) {
		var resp = $.parseJSON(response);
		if (resp[0][0] == 'OK') {
			var h = '';
			if (resp.length == 2) {
				var img = resp[1];
				for (x = 0; x < img.length; x++) {
					h += '<span class="img-wrapper">'
						+ '<a href="' + image_server+img[x][1] + '">'
						+ '<img class="bike-image" src="' + image_server+img[x][1] + '">'
						+ '</a>'
						+ '<a class="btn btn-xs btn-default delete-bike-image-btn" '
						+ 'data-image-id="' + img[x][0] + '">'
						+ '<span class="glyphicon glyphicon-trash"></span>'
						+ '</a>'
						+ '</span>';
						// + '<span class="glyphicon glyphicon-trash"></span>'
				}
			}
			$('#bike-images').html (h);
		} else {
			$('#update-profile-msg').html ("Error loading images").show ();
		}

		// handler for delete-bike-image-btn(s)
		$('.delete-bike-image-btn').on('click', function (event) {
			if ($(this).data('confirm') == '1') {
				var image_id = $(this).data('image-id');
				if (image_id == '0') {
					return false;
				}
				var caller = $(this);
				$.post(server + "deleteImage.php", {image_id:image_id})
				.done (function(response) {
					var resp = $.parseJSON(response);
					if (resp[0] == 'OK') {
						caller.data('image-id','0');
						caller.html('Deleted');
					}
				})
				.fail (function(response) {
					$('#del-btn'+image_id).html('Failed: ' + image_id);
				});
			} else {
				$(this).data('confirm','1');
				$(this).html('<strong>Confirm</strong>');
			}
			return false;
		});
	})
	.fail (function () {
		$('#update-profile-msg').html ("Failed loading images").show ();
	});

	return false;
}

/*
 * out = nothing
 * in = [[status[OK|NOTOK], err_msg]
 * 	 [username, firstname, lastname, email, phone, location, bike_manufacturer, bike_model, bike_year]
 *	 [profile_image_id, filepath/filename]]
 *
 *	filepath is relative to the base upload dir, which 
 */
function loadProfile () {
	// first set up the options for the select items
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
			// now we can populate the fields using the already set up <select> items
			// [OK|NOTOK,msg]
			// [username, firstname, lastname, email, phone, location, lat, lng, gender_id, gender_txt,age_id,age_txt, ability_id,ability_txt, bio, bike_mfg, bike_model, bike_year]
			// [profile_image_id, filename]

			$.post (server + "getProfile.php")
			.done (function (response) {
				var resp = $.parseJSON (response);
				if (resp[0][0] == "OK") {
					$('#my_username').val(resp[1][0]);
					$('#firstname').val(resp[1][1]);
					$('#lastname').val(resp[1][2]);
					$('#email').val(resp[1][3]);
					$('#phone').val(resp[1][4]);
					$('#location').val(resp[1][5]);
					$('#location').data('lat', resp[1][6]);
					$('#location').data('lng', resp[1][7]);
					$('#select-gender').val(resp[1][8]);
					$('#select-age').val(resp[1][10]);
					$('#select-ability').val(resp[1][12]);
					$('#bio').val(resp[1][14]);
					$('#bike-manufacturer .typeahead').typeahead('val', resp[1][15]);
					$('#bike-model .typeahead').typeahead('val',resp[1][16]);
					$('#bike-year').val(resp[1][17]);
					// show Update button
					$('#update-profile-btn').show();
					// load profile image if present
					var profile_filename = 'img/generic_user.png', profile_image_id = '0';
					// if third element is present it points to profile image
					if (resp.length == 3) {
						profile_image_id = resp[2][0];
						profile_filename = image_server + resp[2][1];
					}
		
					$('#profile-image-link').attr('href',profile_filename);
					$('#profile-image').attr('src',profile_filename);
					$('#change-profile-image-btn').data('image-id',profile_image_id);
					$('#delete-profile-image-btn').data('image-id',profile_image_id);
		
					// hide delete button if no profile image
					if (profile_image_id != '0') {
						$('#delete-profile-image-btn').show();
					}
				} else {
					$('#update-profile-msg').html ("Error loading profile").show ();
				}
			})
			.fail (function (response) {
				$('#update-profile-msg').html ("Failed (load)").show ();
			});
		
		} else {
			// resp=NOTOK
			$('#update-profile-msg').html ('Error getting attributes').show();
			$('#update-profile-btn').hide();
		}
	})
	.fail (function () {
		$('#update-profile-msg').html ('Failed to get attributes').show();
		$('#update-profile-btn').hide();
	});




	return false;
}

function updateProfile () {
	$('#update-profile-msg').html("Updating...").show();

	// check fields
	var username = $.trim ($('#my_username').val());
	var password = $.trim ($('#my_password').val());
	var password1 = $.trim ($('#my_password1').val());
	var firstname = $.trim ($('#firstname').val());
	var lastname = $.trim ($('#lastname').val());
	var email = $.trim ($('#email').val());
	var phone = $.trim ($('#phone').val());
	var xlocation = $('#location').val();
	var lat = $('#location').data('lat');
	var lng = $('#location').data('lng');
	var gender = $('#select-gender').val();
	var age = $('#select-age').val();
	var ability = $('#select-ability').val();
	var bio = $.trim ($('#bio').val());
	var bike_manufacturer = $.trim ($('#bike-manufacturer-input').val());
	var bike_model = $.trim ($('#bike-model-input').val());
	var bike_year = $.trim ($('#bike-year-input').val());
	if (password != password1) {
		$('#update-profile-msg').html("Passwords don't match").show();
		return false;
	}

	var err = false;
	var err_msg = "Check: ";
	if (username.length == 0) {err_msg+="Username"; err=true;}
	// if (password.length == 0) {if(err) {err_msg+=", ";}err_msg+="Password"; err=true;}
	// if (password1.length == 0) {if(err) {err_msg+=", ";}err_msg+="Password Re-enter"; err=true;}
	if (firstname.length == 0) {if(err) {err_msg+=", ";}err_msg+="Firstname"; err=true;}
	if (lastname.length == 0) {if(err) {err_msg+=", ";}err_msg+="Lastname"; err=true;}
	if (email.length == 0) {if(err) {err_msg+=", ";}err_msg+="Email"; err=true;}
	if ((xlocation.length == 0) || (lat=='0') || (lng=='0')) {if(err) {err_msg+=", ";}err_msg+="Location"; err=true;}
	
	if (!validateEmail(email)) {
		if (err) {err_msg += ', ';}
		err_msg += 'Email format';
		err = true;
	}

	if (err) {
		$('#update-profile-msg').html(err_msg).show();
		return false;
	}

	// data seems OK register.php returns status OK|NOTOK, message
	$.post (server + "updateProfile.php", {username:username,
				password:password,
				firstname:firstname,
				lastname:lastname,
				email:email,
				phone:phone,
				xlocation:xlocation,
				lat:lat,
				lng:lng,
				gender:gender,
				age:age,
				ability:ability,
				bio:bio,
				bike_manufacturer:bike_manufacturer,
				bike_model:bike_model,
				bike_year:bike_year})
	.done (function (response) {
		var resp = $.parseJSON (response);
		if (resp[0] == "OK") {
			$('#update-profile-msg').html ('Profile updated').show ();
		}
		else {
			$('#update-profile-msg').html (resp[1]).show ();
		}
	})
	.fail (function (response) {
		$('#update-profile-msg').html ("Darn. Something went wrong").show ();
	});

	return false;
}

var new_image;
// Modal on-show event - reset filename, message, preview-image
$('#uploadImageModal').on('show.bs.modal', function (event) {
	var button = $(event.relatedTarget); // button that triggered the event
	$('#image-type').val(button.data('image-type')); // set hidden field to type of image [profile, bike]
	$('#image-id').val(button.data('image-id')); // set hidden field to id of current image or '0' if nonw
	$('#fileToUpload').val('');
	if ($('#image-type').val() == 'profile') {
		$('#current-image-div').show();
		$('#modal-profile-image').attr('src', $('#profile-image').attr('src'));
	} else {
		$('#current-image-div').hide();
	}
	$('#modal-preview-image').attr('src', 'img/generic_user.png');
	$('#upload-btn').hide();
	$('#modal-message').html('Upload jpg or png files, Max size 2 Mb');
});

// prefiew the image when a file is chosen - onChange function
$('#fileToUpload').change (function () {
	var file = this.files[0];
	var imagefile = file.type;
	var match= ["image/jpeg","image/png","image/jpg"];
	if(!((imagefile==match[0]) || (imagefile==match[1]) || (imagefile==match[2])))
	{
		$("#modal-message").html('File must be .jpg or .jpeg or .png').show();
		return false;
	}
	// var preview = document.querySelector('img');
	var preview = $('#modal-preview-image')[0];
	// var file    = document.querySelector('input[type=file]').files[0];
	var file    = $('#fileToUpload')[0].files[0];
	var reader  = new FileReader();

	reader.onloadend = function () {
		preview.src = reader.result;
		new_image = reader.result;
		$('#upload-btn').show();
		$('#modal-message').hide();
	}
	if (file) {
		reader.readAsDataURL(file);
	} else {
		preview.src = "";
	}
});

// upload the selected image
// used for both profile and bike images
// on success, close the modal and update the relevant image
$("#uploadForm").on('submit',(function(e) {
	e.preventDefault();
	$("#modal-message").html('Loading...');

	$.ajax({
		url: server+"uploadImage.php", // Url to which the request is send
		type: "POST",             // Type of request to be send, called as method
		data: new FormData(this), // Data sent to server, a set of key/value pairs (i.e. form fields and values)
		contentType: false,       // The content type used when sending data to the server.
		cache: false,             // To unable request pages to be cached
		processData:false,        // To send DOMDocument or non processed data file it is set to false
		success: function(data)   // A function to be called if request succeeds
		{
			// [OK|NOTOK, image_type (or err_msg if NOTOK), filename, image-id] (filename is relative to 'image-base-dir')
			var resp=$.parseJSON(data);
			if (resp[0]=='OK') {
				if (resp[1] == 'profile') {
					$('#profile-image').attr('src',image_server+resp[2]);
					$('#profile-image-link').attr('href', image_server+resp[2]);
					$('#change-profile-image-btn').data('image-id',resp[3]);
					$('#delete-profile-image-btn').html('<span class="glyphicon glyphicon-trash"></span>');
					$('#delete-profile-image-btn').data('image-id',resp[3]);
					$('#delete-profile-image-btn').data('confirm','0');
					$('#delete-profile-image-btn').show();
				} else if (resp[1] == 'bike') {
					var h = '<span class="img-wrapper">'
						+ '<a href="' + image_server+resp[2] + '">'
						+ '<img class="bike-image" src="' + image_server+resp[2] + '">'
						+ '</a>'
						// + '<a class="btn btn-xs btn-default bike-image-overlay-btn delete-bike-image-btn" '
						// + 'data-image-id="' + resp[3] + '">'
						// + '<span class="glyphicon glyphicon-trash"></span>'
						// + '</a>'
						+ '</span>';
					$('#bike-images').append(h);
				} 
				$('#uploadImageModal').modal('hide');
			} else {
				$('#modal-message').html('Error: ' + resp[1]);
			}
			$("#modal-message").show();
			$('#upload-btn').hide();
		},
		failure: function(data)
		{
			$("#modal-message").html('failed');
		}
	});
	return false;
}));

// for google Places Autocomplete
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
	});
}
