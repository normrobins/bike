<?php
	/*
	 * in [q="query"] where "query" is what has been typed by the user thus far. Return manufacturers that match the query string.
	 * out [{name =>'name', value => "value"}, ...]
	 */
	include "dbLogin.php";

	$query = $_GET['q'];

	if ($db=dbLogin()) {
		$sql="select manufacturer from bike_manufacturers
			where manufacturer like '%$query%' collate latin1_general_ci";
		$result = $db->query($sql);
		if ($result->num_rows > 0) {
			while ($row = $result->fetch_assoc()) {
				$ret[] = [
					"name" => $row['manufacturer'],
					"value" => $row['manufacturer']
					];
			}
		} else {
			$ret[] = ["name" => "none", "value" => "No suggestions"];
		}
		$db->close ();
	} else {
		$ret[] = ["name" => "err", "value" => "Error: no matches"];
	}

	// return JSON array of bike manufacturer names
	/*
	$a = [
		["name" => "none", "value" => "No suggestions"],
		["name" => "GET", "value" => "$x"],
		["name" => "Honda", "value" => "Hondaval"],
		["name" => "Yamaha", "value" => "Yamahaval"],
		["name" => "Toyota", "value" => "Toyotaval"],
		["name" => "Suzuki", "value" => "Suzukival"],
		["name" => "Merlin", "value" => "Merlinval"],
		["name" => "Rainbow", "value" => "Rainbowval"],
		["name" => "Triumph", "value" => "Triumphval"]
		];
	*/

	print json_encode ($ret);
?>
