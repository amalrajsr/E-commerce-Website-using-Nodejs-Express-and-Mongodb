const  productCollection=require('../../Model/produtModel')
const  userCollection=require('../../Model/userModel')
const cartCollection=require('../../Model/cartModel')
const orderCollection=require('../../Model/orderModel')
const couponCollection=require('../../Model/couponModel')
const wishlistCollection=require('../../Model/wishlistModel')


const mongoose=require('mongoose');

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

const checkoutPage= async(req,res)=>{

    try{

      console.log(req.query.id);
        const userStatus= await userActive(req.cookies.jwt, req.cookies.id);
        let cartWishlist= await cartAndWishlist(req.cookies.id)
    
        let userAddress= await userCollection.findOne({_id:req.cookies.id})
        let address=userAddress.address
        let cart=await cartCollection.findOne({user:req.cookies.id}).populate('cart_items.product')
        CartItems=cart.cart_items
        const coupon= await couponCollection.find()
    // let coupon=await userCollection.aggregate([{$match:{_id:mongoose.Types.ObjectId(req.cookies.id)}},
    //                                            {$unwind:"$usedCoupon"},
    //                                          {$project:{usedCoupon:1}}
    // ])

        res.render('../views/User1/Order/checkout',{userStatus,cartWishlist,address,CartItems,coupon})

    }catch(error){

        console.log(error)
        res.redirect('/error')

    }
    
}

const orderCancel= async(req,res)=>{

    const orderId= req.query.id
    console.log(orderId);
   await orderCollection.updateOne({_id:orderId},{$set:{status:'cancelled'}})

    res.redirect('back')

}



module.exports={

    checkoutPage,
    orderCancel

    
}