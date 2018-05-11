<?php
	/*
	 * [in] messageid
	 * [out] OK|NOTOK, message
 	 */
	include "dbLogin.php";
	include "mailgun/sendMail.php";

	$ret_data = array ("NOTOK", "Server error");

	// if called from link in email no need to check if logged in
	if (isset($_POST['email_invitation'])) {
		$user_id = true;
	} else {
		session_start ();
		if (isset($_SESSION['id'])) { // user id
			$user_id = $_SESSION['id'];
		} else {
			$user_id = false;
			$ret_data[1]="Not logged in";
		}
		session_write_close ();
	}

	if ($user_id) {
		if ($db=dbLogin()) {
			$messageid=$_POST['messageid'];

			// email user to let them know their invitation has been declined
			$sql = "select u.email, f.firstname, f.lastname
				from pending_messages p, users u, users f
				where p.sender_id=u.id 
				and p.recipient_id = f.id 
				and p.id=$messageid";
			$result = $db->query($sql);
			if ($result) {
				while ($row = $result->fetch_assoc()) {
					$to = $row['email'];
					$fname = $row['firstname'];
					$lname = $row['lastname'];
				}
				$subject = "$fname $lname declined your friend invitation";
				$text = "$fname $lname declined your friend invitation";
				$html = makeDeclineFriendRequestHtmlEmail ($fname, $lname);
				sendHtmlMail ($to, $subject, $text, $html);
			} else {
				$err = true;
				$ret_data[1]="sendMail";
			}

			// delete friend-request from pending_messages
			$sql = "delete from pending_messages where id = $messageid";
			$result = $db->query($sql);
			if ($result) {
				$ret_data[0]="OK";
			} else {
				$ret_data[0]="NOTOK";
				$ret_data[1]="pending_messages";
			}
			$db->close();
		}
	}
	print json_encode ($ret_data);
?>
