var gamejs = require('gamejs');
var draw = require('gamejs/draw');
var carte = require('carte');

exports.GameLogic = function() {
	this.targetedVille = null;
	this.populationInfectee = 0;
	this.carte = new carte.Carte(this);
	return this;
}

exports.GameLogic.prototype.update = function(deltaTime) {
	this.carte.update(deltaTime);
}

exports.GameLogic.prototype.draw = function(surface) {
	this.carte.draw(surface);
}

exports.GameLogic.prototype.lancerEpidemie = function(nombre) {
	var i = Math.round(Math.random()*6);
	var j = Math.round(Math.random()*this.carte.zones[i].nbVilles);
	
	//XXX Moche moche moche
	this.carte.zones[i].gVilles._sprites[j].habitantsInfectes = nombre;
}
