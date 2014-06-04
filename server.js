var express = require("express");
var app = express();
var databaseUrl = "robertsv_lv";
var collections = [ "requests" ]
var db = require("mongojs").connect(databaseUrl, collections);

var auth = require("basic-auth-old")({
	name : "Admin",
	accounts : [ "XXX:XXX" ]
}).auth;

function start() {

	app.all("*", function(req, res, next) {
		if(req.url.indexOf('requests.json') == -1) {
			db.requests.save({
				datetime : new Date(),
				url : req.url,
				remoteaddress : req.connection.remoteAddress,
				remoteport : req.connection.remotePort,
				useragent : req.headers["user-agent"]

			}, function(err, saved) {

			});
		}
		next();
	});

	app.get("/", function(req, res) {
		res.sendfile("index.html")
	});

	app.get("/index.html", function(req, res) {
		res.sendfile("index.html")
	});

	app.get("/admin.html", auth, function(req, res) {
		res.sendfile("admin.html")
	});

	app.get("/robots.txt", function(req, res) {
		res.sendfile("robots.txt")
	});

	app.get("/requests.json", auth, function(req, res) {
		var allRequests = "[]";
		var page = req.query.page;
		var pageSize = 15;
		req.method="NONE"; // TODO (RV): hack 
		db.requests.find().skip(page * pageSize).limit(pageSize).toArray(function(err, items) {
			res.status(200).json(items);
		});
	});

	app.get('*', function(req, res, next) {
		var err = new Error();
		err.status = 404;
		next(err);
	});

	app.use(function(err, req, res, next) {
		if (err.status !== 404) {
			return next();
		}
		res.send("Well ...");
	});

	app.listen(8888, function() {
		console.log("Listening...");
	});

}

exports.start = start;
