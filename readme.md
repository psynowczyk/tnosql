# Spis treści
- [Dane techniczne](#Dane techniczne)
- [Zadanie 1a](#Zadanie 1a)

# Dane techniczne
**CPU**: Intel® Core™ i7-4510U (2.0 GHz, 3.1 GHz Turbo, 4 MB Cache)<br>
**RAM**: 8 GB DDR3 (1600 MHz)<br>
**HDD**: 240 GB SSD SanDisk Ultra II<br>
**OS**: Linux Mint 17 64-bit

# Zadanie 1a

Poprawny import pliku Train.csv wymaga usunięcia znaków nowej linii. Użyłem do tego [skryptu](https://github.com/nosql/aggregations-2/blob/master/scripts/wbzyl/2unix.sh) udostępnionego w repozytorium prowadzącego.
```
time ./2unix.sh Train.csv Train_ready.csv

real    3m 4.903s
user    0m 28.353s
sys     0m 54.266s

time mongoimport -d Trains -c trains --type csv --file Train_ready.csv --headerline

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


# Zadanie 1b

```
db.trains.count()
6034195
```