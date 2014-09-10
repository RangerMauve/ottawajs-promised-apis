title: Promise Based APIs
author:
  name: Georgiy S.
  twitter: LoneMauve
  url: https://github.com/RangerMauve
output: index.html
controls: true
output: index.html
style: style.css

--

#Promised APIs
## Turning your server's HTTP API into a clean Promise-based library.

--

### AJAX Spaghetti

Performing multiple requests can be messy

``` javascript
$("#my_button").click(function(){
	$.post("foo/bar",
	{
		hello: "Is it me you're looking for?"
	},
	success: function(data){
		$("body").load("/foo/bar/"+data.id,function(){
			if(status === "error")
				$("#error_thing").text("Error loading!");
		})
	}
	error: function(xhr,status,error){
		$("#error_thing").text("Error posting!");
	});
});
```

--

### Some problems

 * Requests strewn throughout code
 * If a URL changes, all instances need to be found and changed
 * Less DRY because request code is repeated `$.post("foo/bar/",function(data,status){/* etc*/})`
 * Error handling can be tricky

--

### What are some alternatives?

 * Use client side models
 * Let X framework handle all data
 * **Create your own abstraction over the HTTP api**

--

### Advantages in-house abstraction

 * More control over the code
 * Can re-use regardless of framework
 * Fancy

--

### Why promises?

 * Handle both synchronous and asynchronous flow
 * Part of ES6 standard and supported natively
 * Allow for a more functional approach
 * Chaining allows you to handle errors in one place

--
### Promise states

Promises can be fulfilled or rejected. The flow goes through 3 states.

_Pending_: Value not yet available, can transition

_Fulfilled_: Promise was successful and now has a value

_Rejected_: An error occurred and the promise now has an error value

--

### API

`new Promise(function(fulfill,reject))`

`Promise.all([Promise])`
	Construct a new promise

`Promise.reject(value)`
	Create a rejected promise

`Promise.resolve(value)`
	Create a fulfilled promise

`promise.then([success],[error])`
	Continue the chain

`promie.catch()`
	Catch any errors that occurred

---

### Example

All functions in the chain get put within try-catch blocks so every error is caught

``` javascript
document.querySelector("#my_button").addEventListener("click",function(){
	xhr.post("/foo/bar")
		.then(fetch_prop("id"))
		.then(load_foo)
		.catch(function(err){
			alert("An error occured!");
		});
})

function load_foo(id){
	return xhr.get("/foo/bar/"+id).then(function(page){
		document.body.innerHTML = page;
	});
}

function fetch_prop(name){
	return function (object) {
		return object[name];
	}
}
```

---

### How will this work with your API?

 * API functions will return a promise
 * Requests can be chained together with other functions
 * Interaction with HTTP will be wrapped by a Promise
 * Data endpoints will be represented as `api.resource.action`

---

### Example application

A SPA with CRUD, Create-Read-Update-Delete, operations.
Have a list of threads and allow for comments on the threads.
Call it CRUD Chat.

---

### Define your resources and actions

* Threads
	* Can be created, read, and removed
* Comments
	* Belong to Threads
	* Can be read along with thread data
	* Can be read page by page
	* Can be edited by users
	* Can be removed

---

### API - Threads

|Client | Server|
|---------------|
|threads.list (page,limit) | GET /thread/list {page,limit}|
|threads.read (id) | GET /thread/:id|
|threads.create (user,title,content) | POST /thread {user,title,content}|
|threads.delete (id) | DELETE /thread/:id|

---

### API - Comments

| Client | Server |
|-----------------|
|comments.list (thread,page,limit) | GET /thread/:thread/comments/:page {limit}|
|comments.create (thread,user,content) | POST /thread/:thread/comments {user,conten}|
|comments.update (id,content) | PUT /comment/:id {content}|
|comments.delete (id) | DELETE /comment/:id|

---

### Wrapping over Superagent for HTTP

``` javascript
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

var u = ["get", "post", "put", "del"].reduce(function(res, verb) {
	res[verb] = request.bind(null, verb);
	return res;
}, {});
```

---

### Create API object

``` javascript
// Wrap in Closure
api = {};
var threads = {};
var comments = {};
api.threads = {};
api.comments = {};

threads.list = function(page, limit) {
	return u.get("thread/list", {
		page: page,
		limit: limit
	});
}

// ETC

comments.create = function(thread, user, content) {
	return u.post("/thread/" + thread + "/comments", {
		user: user,
		content: content
	});
}

retrun api;
```

---

### Use it

``` javascript
events = new EventEmitter();

api.threads.list(0,10)
	.then(pass_through(render_threads))
	.then(bind_thread_listeners);
	.catch(alert);

function view_thread(id){
	api.threads.read(id)
		.then(render_thread)
		.catch(alert);
}

function pass_through(fn){
	return function(data){
		return Promise.resolve(data)
			.then(fn)
			.then(function(){
				return data;
			});
	}
}
```

---

### Result

<iframe src="/files/client"></iframe>
