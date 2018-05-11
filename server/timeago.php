<?php
// input is mysql date format, e.g. '2016-06-13 07:30:14'

function timeago( $mtime )
{
	date_default_timezone_set ('Europe/London'); 
	$ptime = strtotime($mtime);

	$estimate_time = time() - $ptime;
	if( $estimate_time < 1 )
	{
		return 'just now';
	}
	$condition = array( 
		12 * 30 * 24 * 60 * 60=>'year',
		30 * 24 * 60 * 60 =>'month',
		24 * 60 * 60=>'day',
		60 * 60 =>'hr',
		60=>'min',
		1 =>'sec'
	);

	foreach( $condition as $secs => $str )
	{
		$d = $estimate_time / $secs;
		if( $d >= 1 )
		{
			$r = round( $d );
			return $r . ' ' . $str . ( $r > 1 ? 's' : '' );
		}
	}
}
?>
