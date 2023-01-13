
const mongoose= require('mongoose')

const productSchema= new mongoose.Schema(({

    name:{
        type:String,
        required:true,
        unique:true
    },
    author:{
        type:String,
        required:true
    },

    image:String,

    // category:{
       
    //      type:String,
    //     required:true
    // },
    category:{

       type:mongoose.Types.ObjectId, 
        ref:'Category',
    },
    stock:{
        type:Number,
        required:true
    },
    product_price:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        default:'In Stock'
    },
    flag:{
        type:String
    },
    description:{
        type:String,
        required:true
    },
    isDeleted:{
        type:Boolean,
        default:false
    }

}))

module.exports=mongoose.model("product",productSchema)