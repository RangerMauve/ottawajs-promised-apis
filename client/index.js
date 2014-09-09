console.log("Hello World");

api.host = "http://localhost:21337"

var app = {
	user: "Anon",
	new_thread_title: "",
	new_thread_content: "",
	new_comment: "",
	thread: {},
	threads: [],
	page: 0,
	view: "list"
}

app.create_thread = function(e) {
	if (e && e.preventDefault) e.preventDefault();
	var user = app.user;
	var title = app.new_thread_title;
	var content = app.new_thread_content;
	api.threads.create(user, title, content)
		.then(fetch("_id"))
		.then(app.load_thread)
		.catch(alert_error);
}

app.delete_thread = function(e) {
	if (e && e.preventDefault) e.preventDefault();
	var id = this.dataset.id;
	api.threads.delete(id).then(app.view_list).catch(alert_error);
}

app.create_comment = function(e) {
	if (e && e.preventDefault) e.preventDefault();
	var user = app.user;
	var thread = app.thread._id;
	var content = app.new_comment;
	api.comments.create(thread, user, content).then(app.load_comments).catch(alert_error);
}

app.delete_comment = function(e) {
	if (e && e.preventDefault) e.preventDefault();
	var id = this.dataset.id;
	api.comments.delete(id).then(app.load_comments).catch(alert_error);
}

app.load_threads = function(e) {
	if (e && e.preventDefault) e.preventDefault();
	var page = app.page;
	return api.threads.list(page).then(function(threads) {
		app.threads = threads;
	});
}

app.load_comments = function() {
	var page = app.page;
	var thread = app.thread._id;
	return api.comments.list(thread, page).then(function(comments) {
		app.thread.comments = comments;
	});
}


app.load_thread = function(id) {
	if (this && this.dataset) {
		id = this.dataset.id || id;
	}
	return api.threads.read.full(id).then(function(thread) {
		app.thread = thread;
		app.view_thread();
		return thread
	});
}

app.view_create = function(e) {
	if (e && e.preventDefault) e.preventDefault();
	app.view = "create";
}

app.view_list = function(e) {
	if (e && e.preventDefault) e.preventDefault();
	app.view = "list";
	app.load_threads().catch(alert_error);
}

app.view_thread = function(e) {
	if (e && e.preventDefault) e.preventDefault();
	app.view = "thread";
}

rivets.formatters.is = function(value, arg) {
	return ("" + value) === arg;
}

rivets.bind(document.body, app);

app.load_threads();

function alert_error(e) {
	console.log(e);
	if (e.response)
		alert(e.response.message);
	else alert(e.message);
}

function fetch(key) {
	return function(object) {
		console.log("Getting", key, "from", object);
		return object[key];
	}
}
