/*
 * my_messages page
 */

$(document).ready (function () {
	// isLoggedIn.php out=none, in=ret_status, ret_msg, isLoggedIn (yes/no), username
	$.post (server + "isLoggedIn.php")
	.done (function (response) {
		var resp = $.parseJSON (response);
		if (resp[0] == "OK" && resp[2]=="yes") {
			setNavbar (true, resp[3], '');
			loadEventInvitationsToMe ();
			loadJoinEventRequestsToMe ();
			loadJoinEventRequestsFromMe ();
			loadMyMessages ();
		}
		else {
			$('#my-messages-msg').html ("Not logged in").show();
			setNavbar (false, '', 'Something went wrong');
		}
	})
	.fail (function (response) {
		$('#my-messages-msg').html ("Failed").show ();
		setNavbar (false, '', 'Something failed');
	});

	// MODAL on show event - set title to the event and clear old text (ie message)
	$('#eventMessageModal').on('show.bs.modal', function (event) {
		var button = $(event.relatedTarget); // Button that triggered the modal
		var recipient = button.data('event-title'); // Extract info from data-* attributes
		var eventid = button.data('event-id');
		// set event-id on the modal (data)
		$(this).data('event-id',eventid);
		$('#event-message-modal-title').text ('To: ' + recipient);
		$('#event-message-modal-text').val ('');
	});

	$('#modal-send-message').on ('click', function () {
		var msg = $.trim ($('#event-message-modal-text').val());
		if (msg.length == 0) {
			// do nothing
			$('#event-message-modal-msg').html ('Enter something');
			return false;
		}
		$('#event-message-modal-msg').html (''); // clear previous message

		var eventid = $('#eventMessageModal').data('event-id');
		// send message
		$.post (server + "sendMessage.php", {event_id:eventid, message:msg})
		.done (function (response) {
			var resp = $.parseJSON (response);
			if (resp[0] == "OK") {
				$('#eventMessageModal').modal ('hide');
				return false;
			}
			else {
				$('#event-message-modal-msg').html ('Error');
			}
		})
		.fail (function (response) {
			$('#event-message-modal-msg').html ("Darn. Something went wrong");
		});
	});

	// MODAL

	return false;
});

function loadMyMessages () {
	// return [[status(OK|NOTOK), status_msg], [pm.id, pm.message, pm.status, pm.created_at, event_id, event-title, event-startdate, sender.firstname, lastname],[...]]
	// one row for each message, so break on new event id.
	// pm.status is read|unread

	$.post (server + "getMyMessages.php")
	.done (function (response) {
		var resp = $.parseJSON (response);
		if (resp[0][0] == "OK") {
			var h = '';
			var last_event_id = '';
			for (x=1; x<resp.length; x++) {
				if (last_event_id != resp[x][4]) {
					// new event, show title
					last_event_id = resp[x][4];
					h += '<div class="row event-messages-title-row">'
						+ '<div class="col-md-12">'
						+ '<h3 class="event-messages-event-title">'
						+ resp[x][5]
						+ '<span class="event-messages-event-date">' + resp[x][6] + '</span>'
						+ '<button class="btn btn-default btn-xs event-messages-reply-btn" data-toggle="modal" data-target="#eventMessageModal" data-event-title="'
						+ resp[x][5]
						+ '" data-event-id="' + resp[x][4]
						+ '">Reply</button>'
						+ '</h3>'
						+ '</div>'
						+ '</div>';
				}
				// event message
				h += '<div class="row">'
					+ '<div class="col-md-3">'
					+ '<span class="event-messages-message-sender">' + resp[x][7] + ' ' + resp[x][8] + '</span>'
					+ '<span class="event-messages-message-timeago">' + resp[x][3] + '</span>'
					+ '</div>'
					+ '<div class="col-md-9">';

				// highlight unread messages
				if (resp[x][2] == 'unread') {
					h += '<span class="event-messages-unread-message">' + resp[x][1] + '</span>'
						+ '<a class="event-messages-mark-as-read" data-messageid="' + resp[x][0]
						+ '" id="mar' + resp[x][0] + '">Mark as read</a>';
				} else {
					h += '<span class="event-messages-message">' + resp[x][1] + '</span>';
				}

				// finish off row/col divs
				h += '</div></div>';
			}

			if (h == '') {h = 'No messages';}
			$('#event-messages').html(h);

			// handler for Mark as Read buttons 
			$('.event-messages-mark-as-read').on('click', function () {
				if ($(this).data('inactive') != '1') {
					$(this).html('Read');
					var id = $(this).data('messageid');
					$.post (server + 'markMessageAsRead.php', {messageid:id})
					.done (function (response) {
						// do nothing
					})
					.fail (function (response) {
						$('#mar' + id).html ('failed');
					});
				}
				$(this).data('inactive','1');
			});
		} else {
			$('#event-messages').html('Something went wrong');
		}
	})
	.fail (function (response) {
		$('#event-messages').html ("Failed");
	});

	return false;
}

