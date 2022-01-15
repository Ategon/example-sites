let restaurantPicked = null;

/*
Gets the data for a restaurant for future use in the restaurant editing page
*/
function getRestaurant(){
	var resId = document.getElementById("resId");
	
	var xhttp2 = new XMLHttpRequest();
	xhttp2.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			let data = JSON.parse(xhttp2.responseText);
			
			restaurantPicked = data;
			
			updateDropbox()
		}
	}
	xhttp2.open("GET", `/restaurants/${resId.innerText}`, true);
	xhttp2.send();
}

/*
Sends a request to add a restaurant to the server from given data in the restaurant add form
*/
function restaurantAdd(){
	var nameBox = document.getElementById("name");
	var minimumBox = document.getElementById("minimum");
	var deliveryBox = document.getElementById("delivery");
	
	if(deliveryBox.value == "" || minimumBox.value == "" || nameBox.value == "" || isNaN(deliveryBox.value) || deliveryBox.value < 0 || isNaN(minimumBox.value) || minimumBox.value < 0){
		alert("invalid form input")
	} else {
		var xhttp = new XMLHttpRequest();
		xhttp.open("POST", "/restaurants", true);
		xhttp.setRequestHeader("Content-Type", "application/json");
		xhttp.send(JSON.stringify({name: nameBox.value, delivery_fee: deliveryBox.value, min_order: minimumBox.value}));
		
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 201) {
				let data = JSON.parse(xhttp.responseText);
				
				location.href = `../../restaurants/${data.id}`
			}
		}
	}
}

/*
Adds a category locally on the restaurant editing page
*/
function categoryAdd(){
	var nameBox = document.getElementById("name2");

	if(!Object.keys(restaurantPicked.menu).includes(nameBox.value)){
		restaurantPicked.menu[nameBox.value] = {};
		nameBox.value = "";
		
		updateDropbox()
		updatePage()
	} else {
		alert("that category already exists")
		nameBox.value = "";
	}
}

/*
Update what shows up in the dropbox on the restaurant editing page
*/
function updateDropbox() {
	var itemDropbox = document.getElementById("itemCategory");
	itemDropbox.innerHTML = "";
	
	for(key of Object.keys(restaurantPicked.menu)){
		let restaurantOption = document.createElement("option");
		restaurantOption.innerText = key;
		restaurantOption.value = key;
		
		itemDropbox.appendChild(restaurantOption);
	};
}

/*
Adds an item locally on the restaurant editing page
*/
function itemAdd(){
	var itemName = document.getElementById("itemName");
	var itemDescription = document.getElementById("itemDescription");
	var itemPrice = document.getElementById("itemPrice");
	var itemCategory = document.getElementById("itemCategory");
	
	if(itemCategory.value == "" || itemName.value == "" || itemDescription.value == "" || itemPrice.value == "" || isNaN(itemPrice.value) || itemPrice.value < 0){
		alert("invalid form input")
		itemName.value = "";
		itemDescription.value = "";
		itemPrice.value = "";
	} else {
		let id = 0;
		Object.values(restaurantPicked.menu).forEach(e => id += Object.keys(e).length);
		
		restaurantPicked.menu[itemCategory.value][id.toString()] = {name: itemName.value, description: itemDescription.value, price: parseFloat(itemPrice.value)}
		itemName.value = "";
		itemDescription.value = "";
		itemPrice.value = "";
		
		updatePage()
	}
}

/*
Updates the restaurant editing page with new info
*/
function updatePage(){
	let leftContent = document.getElementById("lowerleft");
	leftContent.textContent = "";
	
	let tableDiv = document.createElement("div");
	leftContent.appendChild(tableDiv);
	
	let tableContent = document.createElement("h1");
	tableContent.textContent = `Table of Contents`
	tableDiv.appendChild(tableContent);
		
	Object.keys(restaurantPicked.menu).forEach(key => {
		let restaurantCategory = document.createElement("a");
		let categoryText = document.createElement("h2");
		
		restaurantCategory.textContent = `${key}`;
		restaurantCategory.href = `#${key}`;
		
		leftContent.appendChild(categoryText);
		categoryText.appendChild(restaurantCategory);
	})
	
	let addButtonNum = 0;
	let centerContent = document.getElementById("lowercenter");
	centerContent.textContent = "";
	
	Object.entries(restaurantPicked.menu).forEach(([key, entry]) => {
		let menuCategoryDiv = document.createElement("div");
		menuCategoryDiv.className = "menuCategoryDiv";
		centerContent.appendChild(menuCategoryDiv);
		
		let restaurantCategory = document.createElement("h2");
		restaurantCategory.textContent = `${key}`;
		restaurantCategory.id = `${key}`;
		menuCategoryDiv.appendChild(restaurantCategory);
		
		Object.entries(entry).forEach(([key2, entry2]) => {
			let itemDiv = document.createElement("div");
			itemDiv.className = "itemDiv";
			menuCategoryDiv.appendChild(itemDiv);
			
			let itemName = document.createElement("h3");
			itemName.textContent = `${entry2.name}`;
			itemDiv.appendChild(itemName);
			let itemDescription = document.createElement("p");
			itemDescription.textContent = `${entry2.description}`;
			itemDiv.appendChild(itemDescription);
			let itemPrice = document.createElement("p");
			itemPrice.textContent = `Price: $${entry2.price.toFixed(2)}`;
			itemPrice.className = `price`;
			itemDiv.appendChild(itemPrice);
		})
	})
}

/*
Saves the edited data for the restaurant to the server
*/
function saveItems(){
	let name = document.getElementById("name");
	let minimum = document.getElementById("minimum");
	let delivery = document.getElementById("delivery");
	
	if(name.value == "" || minimum.value == "" || delivery.value == "" || isNaN(delivery.value) || delivery.value < 0){
		alert("invalid restaurant info")
	} else {
		if(confirm("Are you sure you wish to save changes?")){
			restaurantPicked.name = name.value;
			restaurantPicked.min_order = parseFloat(minimum.value);
			restaurantPicked.delivery_fee = parseFloat(delivery.value);
			
			var xhttp = new XMLHttpRequest();
			xhttp.open("PUT", `/restaurants/${restaurantPicked.id}`, true);
			xhttp.setRequestHeader("Content-Type", "application/json");
			xhttp.send(JSON.stringify(restaurantPicked));
			
			xhttp.onreadystatechange = function() {
				if (this.readyState == 4 && this.status == 200) {
					alert("data saved")
				} else if (this.readyState == 4 && this.status == 404) {
					alert("error saving data")
				}
			}
		}
	}
}