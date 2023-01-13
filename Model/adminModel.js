const mongoose=require('mongoose')

//creating schema for admin collection
const adminSchema= mongoose.Schema(({

 name:{

    type:String,
    required:true
 },
 
 password:{

    type:String,
    required:true
 }

}))

//Creating model for admin
module.exports= mongoose.model("Admin",adminSchema)