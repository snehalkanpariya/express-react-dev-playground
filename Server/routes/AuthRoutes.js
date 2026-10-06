const express=require("express");
const router=express.Router();
const { registerUser,loginUser,getMe}=require('../controller/AuthController');
const {protect}=require("../middleware/AuthMiddleware")

router.post('/register',registerUser);
router.post('/login',loginUser)
router.get('/getme',protect,getMe)
module.exports=router;
