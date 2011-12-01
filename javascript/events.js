var gamejs = require('gamejs');
var draw = require('gamejs/draw');
var transfert = require('transfert');

// Variables pour les events.
var mouseDown = false;
var isTraitement = true;
var pourcentageVoulu = 0.2;
var selectedVille = null;

exports.eventManager = function(gameLogic, lineSurface, gTransferts) {
	var events = gamejs.event.get()
	events.forEach(function(event) {
		var update = false;
		if (event.type === gamejs.event.MOUSE_DOWN) {
			mouseDown = true;
			isTraitement = (event.button == 0);
			selectedVille = gameLogic.targetedVille;
		} else if (event.type === gamejs.event.MOUSE_UP) {
			if (gameLogic.targetedVille != null && selectedVille != null && gameLogic.targetedVille != selectedVille) {
				var quantite;
				if (isTraitement) {
					quantite = pourcentageVoulu * selectedVille.stockTraitements;
					selectedVille.stockTraitements -= quantite;
				} else {
					quantite = pourcentageVoulu * selectedVille.stockVaccins;
					selectedVille.stockVaccins -= quantite;
				}
				gTransferts.add(new transfert.Transfert(selectedVille, gameLogic.targetedVille, quantite, isTraitement));
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
			var villesHL=new Array();
			var i;
			for(i=0; i<6; i++){
				villesHL = villesHL.concat(gameLogic.carte.zones[i].gVilles.collidePoint(event.pos));
			}
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
};
