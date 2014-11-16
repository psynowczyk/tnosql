var connection = new Mongo();
var db = connection.getDB('Trains');
var trains = db.trains.find();
var counter = 0;

trains.forEach(function (result) {
	if (typeof result.tags === 'string') {
		var TagsArray = result.tags.split(' ');
		counter++;
		db.trains.update(
			{_id: result._id},
			{
				$set: {
					tags: TagsArray
				}
			}
		);
	}
});
print("Documents modified: " + counter);
