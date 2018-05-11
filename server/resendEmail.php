<?php
	/*
	 * [in] userid
	 * [out] OK|NOTOK, message
 	 */
	include "dbLogin.php";
	include "mailgun/sendMail.php";

	$ret_data = array ("NOTOK", "Server error");

	// make sure there is no session running
	session_start ();
	if (isset($_SESSION['id'])) { // user id
		$error = true;
	} else {
		$error = false;
	}
	session_write_close ();

	if (isset($_POST['userid'])) {
		$userid = $_POST['userid'];
	} else {
		$userid = false;
	}
	if (!$error && $userid) {
		if ($db=dbLogin()) {
			// find the user's details incl verify_email record
			$sql = "select u.email, v.code_a, v.code_b
				from users u, verify_email v
				where u.id=$userid
				and u.id = v.userid";
			$result = $db->query($sql);
			if ($result) {
				// should only be one row
				if ($result->num_rows > 0) {
					$row = $result->fetch_assoc ();
					$code_a = $row['code_a'];
					$code_b = $row['code_b'];
					$email = $row['email'];
					$result->close();

					// update users set email_verified_date=now()
					$sql="update users set email_verified_date=now() where id=$userid";
					$result = $db->query($sql);
					if ($result) {
						$ret_data[0]="OK";
					} else {
						$ret_data[1]=$sql;
					}
					// send the email
					$appsvr = APP_SERVER;
					$text = "Hi $firstname $lastname\r\n\nPlease click this link to verify your email address: $appsvr/verify_email.html?a=$code_a&b=$code_b\r\n\nIf you didn't register with us please ignore this email and sorry for the inconvenience.";
		
					$html = makeEmailConfirmationHtml ($code_a, $code_b);
					$to = $email;
					$subject = 'Re-send: Please verify your email';
					// send validation email
					if (sendHtmlMail ($to, $subject, $text, $html)) {
						$ret_data[0]="OK";
					} else {
						$ret_data[0]="NOTOK";
						$ret_data[1]="Error sending email";
					}
				}
			} else {
				$ret_data[1]=$sql;
			}
			$db->close();
		}
	}
	print json_encode ($ret_data);
?>
