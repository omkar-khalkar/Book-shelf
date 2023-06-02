const mongoose=require("mongoose")
require('dotenv').config();
const MONGO_URI= process.env.MONGO_URI;

mongoose.connect(MONGO_URI)

.then(()=>{
    console.log('mongoose connected');
})
.catch((e)=>{
    console.log('failed');
})

// models/user.js



const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  mob_number: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const users = mongoose.model('users', userSchema);

module.exports = users;


