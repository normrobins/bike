/*
 * My Friends page
 */

$(document).ready (function () {
	// isLoggedIn.php out=none, in=ret_status, ret_msg, isLoggedIn (yes/no), username
	$.post (server + "isLoggedIn.php")
	.done (function (response) {
		var resp = $.parseJSON (response);
		if (resp[0] == "OK" && resp[2]=="yes") {
			setNavbar (true, resp[3], '');
			loadMyFriends ();
			loadFriendRequests ();
			loadPendingFriends ();
			$('#send-friend-request-btn').show();
		}
		else {
			setNavbar (false, '', '');
			$('#send-friend-request-msg').html ("Not logged in").show ();
		}
	})
	.fail (function (response) {
		$('#send-friend-request-msg').html ("Error").show ();
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
		var search_location = $.trim($('#location').val());
		var lat = $('#location').data('lat') || '0';
		var lng = $('#location').data('lng') || '0';
		var search_bike_make = $.trim($('#bike_make').val());
		var search_age = $('#select-age').val();
		var search_gender = $('#select-gender').val();
		var search_ability = $('#select-ability').val();

		// searchUsers: [[OK|NOTOK,msg][userid, firstname, lastname, location, bike_manufacturer, bike_model, bike_year][....]]
		$.post (server + "searchUsers.php", {firstname:search_firstname,
						lastname:search_lastname,
						location:search_location,
						lat:lat,
						lng:lng,
						bike_make:search_bike_make,
						source:'friends',
						age:search_age,
						gender:search_gender,
						ability:search_ability
						})
		.done (function (response) {
			var resp = $.parseJSON (response);
			if (resp[0][0] == "OK") {
				// reset select-all button
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
				// user-invitee checkbox button
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
				$('#send-friend-request-msg').html(resp[0][1]).show ();
			}
		})
		.fail (function (response) {
			$('#send-friend-request-msg').html ("Failed").show ();
		});
	});
	return false;
});

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

function loadMyFriends () {
	// getFriends out=>nothing in=>f.id, f.friend_id, u.firstname, u.lastname, f.last_used
	$.post (server + "getFriends.php")
	.done (function (response) {
		var resp = $.parseJSON (response);
		var h = ''
		if (resp[0][0] == "OK") {
			var row_done = true;
			for (x=1; x < resp.length; x++) {
				if (x % 2) {
					h += '<div class="row">'; // new row
					h += '<div class="col-md-6 col-xs-12">'
						+ '<a class="friend-name" data-toggle="modal" data-target="#userProfileModal" data-id="' 
						+ resp[x][1] + '">'
						+ resp[x][2] + ' ' + resp[x][3] + '</a>'
						+ '<a class="unfriend-link unfriend unfriend-confirm" data-friendsid="' + resp[x][0] + '">Unfriend</a>'
						+ '</div>';
					row_done = false;
				} else {
					h += '<div class="col-md-6 col-xs-12">'
						+ '<a class="friend-name" data-toggle="modal" data-target="#userProfileModal" data-id="' 
						+ resp[x][1] + '">'
						+ resp[x][2] + ' ' + resp[x][3]
						+ '<a class="unfriend-link unfriend unfriend-confirm" data-friendsid="' + resp[x][0] + '">Unfriend</a>'
						+ '</div>';
					h += '</div>'; // end off the row
					row_done = true;
				}
			}
			if (!row_done) {h += '</div>';}
			if (h == '') {h = 'none';}
			$('#my-friends').html (h);

			// unfriend handler
			$('.unfriend').on ('click', function () {
				if ($(this).hasClass('unfriend-confirm')) {
					// needs confirmation
					$(this).removeClass('unfriend-confirm');
					$(this).html ('Click again to CONFIRM');
				} else {
					// do it
					$(this).html ('unfriended');
					$(this).addClass('unfriending');
					$.post (server + "unfriend.php", {friendsid:$(this).data('friendsid')})
					.done ( function (response) {
						var resp = $.parseJSON (response);
						if (resp[0] == 'OK') {
							// all fine. do nothing
						} else {
							$('.unfriending').html('error');
						}
					})
					.fail (function (response) {
						$('.unfriending').html('failed');
					});
				}
			});
		}
		else {
			$('#send-friend-request-msg').html (resp[0][1]).show ();
			$('#friend-invitees').html ($('#friend-invitees').html() + " Failed");
		}
	})
	.fail (function (response) {
		$('#send-friend-request-msg').html ("Error").show ();
		$('#friend-invitees').html ($('#friend-invitees').html() + " Failed");
	});
}