// requests from others to join my event
function loadJoinEventRequestsToMe () {
	// [[status(OK|NOTOK), status_msg],
	//  [ea.id, timeago(a.reason_time), owner_id, firstname, lastname, event_id, title, max_att, num_att, message],[...]]
	$.post (server + "getJoinEventRequestsToMe.php")
	.done (function (response) {
		var resp = $.parseJSON (response);
		if (resp[0][0] == "OK") {
			var h = '';
			var max_attendees, num_attendees;
			for (x=1; x<resp.length; x++) {
				h += '<div class="row join-request-row">'
					+ '<div class="col-md-3">'
					+ '<span class="join-request-name">' + resp[x][3] + ' ' + resp[x][4] + '</span>'
					+ '<span class="join-request-timeago">' + resp[x][1] + '</span>'
					+ '</div>'
					+ '<div class="col-md-9">'
					+ '<p class="join-request-title">' + resp[x][6] + '</p>'
					+ '<span class="join-request-message">' + resp[x][9] + '</span>';
				// check is event is full
				max_attendees = parseInt (resp[x][7]);
				num_attendees = parseInt (resp[x][8]);
				if ((max_attendees == 0) || (num_attendees < max_attendees)) { // unlimited or not full
					h += '<a class="accept-join-request" data-messageid="' + resp[x][0] 
						+ '" id="ajr' + resp[x][0] + '">Accept</a>'
						+ '<a class="ignore-join-request" data-messageid="' + resp[x][0]
						+ '" id="ijr' + resp[x][0] + '">Decline</a>';
				} else {
					h += '<p><span class="event-full-message">The event is now full</span>'
						+ '<a class="delete-join-request" data-messageid="' + resp[x][0]
						+ '" id="djr' + resp[x][0] + '">Delete Join Request</a></p>';
				}
				h += '</div></div>'; // col-md-9 & row
			}
			if (h != '') {
				$('#join-event-requests-received').html(h);
				$('#join-event-requests-received-div').show ();
				$('#join-event-requests-received-div1').show ();
			}

			// handler for Accept buttons class ajr
			$('.accept-join-request').on('click', function () {
				if ($(this).data('inactive') != '1') {
					$(this).html('Accepted');
					var id = $(this).data('messageid');
					// hide ignore button
					$('#ijr' + id).hide ();
					$.post (server + 'acceptJoinEventRequest.php', {invitation_id:id})
					.done (function (response) {
						var resp = $.parseJSON (response);
						if (resp[0] == 'OK') {
							// do nothing
						} else {
							// error, check for why
							if (resp[1] == 'max_attendees') {
								$('#ajr' + id).html ('Oops, the event is now full. Sorry!');
							} else {
								$('#ajr' + id).html ('Error');
							}
						}
					})
					.fail (function (response) {
						$('#ajr' + id).html ('failed');
					});
				}
				$(this).data('inactive','1');
			});
			// handler for Ignore buttons class ijr
			$('.ignore-join-request').on('click', function () {
				if ($(this).data('inactive') != '1') {
					$(this).html('Declined');
					var id = $(this).data('messageid');
					// hide accept button
					$('#ajr' + id).hide ();
					$.post (server + 'declineJoinEventRequest.php', {invitation_id:id})
					.done (function (response) {
						var resp=$.parseJSON(response);
						if (resp[0]=="OK") {
							// do nothing
						} else {
							$('#ijr' + id).html ('Error');
						}
					})
					.fail (function (response) {
						$('#ijr' + id).html ('failed');
					});
				}
				$(this).data('inactive','1');
			});
			// handler for Delete buttons class djr
			$('.delete-join-request').on('click', function () {
				if ($(this).data('inactive') != '1') {
					$(this).html('Deleted');
					var id = $(this).data('messageid');
					$.post (server + 'deleteJoinRequest.php', {messageid:id})
					.done (function (response) {
						var resp=$.parseJSON(response);
						if (resp[0]=="OK") {
							// do nothing
						} else {
							$('#djr' + id).html ('Error');
						}
					})
					.fail (function (response) {
						$('#djr' + id).html ('failed');
					});
				}
				$(this).data('inactive','1');
			});
		} else {
			$('#join-event-requests-received').html('Something went wrong');
			$('#join-event-requests-received-div').show ();
			$('#join-event-requests-received-div1').show ();
		}
	})
	.fail (function (response) {
		$('#join-event-requests-received').html ("Failed");
		$('#join-event-requests-received-div').show ();
		$('#join-event-requests-received-div1').show ();
	});

	return false;
}
// requests from others to join my event
function loadJoinEventRequestsFromMe () {
	// [[status(OK|NOTOK), status_msg], 
	// [message.id, timeago(date), owner_id, ownerfirstname, lastname, event.id, event.title, max_att, num_att, message],[..],...]
	$.post (server + "getJoinEventRequestsFromMe.php")
	.done (function (response) {
		var resp = $.parseJSON (response);
		if (resp[0][0] == "OK") {
			var h = '';
			var max_attendees, num_attendees;
			for (x=1; x<resp.length; x++) {
				h += '<div class="row join-request-sent-row">'
					+ '<div class="col-md-3">'
					+ '<span class="join-request-sent-name">' + resp[x][3] + ' ' + resp[x][4] + '</span>'
					+ '<span class="join-request-sent-timeago">' + resp[x][1] + '</span>'
					+ '</div>'
					+ '<div class="col-md-9">'
					+ '<p class="join-request-sent-title">' + resp[x][6] + '</p>'
					+ '<span class="join-request-sent-message">' + resp[x][9] + '</span>';
				// check is event is full
				max_attendees = parseInt (resp[x][7]);
				num_attendees = parseInt (resp[x][8]);
				if ((max_attendees != 0) && (num_attendees >= max_attendees)) { // full
					h += '<span>Event is now full</span>';
				} 
				h += '<a class="cancel-join-request-sent" data-messageid="' + resp[x][0] 
					+ '" id="cjrs' + resp[x][0] + '">Cancel my request</a>'
					+ '</div>' // col
					+ '</div>'; // row
			}

			if (h != '') {
				$('#join-event-requests-sent').html(h);
				$('#join-event-requests-sent-div').show ();
				$('#join-event-requests-sent-div1').show ();
			}

			// handler for Accept buttons class ajr
			$('.cancel-join-request-sent').on('click', function () {
				if ($(this).data('inactive') != '1') {
					$(this).html('Cancelled');
					var id = $(this).data('messageid');
					$.post (server + 'deleteJoinRequest.php', {messageid:id})
					.done (function (response) {
						var resp = $.parseJSON (response);
						if (resp[0] == 'OK') {
							// do nothing
						} else {
							$('#cjrs' + id).html ('Error');
						}
					})
					.fail (function (response) {
						$('#cjrs' + id).html ('failed');
					});
				}
				$(this).data('inactive','1');
			});
		} else {
			$('#join-event-requests-sent').html('Something went wrong');
			$('#join-event-requests-sent-div').show ();
			$('#join-event-requests-sent-div1').show ();
		}
	})
	.fail (function (response) {
		$('#join-event-requests-sent').html ("Failed");
		$('#join-event-requests-sent-div').show ();
		$('#join-event-requests-sent-div1').show ();
	});

	return false;
}

