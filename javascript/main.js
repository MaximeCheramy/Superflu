var gamejs = require('gamejs');
var draw = require('gamejs/draw');

var targetedVille = null;
var selectedVille = null;
var pourcentageVoulu = 0.2;
var populationInfectee = 0;

var vitesseTransfert = 0.08;

// Misc

function distance_sens2(depart, arrivee) {
	if (depart[0] < arrivee[0]) {
		return gamejs.utils.vectors.distance([depart[0] + 1024, depart[1]], arrivee);
	} else {
		return gamejs.utils.vectors.distance(depart, [arrivee[0] + 1024, arrivee[1]]);
	}
}

// Fin Misc


// Transfert

var Transfert = function(depart, arrivee, stock) {
	Transfert.superConstructor.apply(this, arguments);
	this.depart = depart;
	this.arrivee = arrivee;
	this.stock = stock;
	this.tempsDepart = Date.now();


	var d1 = gamejs.utils.vectors.distance(depart.rect.center, arrivee.rect.center);
	var d2 = distance_sens2(depart.rect.center, arrivee.rect.center);
	this.direct = d1 <= d2;

	if (this.direct) {
		this.tempsArrivee = this.tempsDepart + d1 / vitesseTransfert;
	} else {
		this.tempsArrivee = this.tempsDepart + d2 / vitesseTransfert;
	}

	this.departX = depart.rect.center[0];
	this.departY = depart.rect.center[1];
	this.arriveeX = arrivee.rect.center[0];
	this.arriveeY = arrivee.rect.center[1];
	if (!this.direct) {
	if (this.departX < this.arriveeX) {
			this.departX += 1024;
		} else {
			this.arriveeX += 1024;
		}
	}

	// Gestion sprite.
	this.imageOrigine = gamejs.image.load("images/avion.png");
	var v = [this.arriveeX - this.departX, this.arriveeY - this.departY];
	this.imageOrigine = gamejs.transform.rotate(this.imageOrigine, 180 * gamejs.utils.vectors.angle([1, 0], v) / Math.PI);

	this.width = this.imageOrigine.getSize()[0];
	this.height = this.imageOrigine.getSize()[1];
	this.departX -= this.width/2;
	this.arriveeX -= this.width/2;
	this.departY -= this.height/2;
	this.arriveeY -= this.height/2;

	this.rect = new gamejs.Rect([this.departX, this.departY], [0,0]);

	this.image = this.imageOrigine;

	return this;
}
gamejs.utils.objects.extend(Transfert, gamejs.sprite.Sprite);

Transfert.prototype.update = function(msDuration) {
	var avancement = (Date.now() - this.tempsDepart) / (this.tempsArrivee - this.tempsDepart);
	var zoom = 0.25 + 0.75*Math.sin(avancement*Math.PI);

	if (avancement >= 1) {
		this.kill();
	}

	var avionX = ((1 - avancement) * this.departX + avancement * this.arriveeX + this.width * (1 - zoom) * 0.5) % 1024;
	var avionY = ((1 - avancement) * this.departY + avancement * this.arriveeY + this.height * (1 - zoom) * 0.5) % 1024;
	this.rect = new gamejs.Rect(avionX, avionY, this.width * zoom, this.height * zoom);
}

// Fin Transfert


// Ville

