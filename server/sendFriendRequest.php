<?php
	/*
	 * [in] user_invitees[], invitation_msg
	 * [out] OK|NOTOK, message
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
			$invitees = json_decode($_POST['user_invitees']);
			$message = $db->real_escape_string(htmlspecialchars($_POST['invitation_msg']));
			$pm_values = '';
			$conn = '';
			$tmp_status=uniqid();
			foreach ($invitees as $invitee) {
				$code_a = str_shuffle (uniqid('abc'));
				$code_b = str_shuffle (uniqid('xyz'));
				$pm_values .= " $conn ($user_id, $invitee, '$message', 'friend-request', '$tmp_status', '$code_a','$code_b')";
				$invitee_ids .= $conn . $invitee;
				$conn = ',';
			}

			if ($pm_values != '') {
				// record request in pending_messages
				$sql = "insert into pending_messages 
					(sender_id, recipient_id, message, message_type, status, code_a, code_b) 
					values $pm_values";
				$result = $db->query($sql);
				if ($result) {
					$ret_data[0]="OK";
				} else {
					$ret_data[0]="NOTOK";
					$ret_data[1]="pending_messages";
				}
			}
			// email the list of invitees
			// email links to id in friend_requests table, which in turn links to pending_messages
			$appsvr = APP_SERVER;
			$subject = "$firstname sent you a friend request";
			$text = "\r\n" . $message . "\r\n\nLog on to $appsvr to accept";
			$sql = "select u.email, p.id, p.message, p.code_a, p.code_b
				from users u, pending_messages p
				where u.id in ($invitee_ids)
				and u.id = p.recipient_id
				and p.status='$tmp_status'";
			$result = $db->query($sql);
			if ($result) {
				$ret_data[0] = 'OK';
				while ($row = $result->fetch_assoc()) {
					$html = makeFriendInvitationHtmlEmail 
							($firstname, $row['id'], $row['code_a'], $row['code_b'], $row['message']);
					sendHtmlMail ($row['email'], $subject, $text, $html);
				}
			} else {
				$ret_data[0]="NOTOK";
				$ret_data[1] = "sendMail";
			}

			// finally, set the status to 'pending' in pending_messages
			$sql = "update pending_messages set status = 'pending' where status='$tmp_status'";
			$result = $db->query($sql);
			if ($result) {
			} else {
				$ret_data[0]="NOTOK";
				$ret_data[1] = "update pmids";
			}

			$db->close();
		}
	}
	print json_encode ($ret_data);
?>
