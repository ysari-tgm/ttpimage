<?php

include_once 'functions.php';

// erster output an browser. nichts vorher!
header('Content-Type: application/json');

if(!($wpdb = connectDB())) return;

if(!isset($_GET['datum'],$_GET['raum'],$_GET['t_begin'])){
	echo '{"error":"not all needed Parameters were set!"}';
	return;
}
$query  = 'DELETE FROM raumnutzungsplan' . "\n"
		. 'WHERE raum = "' . $_GET['raum'] . '"' . "\n"
		. '  AND datum = "' . $_GET['datum'] . '"' . "\n"
		. '  AND t_begin = "' . $_GET['t_begin'] . '"' . "\n";

if(isset($_GET['debug'])){
	echo '/*' . "\n" . $query . "\n" . '*/' ."\n";
}

$data = [];
$wpdb->query($query);
if($wpdb->affected_rows == 1){
	$data = true;
}else{
	$data['error'] = $wpdb->error;
}

$wpdb->close();

// ausgabe als JSON
echo JSON_ENCODE($data);

?>