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
