const jwt=require('jsonwebtoken');
const User=require("../models/User")
const asyncHandler=require('./asyncHandler')

const protect=asyncHandler(async(req,res,next)=>{
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token=req.headers.authorization.split(' ')[1];
    }
    try{
        const decode=jwt.verify(token,process.env.JWT_SECRET);
        req.user=await User.findById(decode.id);

        if(!req.user){
            return res.status(401).json({
                success:false,
                error:'User beloging to this token is not longer exists'
            })
        }
        next()
    }
    catch(err){
        return res.status(401).json({
            success:false,
            error:"Not authorized to access this route"
        })
    }
})

module.exports={protect}