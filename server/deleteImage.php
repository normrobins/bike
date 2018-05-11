<?php
	/*
	 * [in] image_id
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
			$image_id=$_POST['image_id'];
			// set event_attendees status to declined
			$sql="update profile_images set status='deleted' where id=$image_id";
			$result = $db->query($sql);
			if ($result) {
				$ret_data[0]="OK";
			} else {
				$ret_data[0]="NOTOK";
				$ret_data[1]="profile_images";
			}

			$db->close();
		}
	}
	print json_encode ($ret_data);
?>
