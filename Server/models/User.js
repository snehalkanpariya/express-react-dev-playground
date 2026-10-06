const mongoose=require("mongoose")
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const UserSchema=new mongoose.Schema(
    {
        name:{
            type:String,
            required:[true,"Please provide name"],
            trim:true,
            maxlength:[50,'Name cannot be more then 50 char long']
        },
        email:{
            type:String,
            required:[true,"Please provide an email"],
            unique:true,
            lowercase:true,
            match:[
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide an email'
            ]
        },
        password:{
            type:String,
            required:[true,'Password is required'],
            minlength:[6,'Password must have atleast 6 char'],
            select:false
        },
        role:{
            type:String,
            enum:['user','admin'],
            default:'user'
        }
    },
    {
        timestamps:true
    }
)

UserSchema.pre('save',async function(next){
    if(!this.isModified('password')){
        return next();
    }
    const salt=await bcrypt.genSalt(10) 
    this.password=await bcrypt.hash(this.password,salt)
})
UserSchema.methods.matchPassword=async function(enteredPassowrd){
    return await bcrypt.compare(enteredPassowrd,this.password)
}
UserSchema.methods.getSignedJwtToken=function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE || '30d'
    });
};

UserSchema.methods.matchPassword=async function (enteredPassword){
    return await bcrypt.compare(enteredPassword,this.password)
}
module.exports=mongoose.model('User',UserSchema);