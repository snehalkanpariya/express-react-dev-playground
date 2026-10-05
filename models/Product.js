const mongoose=require("mongoose");

const ProductSchema=new mongoose.Schema({
    title:{
        type:String,
        required:[true,"Title is required"],
        trim:true
    },
    price:{
        type:Number,
        required:[true,"Price is required"],
        min:[0,"Price must be a positive number"]
    }
    
},
{
    timestamps:true
})

module.exports=mongoose.model("product",ProductSchema);