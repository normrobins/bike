<?php
include "sendMail.php";
	$send_email=true;

	$to = 'normrobins@gmail.com';
	$subject = 'TEST FROM t.php';
	$text = "Test email from t.php Please click this link to verify your email address: " . APP_SERVER . uniqid();

	// send email or not
	if ($send_email) {
		if (sendMail ($to, $subject, $text)) {
			echo "ok";
		} else {
			echo 'notok';
		}
	}

	printf ("Email:%s\r\nFrom:%s\n\rText%s\n\r", ($send_email ? 'YES' : 'NO'), $from, $text);
?>
