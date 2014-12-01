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
```sh
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

Rozmiar kolekcji:
```js
db.trains.stats(1024 * 1024)
...
size: 7365
...
```

Postgres: usunięcie headerline, stworzenie tabeli, import z pliku
```sh
sed '1d' Train_ready.csv > Train_ready_psql.csv

psql
\timing
Timing is on.

CREATE TABLE trains(
	ID INT PRIMARY KEY NOT NULL,
	TITLE TEXT NOT NULL,
	BODY TEXT NOT NULL,
	TAGS TEXT NOT NULL
);
CREATE TABLE

COPY trains FROM '/home/username/Train_ready_psql.csv' DELIMITER ',' CSV;
COPY 6034195
Time: 366697,883 ms ~ 6,1 minut
```
Średnio 16455 rekordów na sekundę

Rozmiar tabeli:
```sh
SELECT pg_size_pretty( pg_relation_size('trains') );
5222 MB
```

Porównanie:<br>
| Baza danych                                | Czas importu | Szybkość  | Rozmiar danych |
|--------------------------------------------|--------------|-----------|----------------|
| PostgreSQL 9.3                             | 6m 11.163s   | 16455 r/s | 5222 MB        |
| Mongo 2.4.9                                | 3m 20.245s   | 30134 r/s | 7365 MB        |
| Mongo 2.8.0 rc                             | 4m 12.240s   | 23922 r/s | 10183 MB       |
| Mongo 2.8.0 rc WiredTiger bez kompresji    | 4m 6.960s    | 24434 r/s | 7037 MB        |
| Mongo 2.8.0 rc WiredTiger kompresja snappy | 3m 55.608s   | 25611 r/s | 2889 MB        |
| Mongo 2.8.0 rc WiredTiger kompresja zlib   | 3m 55.924s   | 25577 r/s | 2185 MB        |

![alt text](https://raw.githubusercontent.com/psynowczyk/tnosql/master/sc1.png "")

#Zadanie 1b

```js
db.trains.count();
6034195
```
```sh
SELECT COUNT (*) FROM trains;
6034195
```

#Zadanie 1c

Zamianę stringu zawierającego tagi na tablicę łańcuchów dokonałem za pomocą [skryptu](https://github.com/psynowczyk/tnosql/blob/master/tags_to_array.js).
```sh
$ time mongo tags_to_array.js
Documents modified: 6032934

real    6m 31.324s
user    2m 31.634s
sys     0m 18.248s
```
Średnio 15417 rekordów na sekundę

Przykładowy zmodyfikowany dokument:
```js
db.trains.findOne();
{
	"_id" : 4827307,
	"body" : "I have two machines, both running Ubuntu. Both the machines are on a local network. I am behind a proxy server and am required to login for accessing internet. This means I can't access Internet on both machines simultaneously. What I want to do, is to be able to login on one machine and then route all my internet requests on other machine to the logged-in machine. I have administrator priviliges on both the machines. SSH tunneling does not seem to be doing the job even though every artice on the net is suggesting it.",
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
```js
db.trains.distinct("tags").length;
42060
```

#Zadanie 1d

Do tego zadania użyłem współrzędnych geograficznych stacji paliw pobranych z serwisu poipoint.pl w formacie csv.
```sh
time mongoimport -d Trains -c fuel --type csv --file Stacje_Paliw.csv --headerline

connected to: 127.0.0.1
check 9 1433
imported 1432 objects

real    0m 0.043s
user    0m 0.019s
sys     0m 0.014s
```

Przykładowy dokument:
```js
db.fuel.findOne();
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
```sh
time mongo fix_fuel.js

real    0m 0.138s
user    0m 0,109s
sys     0m 0.026s
```

Przykładowy poprawiony dokument:
```js
db.fuel.findOne();
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
```js
db.fuel.ensureIndex({"loc": "2dsphere"});
```

### 1d.1

10 najbliższych stacji paliw w promieniu 20km od centrum Gdańska
```js
var gdansk = { "type": "Point", "coordinates": [18.65, 54.35] };
db.fuel.find({ loc: { $near: { $geometry: gdansk }, $maxDistance: 20000 } }).limit(50).toArray();
```

Przekształcenie do formatu geojson za pomocą [skryptu](https://github.com/psynowczyk/tnosql/blob/master/to_geojson.js)<br>
[Mapa](https://github.com/psynowczyk/tnosql/blob/master/1d1_result.geojson)

### 1d.2

Stacje paliw w promieniu 0.8° od Olsztyna
```js
var olsztyn = { "type": "Point", "coordinates": [20.48, 53.78] };
db.fuel.find({
	loc: {
		$geoWithin: {
			$center: [[olsztyn.coordinates[0], olsztyn.coordinates[1]], 0.80]
		}
	}
}).limit(50).toArray();
```
[Mapa](https://github.com/psynowczyk/tnosql/blob/master/1d2_result.geojson)

### 1d.3

100 stacji paliw na obszarze pomiędzy Gdańskiem, Olsztynem i Poznaniem.
```js
db.fuel.find({
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
```
[Mapa](https://github.com/psynowczyk/tnosql/blob/master/1d3_result.geojson)

### 1d.4

Stacje paliw na linii Warszawa-Gdańsk
```js
var line = {
	"type": "LineString",
	"coordinates": [[20.904929, 52.239413], [19.424150, 54.374859]]
}
db.fuel.find({
	loc: {
		$geoIntersects: {
			$geometry: line
		}
	}
}).limit(100).toArray();
```
[Mapa](https://github.com/psynowczyk/tnosql/blob/master/1d4_result.geojson)