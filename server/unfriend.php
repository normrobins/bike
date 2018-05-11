<?php
	/*
	 * [in] friends.id
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

	$friendsid = $_POST['friendsid'];

	if ($user_id) {
		if ($db=dbLogin()) {
			// find the related record
			$sql = "select related_id from friends where id=$friendsid";
			$result = $db->query($sql);
			if ($result) {
				// check this just in case the other end of the friends relationship deleted it already
				if ($result->num_rows > 0) {
					$row = $result->fetch_assoc ();
					$related_id = $row['related_id'];
					$result->close();

					// Delete both original and related records
					$sql="delete from friends where id in ($friendsid, $related_id)";
					$result = $db->query($sql);
					if ($result) {
						$ret_data[0]="OK";
					} else {
						$ret_data[0]="NOTOK";
						$ret_data[1]=$sql;
					}
				}
			} else {
				$ret_data[0]="NOTOK";
				$ret_data[1]=$sql;
			}
			$db->close();
		}
	}
	print json_encode ($ret_data);
?>
