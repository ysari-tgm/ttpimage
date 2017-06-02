<?php

include_once 'functions.php';

// erster output an browser. nichts vorher!
header('Content-Type: application/json');

if(!($wpdb = connectDB())) return;

$where = [];
if(isset($_GET['raum'])){
	array_push($where, 'raum LIKE "' . $_GET['raum'] . '"');
}
if(isset($_GET['datum'])){
	array_push($where, 'datum >= "' . $_GET['datum'] . '"');
	array_push($where, 'datum < DATE_ADD("' .  $_GET['datum']. '", INTERVAL 7 DAY)');
}

$query  = 'SELECT *' . "\n"
		. 'FROM raumnutzungsplan' . "\n"
		. (!empty($where)?'WHERE ' . implode( "\n" . '  AND ', $where) . "\n":'')
		. ';';

if(isset($_GET['debug'])){
	echo '/*' . "\n" . $query . "\n" . '*/' ."\n";
}

$data = [];
$res = $wpdb->query($query);
if($res){
	for($i=0;$i<$res->num_rows;$i++){
		array_push($data, $res->fetch_assoc());
	}
}

$wpdb->close();

// ausgabe als JSON
echo JSON_ENCODE($data);

?>