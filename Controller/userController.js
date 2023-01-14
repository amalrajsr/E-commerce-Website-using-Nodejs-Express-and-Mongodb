const userCollection = require("../Model/userModel");
const productCollection = require("../Model/produtModel");
const cartCollection=require("../Model/cartModel")
const wishlistCollection=require("../Model/wishlistModel")
const nodemailer = require("../Utilities/mail");
const bcrypt = require("bcrypt");
const jwt = require("../Utilities/jwt");
const mongoose=require('mongoose')


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


//----------------WHY US PAGE----------------

const why_us=async (req,res)=>{
try{

  userStatus = await userActive(req.cookies.jwt, req.cookies.id);

  res.render('../views/User/why.ejs',{userStatus})


}catch(eror){

  console.log(eror);
  res.redirect('/error')
}
}

//-------------------------------User Login and verfication section-----------------------------------------------
// Landing page
const landPage = async (req, res) => {
  try {
    const productData = await productCollection.find({
      $and: [{ flag: "New" }, { isDeleted: false }],
    });

    userStatus = await userActive(req.cookies.jwt, req.cookies.id);

    res.render("../views/User/index.ejs", { productData, userStatus });
  } catch (error) {
    console.log(error);
    res.redirect('/error')
  }
}

const landPage1 = async (req, res) => {
  try {
    const productData = await productCollection.find({
      $and: [{ flag: "New" }, { isDeleted: false }],
    });

    userStatus = await userActive(req.cookies.jwt, req.cookies.id);
    let cartWishlist=await cartAndWishlist(req.cookies.id)
    res.render("../views/User1/index.ejs", { productData, userStatus,cartWishlist });
  } catch (error) {
    console.log(error);
    res.redirect('/error')
  }
};



// Login page view
const loginView = (req, res) => {

  res.render("../views/User1/Login/login.ejs", req.query);
};


const login = async (req, res) => {
  try {
    const email = req.body.email;
    let userExist = await userCollection.findOne({ email: email });
   
    if (userExist) {
      const match = await bcrypt.compare(req.body.password, userExist.password);

      if (match) {
        if (userExist.isBlocked == true) {
          res.render("../views/User1/Login//login.ejs",{wrong:"Your Account has been blocked",});
         
        } else {
          const token = jwt.createToken(userExist._id);
          res.cookie("jwt", token, { httpOnly: true });
          res.cookie("id", userExist._id, { httpOnly: true });
          res.redirect("/");

        }
      } else {
        res.render("../views/User1/Login//login.ejs", {wrong: "wrong email id or password", });
        console.log('Wrong password')

      }
    } else {
      res.render("../views/User1/Login//login.ejs", { wrong: "user not found" });
    }
  } catch (eror) {
    console.log(eror);
    res.redirect('/error')
  }
};



// for viewing signup page
const registerView = (req, res) => {
  res.render("../views/User1/Login/signup.ejs");
};

const register = async (req, res) => {
  try {
    req.session.userData = req.body;
    res.cookie('user_mail',req.body.email,{httpOnly:true})
    let email = req.body.email;
    let userExist = await userCollection.findOne({ email });

    if (userExist) {
      res.render("../views/User1/Login/signup", { message: "Email already exists" });
    } else if (req.body.password != req.body.re_password) {
      res.render("../views/User1/Login/signup", { message: "Password not matched" });
    } else {
     let otp=`${Math.floor(1000+Math.random()*9000)}`
      const mailOptions = {
        from: process.env.AUTH_USER,
        to: email,
        subject: "OTP verification",
        html: ` <p> OTP: <b> ${otp} </b></p>`,
      };
    nodemailer.transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          console.log("OTP send");
          console.log(otp);
          res.redirect("/otp");
        }
      });
      req.session.otp=otp

      setTimeout(function(){
        req.session.destroy()
      },300000)

    //Saving OTP to Database
    // const userOtp= await new otpCollection({

    //   user_email:email,
    //   otp:nodemailer.MAIL_SETTINGS.otp,
    //   createdAt:Date.now(),
    //   expiresAt:Date.now()+60000,
    // })

    // userOtp.save()
    
    }
  } catch (error) {
    console.log(error);
  }
};

