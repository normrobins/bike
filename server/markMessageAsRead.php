<?php
	/*
	 * [in] messageid
	 * [out] OK|NOTOK, message
 	 */
	include "dbLogin.php";

	$ret_data = array ("NOTOK", "Server error");

	session_start ();
	if (isset($_SESSION['id'])) { // user id
		$user_id = $_SESSION['id'];
	} else {
		$user_id = false;
		$ret_data[1]="Not logged in";
	}
	session_write_close ();

	if ($user_id) {
		if ($db=dbLogin()) {
			$messageid=$_POST['messageid'];
			// mark selected message as 'read'
			$sql = "update pending_messages set status='read' where id = $messageid";
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
