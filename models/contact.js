require('dotenv').config();
const MONGO_URI= process.env.MONGO_URI;
const mongoose=require("mongoose")

mongoose.connect(MONGO_URI)

.then(()=>{
    console.log('mongoose connected');
})
.catch((e)=>{
    console.log('failed');
})

const ContactSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true

    },
    email:{
        type:String,
        required:true
       
    },
    subject:{
        type:String,
        required:true
     
    },
    message:{
        type:String,
        required:true
      
    }

})

const ContactCollection=new mongoose.model('ContactCollection',ContactSchema)
module.exports=ContactCollection
