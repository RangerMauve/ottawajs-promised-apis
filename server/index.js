var express = require("express");
var Promise = require("promise");
var getParams = require("get-parameter-names");
var app = express();
var api = require("./api");
var port = process.env.PORT || 21337;

app.use(require("body-parser")({
	extended: false
}));

app.get("/thread/list", bind_api(api.threads.list));
app.get("/thread/list/:page", bind_api(api.threads.list));
app.get("/thread/:id", bind_api(api.threads.read));
app.get("/thread/:id/full", bind_api(api.threads.read.full));
app.post("/thread", bind_api(api.threads.create));tee
app.delete("/thread/:id", bind_api(api.threads.delete));

app.get("/thread/:thread/comments", bind_api(api.comments.list));
app.get("/thread/:thread/comments/:page", bind_api(api.comments.list));
app.get("/comment/:id", bind_api(api.comments.read));
app.post("/thread/:thread/comments", bind_api(api.comments.create));
app.put("/comment/:id", bind_api(api.comments.update));
app.delete("/comment/:id", bind_api(api.comments.delete));

app.use(function(err, req, res, next) {
	var status = err.code || 500;
	var message = "Server Error";
	if (err.code) {
		message = err.message;
		res.status(err.code);
	}
	res.status(status).json({
		message: message
	});
})

app.use(function(req, res, next) {
	res.status(404).json({
		message: "Not Found"
	});
});

console.log("Starting server on port", port);
app.listen(port);

function fetch_args(req, names) {
	return Promise.resolve(names.map(function(name) {
		return req.param(name);
	}));
}

function bind_api(fn) {
	var names = getParams(fn);
	return function(req, res, next) {
		var args = fetch_args(req, names);
		fetch_args(req, names)
			.then(fn.apply.bind(fn, null))
			.then(function(result) {
				res.status(200).json(result);
			})
			.catch(next);
	}
}
