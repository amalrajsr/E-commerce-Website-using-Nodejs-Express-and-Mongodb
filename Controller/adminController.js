const adminCollection = require('../Model/adminModel')
const userCollection = require('../Model/userModel')
const categoryCollection = require('../Model/categoryModel')
const productCollection = require('../Model/produtModel')
 const orderCollection=require('../Model/orderModel')
const jwt= require('../Utilities/jwt')
const mongoose=require('mongoose')
const exceljs= require('exceljs')
// const sharp=require('sharp')
// html to pdf dependencies
const ejs= require('ejs')
const pdf=require('html-pdf')
const fs= require('fs')
const path=require('path')
const http = require('http');
const { off } = require('process')

//------------------------------------------------------ADMIN HOME PAGE-------------------------------------------

const adminLoginView = async (req, res) => {

    res.render('../views/Admin/adminLogin.ejs')
}

const adminVerification = async (req, res) => {
    try {
        let name = req.body.name
        const adminCheck = await adminCollection.findOne({ name })
        if (adminCheck) {
            if (req.body.password === adminCheck.password) {
                const token=jwt.createToken(adminCheck._id)
                res.cookie('jwt_ad',token,{httpOnly:true}) // Creating jwt

                res.redirect('/admin/dashboard')


            } else {
                res.render('../views/Admin/adminLogin.ejs', { wrong: 'wrong username or password' })

            }
        }
        else {
            res.render('../views/Admin/adminLogin.ejs', { wrong: 'wrong username or password' })

        }
    } catch (error) {
        console.log(error)
    }


}

const adminHome =async (req, res) => {

    try {
        const order= await orderCollection.find({status:'delivered'})
        const user= await userCollection.find()
        const total_price=await orderCollection.aggregate([{$match:{status:"delivered"}},{$group:{_id:null,total:{$sum:'$total_price'}}}])
            
 
       const  orderPending= await orderCollection.find({status:'pending'}).count()
       const   orderShipped= await orderCollection.find({status:'shipped'}).count()
       const  orderOutForDelivery= await orderCollection.find({status:'Out for delivery'}).count()
       const  orderDelivered= await orderCollection.find({status:'delivered'}).count()
       const  orderCancelled= await orderCollection.find({status:'cancelled'}).count()

       let month=[],barchartData,j=0
       for(i=1;i<=12;i++){
      
        barchartData= await orderCollection.aggregate([{$project:{total_price:1,DeliveredDate:{$month:'$DeliveredDate'}}},
                                                       {$match:{DeliveredDate:i}},{$group:{_id:{sum:{$sum:"$total_price"}}}}])
        month[j]=0
         barchartData.forEach(function(bar){
         month[j]=month[j]+bar._id.sum
        })
         j++
        }
 

                             

        res.render('../views/Admin/dashboard.ejs',{order,user,total_price,orderCancelled,orderDelivered,orderOutForDelivery,orderShipped,orderPending,month})

    } catch (error) {
        console.log(error)
    }
}

const sort_sales_report_download= async(req,res)=>{

    console.log(req.body);


}

async function reportPdfDownload(req,res){

    try{
        const total_price=await orderCollection.aggregate([{$match:{status:"delivered"}},{$group:{_id:null,total:{$sum:'$total_price'}}}])
        
        const productData= await orderCollection.aggregate([
            {$match:{status:"delivered"}},
            {$lookup:{from:'products',localField:"order_details.product",foreignField:"_id",as:"order_details.product"}},
            {$lookup:{from:'users',localField:"user",foreignField:"_id",as:"user"}},
            {$unwind:"$user"}])

        const data={

            productData:productData,
            total_price:total_price
        }
        let option={

            format:'A4'
        }
        const filePath= path.resolve(__dirname,'../views/Admin/sales_report_pdf.ejs')
        const htmlString=fs.readFileSync(filePath).toString()
        const ejsData= ejs.render(htmlString,data)

      
        pdf.create(ejsData,option).toFile('sales_report.pdf',(err,file)=>{
            if(err){

                console.log(err);
            }

          const filePath= path.resolve(__dirname,'../sales_report.pdf')
                fs.readFile(filePath,(err,file)=>{

                    if(err){

                        console.log(err)
                    }
                         
                         res.setHeader('Content-Type','application/pdf');
                         res.setHeader('Content-Disposition','attachement;filename="sales_report.pdf"');
                         res.send(file)
                        console.log('pdf generated')
                

                })
            
        })
  
        

    }catch(error){

        console.log(error);
    }

}

