var connection = new Mongo();
var db = connection.getDB('Trains');
var trains = db.trains.find();

trains.forEach(function (result) {
	for(var x = 0; x < result.tags.length; x++) {
		var tag = db.tags.findOne({ 'tag': result.tags[x].toLowerCase() });
		if(tag) {
			var occ = parseInt(tag.occ) + 1;
			db.tags.update(
				{'_id': tag._id},
				{ $set: {'occ': occ} }
			);
		}
		else {
			db.tags.insert({
				'tag': result.tags[x].toLowerCase(),
				'occ': 0
			});
		}
	}
});