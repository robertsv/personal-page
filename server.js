var http = require("http");
var url = require("url");
var fs = require('fs');
var indexFile;
var robotFile;

var databaseUrl = "robertsv_lv";
var collections = [ "requests" ]
var db = require("mongojs").connect(databaseUrl, collections);

function start() {

	fs.readFile('./index.html', function(err, data) {
		if (err) {
			throw err;
		}
		indexFile = data;
	});

	fs.readFile('./robots.txt', function(err, data) {
		if (err) {
			throw err;
		}
		robotFile = data;
	});

	function onRequest(request, response) {
		db.requests.save({
			datetime : new Date(),
			url : request.url,
			remoteaddress : request.connection.remoteAddress,
			remoteport : request.connection.remotePort,
			useragent : request.headers['user-agent']
			
		}, function(err, saved) {
			/*
			if (err || !saved) {
				console.log("Request url is not saved");
			} else {
				console.log("Request url is saved");
			}
			*/
		});
		
		var path = url.parse(request.url).pathname;
		if (path == "/" || path == "/index.html") {
			response.writeHead(200, {
				"Content-Type" : "text/html;charset=utf-8"
			});
			response.write(indexFile);
			response.end();
		} else if (path == "/robots.txt") {
			response.writeHead(200, {
				"Content-Type" : "text/html;charset=utf-8"
			});
			response.write(robotFile);
			response.end();
		} else {
			response.writeHead(404, {
				"Content-Type" : "text/html;charset=utf-8"
			});
			response.write("Well ... it seems that there is nothing ...");
			response.end();
		}

	}

	http.createServer(onRequest).listen(8080);
	console.log("Server has started.");
}

exports.start = start;
