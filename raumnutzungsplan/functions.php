<?php

function connectDB($db = 'local'){
	// verbingung zur db aufbauen
	switch($db){
		case 'local':
			$wpdb = @new mysqli('localhost', 'root', '1234', 'ttpimage');
			break;
		case 'hostinger':
			$wpdb = @new mysqli('mysql.hostinger.de', 'u243846017_ttp', 'Ichbinsich1', 'u243846017_ttp');
			break;
		case 'wordpress':
			global $wpdb;
			break;
		default:
			return false;
	}

	// pruefen, ob fehlerfreie verbindung
	if ($wpdb->connect_errno) {
		echo '{"error":"Database Connection Error: ' . $wpdb->connect_error . '"}';
		return false;
	}
	
	return $wpdb;
}

function leadingZero($part){
	return sprintf('%02d', $part);
}

?>