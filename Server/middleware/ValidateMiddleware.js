const express=require('express');

const validateProduct=(req,res,next)=>{
    const {title,price}=req.body;
    if(!title || typeof title!=='string' || title.trim()===''){
        return res.status(400).json({
            success:false,
            message:'Title is required and must be a non-empty string'
        })
    }
    if(!price || typeof price!=='number' || price<=0){
        return res.status(400).json({
            success:false,
            message:'Price is required and must be a positive number'
        })
    }
    next();

}

module.exports=validateProduct;