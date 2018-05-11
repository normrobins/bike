<?php
	/*
 	 * Update an existing event
	 * in: event_id, title, location, lat, lng, type, description, start_date, start_month, start_year, days, invite_type, invitees[]
	 * out = status(OK|NOTOK), msg
 	 */
	include "dbLogin.php";
	include "mailgun/sendMail.php";

	$ret_data = array ("NOTOK", "Server error");

	session_start ();
	if (isset($_SESSION['id'])) { // user id
		$uid = $_SESSION['id'];
		$firstname = $_SESSION['firstname'];
	} else {
		$uid = false;
		$ret_data[1]="Not logged in";
	}
	session_write_close ();

	if ($uid) {
		if ($db=dbLogin()) {
			$event_id=$_POST['event_id'];
			// check that event(id) is owned by current user
			$sql = "select * from events
				where id=$event_id
				and owner_id=$uid";

			$result = $db->query($sql);
			if ($result->num_rows == 1) {
				$result->close();
				$title=$db->real_escape_string(htmlspecialchars($_POST['title']));
				$location=$db->real_escape_string(htmlspecialchars($_POST['xlocation']));
				$lat=$db->real_escape_string(htmlspecialchars($_POST['lat']));
				$lng=$db->real_escape_string(htmlspecialchars($_POST['lng']));
				$description=$db->real_escape_string(htmlspecialchars($_POST['description']));
				$start_date=$_POST['start_date'];
				$start_month=$_POST['start_month'];
				$start_year=$_POST['start_year'];
				$finish_date=$_POST['finish_date'];
				$finish_month=$_POST['finish_month'];
				$finish_year=$_POST['finish_year'];
				$type=$_POST['type'];
				$invite_type=$_POST['invite_type'];
				$max_attendees=$_POST['max_attendees'];
			
				$full_start_date = $start_year.'-'.$start_month.'-'.$start_date;
				$full_finish_date = $finish_year.'-'.$finish_month.'-'.$finish_date;
				$sql="update events set title='$title',
					location='$location', 
					lat=$lat, 
					lng=$lng, 
					description='$description', 
					start_date='$full_start_date',
					finish_date='$full_finish_date',
					type='$type', 
					invite_type='$invite_type',
					max_attendees=$max_attendees
					where id=$event_id";
				$result = $db->query($sql);
				if ($result) {
					$ret_data[0]="OK";
				} else {
					$ret_data[1]="Update events failed";
				}
			} else {
				$ret_data[1]="Cannot update this event";
			}
			
			// invitees
			$values = '';
			$conn = '';
			$invitee_ids = '';
			$invitation_msg = $db->real_escape_string(htmlspecialchars($_POST['invitation_msg']));
			$invitees=json_decode($_POST['invitees']);
			foreach ($invitees as $invitee) {
				$code_a = str_shuffle(uniqid('abc'));
				$code_b = str_shuffle(uniqid('xyz'));
				$values .= "$conn ($event_id, $invitee, 'pending', 'upd-event-invitation', '$invitation_msg', '$code_a','$code_b')";
				$invitee_ids .= $conn . $invitee;
				$conn = ',';
			}
			if ($values != '') {
				$sql = "insert into event_attendees 
					(event_id, attendee_id, attending, reason, message, email_code_a, email_code_b) 
					values $values";
				$result=$db->query($sql);
				if ($result) {
				} else {
					$ret_data[0]="NOTOK";
					$ret_data[1]="Update invitees failed";
				}
			}

			// send email to all invitees (select from event_attendees with this event_id)
			// missing error checking
			if ($invitee_ids != '') {
				$app_svr = APP_SERVER;
				$subject = "$firstname invited you to an event";
				$text = "\r\n" . $invitation_msg . "\r\n\nLog on to $app_svr to accept";
				$sql = "select e.id, e.email_code_a, e.email_code_b, u.email, u.firstname 
					from event_attendees e, users u 
					where e.event_id=$event_id 
					and u.id=e.attendee_id 
					and u.id in ($invitee_ids) 
					and reason='upd-event-invitation'";
				$result = $db->query($sql);
				if ($result) {
					while ($row = $result->fetch_assoc()) {
						$html = makeEventInvitationHtmlEmail ($row['id'], $row['email_code_a'], $row['email_code_b'],
							$title, $description, $full_start_date, $invitation_msg);
						sendHtmlMail ($row['email'], $subject, $text, $html);
					}
				}
			}
			// finally, update reason to 'event-invitation'
			$sql = "update event_attendees 
				set reason='event-invitation' 
				where event_id=$event_id 
				and reason='upd-event-invitation'";
			$result = $db->query($sql);
			if ($result) {
				// seems ok
			} else {
				$ret_data[0]='NOTOK';
				$ret_data[1]=$sql;
			}
			$db->close();
		}
	}
	print json_encode ($ret_data);
?>
