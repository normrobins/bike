/*
 * accept_event_invitation email page
 */

$(document).ready (function () {
	// check if request params are OK
	var message_id = getParameterByName('q');
	var code_a = getParameterByName('a');
	var code_b = getParameterByName('b');

	if ((message_id == '') || (code_a == '') || (code_b == '')
		|| (message_id == null) || (code_a == null) || (code_b == null)) {
		$('#accept-msg').html('Oops, something went wrong. Try accepting on the RevUpAndRide website');
	} else {
		$.post (server + "checkFriendInvitationByEmail.php", {messageid:message_id,
									code_a:code_a,
									code_b:code_b})
		.done (function (response) {
			var resp = $.parseJSON(response);
			if (resp[0] == 'OK') {
				// don't check if logged in or not, just process the request.
				$.post (server + "acceptFriendRequest.php", {messageid:message_id,email_invitation:'email'})
				.done (function (response) {
					var resp = $.parseJSON (response);
					if (resp[0] == "OK") {
						$('#accept-msg').addClass('text-success');
						$('#accept-msg').html('Invitation Accepted');
					} else {
						$('#accept-msg').addClass('text-danger');
						$('#accept-msg').html('Accept Error. Please try via the website.');
					}
				})
				.fail (function (response) {
					$('#accept-msg').html ("Accept Failed, try again on the RevUpAndRide website").show ();
				});
			} else {
				$('#accept-msg').html('Sorry, could not accept the invitation. Have you accepted/declined already? Or use the RevUpAndRide website to accept');
			}
		})
		.fail (function () {
			$('#accept-msg').html ("Accept check Failed, try again on the RevUpAndRide website").show ();
		});
	}
	return false;
});
