import { Quiz } from "../models/quizModel.js";

// Mock data (we can use this to seed the DB if it is empty)
const mockQuestions = [
    {
        category: "frontend",
        topic: "HTML",
        question: "Which tag is used to create a hyperlink?",
        options: ["<link>", "<a>", "<href>", "<url>"],
        correctOption: 1
    },
    {
        category: "frontend",
        topic: "CSS",
        question: "Which property is used to change the font of an element?",
        options: ["font-style", "font-weight", "font-family", "font-size"],
        correctOption: 2
    },
    {
        category: "frontend",
        topic: "React",
        question: "What is the primary way to manage state in a functional component?",
        options: ["this.state", "useState hook", "setState method", "state property"],
        correctOption: 1
    },
    {
        category: "backend",
        topic: "Node.js",
        question: "What module is used to create a web server in Node.js?",
        options: ["http", "fs", "url", "path"],
        correctOption: 0
    },
    {
        category: "backend",
        topic: "Express",
        question: "How do you define a route in Express?",
        options: ["app.route()", "app.get()", "app.path()", "app.map()"],
        correctOption: 1
    },
    {
        category: "backend",
        topic: "Database",
        question: "Which database type is MongoDB?",
        options: ["Relational (SQL)", "Document-oriented (NoSQL)", "Key-value", "Graph"],
        correctOption: 1
    }
];


// Seed functionality (can be called once to populate the DB)
export const seedQuizData = async (req, res) => {
    try {
        const count = await Quiz.countDocuments();
        if (count === 0) {
            await Quiz.insertMany(mockQuestions);
            return res.status(201).json({ message: "Mock questions seeded successfully" });
        }
        return res.status(200).json({ message: "Database already has questions" });
    } catch (error) {
        console.error("Seed error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getTopicsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const topics = await Quiz.find({ category }).distinct("topic");
        return res.status(200).json({ topics });
    } catch (error) {
        console.error("GetTopics error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getQuestionsByTopic = async (req, res) => {
    try {
        const { category, topic } = req.query;
        if (!category || !topic) {
            return res.status(400).json({ message: "Category and topic are required" });
        }
        const questions = await Quiz.find({ category, topic }).select("-correctOption"); // Don't send correct answer to frontend yet
        return res.status(200).json({ questions });
    } catch (error) {
        console.error("GetQuestions error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const checkAnswers = async (req, res) => {
    try {
        const { answers } = req.body; // Array of { questionId, selectedOption }
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ message: "Answers must be an array" });
        }

        let score = 0;
        const results = await Promise.all(answers.map(async (ans) => {
            const question = await Quiz.findById(ans.questionId);
            if (!question) return { questionId: ans.questionId, correct: false, message: "Question not found" };

            const isCorrect = question.correctOption === ans.selectedOption;
            if (isCorrect) score++;

            return {
                questionId: ans.questionId,
                isCorrect,
                correctOption: question.correctOption,
                correctText: question.options[question.correctOption]
            };
        }));

        return res.status(200).json({
            score,
            total: answers.length,
            results
        });
    } catch (error) {
        console.error("CheckAnswers error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
