/*
	beinhaltet namen der tage, anzahl der tage pro monat und offset der aktuellen woche vom heutigen tag
	funktionen zum wechseln der woche (stellt den wochenstart um 7 tage weiter) und herausfinden, ob noch das aktuelle monat ist
*/
function Kalender(){
	this.tage = ['Mo','Di','Mi','Do','Fr','Sa','So'];
	this.monate = [31,28,31,30,31,30,31,31,30,31,30,31];
	
	// aktuelles datum
	var date = new Date();
	this.tag   = date.getDate();
	this.monat = date.getMonth();
	this.jahr  = date.getFullYear();
	
	// wochentag und wochenstart (fuer spaetere anzeigen) berechnen
	this.wochenTag = date.getDay() - 1;
	if(this.wochenTag < 0) this.wochenTag += 7;
	this.wochenStart = this.tag - this.wochenTag;
	this.heuteOffset = 0;
	
	// geht um eine woche weiter, berechnet tag und monat
	this.naechsteWoche = function(){
		this.wochenStart += 7;
		this.heuteOffset += 7;
		if(this.wochenStart > this.monate[this.monat]){
			this.wochenStart -= this.monate[this.monat];
			this.monat ++;
		}
		if(this.monat > 11){
			this.monat = 0;
			this.jahr ++;
		}
	}
	
	// geht um eine woche zurueck, berechnet tag und monat
	this.vorigeWoche = function(){
		this.wochenStart -= 7;
		this.heuteOffset -= 7;
		if(this.wochenStart < 0){
			this.wochenStart += this.monate[this.monat];
			this.monat --;
		}
		if(this.monat < 0){
			this.monat = 11;
			this.jahr --;
		}
	}
	
	// erzeugt ein array fuer den header des kalenders
	this.getTage = function(){
		var wochenTage = [];
		for(var i=0; i<this.tage.length; i++){
			var datum = {"tag": i + this.wochenStart, "monat": this.monat};
			if(datum.tag > this.monate[datum.monat]){
				datum.tag -= this.monate[datum.monat];
				datum.monat ++;
			}
			if(datum.monat > 11){
				datum.monat = 0;
			}
			wochenTage.push(this.tage[i] + ', ' + datum.tag + '.' + (datum.monat + 1));
		}
		return wochenTage;
	}
	
	// gibt das datum des wochenstarts zurueck
	this.getWochenStart = function(){
		return new Date(this.jahr, this.monat, this.wochenStart + 1).toISOString().slice(0,10);
	}
	
	// berechnet mit mit tag und monat, ob der wochenTag im selben monat ist
	this.getMonatDifferenz = function(wochenTag, monat = this.monat){
		if(this.wochenStart + wochenTag > this.monate[monat]) monat ++;
		if(monat > 11) monat = 0;
		return monat - date.getMonth();
	}
};

function Uhrzeit(stunde, minute, sekunde, oneDay = true){
	this.stunde = stunde;
	this.minute = minute;
	this.sekunde = sekunde;
	this.oneDay = oneDay;
	
	// verwandelt einen text in eine uhrzeit
	this.parse = function(text){
		var parts = text.split(':');
		if(parts.length != 3) return false;
		
		this.stunde = parseInt(parts[0]);
		this.minute = parseInt(parts[1]);
		this.sekunde = parseInt(parts[2]);
		
		return this;
	}
	
	// analyse der uebergebenen parameter, text oder stunde, minute und sekunde parsen
	if(typeof stunde == 'string' && stunde.length == 8){
		this.parse(stunde);
	}else{
		if(typeof this.stunde == 'string') this.stunde = parseInt(this.stunde);
		if(typeof this.minute == 'string') this.minute = parseInt(this.minute);
		if(typeof this.sekunde == 'string') this.sekunde = parseInt(this.sekunde);
	}
	
	this.toString = function(withSecond = false){
		return leadingZero(this.stunde) + ':' + leadingZero(this.minute) + (withSecond?':' + leadingZero(this.sekunde):'');
	}
	
	// vergleicht mit einer weiteren uhrzeit in 3 genauigkeitsstufen
	this.compareTo = function(uhrzeit){
		if(this.stunde > uhrzeit.stunde) return 3;
		if(this.stunde < uhrzeit.stunde) return -3;
		if(this.minute > uhrzeit.minute) return 2;
		if(this.minute < uhrzeit.minute) return -2;
		if(this.sekunde > uhrzeit.sekunde) return 1;
		if(this.sekunde < uhrzeit.sekunde) return -1;
		return 0;
	}
	
	this.copy = function(){
		return new Uhrzeit(this.stunde, this.minute, this.sekunde);
	}
	
	// addiert/subrahiert eine sekunde, berechnet minute
	this.addSek = function(value){
		this.sekunde += value;
		while(this.sekunde > 59){
			this.sekunde -= 60;
			this.addMin(1);
		}
		return this;
	}
	this.subSek = function(value){
		this.sekunde -= value;
		while(this.sekunde < 0){
			this.sekunde += 60;
			this.subMin(1);
		}
		return this;
	}
	
	// addiert/subrahiert eine minute, berechnet stunde
	this.addMin = function(value){
		this.minute += value;
		while(this.minute > 59){
			this.minute -= 60;
			this.addStd(1);
		}
		return this;
	}
	this.subMin = function(value){
		this.minute -= value;
		while(this.minute < 0){
			this.minute += 60;
			this.subStd(1);
		}
		return this;
	}
	
	// addiert/subrahiert eine stunde, wenn oneDay wird nach 24 stunden auf 0 gesetzt
	this.addStd = function(value){
		this.stunde += value;
		while(oneDay && this.stunde > 23){
			this.stunde -= 24;
		}
		return this;
	}
	this.subStd = function(value){
		this.stunde -= value;
		while(this.stunde < 0){
			this.stunde += 24;
		}
		return this;
	}
}

leadingZero = function(part){
	return ('' + part).length == 1?'0' + part:part;
}