import express from "express";
import { 
    getTopicsByCategory, 
    getQuestionsByTopic, 
    checkAnswers, 
    seedQuizData 
} from "../controllers/quizController.js";

const quizRouter = express.Router();

quizRouter.get("/seed", seedQuizData);
quizRouter.get("/topics/:category", getTopicsByCategory);
quizRouter.get("/questions", getQuestionsByTopic);
quizRouter.post("/check", checkAnswers);

export default quizRouter;
