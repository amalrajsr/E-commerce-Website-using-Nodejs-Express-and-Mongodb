const mongoose=require('mongoose')

//Creating database collection for mongodb
mongoose.connect("mongodb://127.0.0.1:27017/project").then(()=>{

console.log("Database running successfully")
}).catch((err)=>{

    console.log(err)
})
