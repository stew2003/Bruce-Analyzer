//begin boilerplate
var express = require('express');
var anyDB = require('any-db');
var bodyParser = require("body-parser");
var stemmer = require('porter-stemmer').stemmer;
var conn = anyDB.createConnection('sqlite3://bruce.db');
var mustache = require('mustache-express');
var app = express();
var server = require('http').createServer(app);

app.engine('html', mustache());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('views'));
//end boilerplate

function compare (a, b){
	return Object.values(a) - Object.values(b);
}

function searchLyrics(keyword, type, response){
	var obj = {}
	obj.numberOfUses = 0;
	obj.years = {}
	obj.album = {}
	obj.songs = []
	conn.query('SELECT * FROM springsteen', function(err, data){
		for(var i = 0; i<data.rows.length; i++){
			var thisAlbum = data.rows[i].album;
			var thisName = data.rows[i].name;
			var aYear = data.rows[i].year.toString();
			var lyrics = data.rows[i].analyzeLyrics.split(' ');
			if (obj.album[thisAlbum] == undefined){
				obj.album[thisAlbum] = 0;
			}
			if (obj.years[aYear] == undefined){
				obj.years[aYear] = 0;
			}
			obj.songs[i] = {[thisName]: 0};
			for(var j = 0; j<lyrics.length; j++){
				for (var z = 0; z<keyword.split(" ").length; z++){
					if (type == "Specific"){
						if (lyrics[j + z] != keyword.split(" ")[z]){
							break
						}
					}
					else if (type == "General"){
						var word = keyword.split(" ")[z];
						if (stemmer(lyrics[j + z])!=stemmer(word)){
							break
						}
					}
					if (z == keyword.split(" ").length - 1){
						obj.album[thisAlbum] += 1;
						obj.songs[i][thisName] += 1;
						obj.years[aYear] += 1;
					}
				}
			}
		}
		obj.songs.sort(compare).reverse();
		response.send(obj);
	});
}

function searchSongs(keyword, response){
	conn.query("SELECT fullLyrics FROM springsteen WHERE UPPER(name) = UPPER(?); ", [keyword], function(err, data){
		if (err) throw err;
		if (data.rows.length == 0){
			response.send({error: "The song \""+keyword+"\" does not exist"});
		}
		else{
			response.send({song: data.rows[0].fullLyrics});
		}
	})
}

function topWords(response){
	conn.query("SELECT * FROM words;", function(err, data){
		if (err) throw err;
		words = {top: data.rows}
		response.render("words.html", words);
	});
}

app.get('/home', function(request, response){
	response.render('home.html');
});

app.get('/words', function(request, response){
	topWords(response);
});

app.get('/instructions', function(request, response){
	response.render('instructions.html');
});

app.post('/search', function(request, response){
	if (request.body.type == "Song"){
		searchSongs(request.body.keyword, response);
	}
	else{
		searchLyrics(request.body.keyword.toLowerCase().replace(',',""), request.body.type, response);
	}
});

//redirect any unknown endpoints to /home
app.get('*', function(request, response){
	response.redirect('/home')
});

server.listen(8080, function() {
	console.log("Bruce Analyzer website listening on localhost:8080");
});
