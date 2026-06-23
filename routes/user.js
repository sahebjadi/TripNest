const express = require("express");
const router=express.Router({mergeParams:true});
const User=require("../models/user.js")
const wrapAsync=require("../utils/wrapAsync");
const passport=require("passport");
const {saveRedirectUrl}=require("../middleware.js");

const userController=require("../controller/users.js");

router.route("/signup")
.get(userController.renderSignupForm)
.post(wrapAsync(userController.signup));

router.route("/login")
.get((req,res,next)=>{
    if(req.query.redirect){
        req.session.redirectUrl = req.query.redirect;
    }
    next();
}, userController.renderLoginForm)
.post(
  saveRedirectUrl,
  passport.authenticate("local",{
    failureRedirect:"/login",
    failureFlash:true
  }),
  userController.login
);

router.get("/logout",userController.logout);

module.exports=router;