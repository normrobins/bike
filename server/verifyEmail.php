<?php
	/*
	 * [in] code_a
	 * [out] OK|NOTOK, message
 	 */
	include "dbLogin.php";

	$ret_data = array ("NOTOK", "Server error");

	// make sure there is no session running
	session_start ();
	if (isset($_SESSION['id'])) { // user id
		$error = true;
	} else {
		$error = false;
	}
	session_write_close ();

	if (isset($_POST['code_a'])) {
		$code_a = $_POST['code_a'];
	} else {
		$error = true;
	}
	if (!$error) {
		if ($db=dbLogin()) {
			// find the verify record
			$sql = "select userid from verify_email where code_a='$code_a'";
			$result = $db->query($sql);
			if ($result) {
				// check there's a record, just in case
				if ($result->num_rows > 0) {
					$row = $result->fetch_assoc ();
					$userid = $row['userid'];
					$result->close();

					// update users set validated=true
					$sql="update users set email_verified=1, email_verified_date=now() where id=$userid";
					$result = $db->query($sql);
					if ($result) {
						$ret_data[0]="OK";
					} else {
						$ret_data[1]=$sql;
					}
					// delete the verify_email row. Doing it by userid deletes all records including 'resend email' ones
					$sql="delete from verify_email where userid=$userid";
					$result = $db->query($sql);
					if ($result) {
						$ret_data[0]="OK";
					} else {
						$ret_data[0]="NOTOK";
						$ret_data[1]=$sql;
					}
				}
			} else {
				$ret_data[1]=$sql;
			}
			$db->close();
		}
	}
	print json_encode ($ret_data);
?>
