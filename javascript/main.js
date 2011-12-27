var gamejs = require('gamejs');
var draw = require('gamejs/draw');
var carte = require('carte');
var logic = require('logic');
var events = require('events');
var ia = require('ia');

function aide() {
	var mainSurface = gamejs.display.getSurface();
	var aide = Array();
	aide[0] = gamejs.image.load("images/aide1.png");
	aide[1] = gamejs.image.load("images/aide2.png");
	aide[2] = gamejs.image.load("images/aide3.png");
	aide[3] = gamejs.image.load("images/aide4.png");
	var c = 0;

	function tick() {
		var events = gamejs.event.get();
		events.forEach(function(event) {
			if (event.type == gamejs.event.MOUSE_DOWN) {
				c++;
				if (c >= 4) {
					gamejs.time.deleteCallback(tick, 20);
					afficheMenu();
				}
			}
		});		

		mainSurface.clear();
		mainSurface.blit(aide[c]);
	}

	gamejs.time.fpsCallback(tick, this, 20);
}

function credits() {
	var mainSurface = gamejs.display.getSurface();
	var credit = gamejs.image.load("images/credits.png");

	var dna = Array();
	for (var i = 0; i < 10; i++) {
		dna[i] = gamejs.image.load("images/dna" + (i + 1) + ".png");
	}

	var c = 0;

	function tick() {
		var events = gamejs.event.get();
		events.forEach(function(event) {
			if (event.type == gamejs.event.MOUSE_DOWN) {
				gamejs.time.deleteCallback(tick, 15);
				afficheMenu();
			}
		});

		mainSurface.clear();
		mainSurface.blit(credit);
		mainSurface.blit(dna[c++], [500, 100]);
		c %= 10;
	}

	gamejs.time.fpsCallback(tick, this, 15);
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
				gamejs.time.deleteCallback(tick, 20);
				if (choix == 0) {
					menuDifficulty();
				} else if (choix == 1) {
					aide();
				} else {
					credits();
				}
			}
		});

		mainSurface.clear();
		mainSurface.blit(menu);
		var transp = 0.85 + 0.5*Math.sin(2*Math.PI*((Date.now()%1000))/1000);
		seringue.setAlpha(1 - transp);
		mainSurface.blit(seringue, [168, 248 + choix * 96]);
	}

	 gamejs.time.fpsCallback(tick, this, 20);
}

function menuDifficulty() {
	var mainSurface = gamejs.display.getSurface();
	var menu = gamejs.image.load("images/menu2.png");
	var seringue = gamejs.image.load("images/seringue.png");
	
	var choix = 0;

	function tick() {
		var events = gamejs.event.get();
		events.forEach(function(event) {
			if (event.type === gamejs.event.MOUSE_MOTION) {
				if (event.pos[1] > 60 && event.pos[1] < 60 + 110) {
					choix = 0;
				} else if (event.pos[1] > 60+110 && event.pos[1] < 60+2*110) {
					choix = 1;
				} else if (event.pos[1] > 60+2*110 && event.pos[1] < 60+3*110) {
					choix = 2;
				} else if (event.pos[1] > 60+3*110 && event.pos[1] < 60+4*110) {
					choix = 3;
				}
			} else if (event.type == gamejs.event.MOUSE_DOWN) {
				gamejs.time.deleteCallback(tick, 20);
				if (choix == 0) {
					startGame("EASY");
				} else if (choix == 1) {
					startGame("MEDIUM");
				} else if (choix == 2) {
					startGame("HARD");
				} else {
					afficheMenu();
				}
			}
		});
		mainSurface.clear();
		mainSurface.blit(menu);
		var transp = 0.85 + 0.5*Math.sin(2*Math.PI*((Date.now()%1000))/1000);
		seringue.setAlpha(1 - transp);
		if (choix <= 2) {
			mainSurface.blit(seringue, [72, 72 + choix * 112]);
		} else {
			mainSurface.blit(seringue, [584, 456]);
		}
	}

	gamejs.time.fpsCallback(tick, this, 20);
}

function startGame(level) {
	document.body.style.backgroundImage = "url('images/fond_carte.png')";
	var gameLogic = new logic.GameLogic();

	var mainSurface = gamejs.display.getSurface();

	// Sprites
	var gTransferts = new gamejs.sprite.Group();

	var background = gameLogic.carte.buildMap();
	var lineSurface = new gamejs.Surface(1024, 545);
	var infoVilleSurface = new gamejs.Surface(1024, 545);

	var c = 0;

	function tick(msDuration) {
		
		mainSurface.clear();
		mainSurface.blit(background);

		events.eventManager(gameLogic, infoVilleSurface, lineSurface, gTransferts);
		
		gameLogic.draw(mainSurface);

		gTransferts.update(msDuration);
		gTransferts.draw(mainSurface);
		mainSurface.blit(lineSurface);
		mainSurface.blit(infoVilleSurface);
	};

	var cpu;

	function updateLogic(msDuration) {
		if (gameLogic.state == null) {
			gameLogic.update(msDuration);
		} else {
			gamejs.time.deleteCallback(updateLogic, 2);
			gamejs.time.deleteCallback(tick, 20);
			cpu.stop();
			if (gameLogic.state == "PERDU") {
				var perdu = gamejs.image.load("images/gameover.png");
				mainSurface.blit(perdu, [337, 180]);
			} else {
				var gagne = gamejs.image.load("images/victory.png");
				mainSurface.blit(gagne, [337, 180]);
			}
		}
	}

	gamejs.time.fpsCallback(tick, this, 20);
	gamejs.time.fpsCallback(updateLogic, this, 2);

	cpu = new ia.IA(level, gameLogic, gTransferts, 1);
}

function main() {
	var display = gamejs.display.setMode([1024, 545]);
	gamejs.display.setCaption("SuperFlu");
	afficheMenu();
}

gamejs.preload(["images/menu.png",
								"images/menu2.png",
								"images/victory.png",
								"images/gameover.png",
								"images/dna1.png",
								"images/dna2.png",
								"images/dna3.png",
								"images/dna4.png",
								"images/dna5.png",
								"images/dna6.png",
								"images/dna7.png",
								"images/dna8.png",
								"images/dna9.png",
								"images/dna10.png",
								"images/aide1.png",
								"images/aide2.png",
								"images/aide3.png",
								"images/aide4.png",
								"images/credits.png",
								"images/seringue.png",
								"images/zone1.png",
								"images/zone2.png",
								"images/zone3.png",
								"images/zone4.png",
								"images/zone5.png",
								"images/zone6.png",
								"images/carte.png",
								"images/ville.png",
								"images/usine.png",
								"images/avion.png",
								"images/infected.png",
								"images/HL_usine.png",
								"images/HL_ville.png"]);
gamejs.ready(main);
