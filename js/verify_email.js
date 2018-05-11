/*
 * verify email page
 */

$(document).ready (function () {
	// isLoggedIn.php out=none, in=ret_status, ret_msg, isLoggedIn (yes/no), username
	$.post (server + "isLoggedIn.php")
	.done (function (response) {
		var resp = $.parseJSON (response);
		if (resp[0] == "OK" && resp[2]=="yes") {
			// if user is logged in then something is amiss
			$('#verify-btn').hide ();
			$('#verify-msg').html('Oops. Something went wrong').show();
		}
		else {
			$('#verify-btn').show ();
			// not logged in, verify the user's email
			$.post (server + 'verifyEmail.php', {code_a:getParameterByName('a')})
			.done (function (response) {
				var resp = $.parseJSON(response);
				if (resp[0] == 'OK') {
					$('#verify-msg').html('Thanks! Your email is verified, you can log in').show();
				} else {
					$('#verify-msg').html('Error verifying your email').show();
				}
			})
			.fail (function (response) {
				$('#verify-msg').html('Failed to verify email').show();
			});
		}
	})
	.fail (function (response) {
		$('#verify-msg').html ("Error").show ();
	});
});
