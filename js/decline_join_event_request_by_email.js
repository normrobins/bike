/*
 * decline_friend_invitation email page
 */

$(document).ready (function () {
	// check if request params are OK
	var ea_id = getParameterByName('q');
	var code_a = getParameterByName('a');
	var code_b = getParameterByName('b');

	if ((ea_id == '') || (code_a == '') || (code_b == '')
		|| (ea_id == null) || (code_a == null) || (code_b == null)) {
		$('#decline-msg').html('Oops, something went wrong. Try declining on the RevUpAndRide website');
	} else {
		$.post (server + "checkJoinEventRequestByEmail.php", {ea_id:ea_id,
									code_a:code_a,
									code_b:code_b})
		.done (function (response) {
			var resp = $.parseJSON(response);
			if (resp[0] == 'OK') {
				// don't check if logged in or not, just process the request.
				$.post (server + "declineJoinEventRequest.php", {invitation_id:ea_id,email_invitation:'email'})
				.done (function (response) {
					var resp = $.parseJSON (response);
					if (resp[0] == "OK") {
						// if user is logged in then something is amiss
						$('#decline-msg').addClass('text-success');
						$('#decline-msg').html('You have declined the Join Event request');
					} else {
						$('#decline-msg').addClass('text-danger');
						$('#decline-msg').html('Sorry, could not decline the Join Event Request. Log into RevUpAndRide decline');
					}
				})
				.fail (function (response) {
					$('#decline-msg').addClass('text-danger');
					$('#decline-msg').html ("Decline Failed, try again on the RevUpAndRide website").show ();
				});
			} else {
				$('#decline-msg').addClass('text-danger');
				$('#decline-msg').html('Sorry, could not decline the Join Event Request. Have you accepted/declined already? Or use the RevUpAndRide website to decline');
			}
		})
		.fail (function () {
			$('#decline-msg').addClass('text-danger');
			$('#decline-msg').html ("Decline check Failed, try again on the RevUpAndRide website").show ();
		});
	}
	return false;
});
