const  productCollection=require('../../Model/produtModel')
const  userCollection=require('../../Model/userModel')
const wishlistCollection=require('../../Model/wishlistModel')
const cartCollection=require('../../Model/cartModel')
const mongoose=require('mongoose');
const { render } = require('ejs');


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



const view_wishlist=async (req,res)=>{

    try{
        let Wishlist={}
        let cartWishlist= await cartAndWishlist(req.cookies.id)
        const  userStatus = await userActive(req.cookies.jwt, req.cookies.id);
        const wishlist= await wishlistCollection.findOne({user:req.cookies.id}).populate("productList.product")
        if(wishlist){
        if(wishlist.productList){
            Wishlist=wishlist.productList
        }
    }
           res.render('../views/User1/Order/wishlist',{userStatus,cartWishlist,Wishlist})

    }catch(error){
        console.log(error)
        res.redirect('/error')
    }
}



const add_to_wishlist= async(req,res)=>{

    try{
const product_id=req.body.product
const wishlistExists= await wishlistCollection.find({user:req.cookies.id})
const productExists= await wishlistCollection.find({$and:[{user:req.cookies.id},{"productList.product":product_id}]})
 
     if(productExists.length==0){
    if(wishlistExists.length==0){

        const wishlist= new wishlistCollection({

            user:mongoose.Types.ObjectId(req.cookies.id),
              productList:[{
                product:mongoose.Types.ObjectId(product_id)
    
            }]
        })

          await wishlist.save()
          res.json({
            success:true
        })
      
         console.log('wishlist created')

    }else{
        await wishlistCollection.updateOne({user:req.cookies.id},{$push:{productList:{product:mongoose.Types.ObjectId( product_id)}}})


            res.json({
                success:true
            })
          
          
        console.log('wishlist updated')
    }

     }else{
      console.log('alreday in wishlist');
        res.json({
            exists:true
        })
     }
      
}catch(error){

    console.log(error)
    res.redirect('/error')

}
}

const delete_wishlist_item=async(req,res)=>{

    try{


        const product_id=req.query.id
        await wishlistCollection.updateOne({user:req.cookies.id,"productList.product":product_id},{$pull:{productList:{product:product_id}}})
        
            res.json({
                success:true
            })
        
        console.log('item deleted from wishlist')
    }catch(error){

        console.log(error)
        res.redirect('/error')
    }

}


module.exports={

    view_wishlist,
    add_to_wishlist,
    delete_wishlist_item
}