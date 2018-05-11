/*
 * new_event page
 */

$(document).ready (function () {
	// init start and finish datepickers
	$('#start').datepicker (
		{
			dateFormat: 'd M yy',
			minDate: 0,
			onClose: function (startDate) {
				$('#finish').datepicker ('setDate', startDate);
				$('#finish').datepicker ('option', 'minDate', startDate);
			}	
		}
	);
	$('#finish').datepicker (
		{
			dateFormat: 'd M yy',
			minDate: 0
		}
	);

	// isLoggedIn.php out=none, in=ret_status, ret_msg, isLoggedIn (yes/no), username, id, location, lat, lng
	$.post (server + "isLoggedIn.php")
	.done (function (response) {
		var resp = $.parseJSON (response);
		if (resp[0] == "OK" && resp[2]=="yes") {
			setNavbar (true, resp[3], '');
			// load Friends
			loadFriends ();
			$('#create-event-btn').show();
			// set default location (user's location)
			$('#location').val(resp[5]);
			$('#location').data('lat',resp[6]);
			$('#location').data('lng',resp[7]);
		}
		else {
			$('#create-event-msg').html ("Not logged in").show ();
			setNavbar (false, '', 'Something went wrong');
		}
	})
	.fail (function (response) {
		$('#create-event-msg').html ("Error").show ();
		setNavbar (false, '', 'Something failed');
	});

	// View profile MODAL on show event - get user's details and show them
	$('#userProfileModal').on('show.bs.modal', function (event) {
		var button = $(event.relatedTarget); // Button that triggered the modal
		var userid = button.data('id'); // Extract info from data-* attributes
		$('#modal-view-profile-msg').html('Loading...');
		$.post (server + "getProfile.php", {userid:userid})
		.done (function (response) {
			var resp = $.parseJSON (response);
			if (resp[0][0] == "OK") {
				var img_src = (resp.length == 3 ? image_server + resp[2][1] : 'img/generic_user.png');
				$('#modal-profile-image').attr('src',img_src);
				$('#modal-firstname').html(resp[1][1]);
				$('#modal-lastname').html(resp[1][2]);
				$('#modal-email').html(resp[1][3]);
				$('#modal-email').attr('href', 'mailto:'+resp[1][3]);
				$('#modal-phone').html(resp[1][4]);
				$('#modal-location').html(resp[1][5]);
				$('#modal-gender').html(resp[1][8] == '0' ? '' : resp[1][9]);
				$('#modal-age').html(resp[1][10] == '0' ? '' : resp[1][11]);
				$('#modal-ability').html(resp[1][12] == '0' ? '' : resp[1][13]);
				$('#modal-bio').html(resp[1][14]);
				$('#modal-bike-manufacturer').html(resp[1][15]);
				$('#modal-bike-model').html(resp[1][16]);
				$('#modal-bike-year').html(resp[1][17]);

				$('#modal-view-profile-msg').html('');
			}
			else {
				$('#modal-view-profile-msg').html('Not found');
			}
		})
		.fail (function () {
			$('#modal-view-profile-msg').html('Failed');
		});
	});

	// get user attributes - age, gender, ability
	// [OK|NOTOK,message],[[id,gender],[id,gender]..],[[id,age],...],[[id,ability],...]
	$.post (server + 'getUserAttributes.php')
	.done (function (response) {
		var resp = $.parseJSON(response);
		if (resp[0][0] == 'OK') {
			// select-gender
			var arr = resp[1];
			for (x = 0; x < arr.length; x++) {
				if (arr[x][1] == 'Select gender') {
					arr[x][1] = '-- Any gender --';
				}
				$('#select-gender').append($('<option/>', { 
					value: arr[x][0],
					text : arr[x][1] 
				}));
			}  
	
			// select-ages
			arr = resp[2];
			for (x = 0; x < arr.length; x++) {
				if (arr[x][1] == 'Select age') {
					arr[x][1] = '-- Any age --';
				}
				$('#select-age').append($('<option/>', { 
					value: arr[x][0],
					text : arr[x][1] 
				}));
			}
			// select-ability
			arr = resp[3];
			for (x = 0; x < arr.length; x++) {
				if (arr[x][1] == 'Select ability') {
					arr[x][1] = '-- Any ability --';
				}
				$('#select-ability').append($('<option/>', { 
					value: arr[x][0],
					text : arr[x][1] 
				}));
			}
		
		} else {
			// resp=NOTOK
			$('#edit-event-msg').html ('Error getting attributes').show();
		}
	})
	.fail (function () {
		$('#edit-event-msg').html ('Failed to get attributes').show();
	});

	// search button
	$('#search-btn').on("click", function () {
		// clear existing list if any
		$('#search-results').html ("");
		var search_firstname = $.trim($('#firstname').val());
		var search_lastname = $.trim($('#lastname').val());
		var search_location = $.trim($('#user-location').val());
		var search_lat = $('#user-location').data('lat');
		var search_lng = $('#user-location').data('lng');
		var search_bike_make = $.trim($('#bike_make').val());
		var search_age = $('#select-age').val();
		var search_gender = $('#select-gender').val();
		var search_ability = $('#select-ability').val();

		// searchUsers: [[OK|NOTOK,msg][userid, firstname, lastname, location, bike_manufacturer,bike_model, bike_year][....]]
		$.post (server + "searchUsers.php", {firstname:search_firstname,
						lastname:search_lastname,
						location:search_location,
						lat:search_lat,
						lng:search_lng,
						bike_make:search_bike_make,
						age:search_age,
						gender:search_gender,
						ability:search_ability
						})
		.done (function (response) {
			var resp = $.parseJSON (response);
			if (resp[0][0] == "OK") {
				// reset select-all-btn
				$('#select-all-btn').removeClass ('glyphicon-check');
				$('#select-all-btn').addClass ('glyphicon-unchecked');
				var h = "";
				for (x=1; x < resp.length; x++){
					h += '<div class="row">'
						+ '<div class="col-md-4 col-xs-12">'
						+ '<span data-userid="'
						+ resp[x][0]
						+ '" class="user-invitee-btn glyphicon glyphicon-unchecked"></span>'
						+ ' '
						+ '<a class="search-user-name" data-toggle="modal" data-target="#userProfileModal" data-id="' + resp[x][0] + '">'
						+ resp[x][1]
						+ ' '
						+ resp[x][2]
						+ '</a></div>'
						+ '<div class="col-md-4 col-xs-12">'
						+ '<span class="text-muted">'
						+ resp[x][3]
						+ '</span>'
						+ '</div>'
						+ '<div class="col-md-4 col-xs-12">'
						+ '<span class="text-muted">'
						+ resp[x][4] + ' ' + resp[x][5] + ' ' + resp[x][6]
						+ '</span>'
						+ '</div>'
						+ '</div>';
				}
				if (h == '') {h = 'none';}
				$('#search-results').html (h);
				$('#select-all').show ();
				// user-invitee-btn checkbox button
				$('.user-invitee-btn').on ('click', function () {
					if ($(this).hasClass('glyphicon-check')) {
						// uncheck it
						$(this).removeClass('glyphicon-check');
						$(this).addClass('glyphicon-unchecked');
					} else {
						// check it
						$(this).removeClass('glyphicon-unchecked');
						$(this).addClass('glyphicon-check');
					}
				});
			}
			else {
				$('#create-group-msg').html(resp[0][1]).show ();
			}
		})
		.fail (function (response) {
			$('#create-group-msg').html ("Error").show ();
		});
	});
	return false;
});

