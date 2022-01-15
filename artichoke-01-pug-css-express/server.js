const pug = require('pug');
const fs = require('fs');
const express = require('express');
let app = express();

let restaurants = []
let nextId = 3;

/*
Reads all restaurant info for future use
*/
fs.readdirSync("./restaurants").forEach(file => {
	restaurants.push(JSON.parse(fs.readFileSync(`./restaurants/${file}`, {encoding: 'utf8'})));
})

/*
Helper function to respond to anything passed in with a 404 message
*/
function send404(response){
	response.statusCode = 404;
	response.write("Unknown resource.");
	response.end();
}

/*
Routes
*/
app.set("view engine", "pug");
app.set("views", "public/views");

app.use(express.json());
app.use(express.static("public"));
app.get("/", sendIndex);
app.get("/addrestaurant", addRestaurant);
app.get("/restaurants", listRestaurants);
app.post("/restaurants", newRestaurant);
app.get("/restaurants/:restID", getRestaurant);
app.put("/restaurants/:uid", updateRestaurant);

/*
Sends the welcome page
*/
function sendIndex(req, res, next){
	res.render("index");
	next()
}

/*
Sends the add restaurant page
*/
function addRestaurant(req, res, next){
	res.render("addrestaurant");
	next()
}

/*
Sends a json with the ids of all the restaurants
or
Sends the restaurant list page
*/
function listRestaurants(req, res, next){
	res.format({
		"application/json": () => {
			res.status(200);
			res.json({restaurants: restaurants.map(x => x.id)})
		},
		"text/html": () => {
			res.status(200);
			res.render("restaurants", {restaurants: restaurants});
		}
	});
	next()
}

/*
Creates a new restaurant from the given json
*/
function newRestaurant(req, res, next){
	
	if(req.body.name == null || req.body.min_order == null || req.body.delivery_fee == null){
		send404(res);
	} else {
		restaurants.push({id: nextId, name: req.body.name, min_order: parseFloat(req.body.min_order), delivery_fee: parseFloat(req.body.delivery_fee), menu: {}})
		res.status(201);
		res.json({id: nextId, name: req.body.name, min_order: parseFloat(req.body.min_order), delivery_fee: parseFloat(req.body.delivery_fee), menu: {}});
		nextId++;
	}
	
	next()
}

/*
Sends a json with all the data for a restaurant
or
Sends the restaurant page

for a given restaurant id
*/
function getRestaurant(req, res, next){
	if(restaurants.filter(x => x.id == req.params.restID).length == 0){
		send404(res);
	} else {
		res.format({
			"application/json": () => {
				res.status(200);
				res.json(restaurants.filter(x => x.id == req.params.restID)[0])
			},
			"text/html": () => {
				res.status(200);
				res.render("restaurant", {restaurant: restaurants.filter(x => x.id == req.params.restID)[0]});
			}
		});
	}
	next()
}

/*
Updates a restaurant with edited data from a given json
*/
function updateRestaurant(req, res, next){
	if(restaurants.filter(e => e.id == req.body.id).length > 0){
		restaurants = restaurants.filter(e => e.id != req.body.id)
		restaurants.push(req.body);
		res.status(200);
		res.send();
	} else {
		send404(res);
	}
	next()
}

app.listen(3000);
console.log("Server listening at http://localhost:3000");
