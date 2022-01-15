/*
Registers a user for the website and then sends them to their profile
*/
function register(){
	var nameBox = document.getElementById("registerName");
	var passwordBox = document.getElementById("registerPassword");

	if(nameBox.value == "" || passwordBox.value == ""){
		alert("invalid form input")
	} else {
		var xhttp = new XMLHttpRequest();
		xhttp.open("POST", "/users", true);
		xhttp.setRequestHeader("Content-Type", "application/json");
		xhttp.send(JSON.stringify({name: nameBox.value, password: passwordBox.value}));
		
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 201) {
				if (xhttp.responseText == 'That username already exists') {
					alert("That user already exists")
					return;
				}
				
				let data = JSON.parse(xhttp.responseText);
				
				location.href = `../../users/${data.id}`
			} else if(this.readyState == 4){
				alert("Unknown error");
			}
		}
	}
}

/*
Get the page corresponding to the logged in user's profile
*/
function profile(){
	var xhttp = new XMLHttpRequest();
	xhttp.open("GET", "/userid", true);
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.send();
	
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			let data = JSON.parse(xhttp.responseText);
			
			location.href = `/users/${data.id}`
		} else if(this.readyState == 4){
			alert("Unknown error");
		}
	}
}

/*
Save the logged in user's settings
*/
function saveSettings(){
	var privateBox = document.getElementById("private");
	
	var xhttp = new XMLHttpRequest();
	xhttp.open("PUT", "/settings", true);
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.send(JSON.stringify({privacy: privateBox.checked}));
	
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			alert("Settings saved");
		} else if(this.readyState == 4){
			alert("Unknown error");
		}
	}
}

/*
Attempts to log in to the website using a username and password
*/
function login(){
	var nameBox = document.getElementById("loginName");
	var passwordBox = document.getElementById("loginPassword");
	
	if(nameBox.value == "" || passwordBox.value == ""){
		alert("invalid form input")
	} else {
		var xhttp = new XMLHttpRequest();
		xhttp.open("POST", "/login", true);
		xhttp.setRequestHeader("Content-Type", "application/json");
		xhttp.send(JSON.stringify({username: nameBox.value, password: passwordBox.value}));
		
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				if(xhttp.responseText == "Already logged in."){
					alert("Youre already logged in")
					return;
				}
				alert("Youve logged in");
				
				let data = JSON.parse(xhttp.responseText);
				location.href = `../../users/${data.id}`
			} else if(this.readyState == 4 && this.status == 401){
				alert("Invalid password");
			} else if(this.readyState == 4){
				alert("Unknown error");
			}
		}
	}
}

/*
Logs the user out from the website
*/
function logout(){
	var xhttp = new XMLHttpRequest();
	
	xhttp.open("POST", "/logout", true);
	xhttp.setRequestHeader("Content-Type", "application/json");
	xhttp.send();
	
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			if(xhttp.responseText == "You cannot log out because you aren't logged in."){
				alert("You cannot log out because you aren't logged in.")
				return;
			}
			alert("Youve logged out");
			
			location.href = `../../`
		} else if(this.readyState == 4){
			alert("Unknown error");
		}
	}
}