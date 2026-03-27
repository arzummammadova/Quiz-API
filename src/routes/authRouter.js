import express from "express";
import { loginUser, logoutUser, registerUser, verifyUser } from "../controllers/authController.js";

const authRouter=express.Router();


authRouter.post("/register",registerUser);
authRouter.post("/login",loginUser);
authRouter.post("/logout",logoutUser);
authRouter.get("/verify/:token",verifyUser);

export default authRouter;