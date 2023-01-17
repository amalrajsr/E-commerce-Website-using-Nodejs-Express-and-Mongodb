const { json } = require('express');
const { default: mongoose } = require('mongoose');
const  productCollection=require('../../Model/produtModel')
const  userCollection=require('../../Model/userModel')
const orderCollection=require('../../Model/orderModel')
const bcrypt = require("bcrypt");
const wishlistCollection=require('../../Model/wishlistModel')
const cartCollection=require('../../Model/cartModel')


//pdf
const ejs= require('ejs')
const pdf=require('html-pdf')
const fs= require('fs')
const path=require('path')
const http = require('http');
const { findOne } = require('../../Model/produtModel');
const { log } = require('console');
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
  


const profile = async (req, res) => {
    try {
      userStatus = await userActive(req.cookies.jwt, req.cookies.id);
      let cartWishlist= await cartAndWishlist(req.cookies.id)
      userData=await userCollection.findById({_id:req.cookies.id})
      res.render("../views/User1/profile.ejs", { userStatus,cartWishlist ,userData});
    } catch (error) {
      console.log(error);
      res.redirect('/error')

    }
  };

const profile_edit= async(req,res)=>{

    try{
        userStatus = await userActive(req.cookies.jwt, req.cookies.id);
        const name=req.body.name
       
        await userCollection.findByIdAndUpdate({_id:req.cookies.id},{$set:{name:name}})
        console.log('profile updated')
        res.redirect('back')
    }catch(error){

        console.log(error)
        res.redirect('/error')

    }
}

const address_view= async (req,res)=>{

  try{
    userStatus = await userActive(req.cookies.jwt, req.cookies.id);
    let cartWishlist= await cartAndWishlist(req.cookies.id)

    let userAddress= await userCollection.findOne({_id:req.cookies.id})
    let address=userAddress.address
    
   res.render('../views/User1/Profile/address',{userStatus,cartWishlist,address})
  // res.render('../views/User/Profile/2edit')


  }catch(error){

    console.log(error)
    res.redirect('/error')

  }

}

const add_address_view= async(req,res)=>{

  try{
          let mobileError=req.query.mobileError
          let zipError=req.query.zipError
        userStatus = await userActive(req.cookies.jwt, req.cookies.id);
        let cartWishlist= await cartAndWishlist(req.cookies.id)
         res.render('../views/User1/Profile/add_address',{userStatus,cartWishlist,mobileError,zipError})

  }catch(error){

    console.log(error)
    res.redirect('/error')

  }
} 


const address_add=async (req,res)=>{

  try{

    const address=req.body
  
   if(address.mobile.length <10){

    res.redirect('/add_address?mobileError=10 digit needed')
    console.log('mobile length error');
   }else if(address.zipcode.length <6){

    res.redirect('/add_address?zipError=6 digit needed')
    console.log('zip length error');

   }else{
    await userCollection.findByIdAndUpdate({_id:req.cookies.id},
      {$push:{address:{name:address.name,email:address.email,mobile:address.mobile,zip_code:address.zipcode,address:address.address}}})

      console.log('address added')
      res.redirect('/address')
   }
    
  
  }catch(error){

    console.log(error)
    res.redirect('/error')

  }
}

const edit_address_view= async(req,res)=>{

  try{

    userStatus = await userActive(req.cookies.jwt, req.cookies.id);
    let cartWishlist= await cartAndWishlist(req.cookies.id)

    const address= await userCollection.aggregate([
      {$match:{"address._id":mongoose.Types.ObjectId(req.query.id)}},
      {$unwind:"$address"},
      {$match:{"address._id":mongoose.Types.ObjectId(req.query.id)}},
      {$project:{address:1}}
    ])  
  
     res.render('../views/User1/Profile/edit_address',{userStatus,cartWishlist,address})

  }catch(eror){

    console.log(eror)
    res.redirect('/error')

  }

}

const edit_address= async(req,res)=>{

  try{

    const address= req.body
    
  
    await userCollection.updateOne({_id:req.cookies.id, "address._id":address.id},
 {$set:{"address.$.name":req.body.name,"address.$.email":address.email,"address.$.mobile":address.mobile,"address.$.zip_code":address.zipcode,"address.$.address":address.address}} )
 res.redirect('/address')
   
  

  }catch(error){

    console.log(error)
    res.redirect('/error')

  } 
}
const delete_address= async(req,res)=>{

  try{

    const address_id=req.query.id
    await userCollection.updateOne({"address._id":address_id},{$pull:{address:{_id:address_id}}})
     
    console.log('address deleted ')
   res.redirect('back')
  }catch(err){

    console.log(err)
    res.redirect('/error')

  }
 
 

}

