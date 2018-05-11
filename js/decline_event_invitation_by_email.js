/*
 * decline_event_invitation email page
 */

$(document).ready (function () {
	// check if request params are OK
	var message_id = getParameterByName('q');
	var email_code_a = getParameterByName('a');
	var email_code_b = getParameterByName('b');

	if ((message_id == '') || (email_code_a == '') || (email_code_b == '')
		|| (message_id == null) || (email_code_a == null) || (email_code_b == null)) {
		$('#decline-msg').html('Oops, something went wrong. Try declining on the RevUpAndRide website');
	} else {
		$.post (server + "checkEventInvitationByEmail.php", {messageid:message_id,
									email_code_a:email_code_a,
									email_code_b:email_code_b})
		.done (function (response) {
			var resp = $.parseJSON(response);
			if (resp[0] == 'OK') {
				// don't check if logged in or not, just process the request.
				$.post (server + "declineEventInvitation.php", {messageid:message_id,email_invitation:'email'})
				.done (function (response) {
					var resp = $.parseJSON (response);
					if (resp[0] == "OK") {
						// if user is logged in then something is amiss
						$('#decline-msg').addClass('text-success');
						$('#decline-msg').html('You have declined the invitation');
					} else {
						$('#decline-msg').addClass('text-danger');
						$('#decline-msg').html('Sorry, could not decline the invitation. Log into RevUpAndRide decline');
					}
				})
				.fail (function (response) {
					$('#decline-msg').html ("Decline Failed, try again on the RevUpAndRide website").show ();
				});
			} else {
				$('#decline-msg').html('Sorry, could not decline the invitation. Have you accepted/declined already? Or use the RevUpAndRide website to decline');
			}
		})
		.fail (function () {
			$('#decline-msg').html ("Decline check Failed, try again on the RevUpAndRide website").show ();
		});
	}
	return false;
});
