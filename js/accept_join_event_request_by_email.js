/*
 * accept_event_invitation email page
 */

$(document).ready (function () {
	// check if request params are OK
	var ea_id = getParameterByName('q');
	var code_a = getParameterByName('a');
	var code_b = getParameterByName('b');

	if ((ea_id == '') || (code_a == '') || (code_b == '')
		|| (ea_id == null) || (code_a == null) || (code_b == null)) {
		$('#accept-msg').html('Oops, something went wrong. Try accepting on the RevUpAndRide website');
	} else {
		$.post (server + "checkJoinEventRequestByEmail.php", {ea_id:ea_id,
									code_a:code_a,
									code_b:code_b})
		.done (function (response) {
			var resp = $.parseJSON(response);
			if (resp[0] == 'OK') {
				// don't check if logged in or not, just process the request.
				$.post (server + "acceptJoinEventRequest.php", {invitation_id:ea_id,email_invitation:'email'})
				.done (function (response) {
					var resp = $.parseJSON (response);
					if (resp[0] == "OK") {
						$('#accept-msg').addClass('text-success');
						$('#accept-msg').html('Request Accepted');
					} else {
						$('#accept-msg').addClass('text-danger');
						if (resp[1] == 'max_attendees') {
							$('#accept-msg').html('Oops! The event is full, increase Max Attendees if you want.');
						} else {
							$('#accept-msg').html('Accept Error. Please try via the website.');
						}
					}
				})
				.fail (function (response) {
					$('#accept-msg').addClass('text-danger');
					$('#accept-msg').html ("Accept Failed, try again on the RevUpAndRide website").show ();
				});
			} else {
				$('#accept-msg').addClass('text-danger');
				$('#accept-msg').html('Sorry, could not accept the request. Have you accepted/declined already? Or use the RevUpAndRide website to accept');
			}
		})
		.fail (function () {
			$('#accept-msg').html ("Accept check Failed, try again on the RevUpAndRide website").show ();
		});
	}
	return false;
});
