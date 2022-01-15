const pug = require('pug');
const fs = require('fs');
const express = require('express');
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session);
let nextOrderID = 0;

let store = new MongoDBStore({
	uri: 'mongodb://localhost:27017/connect_mongodb_session_test',
	collection: 'mySessions'
});

//Set up routes
let app = express();
let mongo = require('mongodb');
let MongoClient = mongo.MongoClient;
let ObjectId = mongo.ObjectId;
let db;

app.set("view engine", "pug");
app.set("views", "public/views");

app.use(express.json());

app.use(session({ secret: 'some secret here', store: store}))
app.use(express.static("public"));
app.get("/", sendIndex);

app.get("/users", sendUsers);
app.post("/users", newUser);
app.get("/users/:ID", sendProfile);

app.get("/order", sendOrder);
app.post("/orders", newOrder);
app.get("/orders/:orderID", viewOrder);

app.get("/userid", getUser);
app.put("/settings", updateSettings);

app.get("/registration", sendRegistration);
app.get("/login", sendLogin);
app.post("/login", login);
app.post("/logout", logout);

/*
Sends the home page
*/
function sendIndex(req, res, next){
	res.render("home", {session: req.session});
	next()
}

/*
Sends the summary of an order
*/
function viewOrder(req, res, next){
	db.collection("users").find({orders: {"$exists" : true}}).toArray(function(err, result){
		if(err){
			res.status(500).send("Error reading database.");
			return;
		}
		
		if(result.length == 0){
			res.status(401).send("Unauthorized");
			return;
		} else {
			for(let i = 0; i < result.length; i++){
				if(Object.keys(result[i].orders).includes(req.params.orderID)){
					let gottenOrder = result[i].orders[req.params.orderID];
					
					if(result[i]._id.equals(req.session.user)){
						res.render("ordersummary", {user: result[i], order: gottenOrder, session: req.session});
						return;
					} else {
						//other user
						if(result[i].privacy == false){
							res.render("ordersummary", {user: result[i], order: gottenOrder, session: req.session});
							return;
						} else {
							res.status(403).send("Unauthorized");
							return;
						}
					}
				}
			}
			
			res.status(403).send("Unauthorized");
		}
	});
}

/*
Adds a new order to the logged in user
*/
function newOrder(req, res, next){
	if(req.session.loggedin){
		db.collection("users").find({_id: req.session.user}).toArray(function(err, result){
			if(err){
				res.status(500).send("Error reading database.");
				return;
			}
			
			let orders = {};
			if(result[0].orders == null){
				orders[nextOrderID] = req.body;
			} else {
				orders = result[0].orders;
				orders[nextOrderID] = req.body;
			}
			nextOrderID++;
			
			db.collection("users").updateOne({
				_id: req.session.user
			}, {
				$set: {
					orders: orders
				}
			})
			res.status(200).send("Order placed.")
		});
		
	} else {
		res.status(403).send("Unauthorized.")
	}
}

/*
Send a page with all the public users
*/
function sendUsers(req, res, next){
	db.collection("users").find({privacy: false}).toArray(function(err, result){
		if(err){
			res.status(500).send("Error reading database.");
			return;
		}
		
		if(req.query.name != null){
			result = result.filter(user => user.username.toLowerCase().includes(req.query.name));
		}
		
		res.status(200).render("users", {users: result, session: req.session});
	});
}

/*
Register a new user
*/
function newUser(req, res, next){
	if(req.session.loggedin){
		res.status(200).send("Already logged in.");
		return;
	}
	
	db.collection("users").find({username: req.body.name}).toArray(function(err, result){
		if(err){
			res.status(500).send("Error reading database.");
			return;
		}
		
		if(result.length > 0){
			res.statusCode = 201;
			res.send("That username already exists");
			return;
			
		} else {
			db.collection("users").insertOne({
				"username": req.body.name,
				"password": req.body.password,
				"privacy": false
				
			}, (err, objectInserted) => {
				req.session.loggedin = true;
				req.session.user = objectInserted.insertedId;
				res.statusCode = 201;
				res.json({id: objectInserted.insertedId});
				return;
			}) 
			
			
		}
	});
}

