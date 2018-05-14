<?php
// defining some globals here - change the first one depending on the installation
// localhost setting
define ('USER_IMAGES_BASE_DIR', '/users/norm/sites/bike');
// nesen.uk setting
// define ('USER_IMAGES_BASE_DIR', '/var/www/html/bike');

// these should be the same for all installations, they're relative to USER_IMAGES_BASE_DIR above
define ('UPLOAD_DIR', 'user_images');
define ('PROFILE_IMAGE_DIR', 'profile');
define ('USER_IMAGE_DIR', 'images');

// when searching for events by lat/lng, use this amount of 'range' (approx 100 miles square)
define ('LAT_SEARCH_RANGE', 1);
define ('LNG_SEARCH_RANGE', 2);

// range to use when searching for users
define ('USER_LAT_SEARCH_RANGE', .5);
define ('USER_LNG_SEARCH_RANGE', 1);

function dbLogin() {
	$servername = "localhost";
	$username = "";
	$password = "";
	$db = "";

	// Create connection
	$conn = new mysqli($servername, $username, $password, $db);

	// Check connection
	if ($conn->connect_error) {
    		$conn = false;
	} 
	return $conn;
}
// make it db safe and html safe
function safeString($db, $str) {
	return ($db->real_escape_string(htmlspecialchars($str)));
}

?>
