const mongoose=require('mongoose')

const categorySchema= new mongoose.Schema({

    category_name: String,
    image:String,
    isBlocked:{
        type:Boolean,
        default:false
    }
})

module.exports=mongoose.model("Category",categorySchema)
