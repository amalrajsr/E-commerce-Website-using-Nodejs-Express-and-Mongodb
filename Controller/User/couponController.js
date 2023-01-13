
const couponCollection= require('../../Model/couponModel')
const userCollection=require('../../Model/userModel')
const cartCollection=require('../../Model/cartModel')

const coupon=async(req,res)=>{

    try{
        let message='Invalid Coupon',discount=null,couponId=null,total=null
        let coupon=req.body.coupon.toUpperCase()
        let cart= await cartCollection.findOne({user:req.cookies.id},{total_price:1,_id:0})
        let couponExists= await couponCollection.find({name:coupon})
        if(couponExists.length>0){
            if(couponExists[0].status===false){
             console.log('valid coupon');
            let cuoponExistInUser= await userCollection.findOne({$and:[{"usedCoupon.code":couponExists[0].name},{_id:req.cookies.id}]})
            if(cuoponExistInUser){

                console.log('Coupon exists but already used');
                message='Coupon already used'
                
            }else if(Date.now()>couponExists[0].expiresIn){

                message='Coupon Expired'
                await couponCollection.deleteOne({name:couponExists[0].name})
                

            }else if(cart.total_price<couponExists[0].min_amount){
                       
                message='purchase more to apply this coupon'
             
            }
            else{
 
                   
                 couponId=couponExists[0]._id
                discount=parseInt((cart.total_price)*(couponExists[0].discount/100)) 
                total=cart.total_price-discount
             await cartCollection.updateOne({user:req.cookies.id},{$set:{couponDiscount:discount}})
             
                
                message='Coupon Applied'
                  
               

           
            }
           }else{
            message='Invalid Coupon'
        }

        }

        res.json({
            message:message,
            discount:discount,
            couponId:couponId,
            total:total
        })
    
        
    }catch(error){

        console.log(error);
        res.redirect('/error')
    }

    
}


module.exports={
    coupon
}
