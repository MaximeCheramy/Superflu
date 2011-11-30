var gamejs = require('gamejs');

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
	var width = this.imageVille.getSize()[0];
	var height = this.imageVille.getSize()[1];

	this.rect = new gamejs.Rect(x-width/2,y-height/2, width, height);

	this.stockVaccins = 0;
	this.stockTraitements = 0;

	return this;
}
gamejs.utils.objects.extend(exports.Ville, gamejs.sprite.Sprite);

exports.Ville.prototype.update = function(msDuration) {
	this.highlight();
	this.produit();
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