function loadFriends () {
	/* out [nothing]
	 * in [OK|NOTOK, err_message], array [user_id, first, lastname]
	 */

	// getFriends out=>nothing in=>f.id, f.friend_id, u.firstname, u.lastname, f.last_used
	// f.id (id in friends table) not used.
	$.post (server + "getFriends.php")
	.done (function (response) {
		var resp = $.parseJSON (response);
		var h = ''
		if (resp[0][0] == "OK") {
			var row_done = true;
			var glyph = '';
			for (x=1; x < resp.length; x++) {
				if (x % 2) {
					h += '<div class="row">'; // new row
					h += '<div class="col-md-6 col-xs-12">'
						+ '<span class="friend-invitee glyphicon glyphicon-unchecked" data-friendid="' 
						+ resp[x][1] + '"></span>'
						+ '<a class="friend-name" data-toggle="modal" data-target="#userProfileModal" data-id="' 
						+ resp[x][1] + '">'
						+ resp[x][2] + ' ' + resp[x][3]
						+ '</a></div>';
					row_done = false;
				} else {
					h += '<div class="col-md-6 col-xs-12">'
						+ '<span class="friend-invitee glyphicon glyphicon-unchecked" data-friendid="' 
						+ resp[x][1] + '"></span>'
						+ '<a class="friend-name" data-toggle="modal" data-target="#userProfileModal" data-id="' 
						+ resp[x][1] + '">'
						+ resp[x][2] + ' ' + resp[x][3]
						+ '</a></div>';
					h += '</div>'; // end off the row
					row_done = true;
				}
			}
			if (!row_done) {h += '</div>';}
			if (h == '') {h = 'none';}
			$('#friend-invitees').html (h);
			$('.friend-invitee').on ('click', function () {
				if ($(this).hasClass('glyphicon-check')) {
					// uncheck it
					$(this).removeClass('glyphicon-check');
					$(this).addClass('glyphicon-unchecked');
				} else {
					// check it
					$(this).removeClass('glyphicon-unchecked');
					$(this).addClass('glyphicon-check');
				}
			});
		}
		else {
			$('#create-event-msg').html (resp[0][1]).show ();
			$('#friend-invitees').html ($('#friend-invitees').html() + " Failed");
		}
	})
	.fail (function (response) {
		$('#create-event-msg').html ("Error").show ();
		$('#friend-invitees').html ($('#friend-invitees').html() + " Failed");
	});
}

