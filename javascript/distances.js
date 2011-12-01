var gamejs = require('gamejs');

exports.distance_sens1 = function(depart, arrivee) {
	return gamejs.utils.vectors.distance(depart, arrivee);
};

exports.distance_sens2 = function(depart, arrivee) {
	if (depart[0] < arrivee[0]) {
		return gamejs.utils.vectors.distance([depart[0] + 1024, depart[1]], arrivee);
	} else {
		return gamejs.utils.vectors.distance(depart, [arrivee[0] + 1024, arrivee[1]]);
	}
};

exports.distance = function(depart, arrivee) {
	return Math.min(exports.distance_sens1(depart, arrivee), exports.distance_sens2(depart, arrivee));
}
