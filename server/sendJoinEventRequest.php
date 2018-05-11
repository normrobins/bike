<?php
	/*
	 * [in] event_id
	 * [out] OK|NOTOK, message
 	 */
	include "dbLogin.php";
	include "mailgun/sendMail.php";

	$ret_data = array ("NOTOK", "Server error");

	session_start ();
	if (isset($_SESSION['id'])) { // user id
		$user_id = $_SESSION['id'];
	} else {
		$user_id = false;
		$ret_data[1]="Not logged in";
	}
	session_write_close ();

	$err = false;

	if ($user_id) {
		if ($db=dbLogin()) {
			$event_id=$_POST['event_id'];
			// blow away earlier requests
			$sql = "delete from event_attendees where event_id=$event_id and attendee_id=$user_id";
			$result = $db->query($sql);
			if ($result) {
				// nothing
			} else {
				$err = true;
				$ret_data[1]="delete event_attendees";
			}
			if (!$err) {
				// put a request into event_attendees, with code_a etc
				$code_a = str_shuffle(uniqid('abc'));
				$code_b = str_shuffle(uniqid('xyz'));
				$sql="insert into event_attendees (event_id, attendee_id, attending, reason, email_code_a, email_code_b)
					values ($event_id, $user_id, 'pending', 'join-request', '$code_a', '$code_b')";
				$result = $db->query($sql);
				if ($result) {
					$ea_id = $db->insert_id;
					// nothing
				} else {
					$err = true;
					$ret_data[1]="event_attendees";
				}
			}

			// send email to owner
			if (!$err) {
				$app_svr = APP_SERVER;
				$subject = "$firstname invited you to an event";
				$text = "\r\n" . $invitation_msg . "\r\n\nLog on to $app_svr to accept";
				// get event title and owner's email
				$sql = "select e.title, date_format(e.start_date,'%d %b %Y') as start, u.email
					from events e, users u
					where e.id = $event_id
					and e.owner_id = u.id";
				$result = $db->query($sql);
				if ($result) {
					while ($row = $result->fetch_assoc()) {
						$title = $row['title'];
						$date = $row['start'];
						$to = $row['email'];
					}
				} else {
					$err = true;
					$ret_data[1]='get title';
				}
				// get requester's first and last name
				$sql = "select firstname, lastname
					from users
					where id = $user_id";
				$result = $db->query($sql);
				if ($result) {
					while ($row = $result->fetch_assoc()) {
						$firstname = $row['firstname'];
						$lastname = $row['lastname'];
					}
				} else {
					$err = true;
					$ret_data[1]='get firstname';
				}
				$html = makeJoinEventRequestHtmlEmail ($ea_id, $title, $date, $firstname, $lastname, $code_a, $code_b);
				$subject = "Request to join your event";
				$text = "\r\n $firstname $lastname would like to join your event $title\r\nLog onto RevUpAndRide to accept";
				sendHtmlMail ($to, $subject, $text, $html);
			}
			$db->close();
		}
	}
	$ret_data[0] = ($err ? 'NOTOK' : 'OK');
	print json_encode ($ret_data);
?>
