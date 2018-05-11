<?php
	/*
	 * [in] messageid, friendid
	 * [out] OK|NOTOK, message
 	 */
	include "dbLogin.php";
	include "mailgun/sendMail.php";

	$ret_data = array ("NOTOK", "Server error");

	// if called from link in email no need to check if logged in
	if (isset($_POST['email_invitation'])) {
		$user_id = true;
		$email_invitation = true;
	} else {
		$email_invitation = false;
		session_start ();
		if (isset($_SESSION['id'])) { // user id
			$user_id = $_SESSION['id'];
		} else {
			$user_id = false;
			$ret_data[1]="Not logged in";
		}
		session_write_close ();
	}

	$err = false;
	if ($user_id) {
		if ($db=dbLogin()) {
			$messageid=$_POST['messageid'];

			// if email_invitation, get user_id and friendid from pending_messages
			if ($email_invitation) {
				$sql = "select sender_id, recipient_id from pending_messages where id=$messageid";
				$result = $db->query($sql);
				if (($result) && ($result->num_rows > 0)) {
					while ($row = $result->fetch_assoc()) {
						$user_id = $row['sender_id'];
						$friendid = $row['recipient_id'];
					}
				} else {
					$err = true;
					$ret_data[1]="userid";
				}
			} else {
				// get friendid from POST
				$friendid=$_POST['friendid'];
			}

			// insert into friends
			// one record user => friend, one record friend => user.
			// each record has the id of the other one to facilitate 'unfriend' deletion later
			$sql = "insert into friends (user_id, friend_id, last_used, status) ";
			$sql .= "values ($user_id, $friendid, 0, 'confirmed')";
			$result = $db->query($sql);
			if ($result) {
			} else {
				$err = true;
				$ret_data[1]="friends(0)";
			}

			// insert link friend -> me, with my friends.id
			$orig_id = $db->insert_id;
			$sql = "insert into friends (user_id, friend_id, last_used, status, related_id) ";
			$sql .= "values ($friendid, $user_id, 0, 'confirmed', $orig_id)";
			$result = $db->query($sql);
			if ($result) {
			} else {
				$err = true;
				$ret_data[1]="friends(1)" . $sql;
			}

			// and update my -> friend record with the id of the second record
			$related_id = $db->insert_id;
			$sql = "update friends set related_id = $related_id where id = $orig_id";
			$result = $db->query($sql);
			if ($result) {
			} else {
				$err = true;
				$ret_data[1]="friends(2)";
			}

			// delete friend-request from pending_messages
			$sql = "delete from pending_messages where id = $messageid";
			$result = $db->query($sql);
			if ($result) {
			} else {
				$err = true;
				$ret_data[1]="pending_messages";
			}

			// email user to let them know their invitation has been accepted
			$sql = "select id, firstname, lastname, email from users where id in ($user_id, $friendid)";
			$result = $db->query($sql);
			if ($result) {
				$to='';
				$fname='';
				$lname = '';
				while ($row = $result->fetch_assoc()) {
					if ($row['id'] == $user_id) {
						$to = $row['email'];
					} else {
						$fname = $row['firstname'];
						$lname = $row['lastname'];
					}
				}
				$subject = "$fname $lname accepted your friend invitation";
				$text = "$fname $lname accepted your friend invitation";
				$html = makeAcceptFriendRequestHtmlEmail ($fname, $lname);
				sendHtmlMail ($to, $subject, $text, $html);
			} else {
				$err = true;
				$ret_data[1]="sendMail";
			}

			$db->close();
		}
	}
	$ret_data[0] = ($err ? 'NOTOK' : 'OK');
	print json_encode ($ret_data);
?>
