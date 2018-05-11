<?php
// functions related to sending emails. Includes mailgun API and supporting functions
// to build email body, html, etc.

# Include the Autoloader (see "Libraries" for install instructions)
require 'vendor/autoload.php';
use Mailgun\Mailgun;

// base dir for app server for email content
define ('APP_SERVER','http://localhost/bike');
// define ('APP_SERVER','http://nesen.uk/bike');
// define ('APP_SERVER','https://revupandride.com');

// Mailgun domain for sending email
define ('MAILGUN_DOMAIN', 'mailgun.revupandride.com');
// define ('MAILGUN_DOMAIN', 'mailgun.nesen.uk');
// define ('MAILGUN_DOMAIN', 'sandboxe1a12362c4f6414e891adb7a13adbb12.mailgun.org');

// Sender for emails
define ('FROM', 'RevUpAndRide <no-reply@mailgun.revupandride.com>');

// if test mode, all emails go to normrobins@gmail.com
define ('MAIL_TEST_MODE', true);
// define ('MAIL_TEST_MODE', false);

// make html for Join Event Request email, with Accept / Decline buttons
function makeJoinEventRequestHtmlEmail ($id, $title, $date, $firstname, $lastname, $code_a, $code_b) {
	$appsvr = APP_SERVER;
	$h = '<html><head></head><body>';
	$h .= "<h3>$title</h3>";
	$h .= "<p>On $date</p>";
	$h .= "<p><strong>$firstname $lastname</strong> would like to join.</p>";
	$h .= '<a href="' . $appsvr . '/accept_join_event_request_by_email.html?q=' . $id . '&a=' . $code_a . '&b=' . $code_b . '"'
		. ' style="background:#282;border:solid 1px grey;border-radius:5px;padding:5px;text-decoration:none;color:white">'
		. 'Accept Request</a>';
	$h .= '<a href="' . $appsvr . '/decline_join_event_request_by_email.html?q=' . $id . '&a=' . $code_a . '&b=' . $code_b . '"'
		. ' style="margin-left:10px;background:#822;border:solid 1px grey;border-radius:5px;padding:5px;text-decoration:none;color:white">'
		. 'Decline</a>';
	$h .= '<p>Log into <a href="' . $appsvr . '">RevUpAndRide</a> to see all event details.</p>';
	$h .= '</body></html>';
	return $h;
}

// make html for event invitation email, with Accept / Decline buttons
function makeEventInvitationHtmlEmail ($id, $code_a, $code_b, $title, $description, $date, $msg) {
	$appsvr = APP_SERVER;
	$h = '<html><head></head><body>';
	$h .= "<h3>" . $title . "</h3>";
	$h .= "<p><strong>Date: </strong>" . $date . "</p>";
	$h .= "<p><strong>Description: </strong>" . $description . "</p>";
	if ($msg == '') {
		$msg = '[None]';
	}
	$h .= "<p><strong>Message: </strong>$msg</p>";
	$h .= '<a href="' . $appsvr . '/accept_event_invitation_by_email.html?q=' . $id . '&a=' . $code_a . '&b=' . $code_b . '"'
		. ' style="background:#282;border:solid 1px grey;border-radius:5px;padding:5px;text-decoration:none;color:white">'
		. 'Accept Invitation</a>';
	$h .= '<a href="' . $appsvr . '/decline_event_invitation_by_email.html?q=' . $id . '&a=' . $code_a . '&b=' . $code_b . '"'
		. ' style="margin-left:10px;background:#822;border:solid 1px grey;border-radius:5px;padding:5px;text-decoration:none;color:white">'
		. 'Decline</a>';
	$h .= "<p>Log into RevUpAndRide to see all event details.</p>";
	$h .= '</body></html>';
	return $h;
}

