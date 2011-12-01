var gamejs = require('gamejs');
var distance = require('distances');

var vitesseTransfert = 0.08;

exports.Transfert = function(depart, arrivee, stock, isTraitement) {
	exports.Transfert.superConstructor.apply(this, arguments);
	this.depart = depart;
	this.arrivee = arrivee;
	this.stock = stock;
	this.isTraitement = isTraitement;
	this.tempsDepart = Date.now();

	var d1 = distance.distance_sens1(depart.rect.center, arrivee.rect.center);
	var d2 = distance.distance_sens2(depart.rect.center, arrivee.rect.center);
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
gamejs.utils.objects.extend(exports.Transfert, gamejs.sprite.Sprite);

exports.Transfert.prototype.update = function(msDuration) {
	var avancement = (Date.now() - this.tempsDepart) / (this.tempsArrivee - this.tempsDepart);
	var zoom = 0.25 + 0.75*Math.sin(avancement*Math.PI);

	if (avancement >= 1) {
		if (this.isTraitement) {
			this.arrivee.ajouteStockTraitements(this.stock);
		} else {
			this.arrivee.ajouteStockVaccins(this.stock);
		}
		this.kill();
	}

	var avionX = ((1 - avancement) * this.departX + avancement * this.arriveeX + this.width * (1 - zoom) * 0.5) % 1024;
	var avionY = ((1 - avancement) * this.departY + avancement * this.arriveeY + this.height * (1 - zoom) * 0.5) % 1024;
	this.rect = new gamejs.Rect(avionX, avionY, this.width * zoom, this.height * zoom);
}


