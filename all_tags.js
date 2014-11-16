var connection = new Mongo();
var db = connection.getDB('Trains');
var trains = db.trains.find();
var counter = 0;

trains.forEach(function (result) {
	if(typeof(result.tags.length) == 'number') {
		counter = counter + parseInt(result.tags.length);
	}
});
print("All tags: " + counter);
