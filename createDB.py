from PyLyrics import *
import sqlite3
import csv
import string
import sys

uid = 1

conn = sqlite3.connect('bruce.db')
c = conn.cursor()

c.execute("DROP TABLE IF EXISTS springsteen;")
c.execute("DROP TABLE IF EXISTS words;")
c.execute("CREATE TABLE springsteen (uid INTEGER AUTO INCREMENT, album TEXT, year TEXT, name TEXT, analyzeLyrics TEXT, fullLyrics TEXT);")
c.execute("CREATE TABLE words (uid INTEGER AUTO INCREMENT, word TEXT, amountUsed INT);")
conn.commit()
def sortDict(dictionary): #returns list of tuples
	sortedDict = [];
	sortedKeys = sorted(dictionary, key=dictionary.get, reverse=True)
	for key in sortedKeys:
		sortedDict.append((key, dictionary[key]));
	return sortedDict



def listOfAllWords():
	c.execute("SELECT analyzeLyrics FROM springsteen;")
	listOfLyrics = c.fetchall()
	completeList = {}
	for song in listOfLyrics:
		song = str(song)[2:-3].split(' ')
		for word in song:
			if (word not in completeList):
				completeList[word] = 1
			else:
				completeList[word] += 1
	completeList = sortDict(completeList)
	return completeList

def albumsInCSV():
	global uid
	with open('springsteen.csv', newline='') as csvfile:
		songs = csv.reader(csvfile)
		for row in songs:
			name = row[2]
			album = row[0]
			year = row[1]
			lyrics = PyLyrics.getLyrics('Bruce Springsteen', name)
			analyzeLyrics = ' '.join(lyrics.splitlines()).lower().replace('(', '').replace(')', '').replace('.', '').replace(',', '').replace("\"", '').replace('!', '').replace('?', '').replace("  ", ' ')
			fullLyrics = lyrics
			c.execute("INSERT INTO springsteen (uid, album, year, name, analyzeLyrics, fullLyrics) VALUES (?,?,?,?,?,?)", [uid, album, year, name, analyzeLyrics, fullLyrics])
			print(uid)
			conn.commit()
			uid += 1

def albumsNotInCSV():
	global uid
	allAlbums = PyLyrics.getAlbums(singer='Bruce Springsteen')
	albumsNotInCSV = [allAlbums[15], allAlbums[16], allAlbums[17], allAlbums[28], allAlbums[31]]
	for currentAlbum in albumsNotInCSV:
		songs = PyLyrics.getTracks(currentAlbum)
		for song in songs:
			name = song.__repr__().decode()
			album = currentAlbum.name
			fullLyrics = song.getLyrics()
			analyzeLyrics = ' '.join(fullLyrics.splitlines()).lower().replace('(', '').replace(')', '').replace('.', '').replace(',', '').replace("\"", '').replace('!', '').replace('?', '').replace("  ", ' ')
			year = currentAlbum.year[1:-1]
			c.execute("INSERT INTO springsteen (uid, album, year, name, analyzeLyrics, fullLyrics) VALUES (?,?,?,?,?,?)", [uid, album, year, name, analyzeLyrics, fullLyrics])
			print(uid)
			conn.commit()
			uid += 1

#change name of duplicate songs
def findDuplicates():
	c.execute("SELECT name, count(*) FROM springsteen GROUP BY name HAVING count(*) > 1;")
	duplicates = c.fetchall()
	for duplicate in duplicates:
		c.execute("SELECT * FROM springsteen WHERE name = ?;", [duplicate[0]])
		individual = c.fetchall()
		for song in individual:
			newName = song[3] + " (" + song[1] + " version)"
			c.execute("UPDATE springsteen SET name = ? WHERE uid = ?;", [newName, song[0]])
			conn.commit()

#add the most used words to the database
def putWordsInDB():
	uid = 1
	for words in listOfAllWords():
		c.execute("INSERT INTO words VALUES (?,?,?)", [uid, words[0], words[1]])
		conn.commit()
		uid += 1


#do the stuff
albumsInCSV()
albumsNotInCSV()
findDuplicates()
putWordsInDB()



