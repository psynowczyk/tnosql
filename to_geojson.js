var connection = new Mongo();
var db = connection.getDB('Trains');

var gdansk = { "type": "Point", "coordinates": [18.65, 54.35] }
var array = db.fuel.find({ loc: { $near: { $geometry: gdansk }, $maxDistance: 20000 } }).limit(10).toArray();
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
