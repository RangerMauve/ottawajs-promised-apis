var Promise = require("promise");
var db = require("./db");
var Comments = db.Comments;
var Threads = db.Threads;

var threads_per_page = 10;
var comments_per_page = 20;

var threads = {};
var comments = {};

exports.threads = threads;
exports.comments = comments;

threads.list = function(page, limit) {
	page = (page || 0) * threads_per_page;
	limit = limit || threads_per_page;
	return new Promise(function(resolve, reject) {
		Threads.find({}, {
			_id: true,
			user: true,
			title: true,
			updated_at: true
		}).sort({
			updated_at: -1
		}).skip(page).limit(limit).toArray(function(err, threads) {
			if (err) reject(err);
			else resolve(threads);
		});
	})
}

threads.read = function(id) {
	return new Promise(function(resolve, reject) {
		Threads.findOne({
			_id: id
		}, {
			_id: true,
			user: true,
			title: true,
			content: true,
			updated_at: true
		}, function(err, thread) {
			if (err) reject(err);
			else resolve(thread);
		})
	})
}

threads.read.full = function(id) {
	return Promise.all([threads.read(id), comments.read.list(id)]).then(function(results) {
		results[0].comments = results[1];
		return results;
	});
}

threads.create = function(user, title, content) {
	return new Promise(function(resolve, reject) {
		Threads.insert({
			user: user,
			title: title,
			content: content,
			updated_at: new Date()
		}, function(err, result) {
			if (err) reject(err);
			else resolve(result);
		})
	})
}

threads.delete = function(id) {
	return new Promise(function(resolve, reject) {
		Threads.remove({
			_id: id
		}, function(err) {
			if (err) reject(err);
			else resolve(true);
		})
	})
}

comments.list = function(thread, page, limit) {
	page = (page || 0) * comments_per_page;
	limit = limit || comments_per_page;
	return new Promise(function(resolve, reject) {
		Comments.find({
			thread: thread
		}, {
			user: true,
			title: true,
			updated_at: true,
			_id: true
		}).sort({
			updated_at: -1
		}).skip(page).limit(limit).toArray(function(err, comments) {
			if (err) reject(err);
			else resolve(comments);
		})
	})
}

comments.read = function(id) {
	return new Promise(function(resolve, reject) {
		Comments.findOne({
			_id: id
		}, {
			user: true,
			thread: true,
			content: true,
			updated_at: true,
		}, function(err, comment) {
			if (err) reject(err);
			else resolve(comment);
		})
	})
}

comments.create = function(thread, user, content) {
	return new Promise(function(resolve, reject) {
		Comments.insert({
			thread: thread,
			user: user,
			content: content,
			updated_at: new Date()
		}, function(err, comment) {
			if (err) reject(err);
			else resolve(comment);
		})
	})
}

comments.update = function(id, content) {
	return new Promise(function(resolve, reject) {
		Comments.update({
			_id: id
		}, {
			content: content,
			updated_at: new Date()
		}, function(err, updated) {
			if (err) reject(err);
			if (!updated) reject(new Error(id + " Not Found!"));
			else resolve(updated);
		})
	})
}

comments.delete = function(id) {
	return new Promise(function(resolve, reject) {
		Comments.remove({
			_id: id
		}, function(err) {
			if (err) reject(err);
			else resolve(true);
		})
	})
}

comments.delete.from = function(thread) {
	return new Promise(function(resolve, reject) {
		Comments.remove({
			thread: thread
		}, function(err, removed) {
			if (err) reject(err);
			else resolve(removed);
		})
	})
}
