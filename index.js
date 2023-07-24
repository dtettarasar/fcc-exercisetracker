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
const User = mongoose.model("User", UserSchema);

const ExerciseSchema = new Schema({
  user_id: {type: String, required: true},
  description: String, 
  duration: Number,
  date: Date
});
const Exercise = mongoose.model("Exercise", ExerciseSchema);

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

  const users = await User.find({}).select("_id username");

  if (!users) {
    res.send("No users");
  } else {
    res.json(users);
  }
  
});

// Add User route
app.post('/api/users', async (req, res) => {

  const userObj = new User({
    username: req.body.username
  });

  try {
    
    const user = await userObj.save();
    console.log(user);
    res.json(user);
    
    } catch(err) {
    
    console.log(err);
    
  };
  
});

// Add Exercise route
app.post('/api/users/:_id/exercises', async (req, res) => {

  const id = req.params._id;
  const {description, duration, date } = req.body;

  try {

    const user = await User.findById(id);

    if (!user) {

      res.send('Could not find user');
      
    } else {

      const exerciseObj = new Exercise({
        user_id: user._id,
        description, 
        duration,
        date: date ? new Date(date) : new Date()
      });

      const exercise = await exerciseObj.save();

      res.json({
        _id: user._id,
        username: user.username,
        description: exercise.description,
        duration: exercise.duration,
        date : new Date(exercise.date).toDateString()
      });
      
    }
    
  } catch(err) {
    console.log(err);
    res.send("There was an error saving the exercise");
    
  };

  //res.json({userId: userId});
  
});

// Route to see a users' logged exercises
app.get("/api/users/:_id/logs", async (req, res) => {

  const userId = req.params._id;
  const { from, to, limit } = req.query;

  /*
  console.log("userId: " + userId);
  console.log("from: " + from);
  console.log("to: " + to);
  console.log("limit: " + limit);
  */

  try {

    const userFound = await User.findById(userId);

    if (!userFound) {
      
      res.json({Error: "User Id not valid"});
      
    }

    let dateObj = {};

    if (from) {
      dateObj["$gte"] = new Date(from);
    }

    if (to) {
      dateObj["$lte"] = new Date(to);
    }

    let filter = {
      user_id: userId
    }

    if (from || to) {
      filter.date = dateObj;
    }

    const exercises = await Exercise.find(filter).limit(+limit ?? 300);

    console.log(exercises);

    const logData = [];

    for (let i = 0; i < exercises.length; i++) {
      console.log(exercises[i]);

      const exerciseData = {
        description: exercises[i].description,
        duration: exercises[i].duration,
        date : exercises[i].date.toDateString()
      }

      logData.push(exerciseData);
      
    }
    

    res.json({
      username: userFound.username,
      count: exercises.length,
      _id: userFound._id,
      log: logData
    })
    
  } catch (err) {

    console.log(err);
    
    res.json({Error: err});
    
  }

  //res.send("hello");
  
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
