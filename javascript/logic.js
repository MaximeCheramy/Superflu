var gamejs = require('gamejs');
var draw = require('gamejs/draw');
var carte = require('carte');

var font = new gamejs.font.Font('16px Arial, Helvetica, sans-serif');
var POURCENTAGE_ECHEC = 0.001;

exports.GameLogic = function() {
	this.level = 1;
	this.populationInfectee = 0;
	this.populationMondiale = 0;
	this.populationMorte = 0;
	this.targetedVille = null;
	this.carte = new carte.Carte(this);
	this.gameStarted = false;
	this.state = null;
	return this;
};

exports.GameLogic.prototype.update = function(deltaTime) {
	this.updatePopulation();
	this.carte.update(deltaTime);
	if (!this.gameStarted) {
		this.lancerEpidemie(500);
		this.gameStarted = true;
	}

	if (this.populationInfectee < 200 && this.level < 10) {
		this.level++;
		this.lancerEpidemie(this.level * 500);
	} else if (this.populationInfectee < 100) {
		this.level++;
	}

	if (this.populationMorte > (this.populationMondiale + this.populationMorte)*POURCENTAGE_ECHEC) {
		this.state = "PERDU";
	}

	if (this.level >= 10) {
		this.state = "GAGNE";
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
	
	surface.blit(font.render("Level " + this.level, '#3333ff'), [750, 10]);
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
