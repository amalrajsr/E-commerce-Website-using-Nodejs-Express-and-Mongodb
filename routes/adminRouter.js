const express=require('express')
const admin_route=express()
const adminController=require('../Controller/adminController')
const couponController=require('../Controller/Admin/couponController')
const orderController=require('../Controller/Admin/orderController')
 const uploadFile = require('../Middleware/file_upload')
 const uploadProduct=require('../Middleware/productUpload')
 const requireAuth=require('../Middleware/Auth/Auth')



// Admin Login ,Logout and Verification
admin_route.get('/',requireAuth.isActive,adminController.adminLoginView)
admin_route.post('/',adminController.adminVerification)
admin_route.get('/dashboard',requireAuth.isLogin,adminController.adminHome).post('/dashboard',requireAuth.isLogin,adminController.adminHome)
admin_route.get('/logout',adminController.adminLogout)

//Admin User Management
admin_route.get('/user',requireAuth.isLogin,adminController.getUser)
admin_route.get('/block_user',requireAuth.isLogin,adminController.block_And_Unlbock_User)


//Admin Category Management
admin_route.get('/category',requireAuth.isLogin,adminController.categoryView)
admin_route.get('/add_category',requireAuth.isLogin,adminController.add_category_View)
admin_route.post('/add_category',requireAuth.isLogin,adminController.addCategory)
admin_route.get('/block_category',requireAuth.isLogin,adminController.block_And_Unlbock_Category)
admin_route.get('/edit_Category',requireAuth.isLogin,adminController.edit_Category_View)
admin_route.post('/edit_Category',requireAuth.isLogin,adminController.edit_Category)

// Admin Product Mangement
admin_route.get('/product',requireAuth.isLogin,adminController.productHome)
admin_route.get('/add_product',requireAuth.isLogin,adminController.add_prodcut_view)
admin_route.post('/add_product',requireAuth.isLogin,uploadProduct.single('image'),adminController.add_prodcut)
admin_route.get('/edit_product',requireAuth.isLogin,adminController.edit_product_view)
admin_route.post('/edit_product',requireAuth.isLogin,uploadProduct.single('image'),adminController.edit_product)
admin_route.get('/delete_product',requireAuth.isLogin,adminController.delete_product)

//Admin Dashboard manangement
admin_route.get('/sales_report_pdf',requireAuth.isLogin,adminController.reportPdfDownload)
admin_route.get('/sales_report_xl',requireAuth.isLogin,adminController.reportXlDownload)
admin_route.get('/sales_report_csv',requireAuth.isLogin,adminController.reportCsvDownload)
admin_route.post('/sort_sales_report',requireAuth.isLogin,adminController.sort_sales_report_download)


//Admin Coupon Management
admin_route.get('/coupon',requireAuth.isLogin,couponController.coupon_page)
admin_route.get('/coupon_add',requireAuth.isLogin,couponController.add_coupon_view)
admin_route.post('/coupon_add',requireAuth.isLogin,couponController.add_coupon)
admin_route.get('/coupon_edit',requireAuth.isLogin,couponController.edit_coupon_view)
admin_route.post('/coupon_edit',requireAuth.isLogin,couponController.edit_coupon)
admin_route.get('/coupon_block',requireAuth.isLogin,couponController.block_unblock_coupon)


//Admin Order Management
admin_route.get('/order',requireAuth.isLogin,orderController.order_page)
admin_route.post('/order',requireAuth.isLogin,orderController.order_status_edit)

module.exports=admin_route