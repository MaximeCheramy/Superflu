var gamejs = require('gamejs');
var draw = require('gamejs/draw');
var carte = require('carte');

exports.GameLogic = function() {
	this.populationInfectee = 0;
	this.populationMondiale = 0;
	this.populationMorte = 0;
	this.targetedVille = null;
	this.carte = new carte.Carte(this);
	this.gameStarted = false;
	return this;
};

exports.GameLogic.prototype.update = function(deltaTime) {
	this.updatePopulation();
	this.carte.update(deltaTime);
	if (!this.gameStarted) {
		this.lancerEpidemie(500);
		this.gameStarted = true;
	}
};

exports.GameLogic.prototype.updatePopulation = function() {
	this.populationInfectee = 0;
	this.populationMondiale = 0;
	this.populationMorte = 0;
	for (var i in this.carte.zones) {
		this.populationInfectee += this.carte.zones[i].getPopulationInfectee();
		this.populationMondiale += this.carte.zones[i].getPopulation();
		this.populationMorte += this.carte.zones[i].getPopulationMorte();
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

exports.GameLogic.prototype.getPopulationMondiale = function() {
	return this.populationMondiale;
};

exports.GameLogic.prototype.getPopulationMorte = function() {
	return this.populationMorte;
};
