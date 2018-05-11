<?php
	/*
 	 * searchUsers - return a list of users based on name, location, bike make
	 * in: firstname, lastname, location, bike make (any could be blank)
	 * out: status[OK|NOTOK], [firstname, lastname, location, bike_make]....
 	 */
	include "dbLogin.php";

	$ret_data[] = array ("NOTOK", "Server error");

	// Check that I am logged in
	session_start ();
	if (isset($_SESSION['id'])) { // user id
		$userid = $_SESSION['id'];
	} else {
		$userid = false;
		$ret_data[1]="Not logged in";
	}
	session_write_close ();

	$firstname = $_POST['firstname'];
	$lastname = $_POST['lastname'];
	$location = $_POST['location'];
	$lat = $_POST['lat'];
	$lng = $_POST['lng'];
	$bike_make = $_POST['bike_make'];
	$age = $_POST['age'];
	$gender = $_POST['gender'];
	$ability = $_POST['ability'];

	if ($userid) {
		if (($db=dbLogin()) != false) {
			// SLOW....
			// exclude currently logged in user and friends
			$sql="select id, firstname, lastname, location, bike_manufacturer, bike_model, bike_year
				from users 
				where id != $userid
				and email_verified = 1";
			$collate = "collate latin1_general_ci";
			if ($firstname != "") {
				$sql .= " and firstname like '%$firstname%' $collate";
			}
			if ($lastname != "") {
				$sql .= " and lastname like '%$lastname%' $collate";
			}
			if ($location != "") {
				$latr = USER_LAT_SEARCH_RANGE;
				$lngr = USER_LNG_SEARCH_RANGE;
				$sql .= " and lat < $lat+$latr and lat > $lat-$latr
					and lng < $lng+$lngr and lng > $lng-$lngr";
			}
			if ($bike_make != "") {
				$sql .= " and bike_manufacturer like '%$bike_make%' $collate";
			}
			if ($age != '0') {
				$sql .= " and age = $age";
			}
			if ($gender != '0') {
				$sql .= " and gender = $gender";
			}
			if ($ability != '0') {
				$sql .= " and ability = $ability";
			}

			// source can be 'friends' or notset.
			// If 'friends', then exclude people who I have sent a friend request to
			if (isset($_POST['source'])) {
				if ($_POST['source'] == 'friends') {
					$sql .= " and id not in (select recipient_id from pending_messages 
							where sender_id=$userid and message_type='friend-request')";
				}
			}

			// exclude current friends
			$sql .= " and id not in (select friend_id from friends where user_id=$userid) order by firstname asc";

			$ret_data[0][1] = $sql;
			$result = $db->query($sql);
			if ($result) {
				$ret_data[0][0] = "OK";
				// $ret_data[] = array('0',$sql,'DEBUG','DEBUG1','DEBUG1');
				while ($row = $result->fetch_assoc()) {
					$ret_data[] = array ($row['id'],
							$row['firstname'],
							$row['lastname'],
							$row['location'],
							$row['bike_manufacturer'],
							$row['bike_model'],
							$row['bike_year']
							);
				}
				$result->close();
			} else {
				$ret_data[0][1]="Search Error";
			}
			$db->close();
		}
	}
	print json_encode ($ret_data);
?>
