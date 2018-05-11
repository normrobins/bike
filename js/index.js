/*
 * for index.html 
 */
$(document).ready (function() {
	// check if logged in. load event details and show event update button
	// isLoggedIn.php out=none, in=ret_status, ret_msg, isLoggedIn (yes/no), username
	$.post (server + "isLoggedIn.php")
	.done (function (response) {
		var resp = $.parseJSON (response);
		if (resp[0] == "OK" && resp[2]=="yes") {
			setNavbar (true, resp[3], '');
			getEventsAround ();
		}
		else {
			setNavbar (false, '', '');
			getEventsAround ();
		}
	})
	.fail (function (response) {
		$('#login-msg').html ('Something failed').show ();
		getEventsAround ();
	});


	// Send message MODAL on show event - set title to the event
	$('#eventMessageModal').on('show.bs.modal', function (event) {
		var button = $(event.relatedTarget); // Button that triggered the modal
		var recipient = button.data('event-title'); // Extract info from data-* attributes
		var eventid = button.data('event-id');
		// set event-id on the modal (data)
		$(this).data('event-id',eventid);
		$('#event-message-modal-title').text ('To: ' + recipient);
		$('#event-message-modal-text').val ('');
	});

	$('#modal-send-message').on ('click', function () {
		var msg = $.trim ($('#event-message-modal-text').val());
		if (msg.length == 0) {
			// do nothing
			$('#event-message-modal-msg').html ('Enter something');
			return false;
		}
		$('#event-message-modal-msg').html (''); // clear previous message

		var eventid = $('#eventMessageModal').data('event-id');
		// send message
		$.post (server + "sendMessage.php", {event_id:eventid, message:msg})
		.done (function (response) {
			var resp = $.parseJSON (response);
			if (resp[0] == "OK") {
				$('#eventMessageModal').modal ('hide');
				return false;
			}
			else {
				$('#event-message-modal-msg').html ('Error');
			}
		})
		.fail (function (response) {
			$('#event-message-modal-msg').html ("Darn. Something went wrong");
		});
	});

	return false;

});

function resend_email () {
	var userid=$('#resend-email-btn').data('id');
	if (userid != '0') {
		$.post (server + 'resendEmail.php', {userid:userid})
		.done (function (response) {
			var resp = $.parseJSON(response);
			if (resp[0] == 'OK') {
				setNavbar (false, "", 'Email resent. <span class="highlight-warning">Check your spam folder too</span>');
			} else {
				setNavbar (false, "", 'Error re-sending email');
			}
		})
		.fail (function (response) {
			setNavbar (false, "", 'Resend email Failed');
		});

	} else {
		setNavbar (false, "", 'Something went wrong');
	}
	return false;
}

// Login is only on home page.
function login() {
	var u = $.trim($('#username').val());
	var p = $.trim($('#password').val());

	if (u.length == 0 || p.length == 0) {
		$('#login-msg').html ("Enter something dude").show ();
		return false;
	} 

	// login.php
	// in - [username, passwd]
	// out - [status, msg, user's name]
	$.post (server + "login.php", {username:u,password:p})
	.done (function (response) {
		var resp=$.parseJSON(response);
		if (resp[0] == "OK") {
			// check user is verified
			if (resp[1] == 'verified') {
				// clear all buttons for reload
				clearAllBtns ();
				setNavbar (true, resp[2],"");
				getEventsAround ();
			} else {
				setNavbar (false, "", 'You have not verified your email yet');
				$('#resend-email-btn').data('id',resp[2]).show();
			}
		}
		else {
			setNavbar (false, "", "Oops. Login failed");
		}
	})
	.fail (function () {
		setNavbar (false, "", "Darn. Something went wrong");
	});
	return false;
}

function getEventsIOwn () {
	if ($('#events-i-own-btn').hasClass('events-option-selected')) {
		// do nothing
	} else {
		loadEvents('getEventsIOwn');
		clearAllBtns ();
		$('#events-i-own-btn').addClass('events-option-selected');
		// reset past events counter
		$('#past-events-btn').html ('Past Events');
		$('#past-events-btn').data('older-by', 3);
		return false;
	}
}
function getEventsIAmAttending () {
	if ($('#events-i-am-attending-btn').hasClass('events-option-selected')) {
		// do nothing
	} else {
		loadEvents('getEventsIAmAttending');
		clearAllBtns ();
		$('#events-i-am-attending-btn').addClass('events-option-selected');
		$('#older-events-label').html (' Past Events');
		$('#older-events-label').data('older-by', 3);
		return false;
	}
}

