<?php
	/*
	 * [in] pending_messages.id, code_b, code_b
	 * [out] OK|NOTOK, message
 	 */
	include "dbLogin.php";

	$ret_data = array ("NOTOK", "Server error");

	// no need to check if user is logged in
	if ($db=dbLogin()) {
		// messageid is actually event_attendees.id
		$messageid=$_POST['messageid'];
		$code_a=$_POST['code_a'];
		$code_b=$_POST['code_b'];
		// check that code_a/b are valid for this invitation
		$sql = "select code_a, code_b
			from pending_messages
			where id = $messageid";
		$result = $db->query($sql);
		if ($result->num_rows == 0) {
			$ret_data[1]="no invitation";
		} else {
			$row = $result->fetch_assoc();
			if (($row['code_a'] == $code_a)
				&& ($row['code_b'] == $code_b)) {
					$ret_data[0] = 'OK';
			} else {
				$ret_data[1]="code mismatch";
			}
		}
		$db->close();
	}
	print json_encode ($ret_data);
?>
