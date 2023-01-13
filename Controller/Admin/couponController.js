
const couponCollection=require('../../Model/couponModel')


const coupon_page= async(req,res)=>{

    try{

        let search=''
        let value=false
        if(req.query.search){

            search=req.query.search
            value=true
        }
       console.log(search)
        const coupon_list= await couponCollection.find({
  
            $or:[
                 {name:{ $regex:'^'+search+ '.*',$options:'i'}}
                ]

        })

        res.render('../views/Admin/coupons',{coupon_list,value})

    }catch(error){

        console.log(error)
    }

}

const add_coupon_view= (req,res)=>{

    try{
        let wrong=req.query.wrong
      


res.render('../views/Admin/add_coupon',{wrong})
    }catch(error){

        console.log(error)
    }
}

const add_coupon= async(req,res)=>{

    try{
        const coupon_name= req.body.name.toUpperCase()

        const couponExists= await couponCollection.findOne({name:coupon_name})
    
        if(couponExists){
    
             res.redirect('coupon_add?wrong=Coupon already exists')

        }
        else{

            const Coupon= new couponCollection({

                name:coupon_name,
                discount:req.body.discount,
                max_discount:req.body.max_discount,
                min_amount:req.body.min_amount,
                expiresIn:req.body.expire_date,
                startAt:req.body.start_date,
                capAmount:req.body.cap_amount
            })

            Coupon.save()
            res.redirect('/admin/coupon')
        }

    }catch(error){

        console.log(error)
    }
  

}

const edit_coupon_view= async(req,res)=>{


    const coupon_id= req.query.id
    const couponData=await couponCollection.findById({_id:coupon_id})
    res.render('../views/Admin/edit_coupon.ejs',{couponData})
}

const edit_coupon= async(req,res)=>{

    const coupon_id=req.body.id
    const coupon_name=req.body.name.toUpperCase()
    await couponCollection.findByIdAndUpdate({_id:coupon_id},{$set:{

        name:coupon_name,
        discount:req.body.discount,
        max_discount:req.body.max_discount,
        min_amount:req.body.min_amount,
        expiresIn:req.body.expire_date,
        capAmount:req.body.cap_amount
    }})

    res.redirect('coupon')

}

const block_unblock_coupon= async(req,res)=>{

   const coupon_id=req.query.id
   let coupon_status=true
   const coupon= await couponCollection.findById({_id:coupon_id})
   if(coupon.status===true){
    coupon_status=false
   }
   
   await couponCollection.findByIdAndUpdate({_id:coupon_id},{$set:{status:coupon_status}})
   res.redirect('coupon')
}

module.exports={

coupon_page,
add_coupon_view,
add_coupon,
edit_coupon_view,
edit_coupon,
block_unblock_coupon,


}