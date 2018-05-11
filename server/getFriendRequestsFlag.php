<?php
	/*
 	 * Return yes/no for whether the user has friend requests or not. Later on, keep this flag in the session
	 * in: nothing
	 * out: status[OK|NOTOK], err_msg, flag [0|1]
 	 */
	include "dbLogin.php";

	$ret_data = array ("NOTOK", "Server error", "0");

	// Check that I am logged in
	session_start ();
	if (isset($_SESSION['id'])) { // user id
		$userid = $_SESSION['id'];
	} else {
		$userid = false;
		$ret_data[1]="Not logged in";
	}
	session_write_close ();

	if ($userid) {
		if (($db=dbLogin()) != false) {
			// returns one row 
			$sql="select recipient_id from pending_messages
				where recipient_id = $userid
				and message_type = 'friend-request'";
			$result = $db->query($sql);
			if ($result) {
				$ret_data[0] = "OK";
				if ($result->num_rows > 0) {
					$ret_data[2] = '1';
				}
				else {
					$ret_data[2] = '0';
				}
				$result->close ();
			}
			$db->close();
		}
	}
	print json_encode ($ret_data);
?>
