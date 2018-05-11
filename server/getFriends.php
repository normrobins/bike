<?php
	/*
 	 * get user's friends (status=confirmed)
	 * in [none]
	 * out = status(OK|NOTOK), [friends.id, friend_id, firstname, lastname, last_used(0|1)
 	 */
	include "dbLogin.php";

	$ret_data[] = array ("NOTOK", "Server error");
	$user_id = false;
	$logged_in = "0";

	// If logged in, I will highlight events that I am the owner of
	session_start ();
	if (isset($_SESSION['id'])) { // user id
		$user_id = $_SESSION['id'];
	} else {
		$ret_data[1]= "Not logged in";
	}

	session_write_close ();

	if ($user_id && (($db=dbLogin()) != false)) {
		// get my friends
		$sql="select f.id, f.friend_id, u.firstname, u.lastname, f.last_used
			from friends f, users u
			where f.user_id = $user_id
			and f.friend_id = u.id
			and f.status='confirmed'";
		$result = $db->query($sql);
		if ($result) {
			$ret_data[0][0] = "OK";
			while ($row = $result->fetch_assoc()) {
				$ret_data[] = array (
						$row['id'],
						$row['friend_id'],
						$row['firstname'],
						$row['lastname'],
						$row['last_used']
					);
			}
			$result->close();
		}
		$db->close();
	}
	print json_encode ($ret_data);
?>
