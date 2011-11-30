var gamejs = require('gamejs');
var draw = require('gamejs/draw');

exports.Ville = function(gameLogic, usine, zone, nom, x, y) {
	exports.Ville.superConstructor.apply(this, arguments);
	this.gameLogic = gameLogic;
	this.isUsine = usine;
	this.zone = zone;
	if (this.isUsine) {
		this.imageVille = gamejs.image.load("images/usine.png");
		this.imageVilleHL = gamejs.image.load("images/HL_usine.png");
	} else {
		this.imageVille = gamejs.image.load("images/ville.png");
		this.imageVilleHL = gamejs.image.load("images/HL_ville.png");
	}
	this.image = this.imageVille;
	this.width = this.imageVille.getSize()[0];
	this.height = this.imageVille.getSize()[1];

	this.rect = new gamejs.Rect(x-this.width/2,y-this.height/2, this.width, this.height);

	this.stockVaccins = 0;
	this.stockTraitements = 0;

	this.habitantsSains = 200000 + Math.floor(Math.random() * 300000);
	this.habitantsInfectes = 0;
	this.habitantsImmunises = 0;
	this.habitantsMorts = 0;

	return this;
}
gamejs.utils.objects.extend(exports.Ville, gamejs.sprite.Sprite);

exports.Ville.prototype.update = function(msDuration) {
	this.highlight();
	this.produit();
	this.update_habitants();
}

exports.Ville.prototype.highlight = function() {
	if (this == this.gameLogic.targetedVille) {
		this.image = this.imageVilleHL;
	} else {
		this.image = this.imageVille;
	}
}

exports.Ville.prototype.produit = function() {
	if (this.isUsine) {
		var productionRateTraitements = Math.floor(5 + 0.2 * Math.sqrt(this.gameLogic.populationInfectee));
		var productionRateVaccins = Math.floor(Math.sqrt(this.gameLogic.populationInfectee));

		this.stockTraitements += productionRateTraitements;
		this.stockVaccins += productionRateVaccins;
	}
}

exports.Ville.prototype.update_habitants = function() {
	var habitants = this.habitantsSains + this.habitantsInfectes + this.habitantsImmunises;
	var transmission = 0.015;
	var perteImmunite = 0.0001;
	var mortalite = 0.00005;
	
	// Contamination des habitants entre eux
	if( habitants > 0) {
		var nouveauxHabitantsInfectes = Math.round(this.habitantsInfectes * transmission * (this.habitantsSains / habitants));
		if (nouveauxHabitantsInfectes > 0) {
			this.habitantsSains -= nouveauxHabitantsInfectes;
			this.habitantsInfectes += nouveauxHabitantsInfectes;
		} else {
			//Random rand = new Random();
			//if (rand.nextFloat() < nouveauxHabitantsInfectes) {
			//	this.habitantsSains -= 1;
			//	this.habitantsInfectes += 1;
			//}
		}
	}
	
	// Perte d'immunité 
	this.habitantsImmunises -= Math.round(this.habitantsImmunises * perteImmunite);
	
	// Mortalité 
	var nouveauxHabitantsMorts = Math.round(this.habitantsInfectes * mortalite);
	this.habitantsInfectes -= nouveauxHabitantsMorts;
	this.habitantsMorts += nouveauxHabitantsMorts;
}

exports.Ville.prototype.draw = function(surface) {
	surface.blit(this.image, this.rect);

	// Barre de contamination
	draw.line(surface, "#000000", [this.rect.x - 1, 4 + this.rect.y + this.height], [this.rect.x + this.width + 1, 4 + this.rect.y + this.height], 5);
	var p = this.habitantsInfectes / (this.habitantsSains + this.habitantsImmunises + this.habitantsInfectes);
	draw.line(surface, "#FF0000", [this.rect.x, 4 + this.rect.y + this.height], [this.rect.x + this.width*p, 4 + this.rect.y + this.height], 5);


	return;
}
