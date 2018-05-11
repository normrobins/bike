<?php
	/*
	 * [in] event_attendees id
	 * [out] OK|NOTOK, message
 	 */
	include "dbLogin.php";

	$ret_data = array ("NOTOK", "Server error");

	// if called from link in email no need to check if logged in
	if (isset($_POST['email_invitation'])) {
		$user_id = true;
	} else {
		session_start ();
		if (isset($_SESSION['id'])) { // user id
			$user_id = $_SESSION['id'];
		} else {
			$user_id = false;
			$ret_data[1]="Not logged in";
		}
		session_write_close ();
	}

	if ($user_id) {
		if ($db=dbLogin()) {
			$invitation_id=$_POST['invitation_id'];
			// check that event is not full
			$sql = "select max_attendees from events
				where id = (select event_id from event_attendees where id=$invitation_id)
				and (max_attendees = 0 or max_attendees > num_attendees)";
			$result = $db->query($sql);
			if ($result->num_rows == 0) {
				$ret_data[0]="NOTOK";
				$ret_data[1]="max_attendees";
			} else {
				// update status in event_attendees
				$sql = "update event_attendees set attending='yes', reason='accepted join-request',
					email_code_a = 'used', email_code_b = 'used' where id=$invitation_id";
				$result = $db->query($sql);
				if ($result) {
					$ret_data[0]="OK";
				} else {
					$ret_data[0]="NOTOK";
					$ret_data[1]="event_attendees";
				}
				// update num_attendees
				$sql="update events set num_attendees = num_attendees + 1 
					where id = (select event_id from event_attendees where id=$invitation_id)";
				$result = $db->query($sql);
				if ($result) {
					$ret_data[0]="OK";
				} else {
					$ret_data[0]="NOTOK";
					$ret_data[1]="num_attendees";
				}
			}
			$db->close();
		}
	}
	print json_encode ($ret_data);
?>
