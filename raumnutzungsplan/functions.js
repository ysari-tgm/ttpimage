var kalender_data = new Kalender();
var kalender_html = null;
var kalender_ladenSchluss = new Uhrzeit(23,0,0);
var kalender_restzeit = false

/*
erstellung der struktur des wochenansichts
*/
function initKalender(){
	kalender_html = document.querySelector('table#rnk');

	// header zeile erstellen und befuellen
	var row = kalender_html.insertRow();
	
	var topLeft = row.insertCell();
	topLeft.appendChild(createWeekButton('&lt;',-7));
	topLeft.appendChild(createWeekButton('&gt;', 7));
	topLeft.classList.add('head');
	
	// fuer jeden wochentag wird ein leeres header feld erzeugt
	for(var i=0; i<kalender_data.tage.length; i++){ row.insertCell().classList.add('head'); }
	
	fillKalenderHeader()
	printKalender();
	loadKalender(false);
}

/*
	leert alle termine aus dem kalender, laedt die buchungen der aktuellen woche und checkt die restzeit
*/
function loadKalender(clearFirst = true){
	if(clearFirst) clearKalender();

	loadBuchungen(kalender_raum!=''?kalender_raum:'%');

	checkRemainingTime();
}

/*
	erstellt einen button, der den kalender um eine woche versetzt, alle eintraege ausblendet und die neuen eintraege laedt
*/
function createWeekButton(text, offset){
	var wb = document.createElement('button');
	wb.innerHTML = text;
	wb.onclick = function(evt){
//		console.debug(evt.target);
		
		if(offset>0){
			kalender_data.naechsteWoche();
		}else if(offset<0){
			kalender_data.vorigeWoche();
		}
		
		fillKalenderHeader();
		loadKalender();

		return cancelEvent(evt);
	}
	
	return wb;
}

/*
	fuellt den kalender header mit wochentagen und datum
*/
function fillKalenderHeader(){
	var header = kalender_html.querySelectorAll('tr:first-of-type td:not(:first-of-type)');
	var daten = kalender_data.getTage();
	for(var i=0; i<header.length && i<daten.length; i++){
		header[i].innerHTML = daten[i];
	}
}

/*
	fragt per ajax, wie viel restzeit noch vorhanden ist
*/
function checkRemainingTime(){
	if(kalender_user_role != 'restzeitnutzer') return false;

	jQuery.getJSON(kalender_ajax_object.getAnzahl,{
		// get parameter
		'jahr': kalender_data.jahr,
		'monat': kalender_data.monat + 1,
		'username': kalender_user
	}).success(function(result){
		// abbruch wenn result objekt ein feld "error" enthaelt
		if(result.hasOwnProperty('error')){
			console.error("ERROR: ", result);
			return;
		}
		
		// neues uhrzeit objekt mit der restdauer fuellen
		kalender_restzeit = new Uhrzeit(0,0,0, false);
		kalender_restzeit.addMin(result.max - result.dauer);
//		console.debug(result, kalender_restzeit);
	}).fail(function(result){
		console.error("ERROR: ", result);
	});
}

/*
	leert den kalender
*/
function clearKalender(){
	var slots = kalender_html.querySelectorAll('td.active');
	for(var i=0; i<slots.length; i++){
		slots[i].innerHTML = '';
		slots[i].classList.remove('active');
		slots[i].classList.remove('editable');
		slots[i].classList.remove('erstesFeld');
		slots[i].buchung = null;
	}
}

/*
	erstellt die html tabelle fuer den kalender
*/
function printKalender(){
	for(var jetzt = new Uhrzeit(6,0,0); jetzt.compareTo(kalender_ladenSchluss)<-2; jetzt.addMin(30)){
		var row = kalender_html.insertRow();

		// erste zelle fuer zeitangabe
		var cell = row.insertCell();
		cell.classList.add('head');
		if(jetzt.minute == 0) cell.innerHTML = jetzt;
		
		// woche auffuellen
		for(var tag=0; tag<kalender_data.tage.length; tag++){
			// leere felder mit eindutiger id zum spaeteren befuellen
			row.insertCell().id = 'timeSlot_' + tag + '_' + jetzt.stunde + '_' + jetzt.minute;
		}
	}
}

