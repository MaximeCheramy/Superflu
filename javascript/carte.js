var gamejs = require('gamejs');
var draw = require('gamejs/draw');
var zone = require('zone');
var distance = require('distances');

var font = new gamejs.font.Font('16px Arial, Helvetica, sans-serif');
var TAUX_MIGRATION = .2;

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
	this.migrations(deltaTime);
};

exports.Carte.prototype.migrations = function(deltaTime) {
	for (var idZ1 in this.zones) {
		var villes1 = this.zones[idZ1].gVilles.sprites();
		for (var idV1 in villes1) {
			var taux_sain = villes1[idV1].getHabitantsSains() / villes1[idV1].getHabitants();
			var taux_infection = villes1[idV1].getHabitantsInfectes() / villes1[idV1].getHabitants();
			var taux_immunisation = villes1[idV1].getHabitantsImmunises() / villes1[idV1].getHabitants();
			for (var idZ2 in this.zones) {
				var villes2 = this.zones[idZ2].gVilles.sprites();
				for (var idV2 in villes2) {
					var d = distance.distance(villes1[idV1].rect.center, villes2[idV2].rect.center);
					if (d == 0) {
						continue;
					}
					var flux = Math.floor((Math.random() * villes1[idV1].getHabitants() * TAUX_MIGRATION) / (d*d + 3*this.gameLogic.getPopulationInfectee()) * deltaTime);
					var flux_sain = Math.floor(taux_sain * flux);
					var flux_infecte = Math.floor(taux_infection * flux);
					var flux_immunise = Math.floor(taux_immunisation * flux);

					/* Mise à jour de la population saine */
					if (villes1[idV1].getHabitantsSains() >= flux_sain) {
						villes2[idV2].ajouteHabitantsSains(flux_sain);
						villes1[idV1].retireHabitantsSains(flux_sain);
					} else {
						villes2[idV2].ajouteHabitantsSains(villes1[idV1]
								.getHabitantsSains());
						villes1[idV1].retireHabitantsSains(villes1[idV1]
								.getHabitantsSains());
					}

					/* Mise à jour de la population infectée */
					if (villes1[idV1].getHabitantsInfectes() >= flux_infecte) {
						villes2[idV2].ajouteHabitantsInfectes(flux_infecte);
						villes1[idV1].retireHabitantsInfectes(flux_infecte);
					} else {
						villes2[idV2].ajouteHabitantsInfectes(villes1[idV1].getHabitantsInfectes());
						villes1[idV1].retireHabitantsInfectes(villes1[idV1].getHabitantsInfectes());
					}

					/* Mise à jour de la population immunisée */
					if (villes1[idV1].getHabitantsImmunises() >= flux_immunise) {
						villes2[idV2].ajouteHabitantsImmunises(flux_immunise);
						villes1[idV1].retireHabitantsImmunises(flux_immunise);
					} else {
						villes2[idV2].ajouteHabitantsImmunises(villes1[idV1].getHabitantsImmunises());
						villes1[idV1].retireHabitantsImmunises(villes1[idV1].getHabitantsImmunises());
					}
				}
			}
		}
	}
};

exports.Carte.prototype.draw = function(surface) {
	var popMondText = font.render("Population mondiale : " + this.gameLogic.getPopulationMondiale(), '#ffffff');
	var popMortsText = font.render("Nombre de morts : " + this.gameLogic.getPopulationMorte(), '#ffffff');
	var popMaladeText = font.render("Nombre de malades : " + this.gameLogic.getPopulationInfectee(), '#ffffff');
	surface.blit(popMondText, [0, 2]);
	surface.blit(popMortsText, [0, 20]);
	surface.blit(popMaladeText, [0, 40]);

	var id;
	for (id = 1; id <= 6; id++) {
		this.zones[id-1].draw(surface);
	}
};
