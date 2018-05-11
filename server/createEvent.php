<?php
	/*
	 * [in] title, xlocation, type, description, start_date, start_month, start_year, finish_date, finish_month, finish_year
	 * 	invite_type (invite-only|anyone), friend_invitees[id,...], user_invitees[id,..], invitation_msg
	 * [out] OK|NOTOK, message
	 *
	 * ERROR CHECKING DOESN'T WORK - a db error followed by success returns success. Do it later.
 	 */
	include "dbLogin.php";
	include "mailgun/sendMail.php";

	$ret_data = array ("NOTOK", "Server error");

	session_start ();
	if (isset($_SESSION['id'])) { // user id
		$user_id = $_SESSION['id'];
		$firstname = $_SESSION['firstname'];
	} else {
		$user_id = false;
		$ret_data[1]="Not logged in";
	}
	session_write_close ();

	if ($user_id) {
		if ($db=dbLogin()) {
			$title=$db->real_escape_string(htmlspecialchars($_POST['title']));
			$location=$db->real_escape_string(htmlspecialchars($_POST['xlocation']));
			$lat=$db->real_escape_string(htmlspecialchars($_POST['lat']));
			$lng=$db->real_escape_string(htmlspecialchars($_POST['lng']));
			$type=$_POST['type'];
			$description=$db->real_escape_string(htmlspecialchars($_POST['description']));
			$start_date=$_POST['start_date'];
			$start_month=$_POST['start_month'];
			$start_year=$_POST['start_year'];
			$finish_date=$_POST['finish_date'];
			$finish_month=$_POST['finish_month'];
			$finish_year=$_POST['finish_year'];
			$invite_type=$_POST['invite_type'];
			$max_attendees=$_POST['max_attendees'];
			
			$full_start_date = $start_year.'-'.$start_month.'-'.$start_date;
			$full_finish_date = $finish_year.'-'.$finish_month.'-'.$finish_date;
			$sql="insert into events (owner_id, title, location, lat, lng, description, start_date, finish_date, 
					type, invite_type, max_attendees, num_attendees)";
			$sql .= "values($user_id, '$title', '$location', $lat, $lng, '$description', '$full_start_date', '$full_finish_date',
					'$type', '$invite_type', $max_attendees, 1)";
			$result = $db->query($sql);
			if ($result) {
				$ret_data[0]="OK";
			} else {
				$ret_data[0]="NOTOK";
				$ret_data[1]="events";
			}

			$event_id = $db->insert_id;

			// invitation message
			$invitation_msg=$db->real_escape_string(htmlspecialchars($_POST['invitation_msg']));

			// friend_invitees - one entry in event_attendees for each friend, attending='pending', reason='event-invitation'
			$conn = '';
			$values = '';
			$invitee_ids = ''; // ids of all invitees, friends & others

			$invitees = json_decode($_POST['invitees']);
			foreach ($invitees as $invitee_id) {
				$code_a = str_shuffle(uniqid('abc'));
				$code_b = str_shuffle(uniqid('xyz'));
				$values .= "$conn ($event_id, $invitee_id, 'pending', 'event-invitation', '$invitation_msg','$code_a','$code_b')";
				$invitee_ids .= $conn . $invitee_id;
				$conn = ',';
			}

			if ($values != '') {
				$sql = "insert into event_attendees 
					(event_id, attendee_id, attending, reason, message, email_code_a, email_code_b) 
					values $values";
				$result = $db->query($sql);
				if ($result) {
					$ret_data[0]="OK";
				} else {
					$ret_data[0]="NOTOK";
					$ret_data[1]="event_attendees";
				}
			}

			// send email to all invitees (select from event_attendees with this event_id)
			$app_svr = APP_SERVER;
			$subject = "$firstname invited you to an event";
			$text = "\r\n" . $invitation_msg . "\r\n\nLog on to $app_svr to accept";
			$sql = "select e.id, e.email_code_a, e.email_code_b, u.email, u.firstname 
					from event_attendees e, users u 
					where e.event_id=$event_id 
					and u.id=e.attendee_id
					and u.id in ($invitee_ids)";
			$result = $db->query($sql);
			if ($result) {
				while ($row = $result->fetch_assoc()) {
					$html = makeEventInvitationHtmlEmail ($row['id'], $row['email_code_a'], $row['email_code_b'], 
							$title, $description, $full_start_date, $invitation_msg);
					sendHtmlMail ($row['email'], $subject, $text, $html);
				}
			}
			$db->close();
		}
	}
	print json_encode ($ret_data);

?>
