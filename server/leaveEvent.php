<?php
	/*
 	 * Remove logged_in user from the event
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
			$sql = "update event_attendees set attending='no', reason='left' where event_id=$event_id and attendee_id=$user_id";
			$result = $db->query($sql);
			if ($result) {
				$ret_data[0]="OK";
			}
			// decrement num_attendees
			$sql="update events set num_attendees = num_attendees - 1 
				where id = $event_id";
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
