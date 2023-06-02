
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

const Book=new mongoose.Schema({
   
      title: String,
      price: String,
      mrp: String,
      priceType: String,
      bookCondition: String,
      email:String,
      mob_number:String,
      college:String,
      description:String,
      bookType: String,
      img: 
        { data: Buffer, contentType: String } 

})

const Image=new mongoose.model('Image',Book)
module.exports=Image
