/*
 * edit_event page
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

	// if logged in, load event details and show event update button
	// isLoggedIn.php out=none, in=ret_status, ret_msg, isLoggedIn (yes/no), username
	$.post (server + "isLoggedIn.php")
	.done (function (response) {
		var resp = $.parseJSON (response);
		if (resp[0] == "OK" && resp[2]=="yes") {
			setNavbar (true, resp[3], '');
			loadEvent (getParameterByName('q'));
			// show update button
			$('#update-event-btn').show ();
		} else {
			// not logged in
			setNavbar (false, '','');
			// nothing
		}
	})
	.fail (function (response) {
		// isLoggedIn
		$('#edit-event-msg').html ("Error (ready)").show ();
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
		// set event-id on the modal (data)
	});

	return false;
});

function loadEvent(event_id) {
	// return: [status(OK|NOTOK)],
	// 	[id, title, location, lat, lng, description, start, finish, 
	// 		type, invite_type, max_attendees, num_attendees, owner.id, firstname, lastname, profile_img],
	// 	[[id, attending, reason, timeago(reason_time), message, attendee.id, firstname, lastname],[..],...]
	// 	[is_logged_in, is_owner, is_attending]
	$.post (server + "getEvent.php", {event_id:event_id})
	.done (function (response) {
		var resp = $.parseJSON (response);
		if ((resp[0][0] == "OK") && (resp[3][1] == '1')) { // is owner
				$('#title').val (resp[1][1]);
				// store event_id and num_attendees as data in title, for update.
				$('#title').data ("event-id", event_id); 
				$('#title').data ("num-attendees", resp[1][9]); 
				$('#location').val (resp[1][2]);
				$('#location').data ('lat', resp[1][3]);
				$('#location').data ('lng', resp[1][4]);
				$('#description').val (resp[1][5]);
				$('#start').datepicker("setDate",new Date (resp[1][6]));
				$('#finish').datepicker("setDate",new Date (resp[1][7]));
				// ride type
				if (resp[1][8] == 'Cruise') { $('#ride-type-cruise').prop ('checked', true); }
				else if (resp[1][8] == 'Moderate') { $('#ride-type-moderate').prop ('checked', true); }
				else { $('#ride-type-advanced').prop ('checked', true); }
				// invite type
				if (resp[1][9] == 'invite-only') { $('#invite-type-invite-only').prop ('checked', true); }
				else { $('#invite-type-anyone').prop ('checked', true); }
	
				var spaces = -1;
				if (resp[1][10] != '0') {
					$('#max-attendees').val(resp[1][10]);
					spaces = (parseInt (resp[1][10]) - parseInt (resp[1][11]));
				}
				$('#num-attendees').html(resp[1][11]);
				$('#spaces-available').html(spaces < 0 ? 'unlimited' : spaces);

				// event attendees. Includes attending(yes/no), reason
				// [ea.id, attending, reason, reason_time, message, attendee.id, firstname, lastname, image_file],[..]
				var h = '';
				// first put myself, the organiser
				var profile_image = (resp[1][15] == '' ? 'img/generic_user.png' : resp[1][15]);
				h += '<p class="event-attendee">';
				h += '<a href="profile.html?q=' + resp[1][12] + '">' 
					+ '<img class="attendee-image" src="' + profile_image + '">'
					+ '<span class="attendee-name">'
					+ resp[1][13] + ' ' + resp[1][14] + '</a>';
				h += '</p>';

				// now add other attendees
				var att_class, glyph, add_text, add_delete_option;
				var att = resp[2];
				for (x=0; x < att.length; x++) {
					h += '<p class="event-attendee">';
					// attending->yes/no
					att_class=''; glyph=''; add_text='';
					add_delete_option = false;
					switch (att[x][1]) {
						case 'yes':
							att_class='attendee-attending';
							glyph = 'glyphicon-ok';
							break
						case 'no':
							att_class='attendee-not-attending';
							glyph = 'glyphicon-remove';
							if (att[x][2] == 'declined event-invitation') {
								add_text = 'Declined your invitation';
							} else if (att[x][2] == 'deleted event-invitation') {
								add_text = "Invitation deleted";
							} else if (att[x][2] == 'declined join-request') {
								add_text = "Asked to join, you refused";
							} else if (att[x][2] == 'left') {
								add_text = "Was coming, has now left the event";
							} else {
								add_text = 'hmm. dunno why';
							}
							break;
						case 'pending':
							att_class='attendee-pending';
							glyph = 'glyphicon-question-sign';
							if (att[x][2] == 'event-invitation') {
								add_text = 'Invited';
							} else if (att[x][2] == 'join-request') {
								add_text = "Asked to join";
							} else {
								add_text = 'dunno';
							}
							add_delete_option = true;
							break;
						default:
							att_class='attendee-not-attending';
							glyph = 'glyphicon-asterisk';
							
					}

					h += '<span class="' + att_class + ' glyphicon ' + glyph + '"></span>';
					profile_image = (att[x][8] == '' ? 'img/generic_user.png' : att[x][8]);

					h += '<a href="profile.html?q=' + att[x][5] + '">' 
						+ '<img class="attendee-image" src="' + profile_image + '">'
						+ '<span class="attendee-name">'
						+ att[x][6] + ' ' + att[x][7] + '</a>';
					if (add_text.length) {
						h += '<span class="attendee-reason">' + add_text + '</span>'
							+ '<span class="attendee-timeago">' + att[x][3] + ' ago</span>';
					}
					if (add_delete_option) {
						h += '<a class="delete-event-invitation" data-messageid="'
							+ att[x][0] + '" id="dei' + att[x][0] + '">Delete invitation</a>';
					}
					h += '</p>';
				}
				if (h == '') {h = 'None';}
				$('#attendees').html(h);
				
				// handler for Delete Invitation buttons class dei
				$('.delete-event-invitation').on('click', function () {
					if ($(this).data('inactive') != '1') {
						$(this).html('Invitation Deleted');
						var id = $(this).data('messageid');
						$.post (server + 'deleteEventInvitation.php', {messageid:id})
						.done (function (response) {
							var resp = $.parseJSON(response);
							if (resp[0] == "OK") {
								// do nothing
							} else {
								$('#dei' + id).html ('Error');
							}
						})
						.fail (function (response) {
							$('#dei' + id).html ('failed');
						});
					}
					$(this).data('inactive','1');
				});

				// load Friends - do not display friends who are attending
				loadFriends (resp[2]);
		} else {
			// getEvent ret != OK or not owner, or no event array
			$('#title').val('Oops! Something went wrong');
			$('#edit-event-msg').html ("Something went wrong").show ();
			$('#update-event-btn').hide ();
		}
	})
	.fail (function (response) {
		// getMyEvent
		$('#edit-event-msg').html ("Something failed").show ();
	});

	// set up search functionality
	setSearchButton ();
}

function setSearchButton() {
	// users search button
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

		// searchUsers: [[OK|NOTOK,msg][userid, firstname, lastname, location, bike_manufacturer][....]]
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
				// h += '<p>'+resp[0][1]+'</p>';
				for (x=1; x < resp.length; x++){
					h += '<div class="row">'
						+ '<div class="col-md-4 col-xs-12">'
						+ '<span data-userid="'
						+ resp[x][0]
						+ '" class="user-invitee-btn glyphicon glyphicon-unchecked"></span>'
						+ ' '
						+ '<a class="search-user-name" data-toggle="modal" data-target="#userProfileModal" data-id="' 
						+ resp[x][0] + '">'
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
				$('#edit-event-msg').html(resp[0][1]).show ();
			}
		})
		.fail (function (response) {
			$('#edit-event-msg').html ("Error").show ();
		});
	});

	return false;
}

function updateEvent () {
	$('#edit-event-msg').html('Updating...').show();
	// check fields
	var title = $.trim($('#title').val());
	var xlocation = $('#location').val();
	var lat = $('#location').data('lat');
	var lng = $('#location').data('lng');
	var type = $("input[name=ride-type]:checked").val();
	var invite_type = $("input[name=join-options]:checked").val();
	var description = $.trim($('#description').val());

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
	var max_attendees, num_attendees;
	if ($('#max-attendees').val() == '') {
		max_attendees = 0;
		num_attendees = 0;
	} else {
		max_attendees = parseInt ($('#max-attendees').val());
		num_attendees = parseInt ($('#title').data('num-attendees'));
	}

	var err = false;
	var err_msg = "Check: ";
	if (title.length == 0) {err_msg += "Title"; err=true; }
	if ((xlocation.length == 0) || (lat=='0') || (lng=='0')) {err_msg += "Location"; err=true; }
	if (description.length == 0) {if (err) {err_msg+=", ";} err_msg += "Description"; err=true; }
	if (start == null) {if (err) {err_msg+=", ";} err_msg += "Start Date"; err=true; }
	if (start > finish) {if (err) {err_msg+=", ";} err_msg += "Finish before Start Date"; err=true; }
	if (max_attendees < 0 ) {if (err){err_msg+=', ';} err_msg += 'Max attendees cannot be negative'; err=true;}
	if (max_attendees < num_attendees ) {if (err){err_msg+=', ';} err_msg += 'Max attendees less than current number of attendees'; err=true;}


	// get event_id from #title:data-event-id
	if ($('#title').data ('event-id')) {
		var event_id = $('#title').data('event-id');
	} else {
		err=true;
		err_msg="No event";
	}

	if (err) {
		$('#edit-event-msg').html(err_msg).show();
		return false;
	}

	// invitees.
	// friends
	var x = new Array();
	$('.friend-invitee-btn').each (function () {
		if ($(this).hasClass('glyphicon-check')) {
			x.push ($(this).data('friendid'));
		}
	});

	// and others
	$('.user-invitee-btn').each (function () {
		if ($(this).hasClass('glyphicon-check')) {
			x.push ($(this).data('userid'));
		}
	});
	var invitees = JSON.stringify (x);

	// invitation message if any
	var invitation_msg = $.trim($('#invitation-msg').val());

	$.post (server + "updateEvent.php", {event_id:event_id,
					title:title,
					xlocation:xlocation,
					lat:lat,
					lng:lng,
					description:description,
					start_date:start_date,
					start_month:start_month,
					start_year:start_year,
					finish_date:finish_date,
					finish_month:finish_month,
					finish_year:finish_year,
					type:type,
					invite_type:invite_type,
					max_attendees:max_attendees,
					invitees:invitees,
					invitation_msg:invitation_msg
					})
	.done (function (response) {
		var resp = $.parseJSON (response);
		if (resp[0] == "OK") {
			$('#edit-event-msg').html ("Updated").show ();
			window.location.replace('index.html');
		}
		else {
			$('#edit-event-msg').html(resp[1]).show ();
		}
	})
	.fail (function (response) {
		$('#edit-event-msg').html ("Error (update)").show ();
	});

	return false;
}

// is friend's user-id in the array of attendees
// attendees is array of [[ea.id, attending, reason, reason_time, message, att_id, firstname, lastname],[..]]
function isInvited (id,attendees) {
	var match=false;
	$(attendees).each (function(ind,val) {
		if (id == val[5]){
			match=true;
			return false;
		}
	});
	return match;
}
// load my friends
// param (attendees) is array of attendees:
// 	[[ea.id, attending, reason, reason_time, message, att_id, firstname, lastname],[..]]
function loadFriends (attendees) {
	// getFriends out=>nothing in=>[OK|NOTOK,msf][f.id, f.friend_id, u.firstname, u.lastname, f.last_used],[friend...],...
	$.post (server + "getFriends.php")
	.done (function (response) {
		var resp = $.parseJSON (response);
		var h = ''
		if (resp[0][0] == "OK") {
			var row_done = true;
			var glyph = '';
			var glyph_class='';
			var attendee_class='';
			var count=0;
			for (x=1; x < resp.length; x++) {
				// don't include friends who are already invited or attending or declined.
				if (isInvited (resp[x][1],attendees)) {
					// do nothing
				} else {
					// list the friend
					if (x % 2) {
						h += '<div class="row">'; // new row
						h += '<div class="col-md-6 col-xs-12">';
						h += '<span class="friend-invitee-btn glyphicon glyphicon-unchecked" data-friendid="'
							+ resp[x][1] + '"></span>';
						h += '<a class="friend-name" data-toggle="modal" data-target="#userProfileModal" data-id="' 
							+ resp[x][1] + '">'
							+ resp[x][2] + ' ' + resp[x][3]
							+ '</a></div>';
						row_done = false;
					} else {
						h += '<div class="col-md-6 col-xs-12">';
						h += '<span class="friend-invitee-btn glyphicon glyphicon-unchecked" data-friendid="'
								+ resp[x][1] + '"></span>';
						h += '<a class="friend-name" data-toggle="modal" data-target="#userProfileModal" data-id="' 
							+ resp[x][1] + '">'
							+ resp[x][2] + ' ' + resp[x][3]
							+ '</a></div>';
						h += '</div>'; // close off the row
						row_done = true;
					}
				}
			}
			if (!row_done) {h += '</div>';}
			if (h == '') {h = 'None';}
			$('#friend-invitees').html (h);
			// handler for friend-invitees
			$('.friend-invitee-btn').on ('click', function () {
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
			$('#edit-event-msg').html (resp[0][1]).show ();
			$('#friend-invitees').html ($('#friend-invitees').html() + " Failed");
		}
	})
	.fail (function (response) {
		$('#edit-event-msg').html ("Error").show ();
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

// initialize googlePlacesAutocomplete for Event location (#location) as well as search for users (#user-location)
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