/*
function getAllEvents () {
	if ($('#all-events-btn').hasClass('events-option-selected')) {
		// do nothing
	} else {
		loadEvents();
		clearAllBtns ();
		$('#all-events-btn').addClass('events-option-selected');
		$('#older-events-label').html (' Past Events');
		$('#older-events-label').data('older-by', 3);
		return false;
	}
}
*/

function getEventsAround () {
	// save location value
	var c = $('#location').val();
	var lat = $('#location').data('lat');
	var lng = $('#location').data('lng');
	clearAllBtns ();
	// restore value of location input which is cleared by clearAllBtns above
	$('#location').val(c);
	$('#location').data('lat',lat);
	$('#location').data('lng',lng);
	// set this label to show it is selected
	$('#events-around-label').addClass('events-option-selected');
	// if no county selected, list all
	if (c == '') {
		loadEvents();
	} else {
		loadEvents('getEventsAround');
	}
}

function getPastEvents () {
	// check older-by
	var older_by = $('#past-events-btn').data('older-by');
	if (older_by < 13) {
		clearAllBtns (); // this resets #past-events-btn.older-by to 3
		loadEvents(older_by.toString());
		// set #past-events-btn.older-by to new value
		$('#past-events-btn').data('older-by', older_by + 3); 
		$('#past-events-btn').html(' Events for last ' + older_by + ' months');
		$('#past-events-btn').addClass('events-option-selected');
	} else {
		$('#past-events-btn').html(' Cannot go beyond 12 months');
	}
	return false;
}
function clearAllBtns () {
	$('#all-events-btn').removeClass('events-option-selected');
	$('#events-around-label').removeClass('events-option-selected');
	$('#location').val ('');
	$('#location').data ('lat','0');
	$('#location').data ('lng','0');
	$('#past-events-btn').removeClass('events-option-selected');
	$('#events-i-am-attending-btn').removeClass('events-option-selected');
	$('#events-i-own-btn').removeClass('events-option-selected');
	// reset older-by to 3 months
	$('#past-events-btn').data('older-by', 3);
	$('#past-events-btn').html ('Past Events');
}

