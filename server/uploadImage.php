<?php
/*
	must be logged in 
	each uploaded file is renamed and stored in $upload_dir/$userid/images-table.id.<file-extension>
	Data is recd from form "file"
	Hidden field 'image-type' indicates what type of picture this is - 'profile','bike' ..
	Hidden field 'image-id' is id of currently used image, or 0 if none.
	returns [OK|NOTOK, image_id, path to new file]
*/
include "dbLogin.php";

// upload base directory for files. Files are stored in $upload_dir/<user_id>/$profile_image_dir (or $user_image_dir)
/*
$user_images_base_dir='/users/norm/sites/bike'; // needs to be specified explicitly so that move_uploaded_file works
$upload_dir='user_images';
$profile_image_dir='profile';
$user_image_dir='images';
*/
$user_images_base_dir=USER_IMAGES_BASE_DIR;
$upload_dir=UPLOAD_DIR;
$profile_image_dir=PROFILE_IMAGE_DIR;
$user_image_dir=USER_IMAGE_DIR;

// check loggedin and get user id
$userid = false;
session_start ();
if (isset($_SESSION['id'])) {
	$userid = $_SESSION['id'];
}
session_write_close ();


if($userid && isset($_FILES["file"]["type"])) {
	$err = false;
	$err_msg='File uploaded';
	$validtypes = array ('image/png', 'image/jpg', 'image/jpeg');
	$validextensions = array("jpeg", "jpg", "png");
	$temporary = explode(".", $_FILES["file"]["name"]);
	// lowercase it to take care of .JPG .PNG etc extensions. Files are stored with lowercase extensions
	$file_extension = strtolower(end($temporary));

	if (in_array ($_FILES["file"]["type"], $validtypes)) {
		// OK
	} else {
		$err = true;
		$err_msg = "Wrong file type:".$_FILES['file']['type'];
	}
	
	if (!$err) {
		if (in_array($file_extension, $validextensions)) {
			// OK
		} else {
			$err = true;
			$err_msg = "Wrong file extension:".$file_extension;
		}
	}
	if (!$err) {
		if ($_FILES["file"]["size"] > 3000000) {
			$err = true;
			$err_msg = 'File too large, max size is 3Mb';
		}
	}
	if (!$err) {
		if ($_FILES["file"]["error"] > 0) {
			$err = true;
			$err_msg = 'Error: code ' . $_FILES['file']['error'];
		}
	}
	if (!$err) {
		if (isset($_POST['image-type'])) {
			$image_type = $_POST['image-type'];
			if (($image_type == 'profile') || ($image_type == 'bike')) {
				// OK
			} else {
				$err = true;
				$err_msg = 'Unexpected picture type';
			}
		} else {
			$err = true;
			$err_msg = 'Unknown picture type';
		}
	}
	if (!$err) {
		if (isset($_POST['image-id'])) {
			$orig_image_id = $_POST['image-id'];
		} else {
			$orig_image_id = '0';
		}
	}
	// insert db record
	if (!$err) {
		// db call returns [OK|NOTOK, image_id, filename]
		$file_location = "$upload_dir/$userid/$profile_image_dir";
		$db_ret = add_image_to_db($orig_image_id, $image_type, $file_location, $file_extension);
		if ($db_ret[0] == 'OK') {
			// move file to new location
			$sourcePath = $_FILES['file']['tmp_name']; // Storing source path of the file in a variable
			$targetPath = "$user_images_base_dir/$db_ret[2]"; // Target path where file is to be stored
			if(move_uploaded_file($sourcePath,$targetPath)) {
				// if true, all worked OK, err_msg is returned to client, set it to filename.
			} else {
				$err = true;
				$err_msg="Error writing file";
			}
		} else {
			$err = true;
			$err_msg = $db_ret[1];
		}

	}
	// if OK, return file-type, filename and image-id
	if ($err) {
		$ret_data = array('NOTOK',$err_msg);
	} else {
		$ret_data = array('OK',$image_type, $db_ret[2], $db_ret[1]);
	}
} else {
	$ret_data = array ('NOTOK','Something went wrong. Check file size and type?');
}

print json_encode ($ret_data);

// functions from here on

function add_image_to_db ($orig_image_id, $image_type, $filepath, $file_extension) {
	// if previous image exists, update status to 'old'
	// add a record for new image
	// return new image filename
	global $userid;

	$ret_data = array('NOTOK','noid', 'noname');
	$db = dbLogin();
	if ($db) {
		$no_err = true;
		if ($orig_image_id != '0') {
			$sql = "update profile_images set status = 'old' where id = $orig_image_id";
			$result = $db->query($sql);
			if ($result) {
				// ok
			} else {
				$no_err = false;
				$ret_data[1] = 'DB error 1';
			}
		}
		// insert new record
		if ($no_err) {
			// insert new image details
			$sql = "insert into profile_images (userid, image_type, status)
				values ($userid, '$image_type', 'active')";
			$result = $db->query($sql);
			if ($result) {
				// set filename to last insert id
				$id = $db->insert_id;
				$filename = $filepath .'/'. $id . '.' . $file_extension;
				$sql = "update profile_images
					set image_file='$filename'
					where id=$id";
				$result=$db->query($sql);
				if ($result) {
					$ret_data[0] = 'OK';
					$ret_data[1] = $id;
					$ret_data[2] = $filename;
				} else {
					$ret_data[1] = 'DB error 3';
				}
			} else {
				$ret_data[1] = 'DB error 2';
			}
		} 
	} else {
		$ret_data[1] = 'DB login failed';
	}

	return $ret_data;
}
?>
