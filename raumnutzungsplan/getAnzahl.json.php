<?php

include_once 'functions.php';

// erster output an browser. nichts vorher!
header('Content-Type: application/json');

if(!($wpdb = connectDB())) return;

if(!isset($_GET['jahr'], $_GET['monat'], $_GET['username'])){
	echo '{"error":"not all needed Parameters were set!"}';
	return;
}

$where = [
	'username LIKE "' . $_GET['username'] . '"',
	'datum >= "' . $_GET['jahr'] . '-' . leadingZero($_GET['monat']) . '-01"',
	'datum <  "' . $_GET['jahr'] . '-' . leadingZero(intval($_GET['monat'])+1) . '-01"'
];

$query  = 'SELECT *' . "\n"
		. 'FROM raumnutzungsplan' . "\n"
		. (!empty($where)?'WHERE ' . implode( "\n" . '  AND ', $where) . "\n":'')
		. ';';

if(isset($_GET['debug'])){
	echo '/*' . "\n" . $query . "\n" . '*/' . "\n";
}

$data = [
//	'get' => $_GET,
	'dauer' => 0,
	'max' => 24*60
];
$res = $wpdb->query($query);
if($res){
	$data['count'] = $res->num_rows;
	for($i=0;$i<$res->num_rows;$i++){
		$row = $res->fetch_assoc(); // naechsten eintrag als assoziatives array
		$begin = new DateTime($row['t_begin']);
		$end = new DateTime($row['t_end']);
		$diff = $begin->diff($end);
		$data['dauer'] += $diff->h*60 + $diff->i;
	}
}else{
	echo '{"error":"no entrys found!"}';
	return;
}

$wpdb->close();

// ausgabe als JSON
echo JSON_ENCODE($data);

?>