// friend requests sent to me
function loadFriendRequests () {
	// [[status(OK|NOTOK), status_msg], [message.id, timeago(date), message, friend_id, firstname, lastname],[..],...]
	$.post (server + "getFriendRequests.php")
	.done (function (response) {
		var resp = $.parseJSON (response);
		if (resp[0][0] == "OK") {
			var h = '';
			for (x=1; x<resp.length; x++) {
				// if no message, show [no message]
				h += '<div class="row friend-request-row">'
					+ '<div class="col-md-3">'
					+ '<span class="friend-request-name">' + resp[x][4] + ' ' + resp[x][5] + '</span>'
					+ '<span class="friend-request-timeago">' + resp[x][1] + '</span>'
					+ '</div>'
					+ '<div class="col-md-9">';
				if (resp[x][2] == '') {
					h += '<span class="friend-request-message">[no message]</span>';
				} else {
					h += '<span class="friend-request-message">' + resp[x][2] + '</span>';
				}
				h += '<p><a class="accept-friend-request" data-messageid="' + resp[x][0] 
					+ '" data-friendid="' + resp[x][3]
					+ '" id="afr' + resp[x][0] + '">Accept</a>'
					+ '<a class="ignore-friend-request" data-messageid="' + resp[x][0] + '" id="ifr' + resp[x][0] + '">Ignore</a></p>'
					+ '</div>' // col
					+ '</div>'; // row
			}
			if (h != '') {
				$('#friend-requests').html(h);
				$('#friend-requests-div').show ();
				$('#friend-requests-div1').show ();
			}

			// handler for Accept buttons class afr
			$('.accept-friend-request').on('click', function () {
				if ($(this).data('inactive') != '1') { // so it can't be clicked again
					$(this).html('Accepted');
					var id = $(this).data('messageid');
					// hide ignore button
					$('#ifr' + id).hide ();
					$.post (server + 'acceptFriendRequest.php', {messageid:id,
										friendid:$(this).data('friendid')})
					.done (function (response) {
						// do nothing
					})
					.fail (function (response) {
						$('#afr' + id).html ('failed');
					});
				}
				$(this).data('inactive', '1');
			});
			// handler for Ignore buttons class ifr
			$('.ignore-friend-request').on('click', function () {
				if ($(this).data('inactive') != '1') {
					$(this).html('Ignored');
					var id = $(this).data('messageid');
					// hide accept button
					$('#afr' + id).hide ();
					$.post (server + 'declineFriendRequest.php', {messageid:id})
					.done (function (response) {
						// do nothing
					})
					.fail (function (response) {
						$('#ifr' + id).html ('failed');
					});
				}
				$(this).data('inactive','1');
			});
		}
		else {
			$('#friend-requests').html('Something went wrong');
		}
	})
	.fail (function (response) {
		$('#friend-requests').html ("Failed");
	});

	return false;
}

// Friend requests that I have sent
function loadPendingFriends () {
	// getPendingFriends out=>nothing in=>pm.id, pm.created_at, pm.message, pm.recipient_id, u.firstname, u.lastname
	$.post (server + "getPendingFriends.php")
	.done (function (response) {
		var resp = $.parseJSON (response);
		var h = ''
		if (resp[0][0] == "OK") {
			for (x=1; x < resp.length; x++) {
				h += '<div class="row pending-friend-row">'
					+ '<div class="col-md-3">'
					+ '<span class="pending-friend-name">' + resp[x][4] + ' ' + resp[x][5] + '</span>'
					+ '<span class="pending-friend-timeago">' + resp[x][1] + '</span>'
					+ '</div>'
					+ '<div class="col-md-6">';
				if (resp[x][2] == '') {
					h += '<span class="pending-friend-message">[no message]</span>';
				} else {
					h += '<span class="pending-friend-message">' + resp[x][2] + '</span>';
				}
				h += '</div>'
					+ '<div class="col-md-2">'
					+ '<a class="cancel-pending-friend" data-messageid="' + resp[x][0] 
					+ '" data-friendid="' + resp[x][3]
					+ '" id="cfr' + resp[x][0] + '">Cancel</a>'
					+ '</div>'
					+ '</div>';
			}
			if (h != '') {
				$('#pending-friends').html (h);
				$('#pending-friends-div').show();
				$('#pending-friends-div1').show();
			}

			// cancel-request handler
			$('.cancel-pending-friend').on ('click', function () {
				if ($(this).data('inactive') != '1') {
					$(this).html ('cancelled');
					var id = $(this).data('messageid');
					$.post (server + "cancelFriendRequest.php", {messageid:id})
					.done (function (response) {
						var resp = $.parseJSON (response);
						if (resp[0] == "OK") {
							// do nothing
						}
						else {
							$('#cfr' + id).html ('error');
						}
					})
					.fail (function (response) {
						$('#cfr' + id).html ('failed');
					});
				}
				$(this).data('inactive','1');
			});
		}
		else {
			$('#send-friend-request-msg').html (resp[0][1]).show ();
			$('#friend-invitees').html ($('#friend-invitees').html() + " Failed");
		}
	})
	.fail (function (response) {
		$('#send-friend-request-msg').html ("Error").show ();
		$('#friend-invitees').html ($('#friend-invitees').html() + " Failed");
	});
}

function sendFriendRequest () {
	$('#send-friend-request-msg').html ("Sending...").show ();
	// check that some users are selected
	var y = new Array();
	$('.user-invitee-btn').each (function () {
		if ($(this).hasClass('glyphicon-check')) {
			y.push ($(this).data('userid'));
		}
	});
	if (y.length == 0) {
		$('#send-friend-request-msg').html ('Choose someone').show();
		return false;
	}

	var user_invitees = JSON.stringify (y);

	var invitation_msg = $.trim($('#invitation-msg').val());

	// post the event
	$.post (server + "sendFriendRequest.php", {user_invitees:user_invitees,
					invitation_msg:invitation_msg })
	.done (function (response) {
		var resp = $.parseJSON (response);
		if (resp[0] == "OK") {
			$('#send-friend-request-msg').html ("Request sent").show ();
			// change checkbox on all selected users so they cannot be invited again
			$('.user-invitee-btn').each (function () {
				if ($(this).hasClass('glyphicon-check')) {
					$(this).removeClass('glyphicon-check');
					$(this).addClass('glyphicon-ok');
				}
			});
		}
		else {
			$('#send-friend-request-msg').html ("Error").show ();
		}
	})
	.fail (function (response) {
		$('#send-friend-request-msg').html ("Failed").show ();
	});

	return false;
}

// initialize googlePlacesAutocomplete for user location 
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
