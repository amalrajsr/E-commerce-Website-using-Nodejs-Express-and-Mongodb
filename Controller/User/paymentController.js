const paypal = require('paypal-rest-sdk');
const  productCollection=require('../../Model/produtModel')
const  userCollection=require('../../Model/userModel')
const cartCollection=require('../../Model/cartModel')
const orderCollection=require('../../Model/orderModel')
const couponCollection=require('../../Model/couponModel')
const wishlistCollection=require("../../Model/wishlistModel")
const mongoose=require('mongoose');
const { coupon } = require('./couponController');

//---------------------------------------------Function to find Active User---------------------------------
async function userActive(jwt, id) {
    let user = false;
    if (jwt && id) {
      user = await userCollection.findById({ _id: id });
    }
    return user;
  }

  async function cartAndWishlist(id) {
    let cart=null,wishlist=null,cartCount=0,wishlistCount=0
    if ( id) {
      cart=await cartCollection.aggregate([{$match:{user:mongoose.Types.ObjectId(id)}}])
      wishlist=await wishlistCollection.aggregate([{$match:{user:mongoose.Types.ObjectId(id)}}])
      
      if(cart.length>0){
      if(cart[0].cart_items){
        cartCount=cart[0].cart_items.length
       

  
      }
    }
 
    if(wishlist.length>0){

      if(wishlist[0].productList){
        wishlistCount=wishlist[0].productList.length
  
      }
   }
}
  
    return {cartCount,wishlistCount};
  }
  //---------------------------------------------Function to find Active User Ends---------------------------------

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': process.env.PAYPAL_CILENT_ID,
    'client_secret': process.env.PAYPAL_CILENT_SECRET
  });


  const payment= async(req,res)=>{
    
    try{


         req.session.order_detail=req.body
        if(req.body.payment=='pay_pal'){


          
            req.session.order_detail=req.body

            let cart= await cartCollection.findOne({user:req.cookies.id})
            let total=cart.total_price 
            if(cart.couponDiscount){
            total=cart.total_price-cart.couponDiscount
            }
             const create_payment_json = {
                 "intent": "sale",
                 "payer": {
                     "payment_method": "paypal"
                 },
                 "redirect_urls": {
                     "return_url": `${process.env.PAYPAL_SUCCESS_URL}`,
                     "cancel_url": `${process.env.PAYPAL_SUCCESS_URL}`
                 },
                 "transactions": [{
                     "item_list": {
                         "items": [{
                             "name": "Red Sox Hat",
                             "sku": "001",
                             "price": total,
                             "currency": "USD",
                             "quantity": 1
                         }]
                     },
                     "amount": {
                         "currency": "USD",
                         "total": total
                     },
                     "description": "Hat for the best team ever"
                 }]
             };
     
            paypal.payment.create(create_payment_json, async function (error, payment) {
            if (error) {
                throw error;
            } else {
                for(let i = 0;i < payment.links.length;i++){
                  if(payment.links[i].rel === 'approval_url'){
                    await cartCollection.updateOne({user:req.cookies.id},{$unset:{couponDiscount:""}})
                    res.redirect(payment.links[i].href);
                  }
                }
            }
          });

          console.log('paypal')
            
        }else{
             console.log('cod');
             await cartCollection.updateOne({user:req.cookies.id},{$unset:{couponDiscount:""}})
            res.redirect(`/success`)
        }

      
      
    

    }catch(error){

        console.log(error)
        res.redirect('/error')

    }

        
    

}


async function successPage(req,res){

    try{


      if( req.session.order_detail){
        let orderAddress, coupon
        const userStatus= await userActive(req.cookies.jwt, req.cookies.id);
        let cartWishlist= await cartAndWishlist(req.cookies.id)

        const orderDetail=req.session.order_detail
       
        const cartDetails= await cartCollection.aggregate([
            {$match:{user:mongoose.Types.ObjectId(req.cookies.id)}},
            {$unwind:"$cart_items"},
            {$project:{"product":"$cart_items.product",_id:0,"quantity":"$cart_items.quantity"}}                            
          ])
    
        const total=await cartCollection.findOne({user:req.cookies.id},{total_price:1,_id:0})
   
        orderAddress={
            name:orderDetail.name,
            email:orderDetail.email,
            mobile: parseInt(orderDetail.mobile) , 
            zip_code:parseInt(orderDetail.zipcode) ,
            address:orderDetail.new_address,
            
        }

      

        if(orderDetail.couponId){

             coupon= await couponCollection.findOne({_id:orderDetail.couponId})
             discount=parseInt((total.total_price)*(coupon.discount/100)) 

             let price_after_discount=total.total_price-discount
            order=  new orderCollection({
    
                user:req.cookies.id,
                order_details:cartDetails,
                total_price:price_after_discount,
                discount:discount,
                address:orderAddress,
                payment_type:orderDetail.payment,
                couponApplied:coupon.name
                  })
                
                  console.log(order);
await userCollection.updateOne({_id:req.cookies.id},{$push:{usedCoupon:{code:coupon.name,discount:coupon.discount}}})


        }else{
            order=  new orderCollection({
    
                user:req.cookies.id,
                order_details:cartDetails,
                total_price:total.total_price,
                address:orderAddress,
                payment_type:orderDetail.payment
                  })
    

        }

              await order.save()
              console.log('order placed');
              req.session.order_detail=false
              order_id=order._id

              
    const cart= await cartCollection.aggregate([
        {$match:{user:mongoose.Types.ObjectId(req.cookies.id)}},
        {$unwind:"$cart_items"},
        {$lookup:{from:'products',localField:"cart_items.product",foreignField:'_id',as:'productData'}}   ,
        {$project:{"product":"$productData",_id:0,"quantity":"$cart_items.quantity"}},
                         
      ])


 cart.forEach(async function(cart){
   await productCollection.updateOne({name:cart.product[0].name},{$inc:{stock:-cart.quantity}})
})
        
       await cartCollection.updateOne({user:req.cookies.id},{$unset:{"cart_items":''}})
       await cartCollection.updateOne({user:req.cookies.id},{$set:{total_price:0}})


 res.render('../views/User1/orderSuccess.ejs',{userStatus,cartWishlist,order_id});

      }else{


        res.redirect('/checkout')
      }
    








    }catch(error){

        console.log(error);
        res.redirect('/error')
    }



}


const failure= async(req,res)=>{

    const userStatus= await userActive(req.cookies.jwt, req.cookies.id);
    let cartWishlist= await cartAndWishlist(req.cookies.id)

    res.redirect('error',{userStatus,cartWishlist})
}


const test=async (req,res)=>{

  


    res.render('../views/User1/Order/test.ejs')
}


module.exports={

    payment,
    failure,
    test,
    successPage
}