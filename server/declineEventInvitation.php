<?php
	/*
	 * [in] messageid
	 * [out] OK|NOTOK, message
 	 */
	include "dbLogin.php";

	$ret_data = array ("NOTOK", "Server error");

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
			$messageid=$_POST['messageid'];
			// set event_attendees status to declined
			$sql="update event_attendees set attending='no', reason='declined event-invitation' where id=$messageid";
			$result = $db->query($sql);
			if ($result) {
				$ret_data[0]="OK";
			} else {
				$ret_data[0]="NOTOK";
				$ret_data[1]="pending_messages";
			}
			// if it was an email invitation, disable email_code_a/b so it cannot be called again
			if ($email_invitation) {
				$sql = "update event_attendees set email_code_a='used', email_code_b='used' where id=$messageid";
				$result = $db->query($sql);
				if ($result) {
					// nothing
				} else {
					$ret_data[0]="NOTOK";
					$ret_data[1]="email_code";
				}
			}
			$db->close();
		}
	}
	print json_encode ($ret_data);
?>
