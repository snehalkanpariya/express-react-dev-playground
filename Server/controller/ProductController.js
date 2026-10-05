const express=require('express');

let products=[
    
]

const getProducts=(req,res)=>{
    res.status(200).json({
        success:true,
        count:products.length,
        data:products
    })
}

const createProduct=(req,res)=>{
    const {title,price}=req.body;

    const newProduct={
        id:products.length+1,
        title,
        price
    }

    products.push(newProduct);
    res.status(201).json({
        success:true,
        data:newProduct
    })
}

module.exports={
    getProducts,
    createProduct
}