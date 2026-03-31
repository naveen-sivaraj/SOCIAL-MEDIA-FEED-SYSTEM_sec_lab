const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/demo")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

  // Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  age: Number
});

const User = mongoose.model("User", userSchema);

// POST API → Store data
app.post("/add-user", async (req, res) => {
  try {
    const newUser = new User(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET API → Fetch data
app.get("/get-users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.listen(8000, () => {
  console.log("Server running on port 8000");
});
