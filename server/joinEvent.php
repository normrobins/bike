<?php
	/*
 	 * Add logged_in user to the event, attending=yes,reason=join-event
	 * Delete any old invitations/refusals for this user for this event
	 * in [event_id]
	 * out = status(OK|NOTOK), msg
 	 */
	include "dbLogin.php";

	$ret_data = array ("NOTOK", "Server error");

	session_start ();
	if (isset($_SESSION['id'])) { // user id
		$user_id = $_SESSION['id'];
	} else {
		$user_id = false;
		$ret_data[1]="Not logged in";
	}
	session_write_close ();

	if (($user_id) && isset ($_POST['event_id'])) {
		if ($db=dbLogin()) {
			$event_id = $_POST['event_id'];
			// delete old invitations/joins/left rows for this user for this event
			$sql = "delete from event_attendees where event_id=$event_id and attendee_id=$user_id";
			$result = $db->query($sql);
			if ($result) {
				$ret_data[0]="OK";
			}
			$sql = "insert into event_attendees (event_id, attendee_id, attending, reason)
				values ($event_id, $user_id, 'yes', 'joined')";
			$result = $db->query($sql);
			if ($result) {
				$ret_data[0]="OK";
			}

			// increment num_attendees
			$sql="update events set num_attendees = num_attendees + 1 where id = $event_id";
			$result = $db->query($sql);
			if ($result) {
				$ret_data[0]="OK";
			} else {
				$ret_data[0]="NOTOK";
				$ret_data[1]="num_attendees";
			}
			$db->close();
		}
	}
	print json_encode ($ret_data);
?>
