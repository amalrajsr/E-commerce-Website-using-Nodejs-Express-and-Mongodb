require('dotenv').config()
const express=require('express')
const session=require('express-session')
const app=express()
const path=require('path')
const userRoute=require('./routes/userRouter')
const adminRouter=require('./routes/adminRouter')
const cookieparser=require('cookie-parser')
//importing db sections from Model
require('./Model/adminModel')
require('./Model/userModel')
require('./Model/dbModel')

// for parsing the url to json,string or array format
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieparser())

app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
    
}))
//For not Storing Cache
app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next()
  });

//Calling routers
app.use('/',userRoute)
app.use('/admin',adminRouter)


// for adding external files to view engine
const staticPath=path.join(__dirname,'public')
app.use(express.static(staticPath))

//  Setting view Engine
app.set('view engine', 'ejs')

app.all('*',(req,res)=>{

  res.redirect('/404')
})


// port specified
const port= process.env.PORT || 7888



app.listen(port,()=>console.log(`Server is running at http://localhost:${port}`))