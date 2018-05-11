<?php
	/*
 	 * get an event. isOwner is set if the logged in user is the owner of the event.
	 * in [event_id]
	 * out = [status(OK|NOTOK)],
	 *		[id, title, description, start, finish, type, invite_type, max_attendees, num_attendees, owner.id, firstname, lastname],
	 *		[[event_attendees.id, attending, reason, timeago(reason_time), message, attendee.id, firstname, lastname],[..],...]
	 *		[is_logged_in, is_owner, is_attending]
 	 */
	include "dbLogin.php";
	include "timeago.php";

	$ret_data[] = array ("NOTOK", "Server error");
	$user_id = false;
	$event_id = false;
	$is_owner='0';
	$is_logged_in='0';
	$is_attending='0';

	// logged in? 
	session_start ();
	if (isset($_SESSION['id'])) { // user id
		$user_id = $_SESSION['id'];
		$is_logged_in='1';
	} 
	session_write_close ();

	$event_id = $_POST['event_id'];

	if ($event_id && (($db=dbLogin()) != false)) {
		// get Event info
		$sql = "select e.id, e.owner_id, date_format(e.start_date,'%d %b %Y') as start, date_format(e.finish_date,'%d %b %Y') as finish,
			e.invite_type, e.title, e.location, e.lat, e.lng, e.type, e.description, e.max_attendees, e.num_attendees,
			u.firstname, u.lastname, pi.image_file
			from events e, users u
			left join profile_images pi on u.id = pi.userid and pi.image_type='profile' and pi.status='active'
			where e.id = $event_id
			and e.owner_id = u.id";

		$result = $db->query($sql);
		if ($result && ($result->num_rows == 1)) {
			$ret_data[0][0] = "OK";
			$row = $result->fetch_assoc();
			if ($row['owner_id'] == $user_id) {
				$is_owner='1';
			}
			$image_file = ($row['image_file'] == null ? '' : $row['image_file']);
			$ret_data[] = array(
				$row['id'],
				$row['title'],
				$row['location'],
				$row['lat'],
				$row['lng'],
				$row['description'],
				$row['start'],
				$row['finish'],
				$row['type'],
				$row['invite_type'],
				$row['max_attendees'],
				$row['num_attendees'],
				$row['owner_id'],
				$row['firstname'],
				$row['lastname'],
				$image_file
			);
			$result->close();

			// if owner, get all invitees & attendees
			// otherwise just get attendees (attending=yes)

			$sql = "select ea.id, ea.attending, ea.reason,
					ea.reason_time, ea.message, ea.attendee_id,
					u.firstname, u.lastname, pi.image_file
				from event_attendees ea, users u
				left join profile_images pi on u.id = pi.userid and pi.image_type='profile' and pi.status='active'
				where ea.event_id = $event_id
				and ea.attendee_id = u.id";
			if ($is_owner=='0') {
				$sql .= " and ea.attending='yes'";
			}
			$sql .= " order by ea.attending desc";
			$attendees = array ();
			if (($result = $db->query($sql))) {
				if ($result->num_rows > 0) {
					while ($row = $result->fetch_assoc()) {
						if ($row['attendee_id'] == $user_id) {
							$is_attending='1';
						}
						$image_file = ($row['image_file'] == null ? '' : $row['image_file']);
						$attendees[] = array(
							$row['id'],
							$row['attending'],
							$row['reason'],
							timeago($row['reason_time']),
							$row['message'],
							$row['attendee_id'],
							$row['firstname'],
							$row['lastname'],
							$image_file
						);
					}
				}
				$ret_data[] = $attendees;
				$result->close();
			}
			$ret_data[] = array($is_logged_in, $is_owner, $is_attending);
		} else {
			$ret_data[0][1] = 'No such event';
		}
		$db->close();
	}
	print json_encode ($ret_data);
?>
