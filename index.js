import express from "express";
import dotenv from "dotenv";
dotenv.config();
import './src/db/dbConnect.js'
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./src/routes/authRouter.js";
import quizRouter from "./src/routes/quizRouter.js";


const app=express();
const PORT=process.env.PORT;



app.use(express.json());
app.use(cookieParser());
app.use(helmet({
    crossOriginResourcePolicy: false,
}));

const allowedOrigins = ["http://localhost:5173", "https://quiz-api-git-main-arzuis-projects.vercel.app"];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            // allowing any origin for now to solve the problem, 
            // but in production, you should only allow your frontend URL
            return callback(null, true); 
        }
        return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    credentials: true
}));


app.use("/api/auth",authRouter);
app.use("/api/quiz",quizRouter);


app.listen(PORT,()=>{
    console.log(`server is running on ${PORT}`)
})


app.get("/",(req,res)=>{
    res.send("Hello World");
});
