<?php
	/*
 	 * get bike images for my profile page 
	 * in: nothing
	 * out: [[OK|NOTOK,msg][[image_id, filename],[...]]]
 	 */
	include "dbLogin.php";

	$ret_data[] = array ("NOTOK", "Not set");

	$no_error = true;
	$userid = false;

	// Check that user is logged in
	// By default will return logged in user's images
	session_start ();
	if (isset($_SESSION['id'])) { // user id
		$userid = $_SESSION['id'];
	} 
	session_write_close ();

	// if userid is passed, return images for that userid.
	if (isset($_POST['userid'])) {
		$userid = $_POST['userid'];
	}

	if (!$userid) {
		$no_error=false;
		$ret_data[0][1]="No user";
	}

	$images = false;

	if ($no_error) {
		if (($db=dbLogin()) != false) {
			// get images (profile & bike)
			$sql = "select id, image_file
				from profile_images
				where userid = $userid
				and image_type = 'bike'
				and status = 'active'";
			$result = $db->query($sql);
			if ($result) {
				while ($row = $result->fetch_assoc()) {
					$images[] = array (
						$row['id'],
						$row['image_file']
					);
				}
			} else {
				$no_error = false;
				$ret_data[0][1]="Database error 2";
			}
			$db->close();
		} else {
			$no_error = false;
			$ret_data[0][1]="Database login failed";
		}

	}
	if ($no_error) {
		$ret_data[0][0] = 'OK';
		if ($images) {
			$ret_data[] = $images;
		} 
	}
	print json_encode ($ret_data);
?>
