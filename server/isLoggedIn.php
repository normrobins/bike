<?php
	// if session exists, return OK/yes
	session_start ();
	if (isset($_SESSION["firstname"]))
		$ret_data = array ('OK', 'session', 'yes', 
				$_SESSION['firstname'], $_SESSION['id'], 
				$_SESSION['location'], $_SESSION['lat'], $_SESSION['lng']);
	else
		$ret_data = array ('NOTOK', 'session', 'NO', 'NO', 'no', 'no','no','no');
	session_write_close();

	print json_encode ($ret_data);
?>
