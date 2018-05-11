<?php
	/*
 	 * Login - in [username,passwd], out = status(OK|NOTOK), msg, User's name 
 	 */
	include "dbLogin.php";

	$ret_data = array ("NOTOK");

	// if (isset($_POST['username']) && isset($_POST['password'])) {
	if (true) {
		if ($db=dbLogin()) {
			$username=$_POST['username'];
			$password=$_POST['password'];
			$sql="select id, firstname, lastname, new_message, location, lat, lng, email_verified
				from users
				where username='$username'
				and password=password('$password')";
			$result = $db->query($sql);
			if ($result->num_rows > 0) {
				$ret_data[0]="OK";
				$row=$result->fetch_assoc();
				// check if user if verified
				if ($row['email_verified'] == 1) {
					$ret_data[1]="verified";
					$ret_data[2]=$row['firstname'] . ' ' . $row['lastname'];
					$ret_data[3]=$row['new_message'];
					// start a session
					session_start();
						$_SESSION['firstname']=$ret_data[2];
						$_SESSION['id']=$row['id'];
						$_SESSION['location']=$row['location'];
						$_SESSION['lat']=$row['lat'];
						$_SESSION['lng']=$row['lng'];
					session_write_close();
				} else {
					$ret_data[1]="not-verified";
					$ret_data[2]=$row['id'];
				}
			}
		}
	}
	print json_encode ($ret_data);
?>
