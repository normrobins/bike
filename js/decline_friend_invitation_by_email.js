/*
 * decline_friend_invitation email page
 */

$(document).ready (function () {
	// check if request params are OK
	var message_id = getParameterByName('q');
	var code_a = getParameterByName('a');
	var code_b = getParameterByName('b');

	if ((message_id == '') || (code_a == '') || (code_b == '')
		|| (message_id == null) || (code_a == null) || (code_b == null)) {
		$('#decline-msg').html('Oops, something went wrong. Try declining on the RevUpAndRide website');
	} else {
		$.post (server + "checkFriendInvitationByEmail.php", {messageid:message_id,
									code_a:code_a,
									code_b:code_b})
		.done (function (response) {
			var resp = $.parseJSON(response);
			if (resp[0] == 'OK') {
				// don't check if logged in or not, just process the request.
				$.post (server + "declineFriendRequest.php", {messageid:message_id,email_invitation:'email'})
				.done (function (response) {
					var resp = $.parseJSON (response);
					if (resp[0] == "OK") {
						// if user is logged in then something is amiss
						$('#decline-msg').addClass('text-success');
						$('#decline-msg').html('You have declined the Friend Request');
					} else {
						$('#decline-msg').addClass('text-danger');
						$('#decline-msg').html('Sorry, could not decline the Friend Request. Log into RevUpAndRide decline');
					}
				})
				.fail (function (response) {
					$('#decline-msg').html ("Decline Failed, try again on the RevUpAndRide website").show ();
				});
			} else {
				$('#decline-msg').html('Sorry, could not decline the Friend Request. Have you accepted/declined already? Or use the RevUpAndRide website to decline');
			}
		})
		.fail (function () {
			$('#decline-msg').html ("Decline check Failed, try again on the RevUpAndRide website").show ();
		});
	}
	return false;
});