// select all checkbox button
$('#select-all-btn').on ('click', function () {
	if ($(this).hasClass('glyphicon-check')) {
		// uncheck all
		$(this).removeClass('glyphicon-check');
		$(this).addClass('glyphicon-unchecked');
		$('.user-invitee-btn').removeClass ('glyphicon-check');
		$('.user-invitee-btn').addClass ('glyphicon-unchecked');
	} else {
		// check all
		$(this).removeClass('glyphicon-unchecked');
		$(this).addClass('glyphicon-check');
		$('.user-invitee-btn').removeClass ('glyphicon-unchecked');
		$('.user-invitee-btn').addClass ('glyphicon-check');
	}
});

function createNewEvent () {
	$('#create-event-msg').html('Creating event...').show();
	// check fields
	var title = $.trim($('#title').val());
	var type = $('input[name=ride-type]:checked').val();
	var invite_type = $('input[name=join-options]:checked').val();
	var description = $.trim($('#description').val());
	var xlocation = $('#location').val();
	var lat = $('#location').data('lat');
	var lng = $('#location').data('lng');

	// start date
	var start = $('#start').datepicker( "getDate" );
	if (start) {
		var start_date = start.getDate();
		var start_month = start.getMonth()+1;
		var start_year = start.getFullYear();
	}
	// finish date
	var finish = $('#finish').datepicker('getDate');
	if (finish) {
		finish_date = finish.getDate();
		finish_month = finish.getMonth()+1;
		finish_year = finish.getFullYear();
	} else { // same as start
		finish_date = start_date;
		finish_month = start_month;
		finish_year = start_year;
	}

	// max_attendees
	var max_attendees;
	if ($('#max-attendees').val() == '') {
		max_attendees = 0;
	} else {
		max_attendees = parseInt ($('#max-attendees').val());
	}

	var err = false;
	var err_msg = "Check: ";
	if (title.length == 0) {err_msg += "Title"; err=true }
	if (description.length == 0) {if (err) {err_msg+=", ";} err_msg += "Description"; err=true }
	if ((xlocation.length == 0) || (lat=='0') || (lng=='0')) {if (err) {err_msg+=", ";} err_msg += "Location"; err=true }
	if (start == null) {if (err) {err_msg+=", ";} err_msg += "Start Date"; err=true }
	if (start > finish) {if (err) {err_msg+=", ";} err_msg += "Finish before Start Date"; err=true }
	if (max_attendees < 0 ) {if (err){err_msg+=', ';} err_msg += 'Max attendees cannot be negative'; err=true;}

	if (err) {
		$('#create-event-msg').html(err_msg).show();
		return false;
	}

	// friends
	var x = new Array();
	$('.friend-invitee').each (function () {
		if ($(this).hasClass('glyphicon-check')) {
			x.push ($(this).data('friendid'));
		}
	});

	// and other invitees
	$('.user-invitee-btn').each (function () {
		if ($(this).hasClass('glyphicon-check')) {
			x.push ($(this).data('userid'));
		}
	});

	var invitees = JSON.stringify (x);

	var invitation_msg = $.trim($('#invitation-msg').val());

	// post the event
	$.post (server + "createEvent.php", {title:title,
					xlocation:xlocation,
					lat:lat,
					lng:lng,
					type:type,
					description:description,
					start_date:start_date,
					start_month:start_month,
					start_year:start_year,
					finish_date:finish_date,
					finish_month:finish_month,
					finish_year:finish_year,
					invite_type:invite_type,
					max_attendees:max_attendees,
					invitees:invitees,
					invitation_msg:invitation_msg })
	.done (function (response) {
		var resp = $.parseJSON (response);
		if (resp[0] == "OK") {
			$('#create-event-msg').html ("Event created").show ();
			window.location.replace ('index.html');
			return false;
		}
		else {
			$('#create-event-msg').html(resp[1]).show ();
		}
	})
	.fail (function (response) {
		$('#create-event-msg').html ("Error").show ();
	});

	return false;
}

// initialize googlePlacesAutocomplete for Event location (#location) and user search (#user-location)
function initAutocomplete() {
	// #location
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

	// #user-location
	map = new google.maps.Map(document.getElementById('user-map'), {
		center: {lat: -33.8688, lng: 151.2195},
		zoom: 13,
		mapTypeId: 'roadmap'
	});

	// Create the search box and link it to the UI element.
	input = document.getElementById('user-location');
	user_searchBox = new google.maps.places.SearchBox(input);

	// ####### commented out this line so the input control can display without a map
	// map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

	// Listen for the event fired when the user selects a prediction and retrieve
	// more details for that place.
	user_searchBox.addListener('places_changed', function() {
		var places = user_searchBox.getPlaces();

		if ((!places) || (places.length == 0)) {
			$('#user-location').data('lat','0');
			$('#user-location').data('lng','0');
			return;
		}

		// store latlng in pac-input data
		var lat = places[0].geometry.location.lat();
		var lng = places[0].geometry.location.lng();
		$('#user-location').data('lat',lat);
		$('#user-location').data('lng',lng);
	});
}
