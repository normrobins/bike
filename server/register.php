<?php
/*
 * Register
 * in [username,password, firstname, lastname, email, phone, xlocation, bike_manufacturer, bike_model, bike_year ]
 * out = status(OK|NOTOK), msg
 * Register makes the user's directory for images. Relies on $upload_dir being the same as other places (e.g. uploadImage.php)
 */
include "dbLogin.php";
include "mailgun/sendMail.php";

$ret_data = array ("NOTOK", "Registration failed");

// base dir for image uploads. Should make this a global variable as it relies on other functions having the same value.
$uploaded_images_base_dir=USER_IMAGES_BASE_DIR;
$upload_dir=UPLOAD_DIR;
$profile_dir=PROFILE_IMAGE_DIR;
$image_dir=USER_IMAGE_DIR;

if ($db=dbLogin()) {
	$username=safeString($db, $_POST['username']);
	$password=$_POST['password'];
	$firstname=safeString($db, $_POST['firstname']);
	$lastname=safeString($db, $_POST['lastname']);
	$email=safeString($db, $_POST['email']);
	$phone=safeString($db, $_POST['phone']);
	$location=safeString($db, $_POST['location']);
	$lat=safeString($db, $_POST['lat']);
	$lng=safeString($db, $_POST['lng']);
	$age=safeString($db, $_POST['age']);
	$gender=safeString($db, $_POST['gender']);
	$ability=safeString($db, $_POST['ability']);
	$bio=safeString($db, $_POST['bio']);
	$bike_manufacturer=safeString($db, $_POST['bike_manufacturer']);
	$bike_model=safeString($db, $_POST['bike_model']);
	$bike_year=safeString($db, $_POST['bike_year']);

	$user_ok = false;

	$fullname = $firstname . " " . $lastname;

	// check that username/email does not exist
	$sql="select username from users where username = '$username' or email = '$email'";
	if (($result = $db->query($sql)) != false) {
		if ($result->num_rows > 0) { 
			$ret_data[1]="Username or Email exists";
		} else {
			$user_ok = true;
		}
		$result->close();
	}

	// continue if OK
	if ($user_ok) {
		// add user to db, make required directories, etc. Defaults to non-verified user
		$sql="insert into users (username, password, firstname, lastname, 
				fullname, email, phone, location, lat, lng, 
				gender, age, ability, bio, bike_manufacturer, bike_model, bike_year)
			values ('$username', password('$password'), '$firstname',
				'$lastname', '$fullname', '$email', '$phone', '$location', $lat, $lng,
				$gender, $age, $ability, '$bio',
				'$bike_manufacturer', '$bike_model', '$bike_year')";
		if ($result = $db->query($sql) != false) {
			$ret_data[0]="OK";
			// make user's directory for images
			$userid = $db->insert_id;
			// make userid base directory
			$user_dir = "$uploaded_images_base_dir/$upload_dir/$userid";
			if (mkdir ($user_dir)) {
				chmod ($user_dir, 0777);
				// profile dir
				if (mkdir ("$user_dir/$profile_dir")) {
					chmod ("$user_dir/$profile_dir", 0777);
					// other images dir
					if (mkdir ("$user_dir/$image_dir")) {
						chmod ("$user_dir/$image_dir", 0777);
					} else {
						$ret_data[0]="NOTOK";
						$ret_data[1]="mkdir failed(0)";
					}
				} else {
					$ret_data[0]="NOTOK";
					$ret_data[1]="mkdir failed(1)";
				}
			}
		} else {
			$ret_data[1]="db insert failed";
		}
		// add row in verify_email table
		$code_a = str_shuffle(uniqid('abc'));
		$code_b = str_shuffle(uniqid('xyz'));
		$sql = "insert into verify_email (userid, code_a, code_b) values ($userid, '$code_a', '$code_b')";
		if (($result = $db->query($sql)) != false) {
			// hope it works
			// APP_SERVER defined in mailgun/sendMail
			$appsvr = APP_SERVER;
			// send an email to the user for verification
			$text = "Hi $firstname $lastname, thanks for registering with RevUpAndRide.\r\n\nPlease click this link to verify your email address: $appsvr/verify_email.html?a=$code_a\r\n\nIf you didn't register with us please ignore this email and sorry for the inconvenience.";
		
			$html = makeEmailConfirmationHtml ($code_a, $code_b);
			$to = $email;
			$subject = 'Please verify your email';
			// send validation email
			if (sendHtmlMail ($to, $subject, $text, $html)) {
				$ret_data[0]="OK";
			} else {
				$ret_data[0]="NOTOK";
				$ret_data[1]="Error sending email";
			}
		} else {
			$ret_data[0]="NOTOK";
			$ret_data[1]="Error creating email";
			// delete user record
			$sql = "delete from users where id=$userid";
			$result = $db->query($sql);
			if (!$result) {
				// do something
				$ret_data[1]="Error creating email+";
			}
		}
	}

	// if user_ok, add bike info to db if it does not already exist
	if ($user_ok) {
		if ($bike_manufacturer != '') {
			$sql="select * from bike_manufacturers where manufacturer='$bike_manufacturer'";
			if (($result = $db->query($sql)) != false) {
				if ($result->num_rows == 0) { 
					$sql="insert into bike_manufacturers (manufacturer) values ('$bike_manufacturer')";
					if (($result = $db->query($sql)) != false) {
						// hope it works
					}
				}
			}
			// same for bike model if not blank
			if ($bike_model != '') {
				$sql="select * from bike_models where manufacturer='$bike_manufacturer' and model='$bike_model'";
				if (($result = $db->query($sql)) != false) {
					if ($result->num_rows == 0) { 
						$sql="insert into bike_models (manufacturer, model) values ('$bike_manufacturer', '$bike_model')";
						if (($result = $db->query($sql)) != false) {
							// hope it works
						}
					}
				}
			}
		}
	}
	$db->close();
} else {
	$ret_data[1]="DB login";
}
print json_encode ($ret_data);
?>
