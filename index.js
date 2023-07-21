// Modules
const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose');
const { Schema } = mongoose;

//init database connexion with Mongoose
mongoose.connect(process.env.DB_URL);

//Build Schemas 
const UserSchema = new Schema({
  username: String
});
const UserModel = mongoose.model("User", UserSchema);

const ExerciseSchema = new Schema({
  user_id: {type: String, required: true},
  description: String, 
  duration: Number,
  date: Date
});
const ExerciseModel = mongoose.model("Exercise", ExerciseSchema);

app.use(cors())
app.use(express.static('public'))
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({extended: true}));

// routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Get all users route
app.get("/api/users", async (req, res) => {

  const users = await UserModel.find({}).select("_id username");

  if (!users) {
    res.send("No users");
  } else {
    res.json(users);
  }
  
});

// Add User route
app.post('/api/users', async (req, res) => {

  const userObj = new UserModel({
    username: req.body.username
  });

  try {
    
    const addedUser = await userObj.save();
    console.log(addedUser);
    res.json(addedUser);
    
    } catch(errMsg) {
    
    console.log(errMsg);
    res.json({error: errMsg});
    
  };
  
});

// Add Exercise route
app.post('/api/users/:_id/exercises', async (req, res) => {

  const userId = req.body[':_id'];
  console.log(userId);

  const {description, duration, date } = req.body;

  try {

    const userFound = await UserModel.findById(userId);

    if (!userFound) {
      res.json({Error: "User Id not valid"});
    } else {

      const ExerciseObj = new ExerciseModel({
        user_id: userId,
        description, 
        duration,
        date: date ? new Date(date) : new Date()
      });

      const addedExercise = await ExerciseObj.save();

      const resultObj = {
        _id: userFound._id,
        username: userFound.username,
        description: addedExercise.description,
        duration: addedExercise.duration,
        date: new Date(addedExercise.date).toDateString()
      }
      
      res.json(resultObj);
    }
    
  } catch(err) {
    
    res.json({Error: err});
    
  };

  res.json({userId: userId});
  
});

// Route to see a users' logged exercises
app.get("/api/users/:_id/logs", async (req, res) => {

  const userId = req.params._id;
  const { from, to, limit } = req.query;

  console.log("userId: " + userId);
  console.log("from: " + from);
  console.log("to: " + to);
  console.log("limit: " + limit);

  try {

    const userFound = await UserModel.findById(userId);

    if (!userFound) {
      
      res.json({Error: "User Id not valid"});
      return false;
      
    }

    let dateObj = {};

    if (from) {
      dateObj["$gte"] = new Date(from);
    }

    if (to) {
      dateObj["$lte"] = new Date(to);
    }

    let filter = {
      user_id: id
    }

    if (from || to) {
      filter.date = dateObj;
    }

    const exercise = await ExerciseModel.find(filter).limit(+limit ?? 300);
    
  } catch (err) {

    res.json({Error: err});
    
  }

  res.send("hello");
  
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