const otpPageView = (req, res) => {
  try {

    let wrong=req.query.wrong
    res.render("../views/user1/Login/otp",{wrong});
  } catch (error) {
    console.log(error);
    res.redirect('/error')
  }
};

const otpVerify = async (req, res) => {
  try {
    userOTP = req.body.otp;
    userData=req.session.userData
   
    if(req.session.otp==false){
      res.redirect("otp?wrong=OTP Expired");
    }
    else if(req.session.otp!=userOTP){

      res.redirect("otp?wrong=OTP Invalid");

    }
    else{
      const passwordHash = await bcrypt.hash(userData.password, 12);
      const user = new userCollection({
        name: userData.name,
        email: userData.email,
        password: passwordHash,
      });
      await user.save();
  res.redirect("/login?msg=Successfully Registered Please login");
    }

  //   const otp= await otpCollection.findOne({email:req.cookies.user_mail})
  //   console.log(req.session.otp)
  //   res.cookie('user_mail','',{maxAge:"1",httpOnly:true})
  //   if (nodemailer.MAIL_SETTINGS.otp === userOTP && Date.now() < otp.expiresAt) {
  //     res.redirect("/login?msg=Successfully Registered Please login");
  //     const passwordHash = await bcrypt.hash(userData.password, 12);
  //     const user = new userCollection({
  //       name: userData.name,
  //       email: userData.email,
  //       password: passwordHash,
  //     });
  //     await user.save();

  //  //await otpCollection.deleteOne({user_email:userData.email})

  //   } else if(Date.now()>otp.expiresAt) {
  //     await otpCollection.deleteOne({user_email:userData.email})
  //     res.render("../views/user/otp", { wrong: "OTP Expired" });
  //   }else{
  //     res.render("../views/user/otp", { wrong: "Invalid OTP" });
  //   }
  
  } catch (error) {
    
    console.log(error);
    res.redirect('otp?wrong=OTP Expired')
  }
};

async function resend_otp(req,res){


  try{

    console.log(req.session.userData)

  

    let otp=Math.floor(1000+Math.random()*9000)
     const mailOptions = {
       from: process.env.AUTH_USER,
       to: req.cookies.user_mail,
       subject: "OTP verification",
       html: ` <p> OTP: <b> ${otp} </b></p>`,
     };
   nodemailer.transporter.sendMail(mailOptions, (error, info) => {
       if (error) {
         console.log(error);
       } else {
         console.log(" Reset OTP send");
         console.log(otp);
         res.redirect("/otp");
       }
     });
     req.session.otp=otp
   console.log('req.session '+req.session.otp)
     setTimeout(function(){
       req.session.otp=false
     },60000)


  }catch(error){

    console.log(error);
    res.redirect('/error')
  }


}
//-------------------------------User Login and verfication section Ends-----------------------------------------------

//--------------------------------Const forgot password Section-------------------------------------------------

const forgot_pass_email_view = (req, res) => {
  try {
    res.render("../views/user1/Login/forgot_pass_email");
  } catch (error) {
    console.log(error);
    res.redirect('/error')

  }
};

const forgot_pass_email = async (req, res) => {
  try {
    email = req.body.email;
    userEmail = await userCollection.findOne({ email });
   
    if(userEmail){
      res.cookie("user_id", userEmail._id, {
        httpOnly: true,
      });
    }
   
    if (userEmail) {
      const mailOptions = {
        from: process.env.AUTH_USER,
        to: email,
        subject: "OTP Verification",
        html: `<p>Reset Password OTP:<b>${nodemailer.MAIL_SETTINGS.otp}<b><p>`,
      };
      nodemailer.transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
          
          res.redirect("reset");
        } else {
          console.log("Reset Password otp send successfully");
          console.log(nodemailer.MAIL_SETTINGS.otp)
          res.redirect("reset/otp");
        }
      });
    } else {
      res.redirect("reset/otp");
    }
  } catch (error) {
    console.log(error);
    res.redirect('/error')

  }
};

