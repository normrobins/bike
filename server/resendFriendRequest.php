<?php
	/*
	 * [in] friends.id
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
			$friendsid=$_POST['friendsid'];
			$friend_id='';

			$sql = "select friend_id from friends where id=$friendsid";
			$result = $db->query($sql);
			if ($result) {
				$row = $result->fetch_assoc();
				$friend_id = $row['friend_id'];
			}
			else {
				$ret_data[0]="NOTOK";
				$ret_data[1]="select error";
			}
			$result->close();

			if ($friend_id != '') {
				// record request in pending_messages
				$sql = "insert into pending_messages (sender_id, recipient_id, message, message_type, status)";
				$sql .= "values ($user_id, $friend_id, '', 'resend-friend-request', 'pending')";
				$result = $db->query($sql);
				if ($result) {
					$ret_data[0]="OK";
				} else {
					$ret_data[0]="NOTOK";
					$ret_data[1]="pending_messages";
				}
				// set new_message flag for user
				$sql = "update users set new_message = 1 where id = $friend_id";
				$result = $db->query($sql);
				if ($result) {
					$ret_data[0]="OK";
				} else {
					$ret_data[0]="NOTOK";
					$ret_data[1]="friends_new_message";
				}
			}
			$db->close();
		}
	}
	print json_encode ($ret_data);
?>
