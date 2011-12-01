var gamejs = require('gamejs');
var draw = require('gamejs/draw');
var carte = require('carte');

exports.GameLogic = function() {
	this.populationInfectee = 0;
	this.targetedVille = null;
	this.carte = new carte.Carte(this);
	return this;
};

exports.GameLogic.prototype.update = function(deltaTime) {
	this.updatePopulationInfectee();
	this.carte.update(deltaTime);
};

exports.GameLogic.prototype.updatePopulationInfectee = function() {
	this.populationInfectee = 0;
	for (var i in this.carte.zones) {
		this.populationInfectee += this.carte.zones[i].getPopulationInfectee();
	}
};

exports.GameLogic.prototype.draw = function(surface) {
	this.carte.draw(surface);
};

exports.GameLogic.prototype.lancerEpidemie = function(nombre) {
	var i = Math.round(Math.random()*6);
	var j = Math.round(Math.random()*this.carte.zones[i].nbVilles);
	
	//XXX Moche moche moche
	this.carte.zones[i].gVilles._sprites[j].habitantsInfectes = nombre;
};

exports.GameLogic.prototype.getPopulationInfectee = function() {
	return this.populationInfectee;
};
