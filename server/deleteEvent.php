<?php
	/*
	 * [in] event_id
	 * [out] OK|NOTOK, message
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

	if ($user_id) {
		if ($db=dbLogin()) {
			$event_id=$_POST['event_id'];
			// set event_attendees status to declined
			$sql="delete from events where id=$event_id";
			$result = $db->query($sql);
			if ($result) {
				$sql="delete from event_attendees where event_id=$event_id";
				$result = $db->query($sql);
				if ($result) {
					$ret_data[0]="OK";
				} else {
					$ret_data[1]="event_attendees";
				}
			} else {
				$ret_data[1]="events";
			}

			$db->close();
		}
	}
	print json_encode ($ret_data);
?>
