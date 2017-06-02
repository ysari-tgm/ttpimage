<?php
/*
Plugin Name: Raumnutzungsplan
*/

/*
erstellt frame fuer kalender
*/
function raumnutzung_index(){
	um_fetch_user(get_current_user_id()); //aktuellen benutzer von ultimate member holen
	$user = wp_get_current_user();
?>
<div id="rnk_container">
	<table border="1" id="rnk"></table>
	<form onsubmit="return false;" class="hidden">
		<table border="1" id="rnkb">
			<tr>
				<th colspan="2" height="60px">Raum buchen</th>
			</tr>
			<tr>
				<td>Benutzer</td>
				<td>
					<input type="text" name="user" value="<?php echo $user->display_name; ?>" readonly>
				</td>
			</tr>
			<tr>
				<td>Raum</td>
				<td>
					<!-- select, wenn nicht als get angegeben -->
					<?php if(isset($_GET['raum'])){ ?>
					<input type="text" name="raum" value="<?php echo $_GET['raum']; ?>" readonly>
					<?php } else {?>
					<select name="raum">
						<option disabled selected>-- bitte w&auml;hlen --</option>
						<option value="flamingo">Flamingo</option>
						<option value="flieger">Flieger</option>
						<option value="14.07">14.07</option>
					</select>
					<?php } ?>
				</td>
			</tr>
			<tr>
				<td>Datum</td>
				<td>
					<input type="text" name="datum" value="" readonly>
				</td>
			</tr>
			<tr>
				<td>Beginn</td>
				<td>
					<input type="text" name="begin" value="" readonly>
				</td>
			</tr>
			<tr>
				<td>Ende</td>
				<td>
					<select name="dauer">
						<option disabled selected>-- bitte w&auml;hlen --</option>
					</select>
				</td>
			</tr>
			<tr>
				<td colspan="2">
					<div id="rnkb_save" class="button">Speichern</input>
				</td>
			</tr>
		</table>
	</form>
	<script type="text/javascript">
		kalender_raum = "<?php if(isset($_GET['raum'])) echo $_GET['raum']; ?>";
		kalender_user = "<?php echo $user->display_name; ?>";
		kalender_user_role = "<?php echo um_user('role'); ?>";
	</script>
</div>
<?php
	return ob_get_clean();
}

// shortcode registern
add_shortcode('raumnutzung','raumnutzung_index');
// javascript und css files registrieren, damit sie in der anwendung verwendet werden koennen -> werden in head eingefuegt
wp_enqueue_script('kalender-gui', plugin_dir_url(__FILE__).'functions.js', array('jquery'), null, true);
wp_enqueue_script('kalender-daten', plugin_dir_url(__FILE__).'kalender.js');
wp_enqueue_style('kalender-formatierung', plugin_dir_url(__FILE__).'main.css');

//ajax handler definieren, ist spaeter in javascript als object verfuegbar
wp_localize_script('kalender-gui','kalender_ajax_object', [
	'getBuchungen'  => plugin_dir_url(__FILE__).'getBuchungen.json.php',
	'deleteBuchung' => plugin_dir_url(__FILE__).'deleteBuchung.json.php',
	'addBuchung'    => plugin_dir_url(__FILE__).'addBuchung.json.php',
	'getAnzahl'     => plugin_dir_url(__FILE__).'getAnzahl.json.php'
]);

?>
