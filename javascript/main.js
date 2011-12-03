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

function afficheMenu() {
	var mainSurface = gamejs.display.getSurface();
	var menu = gamejs.image.load("images/menu.png");
	var seringue = gamejs.image.load("images/seringue.png");
	var choix = 0;

	function tick() {
		var events = gamejs.event.get();
		events.forEach(function(event) {
			if (event.type === gamejs.event.MOUSE_MOTION) {
				if(event.pos[1] > 238 && event.pos[1] < 238 + 96) {
					choix = 0;
				} else if(event.pos[1] > 238+96 && event.pos[1] < 238+2*96) {
					choix = 1;
				} else if(event.pos[1] > 238+2*96 && event.pos[1] < 238+3*96) {
					choix = 2;
				}
			} else if (event.type == gamejs.event.MOUSE_DOWN) {
				if (choix == 0) {
					gamejs.time.deleteCallback(tick, 20);
					startGame();
				}
			}
		});

		mainSurface.clear();
		mainSurface.blit(menu);
		var transp = 0.85 + 0.5*Math.sin(2*Math.PI*((Date.now()%1000))/1000);
		seringue.setAlpha(1 - transp);
		mainSurface.blit(seringue, [168, 248 + choix * 100]);
	}

	 gamejs.time.fpsCallback(tick, this, 20);
}

function startGame() {
	document.body.style.backgroundImage = "url('images/fond_carte.png')";
	var gameLogic = new logic.GameLogic();

	var mainSurface = gamejs.display.getSurface();

	// Sprites
	var gTransferts = new gamejs.sprite.Group();

	var background = buildMap();
	var lineSurface = new gamejs.Surface(1024, 545);

	var c = 0;

	function tick(msDuration) {
		
		mainSurface.clear();
		mainSurface.blit(background);

		events.eventManager(gameLogic, lineSurface, gTransferts);
		
		gameLogic.draw(mainSurface);

		gTransferts.update(msDuration);
		gTransferts.draw(mainSurface);
		mainSurface.blit(lineSurface);
	};

	function updateLogic(msDuration) {
		gameLogic.update(msDuration);
	}

	gamejs.time.fpsCallback(tick, this, 20);
	gamejs.time.fpsCallback(updateLogic, this, 2);
}

function main() {
	var display = gamejs.display.setMode([1024, 545]);
	gamejs.display.setCaption("SuperFlu");
	afficheMenu();
}

gamejs.preload(["images/menu.png",
								"images/seringue.png",
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
								"images/infected.png",
								"images/HL_usine.png",
								"images/HL_ville.png"]);
gamejs.ready(main);
