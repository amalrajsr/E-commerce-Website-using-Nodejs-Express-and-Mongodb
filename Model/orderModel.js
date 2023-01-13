const mongoose= require('mongoose')

const orderSchema= new mongoose.Schema(({

user:{

    type:mongoose.Types.ObjectId,
    ref:'User',
    required:true
    
},

order_details: [
    {
      product: { type: mongoose.Types.ObjectId, ref: "product" },
      quantity: Number,
    }
  ],
  total_price:{

    type:Number,
  },
  discount:{

    type:Number
  },
address:{
    name:{
        type:String,
        // required:true
    },
    email:{
        type:String,
        // required:true
    },
    mobile:{
        type:Number,
        // required:true
    },
    zip_code:{
        type:Number,
        // required:true
    },
    address:{
        type:String,
        // required:true
    }
},
status:{

    type:String,
    default:'pending'
},
payment_type:{

    type:String,
    // required:true
},
placedDate:{

    type:Date,
    default:Date.now()
},
DeliveredDate:{
    type:Date
},
couponApplied:String

}))

module.exports=mongoose.model('order',orderSchema)