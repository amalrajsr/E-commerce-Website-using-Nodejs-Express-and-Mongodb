const  productCollection=require('../../Model/produtModel')
const  userCollection=require('../../Model/userModel')
const cartCollection=require('../../Model/cartModel')
const wishlistCollection=require('../../Model/wishlistModel')
const mongoose=require('mongoose');
const { response } = require('express');


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





const cart_view= async(req,res)=>{

    try{
    
        let CartItems=[]
        const  userStatus = await userActive(req.cookies.jwt, req.cookies.id);
        let cartWishlist= await cartAndWishlist(req.cookies.id)

         const cart = await cartCollection.findOne({user:req.cookies.id}).populate('cart_items.product')
         const total=await cartCollection.findOne({user:req.cookies.id},{total_price:1,_id:0})
        if(cart){
    
            CartItems=cart.cart_items
        }
        res.render('../views/User1/Order/cart.ejs',{userStatus,cartWishlist,CartItems,total})
    
    }catch(error){
    
        console.log(error)
        res.redirect('/error')
    }
    
    }




const cart=async(req,res)=>{
      
    try{

        
        const product= await productCollection.findById({_id:req.body.id})
        const user=await userCollection.findById({_id:req.cookies.id})
        const cartExists=await cartCollection.find({user:req.cookies.id})
        const productExists=await cartCollection.find({$and:[{"cart_items.product":product._id},{user:user._id}]})
          if(productExists.length==0){
         if(cartExists.length==0){
    
            const cart_item= new cartCollection({
    
                user:mongoose.Types.ObjectId(user._id) ,
                cart_items:[{
                    product:mongoose.Types.ObjectId(product._id)
                   
                }],
                total_price:product.product_price

            })
              await cart_item.save()
             console.log('item saved to cart')
                
         res.json({

            success:true,
         })
 
    
         }
         
         else{

            const userCart= await cartCollection.findOne({user:req.cookies.id})
            let updatedTotalPrice=userCart.total_price+product.product_price
            
            await cartCollection.updateOne({user:req.cookies.id},{$push:{cart_items:{product:product._id}}})
            await cartCollection.updateOne({user:req.cookies.id},{$set:{total_price:updatedTotalPrice}})
            console.log('Cart updated')
                
         res.json({

            success:true
          })
    
         }
          }
    
         else{
           
            await cartCollection.updateOne(
                
            {user:user._id,"cart_items.product":product._id},
            {$inc:{
                   "cart_items.$.quantity":1,
                   total_price:product.product_price
                  }
            }
             
            )
            res.json({
                update:true
            })
            console.log('qty updated')
         
          }
   
           await wishlistCollection.updateOne({"productList.product":req.body.id},{$pull:{productList:{product:req.body.id}}})

    }catch(error){

        console.log(error)
        res.redirect('/error')
    }
   
}

const update_cart_item= async(req,res)=>{


    try{

    
        const product=await productCollection.findOne({_id:req.body.product})
        const productExists=await cartCollection.find({$and:[{"cart_items.product":req.body.product},{user:req.body.user}]})

     
        
       const qtyChck= await cartCollection.aggregate([{$match:{user:mongoose.Types.ObjectId(req.cookies.id)}},
                                                     {$unwind:"$cart_items"},
                                                     {$match:{"cart_items.product":mongoose.Types.ObjectId(req.body.product)}},
       ])
  


       let productQty= qtyChck[0].cart_items.quantity
       let countCheck= +req.body.count
      
     
         if(productExists.length>0){
            
           if(productQty<2 &&countCheck<0){
       
              await cartCollection.updateOne({user:req.cookies.id},{$inc:{total_price:-product.product_price}})
               await cartCollection.updateOne({user:req.cookies.id,"cart_items.product":req.body.product},
               {$pull:{cart_items:{product:req.body.product}}})
       
                   res.json({
                       delete:true,
       
                    })
           
               console.log('item deleted')
        
           }else{

                if(productQty>=product.stock && countCheck>0){

                  console.log('out of stock');
                  res.json({
                    outOfStock:true,
                  })

                }else{

                
               let priceIncrementOrDecrement=product.product_price
                if(countCheck<0){
                   priceIncrementOrDecrement=-product.product_price
                }
       
               await cartCollection.updateOne(
                       
                   {user:req.body.user,"cart_items.product":req.body.product},
                   {$inc:{"cart_items.$.quantity":req.body.count,total_price:priceIncrementOrDecrement}},
                    
                   )
                   const total=await cartCollection.findOne({user:req.cookies.id},{total_price:1,_id:0})
                  
                   res.json({
                               success:true,
                               total:total
                            })
                  console.log('qty updated')
       
           }


          }
       
         }

         


    }catch(error){

        console.log(error)
        res.redirect('/error')

    }



}

const cart_item_delete= async(req,res)=>{


    try{

        const product_id= req.query.id
        const product=await productCollection.findOne({_id:product_id})
        const qtyChck= await cartCollection.aggregate([{$match:{"cart_items.product":mongoose.Types.ObjectId(product_id)}},
                                                      {$unwind:"$cart_items"},
                                                      {$match:{"cart_items.product":mongoose.Types.ObjectId(product_id)}},
                                                      {$project:{"cart_items.quantity":1,_id:0}}
        ])
        
        let productQty= parseInt(qtyChck[0].cart_items.quantity)
        let total_decrement= productQty*product.product_price
        
        
         
         await cartCollection.updateOne({user:req.cookies.id},{$inc:{total_price:-total_decrement}})
         await cartCollection.updateOne({user:req.cookies.id,"cart_items.product":product_id},{$pull:{cart_items:{product:product_id}}})
         console.log('item deleted')
         res.redirect('back')


    }catch(error){

        console.log((error));
        res.redirect('/error')

    }


}



module.exports={

    cart_view,
    cart,
    update_cart_item,
    cart_item_delete
}