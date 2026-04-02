import express from "express";
import { loginUser, logoutUser, registerUser, verifyUser, getMe, forgotPassword, resetPassword, updateUser } from "../controllers/authController.js";

const authRouter=express.Router();


authRouter.post("/register",registerUser);
authRouter.post("/login",loginUser);
authRouter.post("/logout",logoutUser);
authRouter.get("/verify/:token",verifyUser);
authRouter.get("/me",getMe);
authRouter.post("/forgot-password",forgotPassword);
authRouter.post("/reset-password/:token",resetPassword);
authRouter.put("/update",updateUser);


export default authRouter;