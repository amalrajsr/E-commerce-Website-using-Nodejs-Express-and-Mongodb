// const jwt=require('jsonwebtoken')
const userCollection=require('../../Model/userModel')

const isBlocked= async (req,res,next)=>{
try{
    const id=req.cookies.id
    if(id){
    const user= await userCollection.findById({_id:id})
    if(user.isBlocked==true){
        res.cookie('jwt','',{maxAge:'1'})
        res.cookie('id','',{maxAge:'1'})
       res.redirect('/')
    }
    else{
        next()
    }
}else{
    next()
}
}catch(error){

    console.log(error)
}
   

}

module.exports={isBlocked}