const forgot_pass_otp_view = (req, res) => {
  try {
    const wrong = req.query.wrong;
    res.render("../views/user1/Login/forgot_pass_otp", {
      message: "OTP has been send to your email",
      wrong,
    });
  } catch (error) {
    console.log(error);
    res.redirect('/error')

  }
};

const forgot_pass_otp = (req, res) => {
  try {
    console.log(req.body.otp);
    if (nodemailer.MAIL_SETTINGS.otp === req.body.otp) {
      res.redirect("/reset/password");
    } else {
      res.redirect("/reset/otp?wrong=Invalid OTP");
    }
  } catch (error) {
    console.log(error);
    res.redirect('/error')

  }
};

const forgot_pass_password_view = (req, res) => {
  try {

    let wrong=req.query.wrong
    res.render("../views/User1/Login/forgot_pass_password",{wrong});
  } catch (error) {
    console.log(error);
    res.redirect('/error')

  }
};

const forgot_pass_password = async (req, res) => {
  try {
  
    if (req.body.password === req.body.re_password) {
      userId = req.cookies.user_id;
      const passwordHash = await bcrypt.hash(req.body.password, 12);

     await userCollection.findByIdAndUpdate(
        { _id: userId },
        { $set: { password: passwordHash } }
      );
      console.log('password changed')
      res.cookie('user_id','',{ maxAge : "1"})
      res.redirect("/login?msg=Successfully Changed Password");
    }else{
            console.log(3+'else');
        res.redirect('/reset/password?wrong=password not matched')
    }
  } catch (error) {
    console.log(error);
    console.log(1);
    res.redirect('/error')
  }
};
//-------------------------------User Product Section section---------------------------------------------------------





const single_product = async (req, res) => {

  try{

    userStatus = await userActive(req.cookies.jwt, req.cookies.id);
    let cartWishlist=await cartAndWishlist(req.cookies.id)

    let itemExist=false, itemInWishlist=false
    const itemExistsInCart= await cartCollection.find({$and:[{"cart_items.product":req.query.id},{user:req.cookies.id}]})
    const itemExistsInWishlist= await wishlistCollection.find({$and:[{"productList.product":req.query.id},{user:req.cookies.id}]})
    if(itemExistsInCart.length>0){
      itemExist=true
    }
    if(itemExistsInWishlist.length>0){
     itemInWishlist=true

    }
    const productData = await productCollection.aggregate([
  
      {$match:{_id: mongoose.Types.ObjectId(req.query.id)}},
      {$lookup:{from:"categories",localField:"category",foreignField:"_id",as:"category"}},
  
  ])   
  
  
  
    res.render("../views/User1/single_product.ejs", {
      userStatus,
      productData,
      itemExist,
      itemInWishlist,
      cartWishlist
    });

  }catch(error){
    console.log(error)
    res.redirect('/error')

  }

  
};

// --------------------------------------------------------User Product Section ends------------------------------------------

const error= async(req,res)=>{
  try{

    userStatus = await userActive(req.cookies.jwt, req.cookies.id);
    let cartWishlist=await cartAndWishlist(req.cookies.id)


     

    res.render('../views/User1/error',{userStatus,cartWishlist})
  }catch(error){

    console.log(error)
  }
}

const page_not_found= async(req,res)=>{

try{
  let userStatus = await userActive(req.cookies.jwt, req.cookies.id);
  let cartWishlist=await cartAndWishlist(req.cookies.id)


  res.render('../views/User1/404.ejs',{userStatus,cartWishlist})
}catch(err){

  console.log(err)

}
}

const logout = (req, res) => {
  res.cookie("jwt", "", { maxAge: "1" });
  res.cookie("id", "", { maxAge: "1" });
  
  res.redirect("/");
};

module.exports = {
  why_us,
  landPage,
  landPage1,
  loginView,
  login,
  registerView,
  register,
  otpPageView,
  otpVerify,
  resend_otp,
  single_product,
  forgot_pass_email_view,
  forgot_pass_email,
  forgot_pass_otp_view,
  forgot_pass_otp,
  forgot_pass_password_view,
  forgot_pass_password,
  logout,
  error,
  page_not_found
};
