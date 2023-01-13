const jwt=require('jsonwebtoken')


const maxAge= 1*24*60*60   // day-hour-minute-second
const createToken=(id)=>{
    return jwt.sign({id},process.env.SECRET,{expiresIn:maxAge})
}


module.exports={createToken}