/*
 * event page - View an event
 */

$(document).ready (function () {
	// if logged in, load event details and show event update button
	// isLoggedIn.php out=none, in=ret_status, ret_msg, isLoggedIn (yes/no), username
	$.post (server + "isLoggedIn.php")
	.done (function (response) {
		var resp = $.parseJSON (response);
		if (resp[0] == "OK" && resp[2]=="yes") {
			setNavbar (true, resp[3], '');
		}
		else {
			setNavbar (false, '','');
			// hide login buttons on this page
			$('#login-msg').hide ();
			$('#username').hide();
			$('#password').hide();
			$('#login-btn').hide();
		}
	})
	.fail (function (response) {
		$('#edit-event-msg').html ("Error (ready)").show ();
	});

	loadEvent (getParameterByName("q"));

	return false;
});

function loadEvent (event_id) {
	// [OK|NOTOK, msg],
	// [id, title, location, lat, lng, description, start, finish, 
	// 	type, invite_type, max_attendees, num_attendees, owner.id, firstname, lastname, image_file],
	// [[event_attendees.id, attending, reason, timeago(reason_time), message, attendee.id, firstname, lastname],[..],...]
	// [is_logged_in, is_owner, is_attending]
	$.post (server + "getEvent.php", {event_id:event_id})
	.done (function (response) {
		var resp = $.parseJSON (response);
		if (resp[0][0] == "OK") {
			// if owner, something has gone wrong
			if (resp[3][1] == '1') {
				$('#event-msg').html ('Something went wrong').show();
			} else {
				// not owner, just display fields
				$('#title').html (resp[1][1]);
				$('#location').html (resp[1][2]);
				$('#description').html (resp[1][5]);
				$('#start').html (resp[1][6]);
				$('#finish').html (resp[1][7]);
				$('#ride-type').html (resp[1][8]);
				if (resp[1][9] == 'invite-only') {
					$('#invite-type').html('Organiser must invite you');
				} else {
					$('#invite-type').html('Anyone can join');
				}
				if (resp[1][10] == '0') {
					$('#max-attendees').html('Unlimited');
				} else {
					$('#max-attendees').html(resp[1][10]);
				}

				// owner
				// if user is logged in, link to owner's profile
				var h = '';
				var profile_image = (resp[1][15] == '' ? 'img/generic_user.png' : resp[1][15]);
				if (resp[3][0] == 1) {
					h = '<a href="profile.html?q=' + resp[1][12] + '">'
						+ '<img class="profile-image" src="' + profile_image + '">'
						+ '<span class="attendee-name">'
						+ resp[1][13] + ' ' + resp[1][14]
						+ '</span></a>';
				} else {
					h = '<p><img class="profile-image" src="' + profile_image + '">'
						+ '<span class="attendee-name">'
						+ resp[1][13] + ' ' + resp[1][14]
						+ '</span></p>';
				}
				$('#owner').html (h);

				// attendees - add a row for each one
				// if is_logged_in, link to attendee profile, otherwise not
        			// [id, attending, reason, timeago(reason_time), message, attendee_id, firstname, lastname, profile_image]
				var att=resp[2];
				h='';
				for (a=0; a<att.length; a++) {
					profile_image = (att[a][8] == '' ? 'img/generic_user.png' : att[a][8]);
					h +='<p>';
					if (resp[3][0] == '1') {
						h += '<a href="profile.html?q=' + att[a][5] + '">'
							+ '<img class="profile-image" src="' + profile_image + '">'
							+ '<span class="attendee-name">'
							+ att[a][6] + ' ' + att[a][7]
							+ '</span></a>';
					} else {
						h += '<img class="profile-image" src="' + profile_image + '">'
							+ '<span class="attendee-name">'
							+ att[a][6] + ' ' + att[a][7]
							+ '</span>';
					}
					h += '</p>';
				}
				if (h == '') {h = 'none';}
				$('#attendees').html (h);
			}
		}
		else {
			$('#event-msg').html ("Something not ok").show ();
		}
	})
	.fail (function (response) {
		$('#edit-event-msg').html ("Something failed").show ();
	});
}
