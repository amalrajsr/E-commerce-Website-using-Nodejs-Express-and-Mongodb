
const orderCollection=require('../../Model/orderModel')


const order_page= async(req,res)=>{

    try{
  
  const orderData= await orderCollection.find({},{_id:1})
  
 

 const productData= await orderCollection.aggregate([
                                      
                                       {$lookup:{from:'products',localField:"order_details.product",foreignField:"_id",as:"product"}},
                                       {$lookup:{from:'users',localField:"user",foreignField:"_id",as:"user"}},
                                       {$unwind:"$user"},
                                       {$sort:{"placedDate":-1}}
                                      ])
                                      
  res.render('../views/Admin/order',{orderData,productData})
     
    }catch(error){

        console.log(error)
    }
}

const order_status_edit= async(req,res)=>{

  
   let status=req.body.status
 await orderCollection.updateOne({_id:req.body.id},{$set:{status:status}})
 if(status=='delivered'){

  await orderCollection.updateOne({_id:req.body.id},{DeliveredDate:Date.now()})
 }
 res.json({
  success:true,
  status:status
 })
}
module.exports={

    order_page,
    order_status_edit
}