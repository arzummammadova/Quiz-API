import { User } from "../models/authModel.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { transporter } from "../utils/mailer.js";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email });
        const userName = await User.findOne({ username });

        if (user || userName) {
            return res.status(400).json({ message: "User already exists" });
        }

        const isFirstUser = (await User.countDocuments()) === 0;
        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString("hex");

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: isFirstUser ? "admin" : "user",
            verificationToken,
        });

        await newUser.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Verify your email",
            text: `Please verify your email by clicking on the following link: http://localhost:3000/verify/${verificationToken}`,
        };

        await transporter.sendMail(mailOptions);

        return res.status(201).json({
            message: "User registered successfully, Please verify your email",
            user: {
                username: newUser.username,
                email: newUser.email,
                isVerified: newUser.isVerified
            }
        });
    } catch (error) {
        console.error("Register error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}


export const loginUser=async(req,res)=>{
    try {
        const {email,password}=req.body;
        if(!email || !password){
            return res.status(400).json({message:"All fields are required"});
        }
       
        const user=await User.findOne({email});
        if(!user){
            return res.status(401).json({message:"User not found (İstifadəçi tapılmadı). Please register first."});
        }
       if(!user.isVerified){
        return res.status(401).json({message:"Please verify your email"});
       }
       const isPasswordValid=await bcrypt.compare(password,user.password);
       if(!isPasswordValid){
        return res.status(401).json({message:"Invalid email or password"});
       }
       const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:"1h"});
       res.cookie("token",token,{httpOnly:true,secure:true,sameSite:"strict",maxAge:3600000});
       return res.status(200).json({message:"Login successful",user:{username:user.username,email:user.email,role:user.role}});
        
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}
export const logoutUser=async(req,res)=>{
    try {
        res.clearCookie("token");
        return res.status(200).json({message:"Logout successful"});


    } catch (error) {
        console.error("Logout",error);
        return res.status(500).json({message:"Internal server error"});
        
    }
}

export const verifyUser=async(req,res)=>{
    try {
        const {token}=req.params;
        const user=await User.findOne({verificationToken:token});
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        user.isVerified=true;
        user.verificationToken=null;
        await user.save();
        return res.status(200).json({message:"User verified successfully"});
        
    } catch (error) {
        console.error("Verify error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}   



        
        