
const mongoose=require('mongoose')
mongoose.set('strictQuery', true)

// Creating Schema for user collectio
const userSchema= new mongoose.Schema(({

    name:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true,
        unique:true
    },
    password: {
        type:String,
        require:true

    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    usedCoupon:[
          {
            code:String,
            discount:String
          }
          
    ],
    address:[
        {
            name:{
                type:String,
                required:true
            },
            email:{
                type:String,
                required:true
            },
            mobile:{
                type:Number,
                required:true
            },
            zip_code:{
                type:Number,
                required:true
            },
            address:{
                type:String,
                required:true
            },
            // isDeleted:{
            //     type:Boolean,
            //     default:false
            // }
        }
    ],
    
    

}))
// Creating model and exporting
module.exports= mongoose.model("User",userSchema)