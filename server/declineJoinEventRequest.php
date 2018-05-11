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
		$email_invitation = true;
	} else {
		$email_invitation = false;
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
			// set attending = no and reason in event_attendees
			$sql = "update event_attendees set attending='no', reason='declined join-request',
				email_code_a='used', email_code_b='used' where id=$invitation_id";
			$result = $db->query($sql);
			if ($result) {
				$ret_data[0]="OK";
			} else {
				$ret_data[0]="NOTOK";
				$ret_data[1]="pending_messages";
			}

			$db->close();
		}
	}
	print json_encode ($ret_data);
?>
