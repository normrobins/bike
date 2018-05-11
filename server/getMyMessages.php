<?php
	/*
 	 * get user's messages
	 * in [none]
	 * out = status(OK|NOTOK), [message.id, friend_id, firstname, lastname, last_used(0|1)
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
		$ret_data[0][1]= "Not logged in";
	}

	session_write_close ();

	if ($user_id && (($db=dbLogin()) != false)) {
		// spare_int is the event id for this message
		$sql="select pm.id, pm.message, pm.status, pm.created_at, pm.spare_int,
			e.title, date_format(e.start_date,'%d %M %Y') as start, u.firstname, u.lastname
			from pending_messages pm, events e, users u
			where pm.recipient_id = $user_id
			and pm.message_type='event-message'
			and pm.sender_id = u.id
			and pm.spare_int = e.id
			and e.start_date >= curdate()
			order by e.start_date desc, e.id, pm.id desc";
		$result = $db->query($sql);
		if ($result) {
			$ret_data[0][0] = "OK";
			while ($row = $result->fetch_assoc()) {
				$ret_data[] = array (
						$row['id'],
						$row['message'],
						$row['status'],
						timeago($row['created_at']),
						$row['spare_int'],
						$row['title'],
						$row['start'],
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
