var gamejs = require('gamejs');
var draw = require('gamejs/draw');
var carte = require('carte');
var logic = require('logic');
var events = require('events');

function buildMap() {
	var map = gamejs.image.load("images/carte.png");

	var background = new gamejs.Surface(1024, 545);
	background.blit(map);

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
	var gTransferts = new gamejs.sprite.Group();

	var background = buildMap();
	var lineSurface = new gamejs.Surface(1024, 545);

	function tick(msDuration) {
		
		mainSurface.clear();
		mainSurface.blit(background);

		events.eventManager(gameLogic, lineSurface, gTransferts);
		
		gameLogic.update(msDuration);
		gameLogic.draw(mainSurface);

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