// Pending Invitations to me
function loadEventInvitationsToMe () {
	// [[status(OK|NOTOK), status_msg],
	// [ea.id, timeago(a.reason_time), owner_id, firstname, lastname, event_id, title, max_att, num_att, message],[...]]
	$.post (server + "getEventInvitationsToMe.php")
	.done (function (response) {
		var resp = $.parseJSON (response);
		if (resp[0][0] == "OK") {
			var h = '';
			var max_attendees, num_attendees;
			for (x=1; x<resp.length; x++) {
				h += '<div class="row event-invitation-row">'
					+ '<div class="col-md-3">'
					+ '<span class="event-invitation-name">' + resp[x][3] + ' ' + resp[x][4] + '</span>'
					+ '<span class="event-invitation-timeago">' + resp[x][1] + '</span>'
					+ '</div>'
					+ '<div class="col-md-9">'
					+ '<p class="event-invitation-title">' + resp[x][6] + '</p>'
					+ '<span class="event-invitation-message">';
				if (resp[x][9] == '') {h += '[no message]';} else {h += resp[x][9];}
				h += '</span>';
				// check is event is full
				max_attendees = parseInt (resp[x][7]);
				num_attendees = parseInt (resp[x][8]);
				if ((max_attendees == 0) || (num_attendees < max_attendees)) { // unlimited or not full
					h += '<a class="accept-event-invitation" data-messageid="' + resp[x][0] 
						+ '" id="aei' + resp[x][0] + '">Accept</a>'
						+ '<a class="ignore-event-invitation" data-messageid="' + resp[x][0]
						+ '" id="iei' + resp[x][0] + '">Decline</a>'
				} else {
					h += '<p><span class="event-full-message">Sorry, the event is now full</span>'
						+ '<a class="delete-event-invitation" data-messageid="' + resp[x][0]
						+ '" id="dei' + resp[x][0] + '">Delete Invitation</a></p>';
				}
				h += '</div></div>'; // col-md-9 & row
			}
			if (h != '') {
				$('#event-invitations').html(h);
				$('#event-invitations-div').show ();
				$('#event-invitations-div1').show ();
			}

			// handler for Accept buttons class aei
			$('.accept-event-invitation').on('click', function () {
				if ($(this).data('inactive') != '1') {
					$(this).html('Accepted');
					var id = $(this).data('messageid');
					// hide ignore button
					$('#iei' + id).hide ();
					$.post (server + 'acceptEventInvitation.php', {messageid:id})
					.done (function (response) {
						var resp = $.parseJSON (response);
						if (resp[0] == 'OK') {
							// do nothing
						} else {
							// error, check for why
							if (resp[1] == 'max_attendees') {
								$('#aei' + id).html ('Oops, the event is now full. Sorry!');
							} else {
								$('#aei' + id).html ('Error');
							}
						}
					})
					.fail (function (response) {
						$('#aei' + id).html ('failed');
					});
				}
				$(this).data('inactive','1');
			});
			// handler for Ignore buttons class iei
			$('.ignore-event-invitation').on('click', function () {
				if ($(this).data('inactive') != '1') {
					$(this).html('Declined');
					var id = $(this).data('messageid');
					// hide accept button
					$('#aei' + id).hide ();
					$.post (server + 'declineEventInvitation.php', {messageid:id})
					.done (function (response) {
						var resp = $.parseJSON(response);
						if (resp[0] == "OK") {
							// do nothing
						} else {
							$('#iei' + id).html ('Error');
						}
					})
					.fail (function (response) {
						$('#iei' + id).html ('failed');
					});
				}
				$(this).data('inactive','1');
			});
			// handler for Delete buttons class dei
			$('.delete-event-invitation').on('click', function () {
				if ($(this).data('inactive') != '1') {
					$(this).html('Invitation Deleted');
					var id = $(this).data('messageid');
					$.post (server + 'deleteEventInvitation.php', {messageid:id})
					.done (function (response) {
						var resp = $.parseJSON(response);
						if (resp[0] == "OK") {
							// do nothing
						} else {
							$('#dei' + id).html ('Error');
						}
					})
					.fail (function (response) {
						$('#dei' + id).html ('failed');
					});
				}
				$(this).data('inactive','1');
			});
		}
		else {
			$('#event-invitations').html('Something went wrong');
			$('#event-invitations-div').show ();
			$('#event-invitations-div1').show ();
		}
	})
	.fail (function (response) {
		$('#event-invitations').html ("Failed");
		$('#event-invitations-div').show ();
		$('#event-invitations-div1').show ();
	});

	return false;
}

function markAllMessagesAsRead () {
	if ($('#mark-all').data('inactive') != '1') {
		$('#mark-all').html ('All read');
		$.post (server + 'markAllMessagesAsRead.php')
		.done (function (response) {
			// do nothing
		})
		.fail (function (response) {
			$('#mark-all').html ('failed');
		});
	$('#mark-all').data('inactive','1');
	}
}
