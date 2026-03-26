import { User } from "../models/authModel.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { transporter } from "../utils/mailer.js";

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