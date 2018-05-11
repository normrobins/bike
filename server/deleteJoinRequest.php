<?php
	/*
	 * [in] messageid
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
			$messageid=$_POST['messageid'];
			// set event_attendees status to declined
			$sql="update event_attendees set attending='no', reason='deleted join-request' where id=$messageid";
			$result = $db->query($sql);
			if ($result) {
				$ret_data[0]="OK";
			} else {
				$ret_data[0]="NOTOK";
				$ret_data[1]="event_attendees";
			}

			$db->close();
		}
	}
	print json_encode ($ret_data);
?>
