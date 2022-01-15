Benjamin Barbeau
Login system & Mongo

To run the server:
- navigate to the folder in a terminal
- create a folder called db
- type npm install to install dependencies
- type mongod --dbpath="./db"
- type "node server.js" in another shell to start the server

Then you can go to localhost:3000 to get the home page for the website
The header in the top right lets you move between the home page, users page, order page(if youre logged in), your profile(if youre logged in), 
register(if youre not logged in), or log in and out

**Users
clicking the name of one of the users brings you to that user's profile
Only public users show on the list and the more recently a user has signed up the further down the list they are

**Registration
If you arent logged in you can register a new account using a username and password. You can then use that account to log in and out from the website to place orders.
Setting your profile to private allows nobody else to see data in it.