<?php
	/*
 	 * Update user's profile
	 * in: username, password,firstname,lastname,email, phone, xlocation, bike_manufacturer, bike_model, bike_year
	 * out = status(OK|NOTOK), msg
 	 */
	include "dbLogin.php";

	$ret_data = array ("NOTOK", "Server error");

	session_start ();
	if (isset($_SESSION['id'])) { // user id
		$uid = $_SESSION['id'];
	} else {
		$uid = false;
		$ret_data[1]="Not logged in";
	}
	session_write_close ();

	if ($uid) {
		if ($db=dbLogin()) {
			$username=$_POST['username'];
			$password=$_POST['password'];
			$firstname=safeString($db, ($_POST['firstname']));
			$lastname=safeString($db, ($_POST['lastname']));
			$email=safeString($db, ($_POST['email']));
			$phone=safeString($db, ($_POST['phone']));
			$location=safeString($db, ($_POST['xlocation']));
			$lat=safeString($db, ($_POST['lat']));
			$lng=safeString($db, ($_POST['lng']));
			$gender=safeString($db, ($_POST['gender']));
			$age=safeString($db, ($_POST['age']));
			$ability=safeString($db, ($_POST['ability']));
			$bio=safeString($db, ($_POST['bio']));
			$bike_manufacturer=safeString($db, ($_POST['bike_manufacturer']));
			$bike_model=safeString($db, ($_POST['bike_model']));
			$bike_year=safeString($db, ($_POST['bike_year']));
			
			$fullname = $firstname . " " . $lastname;

			if ($password == "") { // not changing password
				$sql="update users set username='$username',
					firstname='$firstname',
					lastname='$lastname',
					fullname='$fullname',
					email='$email',
					phone='$phone',
					location='$location',
					lat=$lat,
					lng=$lng,
					gender=$gender,
					age=$age,
					ability=$ability,
					bio='$bio',
					bike_manufacturer='$bike_manufacturer',
					bike_model='$bike_model',
					bike_year='$bike_year'
					where id=$uid";
			}
			else {	// changing password as well
				$sql="update users set username='$username',
					password=password('$password'),
					firstname='$firstname',
					lastname='$lastname',
					fullname='$fullname',
					email='$email',
					phone='$phone',
					location='$location',
					gender=$gender,
					age=$age,
					ability=$ability,
					bio='$bio',
					bike_manufacturer='$bike_manufacturer',
					bike_model='$bike_model',
					bike_year='$bike_year'
					where id=$uid";
			}
			$result = $db->query($sql);
			if ($result) {
				$ret_data[0]="OK";
			}
			// add bike manufacturer / model if new and not blank
			if ($bike_manufacturer != '') {
				$sql = "select id from bike_manufacturers where manufacturer='$bike_manufacturer'";
				$result = $db->query($sql);
				if ($result->num_rows == 0) {
					$sql = "insert into bike_manufacturers (manufacturer) values ('$bike_manufacturer')";
					$result = $db->query($sql);
					if ($result) {
						// nothing
					} else {
						$ret_data[0]="NOTOK";
						$ret_data[1]="manufacturer";
					}
				}
				if ($bike_model != '') {
					$sql = "select id from bike_models where manufacturer='$bike_manufacturer' and model='$bike_model'";
					$result = $db->query($sql);
					if ($result->num_rows == 0) {
						$sql = "insert into bike_models (manufacturer,model) values ('$bike_manufacturer','$bike_model')";
						$result = $db->query($sql);
						if ($result) {
							// nothing
						} else {
							$ret_data[0]="NOTOK";
							$ret_data[1]="model";
						}
					}
				}
			}
			$db->close();
		}
	}
	print json_encode ($ret_data);
?>
