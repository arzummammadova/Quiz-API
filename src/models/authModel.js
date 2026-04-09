import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        enum:["user","admin"],
        default:"user",
    },
    verificationToken:{
        type:String,
        required:true,  
    },
    isVerified:{
        type:Boolean,
        default:false,
    },
    resetPasswordToken: {
        type: String,
        default: null,
    },
    resetPasswordExpires: {
        type: Date,
        default: null,
    },
    bio: {
        type: String,
        default: "",
    },
    socialLinks: {
        facebook: { type: String, default: "" },
        instagram: { type: String, default: "" },
        twitter: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        github: { type: String, default: "" },
    },
    points: {
        type: Number,
        default: 0,
    },
    level: {
        type: String,
        default: "Beginner",
    },
    
},{timestamps:true})

export const User=mongoose.model("User",userSchema);