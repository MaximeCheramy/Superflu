var gamejs = require('gamejs');
var draw = require('gamejs/draw');

var transfert = require('transfert');
var ville = require('ville');
var logic = require('logic');

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
	var gameLogic = new logic.GameLogic();

	var mainSurface = gamejs.display.getSurface();

	// Sprites
	var gVilles = chargeVilles(gameLogic);
	var gTransferts = new gamejs.sprite.Group();

	var background = buildMap();
	var lineSurface = new gamejs.Surface(1024, 545);


	// Variables pour les events.
	var mouseDown = false;
	var isTraitement = true;
	var pourcentageVoulu = 0.2;
	var selectedVille = null;

	function eventManager() {
		var events = gamejs.event.get()
		events.forEach(function(event) {
			var update = false;
			if (event.type === gamejs.event.MOUSE_DOWN) {
				mouseDown = true;
				isTraitement = (event.button == 0);
				selectedVille = gameLogic.targetedVille;
			} else if (event.type === gamejs.event.MOUSE_UP) {
				if (gameLogic.targetedVille != null && selectedVille != null && gameLogic.targetedVille != selectedVille) {
					gTransferts.add(new transfert.Transfert(selectedVille, gameLogic.targetedVille));
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
					gameLogic.targetedVille = villesHL[0];
				} else {
					gameLogic.targetedVille = null;
				}

				if (mouseDown) {
					if (selectedVille != null) {
						update = true;
					} else {
						selectedVille = gameLogic.targetedVille;
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
				if (gameLogic.targetedVille != null && gameLogic.targetedVille != selectedVille) {
					var x = gameLogic.targetedVille.rect.center[0];
					var y = gameLogic.targetedVille.rect.center[1];
					var w = gameLogic.targetedVille.rect.width;
					var h = gameLogic.targetedVille.rect.height;
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
