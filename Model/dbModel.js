const mongoose=require('mongoose')

//Creating database collection
mongoose.connect("mongodb://127.0.0.1:27017/project").then(()=>{

console.log("Database running successfully")
}).catch((err)=>{

    console.log(err)
})


// mongoose.connect(process.env.MONGO_CONNECT).then(()=>{

// console.log("Database running successfully")
// }).catch((err)=>{

//     console.log(err)
// })