function loadEvents (f) {
	var filter = f || '';
	var params;
	var is_past_event = false;

	$('#events-list').html ("Loading...");

	// get the selected events depending on filter
	switch (filter) {
		case 'getEventsIOwn':
			params = {filter:'eventsIOwn'};
			break;
		case 'getEventsIAmAttending':
			params = {filter:'eventsIAmAttending'};
			break;
		case 'getEventsAround':
			params = {filter:'eventsAround',lat:$('#location').data('lat'),lng:$('#location').data('lng')};
			break;
		case '3':
			params = {filter:'pastEvents',older_by:3};
			is_past_event = true;
			break;
		case '6':
			params = {filter:'pastEvents',older_by:6};
			is_past_event = true;
			break;
		case '9':
			params = {filter:'pastEvents',older_by:9};
			is_past_event = true;
			break;
		case '12':
			params = {filter:'pastEvents',older_by:12};
			is_past_event = true;
			break;
		default:
			params = {filter:'allEvents'};
	}

	$.post (server + 'getEvents.php', params)
	.done (function (response) {
		var resp = $.parseJSON (response);
		if (resp[0][0] == "OK") {
			// [[OK|NOTOK, err_msg],[event],[event],....]
			// event array:
			// [0] [id, start, finish, invite_type, title, type, description, max_attendees, num_attendees, location
			// [10] owner_id, owner_fname, owner_lname, owner_profile_image, is_logged_in, is_owner, attending(yes/pending), reason,
			// [18] [[attendee_id, attendee_fname, attendee_lname],[],...]
			var h = "";
			var owner_id, owner_img, owner_fname, owner_lname, max_attendees, num_attendees, is_logged_in, is_owner, is_full, verb;

			for (x=1; x < resp.length; x++) {
				max_attendees = parseInt (resp[x][7]);
				num_attendees = parseInt (resp[x][8]);
				is_logged_in = (resp[x][14] == '1' ? true : false );
				is_owner = (resp[x][15] == '1' ? true : false );
				is_full = false;
				// title 
				h += '<hr style="color:black"><div class="row event-title-row">'; // title row
				h += '<div class="col-md-12">'; // title col
				h += '<p class="event-title">';
				if (is_owner) { 
					h += '<a class="event-title" href="edit_event.html?q=' + resp[x][0] + '">' + resp[x][4] + '</a>';
					h += '<a id="delete-event-btn'+ resp[x][0] 
						+ '" class="delete-event-btn" data-event-id="' + resp[x][0] + '">'
						+ '<span class="glyphicon glyphicon-trash"></span></a>';
				} else {
					h += '<a href="event.html?q=' + resp[x][0] + '">' + resp[x][4] + '</a>';
				}
				h += '</p></div>'; // title col
				// owner details to add to attendee list later
				owner_id = resp[x][10];
				owner_img = (resp[x][13] == null ? 'img/generic_user.png' : image_server + resp[x][13]);
				owner_fname = resp[x][11];
				owner_lname = resp[x][12];
				/*
				h += '<div class="col-md-2">';
				if (is_logged_in) { 
					if (is_owner) {
						h += '<a id="delete-event-btn'+ resp[x][0] 
							+ '" class="delete-event-btn" data-event-id="' + resp[x][0] + '">'
							+ '<span class="glyphicon glyphicon-trash"></span> Delete Event</a>';
					} else {
						h += '<a class="event-owner" href="profile.html?q=' + owner_id + '">' 
							+ '<span>' + owner_fname + ' ' + owner_lname + '</span></a>';
					}
				} else {
					h += '<strong>' + owner_fname + ' ' + owner_lname + '</strong>';
				}
				*/

				h += '</div></div>'; // owner col & title row

				h += '<div class="row">'; // date, description etc row
				// start, finish, type
				h += '<div class="col-md-2">';
				h += '<p class="event-date">' + resp[x][1] + '</p>';
				// is start/finish on the same day
				if (resp[x][1] == resp[x][2]) {
					h += '<p>Day trip</p>';
				} else {
					h += '<p class="event-date">to ' + resp[x][2] + '</p>';
				} 
				h += '<p class="event-location">' + resp[x][9] + '</p>'
					+ '<p class="event-type">' + resp[x][5] + '</p>'
					+ '</div>'; // date,type col
				// description
				h += '<div class="col-md-8">'
					+ '<p class="event-description">' + resp[x][6] + '</p>'
					+ '</div>';

				// [0] id, start, days, invite_type, title, type, description, max_att, num_att, location
				// [10] owner_id, owner_fname, owner_lname, owner_image_filename, is_logged_in, is_owner, attending(yes/no), reason,
				// [18] [[attendee_id, fname, lname, profile_image_filename],...]

				// actions, options
				h += '<div class="col-md-2">';
				if (is_past_event) {
					verb = ' went, ';
				} else {
					verb = ' going, ';
				}
				h += '<p class="attending-spaces">' + (num_attendees > 0 ? (num_attendees + verb) : '');
				if (max_attendees == 0) {
					h += 'unlimited spaces';
				} else if (num_attendees == max_attendees ) {
					h += 'FULL';
					is_full = true;
				} else {
					h += (max_attendees - num_attendees) +  ' spaces';
				}
				h += '</p>';
				
				// show Message/Join etc options if not showing past events
				if (!is_past_event) {
					if (is_logged_in) { // logged in
						if (is_owner) { // owner
							// owner is always attendee #1, so check if there are more than 1 attending
							if (num_attendees > 1) { 
								h += '<p class="event-option"><a class="btn btn-info btn-sm option-btn message-group-btn" data-toggle="modal"'
									+ ' data-target="#eventMessageModal" data-event-title="'
									+ resp[x][4]
									+ '" data-event-id="' + resp[x][0]
									+ '">Message the group</a></p>';
							}
						} else if (resp[x][16] == 'yes') { // attending
							// if I am attending there must be more than 1 attendee (owner being the first)
							// if (num_attendees > 0) {
								h += '<p class="event-option"><a class="btn btn-info btn-sm option-btn message-group-btn" data-toggle="modal"'
									+ ' data-target="#eventMessageModal" data-event-title="'
									+ resp[x][4]
									+ '" data-event-id="' + resp[x][0]
									+ '">Message the group</a></p>';
							// }
							h += '<p class="event-option"><a class="btn btn-danger btn-sm option-btn leave-event-btn" data-event-id="'
								+ resp[x][0]
								+ '">Leave the event</a></p>';
						} else if (resp[x][16] == 'pending') { // pending
							// check the reason for 'pending' and act accordingly
							if (resp[x][17] == 'event-invitation') {
								h += '<p><a class="pending-event-invitation" href="my_messages.html">You have a pending invitation</a></p>';
							} else if (resp[x][17] == 'join-request') {
								h += '<p><a class="pending-join-request" href="my_messages.html">You have asked to join</a></p>';
							}
						} else { // not owner or member
							if (!is_full) {
								if (resp[x][3] == 'invite-only') { // value set in new_event.html, not ideal
									h += '<a class="btn btn-success btn-sm option-btn request-join-event-btn" data-event-id="' 
										+ resp[x][0] + '">Ask to join this event</a>';
								} else {
									h += '<a class="btn btn-success btn-sm option-btn join-event-btn" data-event-id="'
										+ resp[x][0] + '">Join this event</a>';
								}
							}
						}
					}
				}

				h += '</div>'; // options col
				h += '</div>'; // date, description row

				// print attendees including the owner
				// [attendee_id, fname, lname, image-name]
				h += '<div class="row"><div class="col-xs-12">';
				// add owner to the attendee list
				if (is_logged_in) {
					h += '<a class="first-event-attendee" href="profile.html?q=' + owner_id + '">' 
						+ '<img class="owner-attendee-image" src="' + owner_img + '">'
						+ '<span>' + owner_fname + ' ' + '</span></a>';
				} else {
					h += '<img class="owner-attendee-image" src="' + owner_img + '">'
						+ '<span>' + owner_fname + ' ' + '</span>';
				}
				var att = resp[x][18];
				for (a=0; a < att.length; a++) {
					img_src = (att[a][3] == null ? 'img/generic_user.png' : image_server + att[a][3]);
					// if logged in, give link to attendee profile
					if (is_logged_in) {
						h += '<a class="event-attendee" href="profile.html?q=' + att[a][0] + '">' 
							+ '<img class="attendee-image" src="' + img_src + '">'
							+ '<span>' + att[a][1] + ' ' + '</span></a>';
					} else {
						h += '<img class="attendee-image" src="' + img_src + '">'
							+ '<span>' + att[a][1] + ' ' + '</span>';
					}
				}

				h += '</div></div>'; // attendees row/col
			}
		}
		if (h == '') {h = '<h4 class="text-muted">None</h4>';}
		$('#events-list').html (h);

		// on error these handlers change the text of all instances of the class. Add id later so only update the specific item.

		// delete-event handler
		$('.delete-event-btn').on('click', function (event) {
			if ($(this).data('confirm') == '1') {
				var event_id = $(this).data('event-id');
				if (event_id == '0') {
					return false;
				}
				var caller = $(this);
				$.post(server + "deleteEvent.php", {event_id:event_id})
				.done (function(response) {
					var resp = $.parseJSON(response);
					if (resp[0] == 'OK') {
						caller.data('event-id','0');
						caller.html('Deleted');
					}
				})
				.fail (function(response) {
					$('#delete-event-btn'+event_id).html('Failed: ' + event_id);
				});
			} else {
				$(this).data('confirm','1');
				$(this).html('<strong>Click again to confirm DELETE</strong>');
			}
			return false;
		});

		// join-event handler
		$('.join-event-btn').on("click", function () {
			if ($(this).data('joined') != '1') { // prevent the link from being clicked again
				$(this).removeClass('join-event-btn');
				$(this).addClass('just-joined-event');
				$(this).html("Joined");
				$.post (server + "joinEvent.php", {event_id:$(this).data('event-id')})
				.done (function (response) {
					var resp = $.parseJSON(response);
					if (resp[0] == "OK") {
						// do nothing, it worked
					} else {
						$('.just-joined-event').html ('Join error');
					}
				})
				.fail (function (response) {
					$('.just-joined-event').html('Join failed');
				});
			}
			$(this).data('joined', '1');
		});

		// request-join-event handler 
		$('.request-join-event-btn').on("click", function () {
			if ($(this).data('requested') != '1') { // prevent the link from being clicked again
				$(this).removeClass('request-join-event-btn');
				$(this).addClass('requested-join-event');
				$(this).html("Request sent");
				$.post (server + "sendJoinEventRequest.php", {event_id:$(this).data('event-id')})
				.done (function (response) {
					var resp = $.parseJSON(response);
					if (resp[0] == "OK") {
						// do nothing, it worked
					} else {
						$('.requested-join-event').html ('Request error');
					}
				})
				.fail (function (response) {
					$('.requested-join-event').html('Request failed');
				});
			}
			$(this).data('requested', '1');
		});
		// leave-event-btn handler 
		$('.leave-event-btn').on("click", function () {
			if ($(this).data('requested') != '1') { // prevent the link from being clicked again
				$(this).html("Left this event");
				$.post (server + "leaveEvent.php", {event_id:$(this).data('event-id')})
				.done (function (response) {
					var resp = $.parseJSON(response);
					if (resp[0] == "OK") {
						// do nothing, it worked
					} else {
						$('.leave-event-btn').html ('error');
					}
				})
				.fail (function (response) {
					$('.leave-event-btn').html('failed');
				});
			}
			$(this).data('requested', '1');
		});
	}) // done
	.fail (function (response) {
		$('#events-list').html('Failed');
	});
	return false;
}

// initialize googlePlacesAutocomplete for Event location as well as search for users
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
