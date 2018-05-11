<?php
	/*
	 * in nothing
	 * out [[ok|NOTOK,message],[[id,gender],..],[[id,age],...],[[id,ability],...]]
	 */
	include "dbLogin.php";

	$ret_data = [['NOTOK','Server Error']];
	$error = false;
	$err_str = 'err-str';

	if ($db=dbLogin()) {
		// gender
		$sql="select id, gender from user_gender";
		$result = $db->query($sql);
		if ($result->num_rows > 0) {
			while ($row = $result->fetch_assoc()) {
				$arr[] = array($row['id'], $row['gender']);
			}
			$ret_data[] = $arr;
			$result->close();
		} else {
			$error = true;
			$err_str = 'gender';
		}

		// age
		unset ($arr);
		$sql="select id, age from user_age";
		$result = $db->query($sql);
		if ($result->num_rows > 0) {
			while ($row = $result->fetch_assoc()) {
				$arr[] = array($row['id'], $row['age']);
			}
			$ret_data[] = $arr;
			$result->close();
		} else {
			$error = true;
			$err_str = 'age';
		}

		// ability
		unset ($arr);
		$sql="select id, ability from user_ability";
		$result = $db->query($sql);
		if ($result->num_rows > 0) {
			while ($row = $result->fetch_assoc()) {
				$arr[] = array($row['id'], $row['ability']);
			}
			$ret_data[] = $arr;
			$result->close();
		} else {
			$error = true;
			$err_str = 'ability';
		}
		$db->close ();
	} else {
		$ret_data[[0][1]] = 'db login';
	}

	if ($error) {
		$ret_data[0][1] = $err_str;
	} else {
		$ret_data[0][0] = 'OK';
	}
	print json_encode ($ret_data);
?>
