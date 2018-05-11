<?php
	/*
 	 * get user's friend requests
	 * in [none]
	 * out = status(OK|NOTOK), status_msg, [message.id, timeago(date), friend_id, firstname, lastname]
 	 */
	include "dbLogin.php";
	include "timeago.php";

	$ret_data[] = array ("NOTOK", "Server error");
	$user_id = false;
	$logged_in = "0";

	// If logged in, I will highlight events that I am the owner of
	session_start ();
	if (isset($_SESSION['id'])) { // user id
		$user_id = $_SESSION['id'];
	} else {
		$ret_data[1]= "Not logged in";
	}

	session_write_close ();

	if ($user_id && (($db=dbLogin()) != false)) {
		$sql="select pm.id, pm.created_at, pm.message, pm.sender_id, u.firstname, u.lastname
			from pending_messages pm, users u
			where pm.recipient_id = $user_id
			and pm.message_type = 'friend-request'
			and pm.sender_id = u.id";
		$result = $db->query($sql);
		if ($result) {
			$ret_data[0][0] = "OK";
			while ($row = $result->fetch_assoc()) {
				$ret_data[] = array (
						$row['id'],
						timeago($row['created_at']),
						$row['message'],
						$row['sender_id'],
						$row['firstname'],
						$row['lastname']
					);
			}
			$result->close();
		}
		$db->close();
	}
	print json_encode ($ret_data);
?>
