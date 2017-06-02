/*
	befuellt einen select
*/
function fillSelect(select, start, end, value){
	if(typeof callback != 'function'){
		console.error('no Callback set!');
		return false;
	}
	for(var i=start; i<end; i++){
		var option = document.createElement('option');
		
		var text = false;
		
		switch(typeof value){
			case 'string':
				option.innerHTML = value;
				option.value = i;
				break;
			case 'object':
				text = value[i];
				break;
			case 'function':
				text = value(i);
				break;
		}
		
		if(text){
			option.innerHTML = text;
			option.value = text;
		}
	
		select.add(option);
	}
}


/*
	prueft ob eine der felder im angegeben zeitfenster bereits belegt ist
*/
function checkBuchungPossible(datum, begin, end){
	var zeit = parseZeitfenster(datum, begin, end);
	
	for(jetzt = zeit.start.copy(); jetzt.compareTo(zeit.end) < 1; jetzt.addMin(30)){
//		console.debug(zeit);

		var selector = '#timeSlot_' + zeit.tag + '_' + jetzt.stunde + '_' + jetzt.minute;
		if(!(timeSlot = kalender_html.querySelector(selector))) break;
//		console.debug(selector, timeSlot);
		
		if(timeSlot.classList.contains('active')) return false;
	}
	
	return true;
}



function parseZeitfenster(datum, begin, end){
	var tag = new Date(datum);
//	console.debug(datum, begin, end);
	
	return {
		"tag":   tag.getDay()==0?6:tag.getDay()-1,
		"begin": new Uhrzeit(begin),
		"end":   new Uhrzeit(end)
	};
}