/*
	fuegt alle buchungen aus dem array in den kalender
*/
function addBuchungen(kalender, buchungen){
//	console.debug(buchungen);
	for(var i=0;i<buchungen.length; i++){
		var erstesFeld = true;
		var editable = (buchungen[i].username == kalender_user);
//		console.debug(buchungen[i].username, kalender_user, editable);
		
		// zeitfenster der buchung
		var datum = new Date(buchungen[i].datum);
		var tag = datum.getDay()==0?6:datum.getDay()-1; // sonntag ist 6 statt 0, die anderen werden verschoben
		var begin = new Uhrzeit(buchungen[i].t_begin);
		var end = new Uhrzeit(buchungen[i].t_end);
//		console.debug(tag, begin, ende);
		
		for(jetzt = begin;jetzt.compareTo(end) < 0;jetzt.addMin(30)){
//			console.debug(jetzt, end, jetzt.compareTo(end));
			
			var selector = '#timeSlot_' + tag + '_' + jetzt.stunde + '_' + jetzt.minute;
			if(!(timeSlot = kalender_html.querySelector(selector))) break;
//			console.debug(selector, timeSlot);
			
			timeSlot.classList.add('active');
			timeSlot.classList.toggle('editable', editable);
			timeSlot.buchung = buchungen[i];
			
			if(erstesFeld){ // wird nur einmal ausgefuehrt
				erstesFeld = false;
				timeSlot.innerHTML = buchungen[i].username;
				timeSlot.classList.add('erstesFeld');
			}
		}
	}
}

/*
	laedt per ajax die buchungen aus der datenbank
*/
function loadBuchungen(raum){
	jQuery.getJSON(kalender_ajax_object.getBuchungen, {
		"raum":raum,
		"datum": kalender_data.getWochenStart()
	}).success(function(buchungen){
//		console.debug(buchungen);
		addBuchungen(kalender_html, buchungen);
	}).fail(function(data){
		console.error("ERROR: ", data);
	});
}

/*
	oeffnet und befuellt den html-dialog zum erstellen einer neuen buchung
	bei click auf speichern werden die daten aus dem form per ajax in der db gespeichert
*/
function addBuchung(data){
//	console.debug(data);

	var wochenTag = parseInt(data.d);
	var datum = {
		"monat": kalender_data.monat,
		"tag": kalender_data.wochenStart + wochenTag
	}
	if(datum.tag > kalender_data.monate[datum.monat]){
		datum.tag = datum.tag - kalender_data.monate[datum.monat];
		datum.monat ++;
	}
	
	/* pruefen, ob an dem gewaehlten datum gebucht werden darf */
	var diff = kalender_data.getMonatDifferenz(wochenTag);
//	console.debug(diff, datum.tag, kalender_data.tag, kalender_user_role);
	if( diff > 1 // buchungen spaeter als naechstes monat
	||  diff < 0 // buchungen vor diesem monat
	|| (diff == 0 && datum.tag < kalender_data.tag) // buchungen diese monat vor heute
	|| (diff > 0 && kalender_user_role == 'restzeitnutzer' && kalender_data.tag < 15) // naechste monat fuer restzeitnutzer erst ab 15 dieses monats
	) return displayBuchungsForm(false);
	
	// restzeit pruefen
	var restzeit = false;
	if(kalender_restzeit){
//		console.debug(kalender_restzeit);
		var restzeit = kalender_restzeit.copy();
		if(restzeit.stunde < 1 && restzeit.minute < 30){
			alert('du hast leider keine Restzeit über!');
			return displayBuchungsForm(false);
		}
	}
	
	// form mit daten fuellen
	var jetzt = new Uhrzeit(parseInt(data.h), parseInt(data.m), 00);
	var form = kalender_html.parentNode.querySelector('form');
	form.datum.value = kalender_data.jahr + '-' + leadingZero(datum.monat + 1) + '-' + leadingZero(datum.tag);
	form.begin.value = jetzt;
	
	clearSelect(form.dauer);
	for(jetzt.addMin(30); jetzt.compareTo(kalender_ladenSchluss) < 1; jetzt.addMin(30)){
//		console.debug(jetzt, jetzt.compareTo(kalender_ladenSchluss));

		// abbruch, wenn restzeit aufgebraucht
		if(restzeit){
//			console.debug(restzeit);
			if(restzeit.stunde < 1 && restzeit.minute < 30) break;
			restzeit.subMin(30);
		}
		
		var option = document.createElement('option');
		option.innerHTML = jetzt;
		option.value = jetzt;
		form.dauer.add(option);

		// abbruch, wenn anderer termin
		var selector = '#timeSlot_' + data.d + '_' + jetzt.stunde + '_' + jetzt.minute;
		if((timeSlot = kalender_html.querySelector(selector)) && timeSlot.classList.contains('active')) break;
	}
	
	return displayBuchungsForm();
}

