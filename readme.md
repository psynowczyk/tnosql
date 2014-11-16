#Spis treści
- [Dane techniczne](#dane-techniczne)
- [Zadanie 1a](#zadanie-1a)
- [Zadanie 1b](#zadanie-1b)
- [Zadanie 1c](#zadanie-1c)
- [Zadanie 1d](#zadanie-1d)

#Dane techniczne
**CPU**: Intel® Core™ i7-4510U (2.0 GHz, 3.1 GHz Turbo, 4 MB Cache)<br>
**RAM**: 8 GB DDR3 (1600 MHz)<br>
**HDD**: 240 GB SSD SanDisk Ultra II<br>
**OS**: Linux Mint 17 64-bit

#Zadanie 1a

Poprawny import pliku Train.csv wymaga usunięcia znaków nowej linii. Użyłem do tego [skryptu](https://github.com/nosql/aggregations-2/blob/master/scripts/wbzyl/2unix.sh) z repozytorium prowadzącego.
```
$ time ./2unix.sh Train.csv Train_ready.csv

real    3m 4.903s
user    0m 28.353s
sys     0m 54.266s

$ time mongoimport -d Trains -c trains --type csv --file Train_ready.csv --headerline

connected to: 127.0.0.1
Progress...
check 9 6034196
imported 6034195 objects

real    3m 20.245s
user    1m 4.368s
sys     0m 6.343s
```
Średnio 30134 rekordów na sekundę

![alt text](https://raw.githubusercontent.com/psynowczyk/tnosql/master/sc1.png "")

#Zadanie 1b

```
> db.trains.count()
6034195
```

#Zadanie 1c

Zamianę stringu zawierającego tagi na tablicę łańcuchów dokonałem za pomocą [skryptu](https://github.com/psynowczyk/tnosql/blob/master/tags_to_array.js).
```
$ time mongo tags_to_array.js
Documents modified: 6032934

real    6m 31.324s
user    2m 31.634s
sys     0m 18.248s
```
Średnio 15417 rekordów na sekundę

Przykładowy zmodyfikowany dokument:
```
> db.trains.findOne()
{
	"_id" : 4827307,
	"body" : "<blockquote>   <p><strong>Possible Duplicate:</strong><br>   <a href=\"http://superuser.com/questions/282891/how-to-share-internet-connection-in-ubuntu\">How to share Internet Connection in Ubuntu</a>  </p> </blockquote>    <p>I have two machines, both running Ubuntu. Both the machines are on a local network. I am behind a proxy server and am required to login for accessing internet. This means I can't access Internet on both machines simultaneously. What I want to do, is to be able to login on one machine and then route all my internet requests on other machine to the logged-in machine. I have administrator priviliges on both the machines. SSH tunneling does not seem to be doing the job even though every artice on the net is suggesting it. </p> ",
	"tags" : [
		"ubuntu",
		"internet-connection",
		"socks-proxy",
		"ssh-tunnel"
	],
	"title" : "Access internet through another machine"
}

```

![alt text](https://raw.githubusercontent.com/psynowczyk/tnosql/master/sc2.png "")

Zliczanie wszystkich tagów za pomocą [skryptu](https://github.com/psynowczyk/tnosql/blob/master/all_tags.js):
```
$ time mongo all_tags.js
All tags: 17408733

real    3m 44.720s
user    0m 40.694s
sys     0m 2.623s
```

Zliczanie unikalnych tagów:
```
> db.trains.distinct("tags").length
42060
```

#Zadanie 1d

Do tego zadania użyłem współrzędnych geograficznych stacji paliw pobranych z serwisu poipoint.pl w formacie csv.
```
time mongoimport -d Trains -c fuel --type csv --file Stacje_Paliw.csv --headerline

connected to: 127.0.0.1
check 9 1433
imported 1432 objects

real    0m 0.043s
user    0m 0.019s
sys     0m 0.014s
```

Przykładowy dokument:
```
> db.fuel.findOne()
{
	"_id" : ObjectId("5468c9bec5e4ff939974a6c4"),
	"coo1" : 20.154418,
	"coo2" : 50.220851,
	"type" : "Stacje Paliw",
	"city" : "Niegardów",
	"address" : 775
}
```

Do poprawienia formatu danych wykorzystałem [skrypt](https://github.com/psynowczyk/tnosql/blob/master/fix_fuel.js)
```
time mongo fix_fuel.js

real    0m 0.138s
user    0m 0,109s
sys     0m 0.026s
```

Przykładowy poprawiony dokument:
```
> db.fuel.findOne()
{
	"_id" : ObjectId("5468cadcc5e4ff939974b1b5"),
	"city" : "Velence",
	"loc" : {
		"type" : "Point",
		"coordinates" : [
			18.637587,
			47.244133
		]
	}
}
>
```

 Dodajemy geo-indeks do kolekcji:
 ```
> db.fuel.ensureIndex({"loc": "2dsphere"})
 ```

 ###1d.1

 10 najbliższych stacji paliw w promieniu 20km od centrum Gdańska
 ```
> var gdansk = { "type": "Point", "coordinates": [18.65, 54.35] }
> db.fuel.find({ loc: { $near: { $geometry: gdansk }, $maxDistance: 20000 } }).limit(10).toArray()
[
	{
		"_id" : ObjectId("5468cadcc5e4ff939974acf3"),
		"city" : "Gdańsk",
		"loc" : {
			"type" : "Point",
			"coordinates" : [
				18.59567,
				54.3509
			]
		}
	},
	{
		"_id" : ObjectId("5468cadcc5e4ff939974ad4c"),
		"city" : "Gdańsk",
		"loc" : {
			"type" : "Point",
			"coordinates" : [
				18.71147,
				54.3506
			]
		}
	},
	{
		"_id" : ObjectId("5468cadcc5e4ff939974ae4f"),
		"city" : "Gdańsk",
		"loc" : {
			"type" : "Point",
			"coordinates" : [
				18.65841,
				54.391505
			]
		}
	},
	{
		"_id" : ObjectId("5468cadcc5e4ff939974b05e"),
		"city" : "Gdańsk",
		"loc" : {
			"type" : "Point",
			"coordinates" : [
				18.571749,
				54.337487
			]
		}
	},
	{
		"_id" : ObjectId("5468cadcc5e4ff939974ad8f"),
		"city" : "Gdańsk",
		"loc" : {
			"type" : "Point",
			"coordinates" : [
				18.619926,
				54.394374
			]
		}
	},
	{
		"_id" : ObjectId("5468cadcc5e4ff939974ad95"),
		"city" : "Gdańsk",
		"loc" : {
			"type" : "Point",
			"coordinates" : [
				18.621572,
				54.397784
			]
		}
	},
	{
		"_id" : ObjectId("5468cadcc5e4ff939974ad1c"),
		"city" : "Gdańsk",
		"loc" : {
			"type" : "Point",
			"coordinates" : [
				18.59482,
				54.40933
			]
		}
	},
	{
		"_id" : ObjectId("5468cadcc5e4ff939974acf4"),
		"city" : "Gdańsk",
		"loc" : {
			"type" : "Point",
			"coordinates" : [
				18.52591,
				54.35009
			]
		}
	},
	{
		"_id" : ObjectId("5468cadcc5e4ff939974ace9"),
		"city" : "Kowale",
		"loc" : {
			"type" : "Point",
			"coordinates" : [
				18.546702,
				54.304205
			]
		}
	},
	{
		"_id" : ObjectId("5468cadcc5e4ff939974ad10"),
		"city" : "Straszyn",
		"loc" : {
			"type" : "Point",
			"coordinates" : [
				18.59435,
				54.27803
			]
		}
	}
]
 ```

 Przekształcenie do formatu geojson za pomocą [skryptu](https://github.com/psynowczyk/tnosql/blob/master/to_geojson.js)<br>
 Mapa: https://github.com/psynowczyk/tnosql/blob/master/1d1_result.geojson

 <script src="https://github.com/psynowczyk/tnosql/blob/master/1d1_result.geojson"></script>