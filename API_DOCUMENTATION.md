# Quiz API Documentation

This API handles authentication and quiz functionality.

**Base URL**: `http://localhost:5000/api` (Verify your PORT in `.env`)

---

## 1. Authentication Endpoints (`/auth`)

### Register User
- **URL**: `/auth/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```

### Login User
- **URL**: `/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```

### Register/Login Response
- **Response (Success)**:
  ```json
  {
    "message": "Login successful",
    "token": "YOUR_JWT_TOKEN",
    "user": { ... }
  }
  ```

### Update User Profile (Self)
- **URL**: `/auth/update`
- **Method**: `PUT`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "username": "new_username",
    "password": "new_password"
  }
  ```
  *Note: Email cannot be updated.*

---

## 2. Quiz Endpoints (`/quiz`)

### Step 1: Seed Mock Data (Optional, run once if DB is empty)
- **URL**: `/quiz/seed`
- **Method**: `GET`
- **Description**: populates the database with some frontend and backend questions.

### Step 2: Get Topics by Category
- **URL**: `/quiz/topics/:category`
- **Method**: `GET`
- **Params**: `category` should be `frontend` or `backend`.
- **Response**:
  ```json
  {
    "topics": ["HTML", "CSS", "Node.js", "Database"]
  }
  ```

### Step 3: Get Questions
- **URL**: `/quiz/questions?category=frontend&topic=HTML`
- **Method**: `GET`
- **Query Params**: `category`, `topic`
- **Description**: Returns all questions for the specified topic without the correct answers.
- **Response**:
  ```json
  {
    "questions": [
      {
        "_id": "64...",
        "question": "What does HTML stand for?",
        "options": ["A", "B", "C", "D"],
        "category": "frontend",
        "topic": "HTML"
      }
    ]
  }
  ```

### Step 4: Check Answers
- **URL**: `/quiz/check`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "answers": [
      { "questionId": "64...", "selectedOption": 0 },
      { "questionId": "65...", "selectedOption": 2 }
    ]
  }
  ```
- **Response**:
  ```json
  {
    "score": 1,
    "total": 2,
    "results": [
      {
        "questionId": "64...",
        "isCorrect": true,
        "correctOption": 0,
        "correctText": "Option Text"
      }
    ]
  }
  ```

---

## Notes for Frontend:
- Store the `token` in `localStorage` or `sessionStorage`.
- For protected routes (`/auth/update`, etc.), send the token in the `Authorization` header: `Bearer <token>`.
- The cookie-based auth is also supported.
