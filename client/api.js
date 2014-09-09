var api = (function() {
	var api = {};
	var threads = {};
	var comments = {};
	var u = ["get", "post", "put", "del"].reduce(function(res, verb) {
		res[verb] = request.bind(null, verb);
		return res;
	}, {});
	api.threads = threads;
	api.comments = comments;
	api.host = "";

	threads.list = function(page, limit) {
		return u.get("thread/list", {
			page: page,
			limit: limit
		});
	}
	threads.read = function(id) {
		return u.get("/thread/" + id);
	}
	threads.read.full = function(id) {
		return u.get("/thread/" + id + "/full");
	}
	threads.create = function(user, title, content) {
		return u.post("/thread", {
			user: user,
			title: title,
			content: content
		});
	}
	threads.delete = function(id) {
		return u.del("/thread/" + id);
	}

	comments.list = function(thread, page, limit) {
		return u.get("/thread/" + thread + "/comments/" + (page || 0), {
			limit: limit
		});
	}

	comments.read = function(id) {
		return u.get("/comment/" + id);
	}

	comments.create = function(thread, user, content) {
		return u.post("/thread/" + thread + "/comments", {
			user: user,
			content: content
		});
	}

	comments.update = function(id, content) {
		return u.put("/comment/" + id, {
			content: content
		});
	}

	comments.delete = function(id) {
		return u.del("/comment/" + id);
	}

	function request(verb, path, data) {
		if (path[0] !== "/") path = ("/" + path);
		if (!data) data = {};
		return new Promise(function(resolve, reject) {
			superagent[verb](api.host + path).send(data).end(function(res) {
				if (res.error) reject(res.body);
				else resolve(res.body);
			});
		});
	}
	return api;
})()
