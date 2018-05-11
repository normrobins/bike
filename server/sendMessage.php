<?php
	/*
	 * [in] event_id, message
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
			$message=$db->real_escape_string(htmlspecialchars($_POST['message']));
			$event_id=$_POST['event_id'];
			$values = '';
			$recipient_ids = '';

			// get attendees for this event (excluding owner)
			$sql="select attendee_id from event_attendees where event_id=$event_id and attending='yes'";
			$result = $db->query($sql);
			if ($result) {
				$conn = '';
				while ($row = $result->fetch_assoc()) {
					$recipient_id = $row['attendee_id'];
					$values .= "$conn ($user_id, $recipient_id, '$message', 'event-message', 'unread', $event_id)";
					$recipient_ids .= $conn . $recipient_id;
					$conn = ',';
				}
			} else {
				$ret_data[0]="NOTOK";
				$ret_data[1]=$sql;
			}

			if ($values != '') {
				$sql = "insert into pending_messages (sender_id, recipient_id, message, message_type, status, spare_int) values $values";
				$result = $db->query($sql);
				if ($result) {
					$ret_data[0]="OK";
				} else {
					$ret_data[0]="NOTOK";
					$ret_data[1]="pending_messages";
				}
				// set new_message flag for users
				$sql = "update users set new_message = 1 where id in ($recipient_ids)";
				$result = $db->query($sql);
				if ($result) {
					$ret_data[0]="OK";
				} else {
					$ret_data[0]="NOTOK";
					$ret_data[1]="friends_new_message";
				}
			}

			// send message to the event owner
			$owner_id='';
			$sql = "select owner_id from events where id=$event_id";
			$result = $db->query($sql);
			if ($result) {
				while ($row = $result->fetch_assoc()) {
					$owner_id=$row['owner_id'];
				}
				$result->close();
			}
			$sql = "insert into pending_messages (sender_id, recipient_id, message, message_type, status, spare_int)
				values ($user_id, $owner_id, '$message', 'event-message', 'unread', $event_id)";
			$result = $db->query($sql);
			if ($result) {
				$ret_data[0]="OK";
			} else {
				$ret_data[0]="NOTOK";
				$ret_data[1]="owner pending_messages";
			}

			$db->close();

		}
	}
	print json_encode ($ret_data);
?>
