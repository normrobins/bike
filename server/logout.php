<?php
/*
 * Destroy the session
 */
include "dbLogin.php";

	$rd = array ("OK", "Session Destroyed");
	session_start ();
	session_unset();
	session_destroy ();
	print json_encode ($rd);
?>
