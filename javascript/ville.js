var gamejs = require('gamejs');
var draw = require('gamejs/draw');

var font = new gamejs.font.Font('16px Arial, Helvetica, sans-serif');

exports.Ville = function(gameLogic, usine, zone, nom, x, y) {
	exports.Ville.superConstructor.apply(this, arguments);
	this.nom = nom.replace('_', ' ');
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
	this.stockTraitementsMax = 100000;

	this.habitantsSains = 200000 + Math.floor(Math.random() * 300000);
	this.habitantsInfectes = 0;
	this.habitantsImmunises = 0;
	this.habitantsMorts = 0;

	return this;
};

gamejs.utils.objects.extend(exports.Ville, gamejs.sprite.Sprite);

exports.Ville.prototype.update = function(msDuration) {
	this.produit(msDuration);
	this.update_habitants(msDuration);
	/*if (this == this.gameLogic.targetedVille) {
		drawInfos(this.infoVilleSurface);
	}*/
};

exports.Ville.prototype.highlight = function() {
	if (this == this.gameLogic.targetedVille) {
		this.image = this.imageVilleHL;
	} else {
		this.image = this.imageVille;
	}
};

exports.Ville.prototype.produit = function(msDuration) {
	if (this.isUsine) {
		var productionRateTraitements = Math.floor(Math.random() + 0.1 * Math.sqrt(this.gameLogic.getPopulationInfectee()) * msDuration);
		var productionRateVaccins = Math.floor(Math.sqrt(this.gameLogic.getPopulationInfectee()) * msDuration);

		this.ajouteStockTraitements(productionRateTraitements);
		this.ajouteStockVaccins(productionRateVaccins);
	}
};

exports.Ville.prototype.update_habitants = function(msDuration) {
	var habitants = this.habitantsSains + this.habitantsInfectes + this.habitantsImmunises;
	
	// Ces données devraient pouvoir varier en fonction du virus
	var transmission = 0.00015;
	var perteImmunite = 0.000001;
	var mortalite = 0.0000005;
	
	// Les stocks se perdent :(
	this.stockVaccins = Math.round(this.stockVaccins * Math.pow(0.995, Math.floor(msDuration / 10)));
	this.stockTraitements = Math.round(this.stockTraitements * Math.pow(0.997, Math.floor(msDuration / 10)));

	if( habitants > 0) {
		
		// Contamination des habitants entre eux
		if(this.habitantsInfectes > 0) {
			var nouveauxHabitantsInfectes = this.habitantsInfectes * transmission * (this.habitantsSains / habitants) * msDuration;
			if(nouveauxHabitantsInfectes >= 1) { 
				this.habitantsSains -= Math.floor(nouveauxHabitantsInfectes);
				this.habitantsInfectes += Math.floor(nouveauxHabitantsInfectes);
			} else {
				if(Math.random() < nouveauxHabitantsInfectes) {
					this.habitantsSains --;
					this.habitantsInfectes ++;
				}
			}
		}
		
		// Utilisation des traitements
		if (this.stockTraitementsMax > 0) {
				var nouveauxHabitantsImmunises = Math.min(this.habitantsInfectes, this.stockTraitements);
				this.stockTraitements -= nouveauxHabitantsImmunises;
				this.habitantsInfectes -= nouveauxHabitantsImmunises;
				this.habitantsImmunises += nouveauxHabitantsImmunises;
		}

		// Perte d'immunité
		if(this.habitantsImmunises > 0) {
			var perteImmunite = this.habitantsImmunises * perteImmunite * msDuration;
			if(perteImmunite >= 1) {
				perteImmunite = Math.floor(perteImmunite);
				this.habitantsImmunises -= perteImmunite;
				this.habitantsSains += perteImmunite;
			} else {
				if(Math.random() < perteImmunite) {
					this.habitantsImmunises --;
					this.habitantsSains ++;
				}
			}
		}

		// Immunisation
		if (this.stockVaccins > 0) {
				var nouveauxHabitantsImmunises = Math.min(this.habitantsSains, this.stockVaccins);
				this.stockVaccins -= nouveauxHabitantsImmunises;
				this.habitantsSains -= nouveauxHabitantsImmunises;
				this.habitantsImmunises += nouveauxHabitantsImmunises;
		}

		// Mortalité 
		if(this.habitantsInfectes > 0 ) { 
			var nouveauxHabitantsMorts = this.habitantsInfectes * mortalite * msDuration;
			if(nouveauxHabitantsMorts >= 1) {
				nouveauxHabitantsMorts = Math.floor(nouveauxHabitantsMorts);
				this.habitantsInfectes -= nouveauxHabitantsMorts;
				this.habitantsMorts += nouveauxHabitantsMorts;	
			} else {
				if(Math.random() < nouveauxHabitantsMorts) {
					this.habitantsInfectes --;
					this.habitantsMorts ++;
				}
			}
		}
	}
};

