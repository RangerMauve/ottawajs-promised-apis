var Db = require("tingodb")().Db;
var path = require("path");

var db = new Db(__dirname, {});

var Comments = db.collection("comments");
var Threads = db.collection("threads");

module.exports.Comments = Comments;
module.exports.Threads = Threads;
