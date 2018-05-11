/*
 * accept_event_invitation email page
 */

$(document).ready (function () {
	// check if request params are OK
	var message_id = getParameterByName('q');
	var email_code_a = getParameterByName('a');
	var email_code_b = getParameterByName('b');

	if ((message_id == '') || (email_code_a == '') || (email_code_b == '')
		|| (message_id == null) || (email_code_a == null) || (email_code_b == null)) {
		$('#accept-msg').html('Oops, something went wrong. Try accepting on the RevUpAndRide website');
	} else {
		$.post (server + "checkEventInvitationByEmail.php", {messageid:message_id,
									email_code_a:email_code_a,
									email_code_b:email_code_b})
		.done (function (response) {
			var resp = $.parseJSON(response);
			if (resp[0] == 'OK') {
				// don't check if logged in or not, just process the request.
				$.post (server + "acceptEventInvitation.php", {messageid:message_id,email_invitation:'email'})
				.done (function (response) {
					var resp = $.parseJSON (response);
					if (resp[0] == "OK") {
						// if user is logged in then something is amiss
						$('#accept-msg').addClass('text-success');
						$('#accept-msg').html('You have joined the event');
					} else {
						$('#accept-msg').addClass('text-danger');
						if (resp[1] == 'max_attendees') {
							$('#accept-msg').html('Sorry, the event is now full');
						} else {
							$('#accept-msg').html('Sorry, could not join. Log into RevUpAndRide to see what happened');
						}
					}
				})
				.fail (function (response) {
					$('#accept-msg').html ("Accept Failed, try again on the RevUpAndRide website").show ();
				});
			} else {
				$('#accept-msg').html('Sorry, could not join the event. Have you accepted/declined already? Or use the RevUpAndRide website to accept');
			}
		})
		.fail (function () {
			$('#accept-msg').html ("Accept check Failed, try again on the RevUpAndRide website").show ();
		});
	}
	return false;
});
