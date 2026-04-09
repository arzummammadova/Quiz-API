import express from "express";
import { 
    getTopicsByCategory, 
    getQuestionsByTopic, 
    checkAnswers, 
    seedQuizData 
} from "../controllers/quizController.js";

import { protect } from "../middleware/authMiddleware.js";

const quizRouter = express.Router();

quizRouter.get("/seed", seedQuizData);
quizRouter.get("/topics/:category", getTopicsByCategory);
quizRouter.get("/questions", getQuestionsByTopic);
quizRouter.post("/check", protect, checkAnswers);

export default quizRouter;
