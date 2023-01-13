const mongoose=require('mongoose')

const wishlistSchema= new mongoose.Schema({

    user:{
        type:mongoose.Types.ObjectId,
        ref:'user'
    },
    productList:[{
       product:{ 
        type:mongoose.Types.ObjectId,
        ref:'product'
    
    }
    }]
})

module.exports=mongoose.model("wishlist",wishlistSchema)