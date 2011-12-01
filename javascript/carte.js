var gamejs = require('gamejs');
var draw = require('gamejs/draw');
var zone = require('zone');

exports.Carte = function(gameLogic) {
	this.gameLogic = gameLogic;
	this.zones = new Array();
	this.chargeZones();
	return this;
};

exports.Carte.prototype.chargeZones = function() {
	var i;
	for (id = 1; id <= 6; id++) {
		this.zones.push(new zone.Zone(this.gameLogic, id));
	}
};

exports.Carte.prototype.update = function(deltaTime) {
	var id;
	for (id = 1; id <= 6; id++) {
		this.zones[id-1].update(deltaTime);
	}
};


exports.Carte.prototype.draw = function(surface) {
	var id;
	for (id = 1; id <= 6; id++) {
		this.zones[id-1].draw(surface);
	}
};
