var connection = new Mongo();
var db = connection.getDB('Trains');

/*
// 1d.1
var gdansk = { "type": "Point", "coordinates": [18.65, 54.35] }
var array = db.fuel.find({
	loc: {
		$near: {
			$geometry: gdansk
		},
		$maxDistance: 20000
	}
}).limit(10).toArray();

// 1d.2
var olsztyn = { "type": "Point", "coordinates": [20.48, 53.78] }
var array = db.fuel.find({
	loc: {
		$geoWithin: {
			$center: [[olsztyn.coordinates[0], olsztyn.coordinates[1]], 0.80]
		}
	}
}).limit(5).toArray();
*/
var array = db.fuel.find({
	loc: {
		$geoWithin: {
			$geometry: {
				"type": "Polygon",
				"coordinates": [[
					[18.65, 54.35],
					[20.48, 53.78],
					[16.93, 52.41],
					[18.65, 54.35]
				]]
			}
		}
	}
}).limit(100).toArray();

var geojson = {
	"type": "FeatureCollection",
	"features": []
};
for(var x = 0; x < array.length; x++) {
	var object = array[x];
	geojson.features[x] = {
		"type": "Feature",
		"geometry": {
			"city": object.city,
			"type": object.loc.type,
			"coordinates": [
				object.loc.coordinates[0],
				object.loc.coordinates[1]
			]
		}
	};
}
printjson(geojson);