/*
Send the page to fill out an order
*/
function sendOrder(req, res, next){
	if(req.session.loggedin){
		res.render("orderform", {session: req.session});
	} else {
		res.status(403).send("Unauthorized.");
	}
}

/*
Get the id of the logged in user
*/
function getUser(req, res, next){
	if(req.session.loggedin){
		res.status(200).send({id: req.session.user});
	} else {
		res.status(404).send("Invalid user.")
	}
}

/*
Send a page with a profile matching the given id
*/
function sendProfile(req, res, next){
	if(!ObjectId.isValid(req.params.ID)){
		res.status(403).send("Unauthorized");
		return;
	}
	
	db.collection("users").find({_id: new ObjectId(req.params.ID)}).toArray(function(err, result){
		if(err){
			res.status(500).send("Error reading database.");
			return;
		}
		
		if(result.length == 0){
			res.status(401).send("Unauthorized");
			return;
		} else {
			if(result[0]._id.equals(req.session.user)){
				res.render("profile", {user: result[0], loggedUser: true, session: req.session});
			} else {
				//other user
				if(result[0].privacy == false){
					res.render("profile", {user: result[0], loggedUser: false, session: req.session});
				} else {
					res.status(403).send("Unauthorized");
				}
			}
		}
	});
}

/*
Sends a registration page
*/
function sendRegistration(req, res, next){
	res.render("registration", {session: req.session});
	next()
}

/*
Sends a login page
*/
function sendLogin(req, res, next){
	res.render("login", {session: req.session});
	next()
}

/*
Logs out the currently logged in user
*/
function logout(req, res, next){
	if(req.session.loggedin){
		req.session.loggedin = false;
		req.session.user = null;
		res.status(200).send("Logged out.");
	}else{
		res.status(200).send("You cannot log out because you aren't logged in.");
	}
}

/*
Logs in a user
*/
function login(req, res, next){
	if(req.session.loggedin){
		res.status(200).send("Already logged in.");
		return;
	}

	let username = req.body.username;
	let password = req.body.password;

	console.log("Logging in with credentials:");
	console.log("Username: " + username);
	console.log("Password: " + password);
	
	db.collection("users").find({username: username}).toArray(function(err, result){
		if(err){
			res.status(500).send("Error reading database.");
			return;
		}
		
		if(result.length == 0){
			res.status(401).send("Unauthorized");
			return;
		} else {
			if(result[0].password === password){
				req.session.loggedin = true;
			
				req.session.user = result[0]._id;
				res.status(200);
				
				res.json({id: result[0]._id});
			}else{
				res.status(401).send("Not authorized. Invalid password.");
			}
		}
	});
}

/*
Update the user settings of the currently logged in user
*/
function updateSettings(req, res, next){
	if(req.session.loggedin){
		db.collection("users").updateOne({
			_id: req.session.user
		}, {
			$set: {
				privacy: req.body.privacy
			}
		})
		
		res.status(200).send("Updated settings.")
	} else {
		res.status(403).send("Unauthorized");
	}
}

/*
Sends a 404 message
*/
function send404(response){
	response.statusCode = 404;
	response.write("Unknown resource.");
	response.end();
}

/*
Connect to the database and initialize the next order id
*/
MongoClient.connect("mongodb://localhost:27017/", function(err, client) {
	if(err) throw err;
	
	db = client.db('a4');
	
	db.collection("users").find({orders: {"$exists" : true}}).toArray(function(err, result){
		if(result.length != 0){
			for(let i = 0; i < result.length; i++){
				nextOrderID += Object.keys(result[i].orders).length;
			}
		}
	});

	app.listen(3000);
	console.log("Listening on port 3000");
});