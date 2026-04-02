import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
    category: {
        type: String,
        enum: ["frontend", "backend"],
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    options: [{
        type: String,
        required: true
    }],
    correctOption: {
        type: Number, // Index of the correct option (0-3)
        required: true
    }
}, { timestamps: true });

export const Quiz = mongoose.model("Quiz", quizSchema);
