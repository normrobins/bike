/*
 * about page
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
			// shows login options which should only appear on home page, so removed for now.
			// setNavbar (false, '','');
		}
	})
	.fail (function (response) {
		$('#edit-event-msg').html ("Error (ready)").show ();
		setNavbar (false, '','Something failed');
	});

	return false;
});