const reportXlDownload= async(req,res)=>{

    try{

        const total_price=await orderCollection.aggregate([{$match:{status:"delivered"}},{$group:{_id:null,total:{$sum:'$total_price'}}}])


         orderData= await orderCollection.aggregate([
            {$match:{status:"delivered"}},
            {$lookup:{from:'products',localField:"order_details.product",foreignField:"_id",as:"order_details.product"}},
            {$lookup:{from:'users',localField:"user",foreignField:"_id",as:"user"}},
            {$unwind:"$user"}])
            let counter=1
        
            const workbook= new exceljs.Workbook()
            const worksheet= workbook.addWorksheet("Sales report")
       
            worksheet.columns=[
                {header:"S_no",key:"s_no"},
                {header:"Date",key:"placedDate",width:20},
                {header:"Name",key:"user",width:20}, 
                {header:"Quantity",key:"quantity",width:20},            
                {header:"Payment",key:"payment_type",width:20},
                {header:"Applied Coupon",key:"couponApplied", width:30},
                {header:"Total Price",key:"total_price",width:20},
                // {header:"Grand Total",key:"grant_total",width:35},

                


             ]

             orderData.forEach(function(order){
                 
                let date= order.placedDate
                let isoString = date.toISOString()
                let newDate = isoString.split('T')[0]
                order.s_no=counter
                order.user=order.user.name
                order.placedDate=newDate
                order.quantity=order.order_details.product.length
                worksheet.addRow(order)
                counter++
             })
 
             worksheet.getRow(1).eachCell((cell)=>{
                cell.font={bold:true}
             })

             res.setHeader(
                "Content-Type",
                "applicaton/vnd.openxmformats-officedocument.spreadsheatml.sheet"
             )
             res.setHeader(
                "Content-Disposition","attachment;filename=sales_report.xlsx"
             )
             return workbook.xlsx.write(res).then(()=>{

                res.status(200)
             })

    }catch(error){

        console.log(error)
    }
}


const reportCsvDownload= async(req,res)=>{

    try{
         orderData= await orderCollection.aggregate([
            {$match:{status:"delivered"}},
            {$lookup:{from:'products',localField:"order_details.product",foreignField:"_id",as:"order_details.product"}},
            {$lookup:{from:'users',localField:"user",foreignField:"_id",as:"user"}},
            {$unwind:"$user"}])
           
           

            let counter=1
        
            const workbook= new exceljs.Workbook()
            const worksheet= workbook.addWorksheet("Sales report")
             worksheet.columns=[
                {header:"S_no",key:"s_no"},
                {header:"Date",key:"placedDate"},
                {header:"Name",key:"user"}, 
                {header:"Quantity",key:"quantity"},            
                {header:"Payment",key:"payment_type"},
                {header:"Applied Coupon",key:"couponApplied", width:50},
                {header:"Total Price",key:"total_price"}


             ]

             orderData.forEach(function(order){

                order.s_no=counter
                order.user=order.user.name
                order.quantity=order.order_details.product.length
                worksheet.addRow(order)
                counter++
             })

             worksheet.getRow(1).eachCell((cell)=>{
                cell.font={bold:true}
             })

             res.setHeader(
                "Content-Type",
                "applicaton/vnd.openxmformats-officedocument.spreadsheatml.sheet"
             )
             res.setHeader(
                "Content-Disposition","attachment;filename=sales_report.csv"
             )
             return workbook.csv.write(res).then(()=>{

                res.status(200)
             })

    }catch(error){

        console.log(error)
    }
}

