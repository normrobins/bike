<?php
	/*
 	 * get requests sent to me to join my events 
	 * in [none]
	 * out [[status(OK|NOTOK), status_msg], [ea.id, timeago(a.reason_time), sender_id, senderfirstname, lastname, event_id, title, message],[...]]
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
		$sql="select a.id, a.reason_time, a.attendee_id, a.message,
				u.firstname, u.lastname, 
				e.id as event_id, e.title,
				e.max_attendees, e.num_attendees
			from event_attendees a, users u, events e
			where e.owner_id = $user_id
			and e.id = a.event_id
			and a.attending = 'pending'
			and a.reason = 'join-request'
			and a.attendee_id = u.id
			order by e.id asc";
		$result = $db->query($sql);
		if ($result) {
			$ret_data[0][0] = "OK";
			while ($row = $result->fetch_assoc()) {
				$ret_data[] = array (
						$row['id'],
						timeago($row['reason_time']),
						$row['attendee_id'],
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
