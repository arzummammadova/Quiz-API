import { Quiz } from "../models/quizModel.js";
import { User } from "../models/authModel.js";

const calculateLevel = (points) => {
    if (points < 100) return "Beginner";
    if (points < 300) return "Intermediate";
    if (points < 600) return "Advanced";
    if (points < 1000) return "Expert";
    return "Master";
};

// Mock data (we can use this to seed the DB if it is empty)
const mockQuestions = [
    // --- FRONTEND ---
    {
        category: "frontend",
        topic: "HTML",
        question: "Which tag is used to create a hyperlink?",
        options: ["<link>", "<a>", "<href>", "<url>"],
        correctOption: 1
    },
    {
        category: "frontend",
        topic: "HTML",
        question: "Which HTML element gives the title of a document?",
        options: ["<title>", "<header>", "<meta>", "<head>"],
        correctOption: 0
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
        topic: "CSS",
        question: "What does CSS stand for?",
        options: ["Cascading Style Sheets", "Creative Style Sheets", "Computer Style Sheets", "Colorful Style Sheets"],
        correctOption: 0
    },
    {
        category: "frontend",
        topic: "React",
        question: "What is the primary way to manage state in a functional component?",
        options: ["this.state", "useState hook", "setState method", "state property"],
        correctOption: 1
    },
    {
        category: "frontend",
        topic: "React",
        question: "Which hook is used to perform side effects in a function component?",
        options: ["useEffect", "useSideEffect", "useMemo", "useContext"],
        correctOption: 0
    },
    {
        category: "frontend",
        topic: "JavaScript",
        question: "Which keyword is used to declare a block-scoped variable?",
        options: ["var", "let", "def", "int"],
        correctOption: 1
    },
    {
        category: "frontend",
        topic: "JavaScript",
        question: "What is the output of 'typeof null' in JavaScript?",
        options: ["null", "undefined", "object", "string"],
        correctOption: 2
    },

    // --- BACKEND ---
    {
        category: "backend",
        topic: "Node.js",
        question: "What module is used to create a web server in Node.js?",
        options: ["http", "fs", "url", "path"],
        correctOption: 0
    },
    {
        category: "backend",
        topic: "Node.js",
        question: "Which globally available object provides information about the current Node.js process?",
        options: ["global", "window", "process", "env"],
        correctOption: 2
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
        topic: "Express",
        question: "Which middleware is typically used to parse JSON requests in Express?",
        options: ["express.json()", "bodyParser.json()", "Both are valid", "None of the above"],
        correctOption: 2
    },
    {
        category: "backend",
        topic: "Database",
        question: "Which database type is MongoDB?",
        options: ["Relational (SQL)", "Document-oriented (NoSQL)", "Key-value", "Graph"],
        correctOption: 1
    },
    {
        category: "backend",
        topic: "Database",
        question: "What does SQL stand for?",
        options: ["Structured Query Language", "Strong Question Language", "Structured Quiz Language", "Simple Query Language"],
        correctOption: 0
    },
    {
        category: "backend",
        topic: "Python",
        question: "Which keyword is used to define a function in Python?",
        options: ["func", "def", "function", "lambda"],
        correctOption: 1
    },

    // --- FULLSTACK ---
    {
        category: "fullstack",
        topic: "Next.js",
        question: "What is Next.js primarily used for?",
        options: ["Mobile app development", "React framework for SSR and SSG", "Database management", "CSS styling"],
        correctOption: 1
    },
    {
        category: "fullstack",
        topic: "Next.js",
        question: "Which function is used in Next.js to fetch data on each request (Server-Side Rendering)?",
        options: ["getStaticProps", "getServerSideProps", "getInitialProps", "fetchData"],
        correctOption: 1
    },
    {
        category: "fullstack",
        topic: "Docker",
        question: "What is the primary purpose of Docker?",
        options: ["Database hosting", "Containerization of applications", "Code compilation", "Version control"],
        correctOption: 1
    },
    {
        category: "fullstack",
        topic: "Docker",
        question: "Which file is used to define a Docker image?",
        options: ["Dockerfile", "docker-compose.yml", "Docker.json", "docker.config"],
        correctOption: 0
    }
];

// Seed functionality (can be called once to populate the DB)
export const seedQuizData = async (req, res) => {
    try {
        await Quiz.deleteMany({}); // Silinib yenidən seed edilməsi üçün
        await Quiz.insertMany(mockQuestions);
        return res.status(201).json({ message: "Bütün suallar yenidən əlavə olundu" });
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

        const totalScore = score * 10; // 10 points per correct answer

        // Update user points if logged in
        if (req.user) {
            const user = await User.findById(req.user.id);
            if (user) {
                user.points += totalScore;
                user.level = calculateLevel(user.points);
                await user.save();
            }
        }

        return res.status(200).json({
            score,
            pointsGained: totalScore,
            total: answers.length,
            results
        });
    } catch (error) {
        console.error("CheckAnswers error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
