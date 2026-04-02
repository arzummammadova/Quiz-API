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
            text: `Please verify your email by clicking on the following link: http://localhost:5173/verify-email/${verificationToken}`,
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
       return res.status(200).json({message:"Login successful",user:{username:user.username,email:user.email,role:user.role}, token});
        
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

export const getMe = async (req, res) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password -verificationToken");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({ user });
    } catch (error) {
        console.error("GetMe error:", error);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetExpires = Date.now() + 3600000; // 1 hour

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetExpires;
        await user.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset Request",
            text: `You requested a password reset. Please click on this link to reset your password: ${process.env.BASE_URL || 'http://localhost'}/reset-password/${resetToken}`,
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: "Password reset link sent to your email" });
    } catch (error) {
        console.error("Forgot password error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: "New password is required" });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() } // token must not be expired
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        
        await user.save();

        return res.status(200).json({ message: "Password has been successfully changed" });
    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const updateUser = async (req, res) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Access denied. No token provided." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { username, password } = req.body;

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (username) user.username = username;
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            user.password = hashedPassword;
        }

        await user.save();

        return res.status(200).json({
            message: "User information updated successfully",
            user: {
                username: user.username,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Update user error:", error);
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid or expired token" });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
};