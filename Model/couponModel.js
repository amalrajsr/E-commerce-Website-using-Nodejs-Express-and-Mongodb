
const mongoose=require('mongoose')

const couponSchema= new mongoose.Schema(({

name:{

    type:String,
    required:true
},
discount:{

    type:Number,
    required:true
},

min_amount:{

    type:Number,
    required:true
},
startAt:{
type:Date,

},
expiresIn:{
  
    type:Date,
    required:true
},
status:{
    type:Boolean,
    default:false
},

}))


module.exports=mongoose.model("coupon",couponSchema,'coupon')