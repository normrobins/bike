<?php
	/*
	 * in: userid
	 * out: [[OK|NOTOK,err_msg]
	 *	[username, firstname, lastname, email, phone, location, gender,age, ability, bio, bike_mfg, bike_model, bike_year]
	 *	[profile_image_id, filename]
 	 */
	include "dbLogin.php";

	$ret_data[] = array ("NOTOK", "Not set");

	$no_error = true;

	// Check that I am logged in
	// and return my profile by default
	session_start ();
	if (isset($_SESSION['id'])) { // user id
		$userid = $_SESSION['id'];
	} else {
		$no_error = false;
		$ret_data[0][1]="Not logged in";
	}
	session_write_close ();

	// if userid passed, then return profile for that userid
	if (isset($_POST['userid'])) {
		$userid = $_POST['userid'];
	}

	if ($no_error) {
		if (($db=dbLogin()) != false) {
			// get user details
			$sql="select u.username, u.firstname, u.lastname, u.email, u.phone, u.location, u.lat, u.lng,
				u.gender, ug.gender as gender_txt, u.age, ua.age as age_txt, u.ability, uab.ability as ability_txt, 
				u.bio, u.bike_manufacturer, u.bike_model, u.bike_year
				from users u, user_age ua, user_gender ug, user_ability uab
				where u.id = $userid
				and u.age = ua.id
				and u.gender = ug.id
				and u.ability = uab.id";
			$result = $db->query($sql);
			if ($result) {
				while ($row = $result->fetch_assoc()) {
					$ret_data[] = array (
						$row['username'],
						$row['firstname'],
						$row['lastname'],
						$row['email'],
						$row['phone'],
						$row['location'],
						$row['lat'],
						$row['lng'],
						$row['gender'],
						$row['gender_txt'],
						$row['age'],
						$row['age_txt'],
						$row['ability'],
						$row['ability_txt'],
						$row['bio'],
						$row['bike_manufacturer'],
						$row['bike_model'],
						$row['bike_year']
					);
				}
				$result->close();
			}
			else {
				$no_error = false;
				$ret_data[0][1]="Database error 1";
			}

			if ($no_error) {
				$profile_image = false;
				// get profile image
				$sql = "select id, image_file
					from profile_images
					where userid = $userid
					and image_type = 'profile'
					and status = 'active'";
				$result = $db->query($sql);
				if ($result) {
					// should be only one row, just in case... only return the last row
					while ($row = $result->fetch_assoc()) {
						$profile_image = array (
							$row['id'],
							$row['image_file']
						);
					}
				} else {
					$no_error = false;
					$ret_data[0][1]="Database error 2";
				}
			}
			if ($profile_image) {
				$ret_data[] = $profile_image;
			}
			$db->close();
		} else {
			$no_error = false;
			$ret_data[0][1]="Database login failed";
		}

	}
	$ret_data[0][0] = ($no_error == true ? 'OK' : 'NOTOK');
	print json_encode ($ret_data);
?>
