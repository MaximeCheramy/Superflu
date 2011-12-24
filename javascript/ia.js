var gamejs = require('gamejs');
var transfert = require('transfert');

exports.IA = function(gameLogic, gTransferts, playerId) {
	this.gameLogic = gameLogic;
	this.gTransferts = gTransferts;
	this.playerId = playerId;
	gamejs.time.fpsCallback(this.doTurn, this, 1);

	return this;
};

exports.IA.prototype.doTurn = function() {
	var villeA = null;
	var maxTraitements = -1;
	for (var i in this.gameLogic.carte.zones) {
		if (this.gameLogic.carte.zones[i].owner == this.playerId) {
			for (var j = 0; j < this.gameLogic.carte.zones[i].nbVilles; j++) {
				if (this.gameLogic.carte.zones[i].gVilles._sprites[j].stockTraitements > maxTraitements) {
					maxTraitements = this.gameLogic.carte.zones[i].gVilles._sprites[j].stockTraitements;
					villeA = this.gameLogic.carte.zones[i].gVilles._sprites[j];
				}
			}
		}
	}

	var villeB = null;
	var maxInfectes = -1;
	for (var i in this.gameLogic.carte.zones) {
	//	if (this.gameLogic.carte.zones[i].owner == this.playerId) {
			for (var j = 0; j < this.gameLogic.carte.zones[i].nbVilles; j++) {
				if (this.gameLogic.carte.zones[i].gVilles._sprites[j].getHabitantsInfectes() > maxInfectes) {
					maxInfectes = this.gameLogic.carte.zones[i].gVilles._sprites[j].getHabitantsInfectes();
					villeB = this.gameLogic.carte.zones[i].gVilles._sprites[j];
				}
			}
	//	}
	}

	if (villeA != villeB && villeA != null && villeB != null) {
		var quantite = Math.round(villeA.stockTraitements * 0.9);
		this.gTransferts.add(new transfert.Transfert(villeA, villeB, quantite, true));
	}
};


