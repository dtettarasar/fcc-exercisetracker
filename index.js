const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

// init database connexion
const { MongoClient } = require('mongodb');
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
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});





const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
