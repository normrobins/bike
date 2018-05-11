<?php
include "dbLogin.php";
include "mailgun/sendMail.php";

$mail_test_mode = (MAIL_TEST_MODE ? 'true' : 'false');
// $latr = LAT_SEARCH_RANGE:

echo "<html><body>";
echo "<h1>sendMail.php</h1>";
echo "<p>APP_SERVER: " . APP_SERVER . "<p>";
echo "<p>FROM (below) includes &lt; &gt; which is not displayed on this page, check page source</p>";
echo "<p>FROM: " . FROM . "<p>";
echo "<p>MAIL_TEST_MODE: $mail_test_mode<p>";
echo "<h1>dbLogin.php</h1>";
echo "<p>USER_IMAGES_BASE_DIR: " . USER_IMAGES_BASE_DIR . "</p>";
echo "<p>LAT_SEARCH_RANGE (events): " . LAT_SEARCH_RANGE . "</p>";
echo "<p>LNG_SEARCH_RANGE (events): " . LNG_SEARCH_RANGE . "</p>";
echo "<p>USER_LAT_SEARCH_RANGE: " . USER_LAT_SEARCH_RANGE . "</p>";
echo "<p>USER_LNG_SEARCH_RANGE: " . USER_LNG_SEARCH_RANGE . "</p>";
echo "</body></html>";
?>
