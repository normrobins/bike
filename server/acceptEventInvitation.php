<?php
	/*
	 * [in] event_attendees.id
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
			// messageid is actually event_attendees.id
			$messageid=$_POST['messageid'];
			// check that event is not full
			$sql = "select max_attendees from events
				where id = (select event_id from event_attendees where id=$messageid)
				and (max_attendees = 0 or max_attendees > num_attendees)";
			$result = $db->query($sql);
			if ($result->num_rows == 0) {
				$ret_data[0]="NOTOK";
				$ret_data[1]="max_attendees";
			} else {
				// update event_attendees status=attending
				$sql="update event_attendees set attending='yes', reason='accepted event-invitation'
					where id=$messageid";
				$result = $db->query($sql);
				if ($result) {
					$ret_data[0]="OK";
				} else {
					$ret_data[0]="NOTOK";
					$ret_data[1]="event_attendees";
				}
				$sql="update events set num_attendees = num_attendees + 1 
					where id = (select event_id from event_attendees where id=$messageid)";
				$result = $db->query($sql);
				if ($result) {
					$ret_data[0]="OK";
				} else {
					$ret_data[0]="NOTOK";
					$ret_data[1]="num_attendees";
				}
			}
			// if it was an email invitation, disable email_code_a/b so it cannot be called again
			if ($email_invitation) {
				$sql = "update event_attendees set email_code_a='used', email_code_b='used' where id=$messageid";
				$result = $db->query($sql);
				if ($result) {
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
