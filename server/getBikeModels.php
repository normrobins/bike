<?php
	/*
	 * in [man="manufacturer,mod=model"]
	 * out [{name =>'name', value => "value"}, ...]
	 */
	include "dbLogin.php";

	$manufacturer = $_GET['man'];
	$model = $_GET['mod'];

	if ($db=dbLogin()) {
		$sql="select model from bike_models 
			where manufacturer='$manufacturer' collate latin1_general_ci 
			and model like '%$model%' collate latin1_general_ci";
		$result = $db->query($sql);
		if ($result->num_rows > 0) {
			while ($row = $result->fetch_assoc()) {
				$ret[] = [
					"name" => $row['model'],
					"value" => $row['model']
					];
			}
		} else {
			// $ret[] = ["name" => "none", "value" => "No suggestions"];
		}
		$sqlx = $db->real_escape_string($sql);
		$db->query("insert into mytab (mystr) values ('$sqlx')");
		$db->close ();
	} else {
		$ret[] = ["name" => "err", "value" => "Error: no matches"];
	}

	// return JSON array of bike model names for testing
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
