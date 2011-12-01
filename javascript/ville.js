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
	this.stockVaccinsMax = 500000;
	
	this.stockTraitements = 0;
	this.stockTraitementsMax = 20000;

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
	
	// Ces données devraient pouvoir varier en fonction du virus
	var transmission = 0.015;
	var perteImmunite = 0.0001;
	var mortalite = 0.00005;
	
	if( habitants > 0) {
		
		// Contamination des habitants entre eux
		var nouveauxHabitantsInfectes = Math.round(this.habitantsInfectes * transmission * (this.habitantsSains / habitants));
		this.habitantsSains -= nouveauxHabitantsInfectes;
		this.habitantsInfectes += nouveauxHabitantsInfectes;
		
		// Perte d'immunité 
		this.habitantsImmunises -= Math.round(this.habitantsImmunises * perteImmunite);
		
		// Immunisation
		if (this.stocksVaccins > 0) {
				var nouveauxHabitantsImmunises = Math.min(this.habitantsSains, this.stocksVaccins);
				this.stocksVaccins -= nouveauxHabitantsImmunises;
				this.habitantsSains -= nouveauxHabitantsImmunises;
				this.habitantsImmunises += nouveauxHabitantsImmunises;
		}

		// Mortalité 
		var nouveauxHabitantsMorts = Math.round(this.habitantsInfectes * mortalite);
		this.habitantsInfectes -= nouveauxHabitantsMorts;
		this.habitantsMorts += nouveauxHabitantsMorts;
	}
}

exports.Ville.prototype.draw = function(surface) {
	surface.blit(this.image, this.rect);

	// Barre de contamination
	draw.line(surface, "#000000", [this.rect.x - 1, 4 + this.rect.y + this.height], [this.rect.x + this.width + 1, 4 + this.rect.y + this.height], 6);
	var p = this.habitantsInfectes / (this.habitantsSains + this.habitantsImmunises + this.habitantsInfectes);
	draw.line(surface, "#FF0000", [this.rect.x, 4 + this.rect.y + this.height], [this.rect.x + this.width*p, 4 + this.rect.y + this.height], 4);
	
	// Barre traitements
	draw.line(surface, "#000000", [this.rect.x - 3, this.rect.y + this.height], [this.rect.x - 3, this.rect.y], 6);
	p = this.stockTraitements / this.stockTraitementsMax;
	draw.line(surface, "#3333FF", [this.rect.x - 3, this.rect.y + this.height-1], [this.rect.x - 3, this.rect.y + this.height-1 - (this.height-2)*p], 4);
	
	// Barre vaccins
	draw.line(surface, "#000000", [this.rect.x + this.width + 3, this.rect.y + this.height], [this.rect.x + this.width + 3, this.rect.y], 6);
	p = this.stockVaccins / this.stockVaccinsMax;
	draw.line(surface, "#FF3333", [this.rect.x + this.width + 3, this.rect.y + this.height-1], [this.rect.x + this.width + 3, this.rect.y + this.height-1 - (this.height-2)*p], 4);
	
	

	return;
}
