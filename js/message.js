/*
 * Send Message page
 */

$(document).ready (function () {
	// isLoggedIn.php out=none, in=ret_status, ret_msg, isLoggedIn (yes/no), username
	$.post (server + "isLoggedIn.php")
	.done (function (response) {
		var resp = $.parseJSON (response);
		if (resp[0] == "OK" && resp[2]=="yes") {
			$('#send-message-btn').show();
		}
		else {
			$('#send-message-msg').html ("Not logged in").show ();
		}
	})
	.fail (function (response) {
		$('#send-message-msg').html ("Error").show ();
	});
	return false;
});

function sendMessage () {
	// check fields
	var message = $.trim ($('#message').val());

	if (message.length == 0) {
		$('#send-message-msg').html("Enter a message").show();
		return false;
	}

	// not a great way to pass the event_id but good enough for now
	var event_id = getParameterByName ("q", window.location.href);

	if ((event_id == null) || (event_id == '')) {
		$('#send-message-msg').html("Something went wrong").show();
		return false;
	}

	var message = $.trim($('#message').val());

	// send message
	$.post (server + "sendMessage.php", {event_id:event_id, message:message})
	.done (function (response) {
		var resp = $.parseJSON (response);
		if (resp[0] == "OK") {
			$('#send-message-msg').html ('Message sent').show ();
			window.location.replace ('index.html');
			return false;
		}
		else {
			$('#send-message-msg').html (resp[1]).show ();
		}
	})
	.fail (function (response) {
		$('#send-message-msg').html ("Darn. Something went wrong").show ();
	});

	return false;
}
