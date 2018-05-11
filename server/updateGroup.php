<?php
	/*
	 * [in] id, groupname, description, [memberid,memberid,...]. List of memberid's does not include the owner (current user)
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
			$groupname=$db->real_escape_string(htmlspecialchars($_POST['groupname']));
			$description=$db->real_escape_string(htmlspecialchars($_POST['description']));
			$group_id = $_POST['groupid'];
			$m = $_POST['members'];
			$members = json_decode($m);
			
			// update groups table
			$sql="update groups set name='$groupname', description='$description'
				where id=$group_id";
			$result = $db->query($sql);
			if ($result) {
				$sql="delete from group_members where group_id=$group_id";
				$result = $db->query($sql);
				if ($result) {
					// group members is an array of user_id's, construct values sql
					// first add one record for owner (ie current user)
					$values = "($group_id, $user_id, 1)";
					foreach ($members as $id) {
						$values .= ',(' . $group_id . ',' . $id . ',0)';
					}
	
					// insert if there are any members
					$sql = "insert into group_members (group_id, user_id, owner) values $values";
					$result = $db->query($sql);
					if ($result) {
						$ret_data[0]="OK";
					} else {
						$ret_data[0]="NOTOK";
						$ret_data[1]="group_members";
						//$ret_data[1]=$sql;
					}
				} else {
					$ret_data[0]="NOTOK";
					$ret_data[1]="group members";
				}
			} else {
				$ret_data[0]="NOTOK";
				// $ret_data[1]="groups";
				$ret_data[1]=$sql;
			}

			$db->close();
		}
	}
	print json_encode ($ret_data);
?>
