<?php
	/*
	 * Return TRUE if user has pending:
	 *	unread messages in an event I am attending
	 *	[pending]:
	 * 	event-invitation to me
	 *	join-request to me
	 *	join-request from me
	 *	(event-invitation from me is on event page)
	 * in: nothing
	 * out: status[OK|NOTOK], err_msg, flag [0|1]
 	 */
	include "dbLogin.php";

	$ret_data = array ("NOTOK", "Server error", "0");

	// Check that I am logged in
	session_start ();
	if (isset($_SESSION['id'])) { // user id
		$userid = $_SESSION['id'];
	} else {
		$userid = false;
		$ret_data[1]="Not logged in";
	}
	session_write_close ();

	if ($userid) {
		if (($db=dbLogin()) != false) {
			// event-message status 'unread'
			$sql="select recipient_id from pending_messages
				where recipient_id = $userid
				and sender_id != $userid
				and message_type = 'event-message'
				and status = 'unread'";
			$result = $db->query($sql);
			if ($result) {
				$ret_data[0] = 'OK';
				if ($result->num_rows > 0) {
					$ret_data[1]='event-message';
					$ret_data[2] = '1';
				} else {
					$result->close();
					// pending event-invitation(s) to me and join-requests sent by me
					$sql="select attendee_id from event_attendees
						where attendee_id = $userid
						and attending  = 'pending'";
					$result = $db->query($sql);
					if ($result) {
						if ($result->num_rows > 0) {
							$ret_data[1] = 'event-invitation';
							$ret_data[2] = '1';
						} else {
							$result->close();
							// pending join-requests sent to me for my events
							$sql="select e.id, a.id
								from events e, event_attendees a
								where e.owner_id = $userid
								and e.id = a.event_id
								and a.attending  = 'pending'
								and a.reason='join-request'";
							$result = $db->query($sql);
							if ($result->num_rows > 0) {
								$ret_data[1] = 'join-request';
								$ret_data[2] = '1';
							}
						}
					}
				}
			}
			$db->close();
		}
	}
	print json_encode ($ret_data);
?>
