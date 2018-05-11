// where php files are
var server = "server/";
// where image files are
var image_server = '';

// list of counties used by various pages
var _list_of_counties = ["Avon","Bedfordshire","Berkshire","Borders","Buckinghamshire","Cambridgeshire","Central","Cheshire","Cleveland","Clwyd","Cornwall","County Antrim","County Armagh","County Down","County Fermanagh","County Londonderry","County Tyrone","Cumbria","Derbyshire","Devon","Dorset","Dumfries and Galloway","Durham","Dyfed","East Sussex","Essex","Fife","Gloucestershire","Grampian","Greater Manchester","Gwent","Gwynedd County","Hampshire","Herefordshire","Hertfordshire","Highlands and Islands","Humberside","Isle of Wight","Kent","Lancashire","Leicestershire","Lincolnshire","London","Lothian","Merseyside","Mid Glamorgan","Norfolk","North Yorkshire","Northamptonshire","Northumberland","Nottinghamshire","Oxfordshire","Powys","Rutland","Shropshire","Somerset","South Glamorgan","South Yorkshire","Staffordshire","Strathclyde","Suffolk","Surrey","Tayside","Tyne and Wear","Warwickshire","West Glamorgan","West Midlands","West Sussex","West Yorkshire","Wiltshire","Worcestershire"];

function getCounties() {
	return _list_of_counties;
}
// VERY BASIC format check
function validateEmail(x) {
        var atpos = x.indexOf("@");
        var dotpos = x.lastIndexOf(".");
        if (atpos<1 || dotpos<atpos+2 || dotpos+2>=x.length) {
                return false;
        }
        return true;
}

function getParameterByName(name, url) {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
	results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}

// set navbar depending on whether user is logged in or not
// params = loggedIn (true|false), username, message (to be displayed on navbar)
function setNavbar (loggedIn, username, message) {
	if (loggedIn) {
		setNavbarButtons (true, username, message);
		// see if new messages are available (event-join-request, event-message or event-invitations)
		// out=>nothing
		// in=> OK|NOTOK, err_msg, new_messages[0|1]
		$.post (server + "getNewMessagesFlag.php")
		.done (function (response) {
			var resp = $.parseJSON (response);
			if (resp[0] == 'OK') {
				if (resp[2] == '1') {
					setNewMessagesFlag(true);
				} else {
					setNewMessagesFlag(false);
				}
			} else {
				$('#login-msg').html ('Error getting new messages');
			}
		})
		.fail (function (response) {
			$('#login-msg').html ('Failed to get new messages');
		});

		// get Friend Requests flag. Flag is only set if there are friend requests sent to me
		// out=>nothing
		// in=> OK|NOTOK, err_message, friend_requests[0|1]
		$.post (server + "getFriendRequestsFlag.php")
		.done (function (response) {
			var resp = $.parseJSON (response);
			if (resp[0] == 'OK') {
				if (resp[2] == '1') {
					setFriendRequestsFlag(true);
				} else {
					setFriendRequestsFlag(false);
				}
			} else {
				$('#login-msg').html ('Error getting friend requests');
			}
		})
		.fail (function (response) {
			$('#login-msg').html ('Failed to get friend requests');
		});
	} else {
		setNavbarButtons (false, '', message);
	}
}

// can be called from any page. Log out and return to home page
function logout() {
	$.post (server + "logout.php")
	.done (function (response) {
		var resp=$.parseJSON(response);
		if (resp[0] == "OK") {
			window.location.replace('index.html');
		}
		else {
			setNavbar(false, "", "Hmm. Logout failed");
		}
	})
	.fail (function () {
		setNavbar(false, "", "Darn. Something went wrong");
	});
	return false;
}

// set navbar buttons according to isLoggedIn (or not). Show username, display any message that is sent in the login-message field
function setNavbarButtons (isLoggedIn, user, message) {
	// in either case, hide the resend-email button
	$('#resend-email-btn').hide();

	if (isLoggedIn) {
		$('#username').hide ();
		$('#password').hide ();
		$('#login-btn').hide ();
		$('#register-btn').hide ();
		$('#events-i-own-btn').show ();
		$('#events-i-am-attending-btn').show ();
		$('#logout-btn').show ();
		$('#my-profile-btn').show ();
		$('#my-friends-btn').show ();
		$('#my-messages-btn').html('Messages').show ();
		$('#new-event-btn').show ();
		$('#login-msg').html(message).show();
		$('#logged-in-as').html('<span class="glyphicon glyphicon-user"></span> ' + user).show ();
	} else {
		$('#events-i-own-btn').hide ();
		$('#events-i-am-attending-btn').hide ();
		$('#logged-in-as').hide ();
		$('#logout-btn').hide ();
		$('#my-profile-btn').hide ();
		$('#my-friends-btn').hide ();
		$('#my-messages-btn').hide ();
		$('#new-event-btn').hide ();
		$('#login-msg').html(message).show ();
		$('#username').val("").show ();
		$('#password').val("").show ();
		$('#login-btn').show ();
		$('#register-btn').show ();
	}
	return false;
}

// set Messages button to show if new messages are available 
function setNewMessagesFlag (onoff) {
	if (onoff) {
		$('#my-messages-btn').html('<span class="glyphicon glyphicon-envelope"></span> Messages');
	} else {
		$('#my-messages-btn').html('Messages');
	}
}

// set Friends button to show if I have friend requests
function setFriendRequestsFlag (onoff) {
	if (onoff) {
		$('#my-friends-btn').html('<span class="glyphicon glyphicon-envelope"></span> Friends');
	} else {
		$('#my-friends-btn').html('Friends');
	}
}

