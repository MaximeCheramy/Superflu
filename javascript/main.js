var gamejs = require('gamejs');
var draw = require('gamejs/draw');

var ville = require('ville');
var logic = require('logic');
var events = require('events');

function chargeVilles(gameLogic) {
	var gVilles = new gamejs.sprite.Group();

	for (id = 1; id <= 6; id++) {
		var filepath = "zones/zone" + id + ".data";
		lines = gamejs.http.get(filepath).responseText.split("\n");
	
		var nom = lines.shift();
		for (var i in lines) {
			var tab = lines[i].split(" ");
			if (tab.length == 3) {
				gVilles.add(new ville.Ville(gameLogic, i == 0, nom, tab[0], tab[1], tab[2]));
			}
		}
	}

	return gVilles;
}

function buildMap() {
	var carte = gamejs.image.load("images/carte.png");

	var background = new gamejs.Surface(1024, 545);
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
	var gameLogic = new logic.GameLogic();

	var mainSurface = gamejs.display.getSurface();

	// Sprites
	var gVilles = chargeVilles(gameLogic);
	var gTransferts = new gamejs.sprite.Group();

	var background = buildMap();
	var lineSurface = new gamejs.Surface(1024, 545);


	function tick(msDuration) {
		mainSurface.clear();
		mainSurface.blit(background);

		events.eventManager(gameLogic, lineSurface, gVilles, gTransferts);

		gVilles.update(msDuration);
		gVilles.draw(mainSurface);
		gTransferts.update(msDuration);
		gTransferts.draw(mainSurface);
		mainSurface.blit(lineSurface);
	};


	gamejs.time.fpsCallback(tick, this, 20);
}


gamejs.preload(["images/carte_eur.png",
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
