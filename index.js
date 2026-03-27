import express from "express";
import dotenv from "dotenv";
dotenv.config();
import './src/db/dbConnect.js'
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./src/routes/authRouter.js";


const app=express();
const PORT=process.env.PORT;



app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.use(cors());

app.use("/api/auth",authRouter);

app.listen(PORT,()=>{
    console.log(`server is running on ${PORT}`)
})


app.get("/",(req,res)=>{
    res.send("Hello World");
});
