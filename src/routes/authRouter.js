import express from "express";
import { loginUser, logoutUser, registerUser, verifyUser, getMe } from "../controllers/authController.js";

const authRouter=express.Router();


authRouter.post("/register",registerUser);
authRouter.post("/login",loginUser);
authRouter.post("/logout",logoutUser);
authRouter.get("/verify/:token",verifyUser);
authRouter.get("/me",getMe);


export default authRouter;