const profile_add_edit_checkout= async(req,res)=>{

  try{

    let address_id= req.query.id

    const user= await userCollection.aggregate([{$match:{_id:mongoose.Types.ObjectId(req.cookies.id)}},
                                              {$unwind:"$address"},
                                              {$match:{"address._id":mongoose.Types.ObjectId(address_id)}},
                                              // {$project:{address:1}}
    ])
   
   res.json({
    success:true,
    user:user,
    
   })
  }
  catch(err){

    console.log(err)
    res.redirect('/error')
  }


}

const order= async(req,res)=>{

  userStatus = await userActive(req.cookies.jwt,req.cookies.id);
  let cartWishlist= await cartAndWishlist(req.cookies.id)

  const orderData= await orderCollection.aggregate([
    {$match:{user:mongoose.Types.ObjectId(req.cookies.id)}},
    {$lookup:{from:'products',localField:"order_details.product",foreignField:"_id",as:"product"}},
    {$sort:{"placedDate":-1}}
  ])

  res.render('../views/User1/Profile/order.ejs',{orderData,cartWishlist,userStatus})

}

const single_order= async(req,res)=>{

  try{
    userStatus = await userActive(req.cookies.jwt,req.cookies.id);
  let cartWishlist= await cartAndWishlist(req.cookies.id)

  const orderData= await orderCollection.aggregate([
    {$match:{_id:mongoose.Types.ObjectId(req.query.id)}},
    {$lookup:{from:'products',localField:"order_details.product",foreignField:"_id",as:"product"}},
  ])

  res.render('../views/User1/Profile/single_order_view.ejs',{orderData,cartWishlist,userStatus})

  }catch(error){

    console.log(error);
    res.redirect('/error')
  }
}
const order_invoice= async(req,res)=>{

  try{
   console.log(req.query.id)
    const orderData= await orderCollection.aggregate([
      {$match:{_id:mongoose.Types.ObjectId(req.query.id)}},
      {$lookup:{from:'products',localField:"order_details.product",foreignField:"_id",as:"product"}},
    ])
  console.log(orderData[0].product.length);


    const data={

        orderData:orderData
    }
    let option={

        format:'A4',
        width:600,
        height:600
    }
    const filePath=path.resolve(__dirname,'../../views/User1/Profile/pdf_order.ejs')
    const htmlString=fs.readFileSync(filePath).toString()
    const ejsData= ejs.render(htmlString,data)

  
    pdf.create(ejsData,option).toFile('invoice.pdf',(err,file)=>{
        if(err){

            console.log(err);
        }else{

          console.log('success');
        }

      const filePath= path.resolve(__dirname,'../../invoice.pdf')
            fs.readFile(filePath,(err,file)=>{

                if(err){

                    console.log(err)
                }
                     
                     res.setHeader('Content-Type','application/pdf');
                     res.setHeader('Content-Disposition','attachement;filename="invoice.pdf"');
                     res.send(file)
                    console.log('pdf generated')
            

            })
        
    })

    

}catch(error){

    console.log(error);
    res.redirect('/error')
}

}

const passwordChangeView= async(req,res)=>{
try{
  userStatus = await userActive(req.cookies.jwt,req.cookies.id);
  let cartWishlist= await cartAndWishlist(req.cookies.id)

let msg=null
if(req.query.msg){
  msg=req.query.msg
}
  res.render('../views/User1/Profile/password_change',{userStatus,cartWishlist,msg})
}catch(error){

  console.log(error);
  res.redirect('/error')
}


}
const passwordChange= async(req,res)=>{

  let match=null
  const userExist= await userCollection.findOne({_id:req.body.id})
  if(userExist){
     
     match= await bcrypt.compare(req.body.current_pass,userExist.password);

  }

  if(match){

  if(req.body.pass===req.body.repass){
    const passwordHash = await bcrypt.hash(req.body.pass, 12);

    await userCollection.updateOne({_id:req.cookies.id},{$set:{password:passwordHash}})
    res.redirect('/change_password?msg=Password Changed Successfully')

  }else{

    res.redirect("/change_password?msg=Password not matched")
  }

}else{

  res.redirect("/change_password?msg=Incorret current password")

}

}
  module.exports={

    profile,
    profile_edit,
    address_view,
    add_address_view,
    address_add,
    edit_address_view,
    edit_address,
    delete_address,
    profile_add_edit_checkout,
    order,
    single_order,
    order_invoice,
    passwordChangeView,
    passwordChange
  }