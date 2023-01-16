const express=require('express')
const user_router=express()
const userController=require('../Controller/userController')
const productController=require('../Controller/User/shopController')
const cartController=require('../Controller/User/cartController')
const wishlistController=require('../Controller/User/wishistController')
const profileController=require('../Controller/User/profileController')
const orderController=require('../Controller/User/orderController')
const couponController=require('../Controller/User/couponController')
const paymentController=require('../Controller/User/paymentController')
const Auth=require('../Middleware/Auth/Auth')
const block=require('../Middleware/Auth/blocked')

user_router.get('/',block.isBlocked,userController.landPage1)
user_router.get('/why_us',userController.why_us)

// Auth Section
user_router.get('/login',Auth.userActive,userController.loginView)
user_router.post('/login',Auth.userActive,userController.login)
user_router.get('/signup',Auth.userActive,userController.registerView)
user_router.post('/signup',userController.register)
user_router.get('/otp',Auth.userActive,userController.otpPageView)
user_router.post('/verify_otp',userController.otpVerify)
user_router.post('/resend_otp',userController.resend_otp)
user_router.get('/logout',userController.logout)

// Forgot Password Section
user_router.get('/reset',userController.forgot_pass_email_view)
user_router.post('/reset',userController.forgot_pass_email)
user_router.get('/reset/otp',userController.forgot_pass_otp_view)
user_router.post('/reset/otp',userController.forgot_pass_otp)
user_router.get('/reset/password',userController.forgot_pass_password_view)
user_router.post('/reset/password',userController.forgot_pass_password)

//  Product Section

user_router.get('/product_view',userController.single_product)
user_router.get('/products',block.isBlocked,productController.product_page)


// Profile Section
user_router.get('/profile',Auth.isUserLogin,block.isBlocked,profileController.profile)
user_router.post('/edit_profile',Auth.isUserLogin,block.isBlocked,profileController.profile_edit)
user_router.get('/address',block.isBlocked,Auth.isUserLogin,profileController.address_view)
user_router.get('/add_address',block.isBlocked,Auth.isUserLogin,profileController.add_address_view)
user_router.post('/address',block.isBlocked,Auth.isUserLogin,profileController.address_add)
user_router.get('/edit_address',block.isBlocked,Auth.isUserLogin,profileController.edit_address_view)
user_router.post('/edit_address',block.isBlocked,Auth.isUserLogin,profileController.edit_address)
user_router.get('/change_address',block.isBlocked,Auth.isUserLogin,profileController.profile_add_edit_checkout)

user_router.get('/order',block.isBlocked,Auth.isUserLogin,profileController.order)
user_router.get('/order_invoice',Auth.isUserLogin,block.isBlocked,profileController.order_invoice)
user_router.get('/order_detail',Auth.isUserLogin,block.isBlocked,profileController.single_order)

user_router.get('/change_password',Auth.isUserLogin,block.isBlocked,profileController.passwordChangeView)
user_router.post('/change_password',Auth.isUserLogin,block.isBlocked,profileController.passwordChange)
user_router.get('/delete_address',block.isBlocked,Auth.isUserLogin,profileController.delete_address)

// Cart Section
user_router.get('/cart',Auth.isUserLogin,block.isBlocked,cartController.cart_view)
user_router.post('/cart',Auth.isUserLogin,block.isBlocked,cartController.cart)
user_router.post('/update_cart',Auth.isUserLogin,block.isBlocked,cartController.update_cart_item)
user_router.get('/delete_item',Auth.isUserLogin,block.isBlocked,cartController.cart_item_delete)




//Wishlist Section
user_router.get('/wishlist',Auth.isUserLogin,block.isBlocked,wishlistController.view_wishlist)
user_router.post('/wishlist',Auth.isUserLogin,block.isBlocked,wishlistController.add_to_wishlist)
user_router.get('/wishlist_delete_item',Auth.isUserLogin,block.isBlocked,wishlistController.delete_wishlist_item)

//Order Section
user_router.get('/checkout',Auth.isUserLogin,block.isBlocked,orderController.checkoutPage)
user_router.get('/order_cancel',Auth.isUserLogin,block.isBlocked,orderController.orderCancel)
//Coupon Section

user_router.post('/coupon',Auth.isUserLogin,block.isBlocked,couponController.coupon)

//Payment Section
 user_router.post('/pay',Auth.isUserLogin,block.isBlocked,paymentController.payment)
//user_router.post('/pay',Auth.isUserLogin,block.isBlocked,paymentController.test)
user_router.get('/success',Auth.isUserLogin,block.isBlocked,paymentController.successPage)
user_router.get('/failure',Auth.isUserLogin,block.isBlocked,paymentController.failure)




user_router.get('/error',userController.error)
user_router.get('/404',userController.page_not_found)
module.exports=user_router