// ----------------------------------------------------USER MANAGEMENT--------------------------------------------------------


const getUser = async (req, res) => {
    try {
        let search = ''
        let value = false
        if (req.query.search) {
            search = req.query.search
            value = true
        }

        const userList = await userCollection.find({

            $or: [
                { name: { $regex: '^' + search + '.*', $options: 'i' } },
                { email: { $regex: '^' + search + '.*', $options: 'i' } }
            ]
        })
        res.render('../views/Admin/users.ejs', { userData: userList, value })

    } catch (error) {
        console.log(error)
    }
}

const block_And_Unlbock_User = async (req, res) => {

    try {
        let userId = req.query.id
        let status = true

        let userStatus = await userCollection.findById({ _id: userId })
        if (userStatus.isBlocked === true) {
            status = false
        }

        await userCollection.findByIdAndUpdate({ _id: userId }, { $set: { isBlocked: status } })
        res.redirect('user')
    } catch (error) {
        console.log(error)
    }

}

//------------------------------------------------------USER MANAGEMENT ENDS----------------------------------------------


//------------------------------------------------------CATEGORY MANAGEMENT-------------------------------------------------

const categoryView = async (req, res) => {

    let search = ''
    let value = false
    if (req.query.search) {
        search = req.query.search
        value = true
    }
    const categoryData = await categoryCollection.find({

        $or: [
            { category_name: { $regex: '^' + search + '.*', $options: 'i' } },
        ]
    })
    res.render('../views/Admin/category.ejs', { categoryData, value })

}

const add_category_View = (req, res) => {

    res.render('../views/Admin/addCategory.ejs')
}

const addCategory = async (req, res) => {


    try {
        let category_Upper = req.body.category.toUpperCase()
        const categoryExists = await categoryCollection.findOne({ category_name: category_Upper })


        if (!categoryExists) {
            const category = new categoryCollection({

                category_name: category_Upper,
                // image: req.file.filename
            })

            category.save()
            res.redirect('category')
        }
        else {
            res.render('../views/Admin/addCategory.ejs', { wrong: 'Category Already Exists' })
        }

    } catch (error) {
        console.log(error)
    }


}

const block_And_Unlbock_Category = async (req, res) => {

    try {

        let status
        const category_id = req.query.id
        const categoryData = await categoryCollection.findById({ _id: category_id })

        if (categoryData.isBlocked === true) {
            status = false
        }
        else {
            status = true
        }
        await categoryCollection.findByIdAndUpdate({ _id: category_id }, { $set: { isBlocked: status } })

        res.redirect('category')
    } catch (error) {
        console.log(error)
    }

}

const edit_Category_View = async (req, res) => {
    try {
        let category_id = req.query.id
        const category = await categoryCollection.findById({ _id: category_id })
        res.render('../Views/Admin/editCategory', { category: category })
    } catch (error) {
        console.log(error)
    }




}

const edit_Category = async (req, res) => {

    try {

        
        const category_Name= req.body.category.toUpperCase()
        const category = await categoryCollection.findOne({ category_name: category_Name })

        if (category) {
            res.render('../Views/Admin/editCategory', { wrong: 'Category Already Exist', category })
        }
        else {
            await categoryCollection.findByIdAndUpdate({ _id: req.body.id }, { $set: { category_name: category_Name } })
            res.redirect('category')
        }

    } catch (error) {
        console.log(error)
    }


}

//---------------------------------------------------Category Management Ends------------------------------------------



//-----------------------------------------------------Product Management Begins---------------------------------------

const productHome = async (req, res) => {

   
    try{
       
   
       
         const productData = await productCollection.aggregate([
            {$match:{isDeleted:false}},
            {$lookup:{from:"categories",localField:"category",foreignField:"_id",as:"category"}},
           {$project:{name:"$name",author:"$author",image:"$image",category:"$category.category_name",stock:"$stock",price:"$product_price",status:"$status",flag:"$flag"}}
        
        ])
             
           

        
    
       res.render('../views/Admin/product.ejs', { productData })

    }catch(error){
        console.log(error)
    }

 
}

