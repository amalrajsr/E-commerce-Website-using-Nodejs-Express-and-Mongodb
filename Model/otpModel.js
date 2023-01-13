const mongoose= require('mongoose')

const otpSchema=mongoose.Schema(({

    user_email:String,
    otp:Number,
    createdAt:Date,
    expiresAt:Date
}))

module.exports=mongoose.model("otp",otpSchema)