// make html for Friend Invitation email, with Accept / Decline buttons
function makeFriendInvitationHtmlEmail ($sender, $id, $code_a, $code_b, $msg) {
	$appsvr = APP_SERVER;
	$h = '<html><head></head><body>';
	$h .= "<h3>$sender wants to be friends with you</h3>";
	if ($msg == '') {
		$msg = '[None]';
	}
	$h .= "<p><strong>Message: </strong>$msg</p>";
	$h .= '<a href="' . $appsvr . '/accept_friend_invitation_by_email.html?q=' . $id . '&a=' . $code_a . '&b=' . $code_b . '"'
		. ' style="background:#282;border:solid 1px grey;border-radius:5px;padding:5px;text-decoration:none;color:white">'
		. 'Accept Friend Request</a>';
	$h .= '<a href="' . $appsvr . '/decline_friend_invitation_by_email.html?q=' . $id . '&a=' . $code_a . '&b=' . $code_b . '"'
		. ' style="margin-left:10px;background:#822;border:solid 1px grey;border-radius:5px;padding:5px;text-decoration:none;color:white">'
		. 'Decline</a>';
	$h .= "<p>Sent from RevUpAndRide</p>";
	$h .= '</body></html>';
	return $h;
}

// make html for Friend-Accepted email
function makeAcceptFriendRequestHtmlEmail ($fname, $lname) {
	$appsvr = APP_SERVER;
	$h = '<html><head></head><body>';
	$h .= "<h3>$fname $lname accepted your friend request</h3>";
	$h .= '<p>Sent from <a href="' . $appsvr . '">RevUpAndRide</a></p>';
	$h .= '</body></html>';
	return $h;
}

// make html for Friend-Decline email
function makeDeclineFriendRequestHtmlEmail ($fname, $lname) {
	$appsvr = APP_SERVER;
	$h = '<html><head></head><body>';
	$h .= "<h3>$fname $lname declined your friend request</h3>";
	$h .= '<p>Sent from <a href="' . $appsvr . '">RevUpAndRide</a></p>';
	$h .= '</body></html>';
	return $h;
}

// make html for Registration Email-confirmation email, with Confirm button
function makeEmailConfirmationHtml ($code_a, $code_b) {
	$appsvr = APP_SERVER;
	$h = '<html><head></head><body>';
	$h .= "<h3>Please verify your email address</h3>";
	$h .= '<a href="' . $appsvr . '/verify_email.html?a=' . $code_a . '&b=' . $code_b . '"'
		. ' style="background:#282;border:solid 1px grey;border-radius:5px;padding:5px;text-decoration:none;color:white">'
		. 'Verify Email</a>';
	$h .= "<p>If you did not register at RevUpAndRide please ignore this email and sorry for the inconvenience.</p>";
	$h .= '<p>Sent from <a href="https://revupandride.com">RevUpAndRide</a></p>';
	$h .= '</body></html>';
	return $h;
}

// All emails should be HTML, not text
/*
function sendMail ($to, $subject, $text) {
	# Instantiate the client.
	$mgClient = new Mailgun('key-7f24901081c33407565436d7451cd69d');
	$domain = MAILGUN_DOMAIN;

	// for testing - sending to normrobins@gmail.com, add 'real' recipient to text
	if (MAIL_TEST_MODE) {
		$subject .= "[Should be to:$to]";
		$to = 'normrobins@gmail.com';
	}

	// from
	$from = FROM;

	# Make the call to the client. - requires PHP5.6 or higher
	try {
		$result = $mgClient->sendMessage("$domain",
			array('from' => $from,
				'to' => $to,
				'subject' => $subject,
				'text' => $text
			)
		);
	} catch (Exception $e) {
		return false;
	}
	return true;
}
*/

function sendHtmlMail ($to, $subject, $text, $html) {
	# Instantiate the client.
	$mgClient = new Mailgun('key-7f24901081c33407565436d7451cd69d');
	$domain = MAILGUN_DOMAIN;
	// $domain = "sandboxe1a12362c4f6414e891adb7a13adbb12.mailgun.org";

	// for testing - sending to normrobins@gmail.com, add 'real' recipient to text
	if (MAIL_TEST_MODE) {
		$subject .= "[Should be to:$to]";
		$to = 'normrobins@gmail.com';
	}

	$from = FROM;

	# Make the call to the client. - requires PHP5.6 or higher
	try {
		$result = $mgClient->sendMessage("$domain",
			array('from' => $from,
				'to' => $to,
				'subject' => $subject,
				'text' => $text,
				'html' => $html
			)
		);
	} catch (Exception $e) {
		return false;
	}
	return true;
}
?>
