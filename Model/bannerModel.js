const mongoose = require("mongoose");

const bannerSchema= new mongoose.Schema({

    text:String,
    image:String
})

module.exports=mongoose.model("banner",bannerSchema)