/*
	fuegt ein onclick event zum submit button, falls er existiert
*/
function initForm(){
	var form = kalender_html.parentNode.querySelector('form');
	if(submit = form.querySelector('#rnkb_save')) submit.onclick = function(evt){
//		console.debug(form.begin.value,form.dauer.value');
		// abbruch, wenn eintrag "bitte waehlen"
		if(form.dauer.selectedIndex == 0) return;

		jQuery.getJSON(kalender_ajax_object.addBuchung, {
			"raum": form.raum.value,
			"datum": form.datum.value,
			"t_begin": form.begin.value + ':00',
			"t_end": form.dauer.value + ':00',
			"username": form.user.value
		}).success(function(result){
//			console.debug('result', result);
			if(result.hasOwnProperty('error')){
				console.debug("ERROR: ", result);
				alert('Buchung nicht moaeglich!' + "\n" + result.error);
				return;
			}

			loadKalender();
			displayBuchungsForm(false);
		}).fail(function(data){
			console.error("ERROR: ", data);
		});
	}
}

/*
	blendet das form ein oder aus
	verschiebt die seite per hash
	schleift die visibility als return durch
*/
function displayBuchungsForm(visible = true){
	var form = kalender_html.parentNode.querySelector('form');
	
	form.classList.toggle('hidden', !visible);
	window.location.hash = visible?'rnkb':'rnk';
	
	return visible;
}

/*
	fragt per confirm ob die buchung wirklich geloescht werden soll und loescht sie dann per ajax aus der db
*/
function deleteBuchung(buchung){
	// vergangene termine loeschen verbieten
	var datum = kalender_data.jahr + '-' + leadingZero(kalender_data.monat + 1) + '-' + leadingZero(kalender_data.tag);
//	console.debug(buchung.datum, datum, buchung.datum < datum);
	if(buchung.datum < datum) return false;
	
	if(!confirm("wollen sie diese Buchung wirklich löschen?")) return false;
//	console.debug(buchung);
	
	jQuery.getJSON(kalender_ajax_object.deleteBuchung,
		buchung
	).success(function(result){
		if(result.hasOwnProperty('error')){
			console.error("ERROR: ", result);
			return;
		}
		reloadKalender();
	}).fail(function(result){
		console.error("ERROR: ", result);
	});
}

/* initialisierung */
window.addEventListener('DOMContentLoaded',function(){
	initKalender();
	initForm();
	
	kalender_html.onclick = function(evt){
		var cl = evt.target.classList;
		if(cl.contains('head')) return;
		if(kalender_user == '') return;
		
		if(cl.contains('active')){
			if(!cl.contains('editable')) return;
			
			deleteBuchung(evt.target.buchung);
		}else{
			var tid = evt.target.id.split('_');
			if(!addBuchung({"d": tid[1], "h": tid[2], "m": tid[3]})) return;
		}
	};
},false);



/* tools */

function clearSelect(select){
	var options = select.querySelectorAll('option:not([disabled])');
	for(var i=0; i<options.length; i++){
		options[i].outerHTML = '';
	}
	select.selectedIndex = 0;
}

function cancelEvent(evt){
	if (evt.stopPropagation) {
		evt.stopPropagation();
	} else {
		evt.cancelBubble = true;
	}
	return false;
}