exports.Ville.prototype.drawInfos = function(infoVilleSurface) {
	infoVilleSurface.clear();
	infoVilleSurface.blit(font.render(this.nom, '#ffffff'), [0, 250]);
	infoVilleSurface.blit(font.render("Population totale : " + this.getHabitants(), '#ffffff'), [0, 280]);
	infoVilleSurface.blit(font.render("Population saine :", '#ffffff'), [0, 300]);
	infoVilleSurface.blit(font.render("non vaccinée : " + this.getHabitantsSains(), '#ffffff'), [40, 320]);
	infoVilleSurface.blit(font.render("immunisée : " + this.getHabitantsImmunises(), '#ffffff'), [40, 340]);
	infoVilleSurface.blit(font.render("Population malade : " + this.getHabitantsInfectes(), '#ffffff'), [0, 360]);
	infoVilleSurface.blit(font.render("Nombre de morts : " + this.getHabitantsMorts(), '#ffffff'), [0, 380]);
	infoVilleSurface.blit(font.render("Stocks traitements : " + this.stockTraitements, '#ffffff'), [0, 410]);
	infoVilleSurface.blit(font.render("Stocks vaccins : " + this.stockVaccins, '#ffffff'), [0, 430]);
};

exports.Ville.prototype.draw = function(surface) {
	this.highlight();
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
	
	// Image d'infection
	if(this.habitantsInfectes > 10000) {
		var infected = gamejs.image.load("images/infected.png");
		surface.blit(infected, new gamejs.Rect(this.rect.x, this.rect.y, 30, 30));
	} else if(this.habitantsInfectes > 200) {
		var infected = gamejs.image.load("images/infected.png");
		surface.blit(infected, new gamejs.Rect(this.rect.x, this.rect.y, 20, 20));
	}

	return;
};

exports.Ville.prototype.ajouteStockTraitements = function(quantite) {
	this.stockTraitements += quantite;
	if (this.stockTraitements > this.stockTraitementsMax) {
		this.stockTraitements = this.stockTraitementsMax;
	}
};

exports.Ville.prototype.ajouteStockVaccins = function(quantite) {
	this.stockVaccins += quantite;
	if (this.stockVaccins > this.stockVaccinsMax) {
		this.stockVaccins = this.stockVaccinsMax;
	}
};

exports.Ville.prototype.getHabitants = function() {
	return this.habitantsSains + this.habitantsImmunises + this.habitantsInfectes;
};

exports.Ville.prototype.getHabitantsSains = function() {
	return this.habitantsSains;
};

exports.Ville.prototype.getHabitantsImmunises = function() {
	return this.habitantsImmunises;
};

exports.Ville.prototype.getHabitantsInfectes = function() {
	return this.habitantsInfectes;
};

exports.Ville.prototype.getHabitantsMorts = function() {
	return this.habitantsMorts;
};

exports.Ville.prototype.ajouteHabitantsSains = function(n) {
	this.habitantsSains += n;
};

exports.Ville.prototype.ajouteHabitantsInfectes = function(n) {
	this.habitantsInfectes += n;
};

exports.Ville.prototype.ajouteHabitantsImmunises = function(n) {
	this.habitantsImmunises += n;
};

exports.Ville.prototype.retireHabitantsSains = function(n) {
	this.habitantsSains -= n;
};

exports.Ville.prototype.retireHabitantsInfectes = function(n) {
	this.habitantsInfectes -= n;
};

exports.Ville.prototype.retireHabitantsImmunises = function(n) {
	this.habitantsImmunises -= n;
};
