// Modules
const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const { MongoClient } = require('mongodb');

// init database connexion
const client = new MongoClient(process.env.DB_URL);
const db = client.db('fcc-exercice-tracker');
const users = db.collection('users');
const exercices = db.collection('exerciceDoc');

/*
// Database infos

console.log(db);
console.log("-------");
console.log(users);
console.log("-------");
console.log(exercices);
*/

app.use(cors())
app.use(express.static('public'))
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({extended: true}));
// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/users', async (req, res) => {

  const userObj = {
    username: req.body.username
  }

  const result = await users.insertOne(userObj);
  
  console.log(result);
  userObj['_id'] = result.insertedId;

  res.json(userObj);
  
});

app.post('/api/users/:_id/exercises', (req, res) => {

  const userId = req.body[':_id'];
  console.log(userId);

  //TODO
  //Build regex to validate duration and date format or 
  //  For the date property, the toDateString method of the Date API can be used to achieve the expected output.

  res.json({userId: userId});
  
})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