const add_prodcut_view = async (req, res) => {

    try {


        const categoryData = await categoryCollection.find({ isBlocked: false })
        res.render('../views/Admin/add_product.ejs',{ categoryData })

    } catch (error) {

        console.log(error)
    }

}

const add_prodcut = async (req, res) => {

    try {


        
        
        const categoryData = await categoryCollection.find({ isBlocked: false })
        const nameCheck = req.body.name.toUpperCase()
        const productExists = await productCollection.findOne({ name:nameCheck })
        const category=await categoryCollection.findOne({category_name:req.body.category})



        const productDetail = {
            name:nameCheck,
            author: req.body.author,
            image: req.file.filename,
            category:category._id,
            stock: req.body.stock,
            product_price: req.body.product_price,
            status: req.body.status,
            flag: req.body.flag,
            description: req.body.description
        }

        if (productExists==null) {
            const product = new productCollection((productDetail))
             product.save()
            res.redirect('product')
        }
        else {

            res.render('../views/Admin/add_product.ejs', { wrong: 'Product name Alreday Exist', categoryData })

        }
    } catch (error) {

        console.log(error)
    }
}

const edit_product_view = async (req, res) => {


    try {

        let product_id=req.query.id
        let categoryData = await categoryCollection.find({ isBlocked: false })
    //    let productData = await productCollection.findById({ _id: product_id})


     const productData = await productCollection.aggregate([

        {$match:{_id: mongoose.Types.ObjectId(product_id)}},
        {$lookup:{from:"categories",localField:"category",foreignField:"_id",as:"category"}},
       
    ])



        let wrong=req.query.wrong
        res.render('../views/Admin/editProduct.ejs', { categoryData,productData,wrong })



    } catch (error) {

        console.log(error)
    }

}

const edit_product = async (req, res) => {

    try {

        
        const category= await categoryCollection.findOne({category_name:req.body.category})
        const productName=req.body.name.toUpperCase()  
   
     
         
        if( typeof(req.file)==='undefined'){

            await productCollection.findByIdAndUpdate({ _id:req.body.id }, { $set: { 

                name:productName,
                author: req.body.author,
                category:category._id,
                stock: req.body.stock,
                product_price: req.body.product_price,
                status: req.body.status,
                flag: req.body.flag,
                description: req.body.description } })          
    
            res.redirect('product')  

        }else{

            await productCollection.findByIdAndUpdate({ _id:req.body.id }, { $set: { 

                name:productName,
                author: req.body.author,
                 image:req.file.filename,
                category:category._id,
                stock: req.body.stock,
                product_price: req.body.product_price,
                status: req.body.status,
                flag: req.body.flag,
                description: req.body.description } })          
    
            res.redirect('product')  

        }


        
    } catch (error) {

        console.log(error)
    }
}

const delete_product = async (req, res) => {

    try {

        await productCollection.findByIdAndUpdate({ _id: req.query.id },{$set:{isDeleted:true}})
        res.redirect('product?delete=true')

    } catch (error) {

        console.log(error)
    }
}

//-------------------------------------Product Management Error-------------------------------------------------------

//----------------------------------------------Admin Dashboard-------------------------------------------------------



const adminLogout = (req, res) => {
    try {

        res.cookie('jwt_ad','',{ maxAge: 1 })
        res.redirect('/admin')
    } catch (error) {
        console.log(error)
    }
}
module.exports = {
    adminLoginView,
    adminVerification,
    adminHome,
    sort_sales_report_download,
    reportPdfDownload,
    reportXlDownload,
    reportCsvDownload,
    getUser,
    block_And_Unlbock_User,
    categoryView,
    add_category_View,
    addCategory,
    block_And_Unlbock_Category,
    edit_Category_View,
    edit_Category,
    productHome,
    add_prodcut_view,
    add_prodcut,
    edit_product_view,
    edit_product,
    delete_product,
    adminLogout
}