<?php
	/*
 	 * get invitations to me to join events
	 * in [none]
	 * out = [[status(OK|NOTOK), status_msg], [a.id, timeago(a.reason_time), owner_id, ownerfirstname, lastname, event_id, title, message],[...]]
 	 */
	include "dbLogin.php";
	include "timeago.php";

	$ret_data[] = array ("NOTOK", "Server error");
	$user_id = false;
	$logged_in = "0";

	session_start ();
	if (isset($_SESSION['id'])) { // user id
		$user_id = $_SESSION['id'];
	} else {
		$ret_data[1]= "Not logged in";
	}

	session_write_close ();

	if ($user_id && (($db=dbLogin()) != false)) {
		$sql="select a.id, a.reason_time, a.message,
				e.owner_id, e.id as event_id, e.title, 
				e.max_attendees, e.num_attendees,
				u.firstname, u.lastname
			from event_attendees a, users u, events e
			where a.attendee_id = $user_id
			and e.owner_id = u.id
			and a.attending = 'pending'
			and a.reason = 'event-invitation'
			and a.event_id = e.id";
		$result = $db->query($sql);
		if ($result) {
			$ret_data[0][0] = "OK";
			while ($row = $result->fetch_assoc()) {
				$ret_data[] = array (
						$row['id'],
						timeago($row['reason_time']),
						$row['owner_id'],
						$row['firstname'],
						$row['lastname'],
						$row['event_id'],
						$row['title'],
						$row['max_attendees'],
						$row['num_attendees'],
						$row['message']
					);
			}
			$result->close();
		}
		$db->close();
	}
	print json_encode ($ret_data);
?>
