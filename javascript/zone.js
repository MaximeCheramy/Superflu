var gamejs = require('gamejs');
var draw = require('gamejs/draw');
var ville = require('ville');

exports.Zone = function(gameLogic, id, playerId) {
	this.id = id;
	this.gameLogic = gameLogic;
	this.owner = playerId;
	this.nbVilles = 0;
	this.populationInfectee = 0;
	this.population = 0;
	this.populationMorte = 0;
	this.chargeVilles();
	return this;
};

exports.Zone.prototype.chargeVilles = function() {
	this.gVilles = new gamejs.sprite.Group();

	var filepath = "zones/zone" + id + ".data";
	lines = gamejs.http.get(filepath).responseText.split("\n");

	this.nom = lines.shift();
	for (var i in lines) {
		var tab = lines[i].split(" ");
		if (tab.length == 3) {
			this.gVilles.add(new ville.Ville(this.gameLogic, i == 0, this, tab[0], tab[1], tab[2]));
			this.nbVilles ++;
		}
	}
};

exports.Zone.prototype.update = function(deltaTime) {
	this.updatePopulation();
	this.gVilles.update(deltaTime);
};

exports.Zone.prototype.draw = function(surface) {
	this.gVilles.draw(surface);
};

exports.Zone.prototype.updatePopulation = function() {
	var populationInfectee = 0;
	var population = 0;
	var populationMorte = 0;
	this.gVilles.sprites().forEach(function(ville) {
		populationInfectee += ville.getHabitantsInfectes();
		population += ville.getHabitants();
		populationMorte += ville.getHabitantsMorts();
	});
	this.populationInfectee = populationInfectee;
	this.population = population;
	this.populationMorte = populationMorte;
};

exports.Zone.prototype.getPopulationInfectee = function() {
	return this.populationInfectee;
};

exports.Zone.prototype.getPopulation = function() {
	return this.population;
};

exports.Zone.prototype.getPopulationMorte = function() {
	return this.populationMorte;
};