var Ville = function(usine, zone, nom, x, y) {
	Ville.superConstructor.apply(this, arguments);
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
gamejs.utils.objects.extend(Ville, gamejs.sprite.Sprite);

Ville.prototype.update = function(msDuration) {
	this.highlight();
	this.produit();
}

Ville.prototype.highlight = function() {
	if (this == targetedVille) {
		this.image = this.imageVilleHL;
	} else {
		this.image = this.imageVille;
	}
}

Ville.prototype.produit = function() {
	if (this.isUsine) {
		var productionRateTraitements = Math.floor(5 + 0.2 * Math.sqrt(populationInfectee));
		var productionRateVaccins = Math.floor(Math.sqrt(populationInfectee));

		this.stockTraitements += productionRateTraitements;
		this.stockVaccins += productionRateVaccins;
	}
}

// Fin Ville



function chargeVilles() {
	var gVilles = new gamejs.sprite.Group();

	for (id = 1; id <= 6; id++) {
		var filepath = "zones/zone" + id + ".data";
		lines = gamejs.http.get(filepath).responseText.split("\n");
	
		var nom = lines.shift();
		for (var i in lines) {
			var tab = lines[i].split(" ");
			if (tab.length == 3) {
				gVilles.add(new Ville(i == 0, nom, tab[0], tab[1], tab[2]));
			}
		}
	}

	return gVilles;
}

function buildMap() {
	var fond_carte = gamejs.image.load("images/fond_carte.png");
	var carte = gamejs.image.load("images/carte.png");

	var background = new gamejs.Surface(1024, 545);
	background.blit(fond_carte);
	background.blit(carte);

	// Pour l'instant on affecte toutes les zones.
	background.blit(gamejs.image.load("images/carte_eur.png"));
	background.blit(gamejs.image.load("images/carte_us.png"));
	background.blit(gamejs.image.load("images/carte_ams.png"));
	background.blit(gamejs.image.load("images/carte_afr.png"));
	background.blit(gamejs.image.load("images/carte_indo.png"));
	background.blit(gamejs.image.load("images/carte_asia.png"));

	return background;
}

function main() {
	var display = gamejs.display.setMode([1024, 545]);
	gamejs.display.setCaption("SuperFlu");

	var mainSurface = gamejs.display.getSurface();

	// Sprites
	var gVilles = chargeVilles();
	var gTransferts = new gamejs.sprite.Group();

	var background = buildMap();
	var lineSurface = new gamejs.Surface(1024, 545);

	// Variables pour les events.
	var mouseDown = false;
	var isTraitement = true;

	function eventManager() {
		var events = gamejs.event.get()
		events.forEach(function(event) {
			var update = false;
			if (event.type === gamejs.event.MOUSE_DOWN) {
				mouseDown = true;
				isTraitement = (event.button == 0);
				selectedVille = targetedVille;
			} else if (event.type === gamejs.event.MOUSE_UP) {
				if (targetedVille != null && selectedVille != null && targetedVille != selectedVille) {
					gTransferts.add(new Transfert(selectedVille, targetedVille));
				}

				selectedVille = null;
				mouseDown = false;
				lineSurface.clear();
			} else if (event.type === gamejs.event.MOUSE_WHEEL) {
				pourcentageVoulu -= event.delta / 100;
				if (pourcentageVoulu < 0) pourcentageVoulu = 0;
				if (pourcentageVoulu > 1) pourcentageVoulu = 1;
				if (selectedVille)
					update = true;
			} else if (event.type === gamejs.event.MOUSE_MOTION) {
				// On cherche la ville où on a le curseur.
				var villesHL = gVilles.collidePoint(event.pos);
				if (villesHL.length > 0) {
					targetedVille = villesHL[0];
				} else {
					targetedVille = null;
				}

				if (mouseDown) {
					if (selectedVille != null) {
						update = true;
					} else {
						selectedVille = targetedVille;
					}
				}
			}

			// On met à jour l'affichage du trait et du cercle de pourcentage à envoyer.
			if (update) {
				lineSurface.clear();
				var color = isTraitement ? "#0000ff" : "#ff0000";
				var diametre = 32;
				draw.arc(lineSurface, color, new gamejs.Rect(selectedVille.rect.center[0] - diametre/2, selectedVille.rect.center[1] - diametre/2, diametre, diametre), 0, 360*pourcentageVoulu, 4);
				draw.line(lineSurface, color, selectedVille.rect.center, event.pos, 4);
				if (targetedVille != null && targetedVille != selectedVille) {
					var x = targetedVille.rect.center[0];
					var y = targetedVille.rect.center[1];
					var w = targetedVille.rect.width;
					var h = targetedVille.rect.height;
					draw.polygon(lineSurface, color, [[x+w, y], [x, y+h], [x-w, y], [x, y-h]], 2);
				}
			}
		});
	}

	function tick(msDuration) {
		mainSurface.clear();
		mainSurface.blit(background);

		eventManager();

		gVilles.update(msDuration);
		gVilles.draw(mainSurface);
		gTransferts.update(msDuration);
		gTransferts.draw(mainSurface);
		mainSurface.blit(lineSurface);
	};


	gamejs.time.fpsCallback(tick, this, 20);
}


gamejs.preload(["images/fond_carte.png",
								"images/carte_eur.png",
								"images/carte_us.png",
								"images/carte_ams.png",
								"images/carte_afr.png",
								"images/carte_indo.png",
								"images/carte_asia.png",
								"images/carte.png",
								"images/ville.png",
								"images/usine.png",
								"images/avion.png",
								"images/HL_usine.png",
								"images/HL_ville.png"]);
gamejs.ready(main);
