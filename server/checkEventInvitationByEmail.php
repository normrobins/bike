<?php
	/*
	 * [in] event_bttendees.id, email_code_b, email_code_b
	 * [out] OK|NOTOK, message
 	 */
	include "dbLogin.php";

	$ret_data = array ("NOTOK", "Server error");

	// no need to check if user is logged in
	if ($db=dbLogin()) {
		// messageid is actually event_attendees.id
		$messageid=$_POST['messageid'];
		$email_code_a=$_POST['email_code_a'];
		$email_code_b=$_POST['email_code_b'];
		// check that email_code_a/b are valid for this invitation
		$sql = "select email_code_a, email_code_b
			from event_attendees
			where id = $messageid";
		$result = $db->query($sql);
		if ($result->num_rows == 0) {
			$ret_data[1]="no invitation";
		} else {
			$row = $result->fetch_assoc();
			if (($row['email_code_a'] == $email_code_a)
				&& ($row['email_code_b'] == $email_code_b)) {
					$ret_data[0] = 'OK';
			} else {
				$ret_data[1]="code mismatch";
			}
		}
		$db->close();
	}
	print json_encode ($ret_data);
?>
