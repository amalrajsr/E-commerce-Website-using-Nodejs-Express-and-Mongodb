
const userCollection = require("../../Model/userModel");
const productCollection=require("../../Model/produtModel")
const categoryCollection=require("../../Model/categoryModel")
const cartCollection=require("../../Model/cartModel")
const wishlistCollection=require("../../Model/wishlistModel")
const mongoose=require('mongoose')

//---------------------------------------------Function to find Active User And cart ,wishlist count---------------------------------

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
//---------------------------------------------Function to find Active User And cart ,wishlist count Ends---------------------------------




const product_page= async(req,res)=>{

    try{

        let userStatus = await userActive(req.cookies.jwt, req.cookies.id);
        let cartWishlist= await cartAndWishlist(req.cookies.id)
       
        let search= req.query.search||'' 
        let Sort,productData,filter
       
        let count=false
        const limit=8
        let page= req.query.page || 1
        let previous=page-1
        let next=+page + 1
        


        if(req.query.search){
             count=true          // To print count in ejs
            }

        if(req.query.category){

            let categoryData= await categoryCollection.findOne({category_name:req.query.category})

            
            filter= {category:categoryData._id}
        }
        else{
            filter={}
        }


 
    if(req.query.sort=='low'){


     Sort={product_price:1}
   }
    if(req.query.sort=='high'){

     Sort={product_price:-1}
    
   }

   productData= await productCollection.find(
    
    {$and:[
        {name:{$regex:'^'+search+'.*',$options:'i'}},
        { isDeleted: false }
          ],}
 ).sort(Sort).limit(limit).skip((page -1)*limit).find(filter).exec()
    

 // To Get Total search Count
    let searchCount=await productCollection.find(
    
        {$and:[
            {name:{$regex:'^'+search+'.*',$options:'i'}},
            { isDeleted: false }
              ]}
     ).countDocuments()

     
let categoryData= await categoryCollection.find({isBlocked:false})
let author= await productCollection.find({isDeleted:false}).distinct("author")


if(previous<1){ // To get always positive value for previous
    previous=1
}

if(next>searchCount/limit){
    next= Math.ceil(searchCount/limit )  // to not exceed next value greater than page
}

 res.render('../views/User1/product',{

    userStatus,
    cartWishlist,
    productData,
    categoryData,
    author,
    searchCount:Math.ceil(searchCount/limit),
    previous,
    next
                   })
    
   }catch(error){
    
    console.log(error)
    res.redirect('/error')

}


}
module.exports={

    product_page,
    

}