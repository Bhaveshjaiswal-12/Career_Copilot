# Career Copilot — AI Job Preparation & ATS Resume Platform

> Turn any target job description into your personalized career game plan.

A production-grade, full-stack AI career acceleration platform that analyzes your existing resume against target jobs, identifies concrete skill gaps, generates technical & behavioral interview questions with answer guidelines, maps out a 7-day preparation roadmap, and produces ATS-optimized resumes with live preview and editing.

---

## ✨ Features

- **🔐 Secure Authentication**: JWT in HTTP-only cookies, bcrypt password hashing, input validation via Zod, session restoration, forgot/reset password flows.
- **📄 Resume PDF Extraction**: High-performance text parsing pipeline for uploaded PDF resumes.
- **🤖 Deep AI Job Analysis (Google Gemini)**: Structured multi-step wizard comparing candidate resume text against job requirements and personal goals.
- **📊 Skill Gap Visualizer**: Categorizes competencies into *Strong*, *Partial*, and *Missing*, featuring proficiency meters and learning priorities.
- **💬 Interview Preparation Engine**:
  - **Technical Questions**: Curated by difficulty, topic, core intent, and expandable expected answer points with completion tracking.
  - **Behavioral Questions**: Guided by the STAR methodology (Situation, Task, Action, Result) with answer draft saving.
- **🗺️ 7-Day Actionable Roadmap**: Daily milestone breakdown with estimated time, key objectives, and completion checklists.
- **📝 Targeted ATS Resume Builder**: Generates clean, ATS-compliant resumes tailored to the target role.
- **✏️ Interactive Resume Editor**: In-place editing of contact info, headline, summary, skills, experience, projects, and education with backend persistence.
- **🎯 Real-Time ATS Compatibility Scoring**: Evaluates keyword match, skills alignment, experience relevance, and formatting with actionable suggestions.
- **🖨️ Vector PDF Print & Export**: Dedicated `@media print` rules generating edge-to-edge standard A4 resumes directly from the browser print dialog.
- **📈 Real-Time Dashboard**: Analytics cards, overall preparation readiness scores, recent report history, and quick actions.
- **👤 Profile & Completeness Gauge**: Live profile strength meter with custom headline, bio, portfolio links, and skill tags.
- **⚙️ Account Security & Settings**: Password updates, cyber dark mode interface, and permanent account removal with data cascading.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Framer Motion, Lucide Icons, Sonner Toasts, React Router v7, Axios, Recharts |
| **Backend** | Node.js (v20+), Express v5, MongoDB, Mongoose, Multer, pdf-parse |
| **AI Engine** | Google Gemini API (`@google/genai`), Zod schema validation & fallback guards |
| **Security** | Helmet, CORS, Cookie-Parser, Express-Rate-Limit, BcryptJS, JWT |
| **Testing** | Node.js native test runner (`node --test`), assert strict |

---

## 📂 Project Structure

```
Resume_Builder/
├── package.json           # Root workspace script runner
├── README.md              # Documentation
├── requirements.txt       # Phased build specifications & DoD
├── client/                # React + Vite Single-Page Application
│   ├── index.html
│   ├── vite.config.js
│   └── src/
│       ├── context/       # AuthContext & session state
│       ├── layouts/       # AppLayout with sidebar & responsive navigation
│       ├── pages/         # 14 Full-featured pages
│       ├── routes/        # Public and Protected route guards
│       ├── services/      # Axios API client & endpoints
│       └── index.css      # Cyber dark theme & print stylesheet
│
└── server/                # Express REST API Server
    ├── package.json
    ├── .env.example
    ├── tests/             # Automated test suite
    └── src/
        ├── app.js         # Express app configuration & middleware
        ├── server.js      # Server entrypoint & DB connection
        ├── config/        # Database setup
        ├── controllers/   # Auth, Dashboard, and Interview controllers
        ├── middleware/    # Auth verification, file uploads, error handling
        ├── models/        # User and InterviewReport Mongoose models
        ├── routes/        # Auth, Dashboard, and Interview route groups
        ├── services/      # Gemini AI prompt engine & PDF extractor
        ├── utils/         # AppError and async wrappers
        └── validators/    # Zod schemas for auth & requests
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas URI)
- [Google Gemini API Key](https://aistudio.google.com/)

### 1. Environment Setup

Copy `.env.example` in the `server` directory to `.env`:

```bash
cd server
cp .env.example .env
```

Ensure `server/.env` contains your configuration:

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/career-copilot
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Install Dependencies

From the project root:

```bash
npm run install:all
```

*(Or run `npm install` inside both `server/` and `client/` directories.)*

---

## 💻 Running the Application

### Start Backend (Port 5000)
```bash
npm run dev:server
```

### Start Frontend (Port 5173)
```bash
npm run dev:client
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing

Run backend unit and validation tests:

```bash
npm test
```

Build and verify the frontend production bundle:

```bash
npm run build
```

---

## 📡 API Endpoints

### Authentication & Account (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/api/auth/register` | Register a new account | No |
| `POST` | `/api/auth/login` | Login with email and password | No |
| `POST` | `/api/auth/logout` | Clear session cookie | No |
| `GET` | `/api/auth/me` | Fetch active user session | **Yes** |
| `PUT` | `/api/auth/profile` | Update profile information & skills | **Yes** |
| `PUT` | `/api/auth/change-password` | Verify & update account password | **Yes** |
| `DELETE` | `/api/auth/account` | Permanently delete account and data | **Yes** |
| `POST` | `/api/auth/forgot-password` | Send password reset token | No |
| `POST` | `/api/auth/reset-password/:token`| Reset password using token | No |

### Dashboard (`/api/dashboard`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/dashboard/stats` | Aggregated report stats & readiness scores | **Yes** |

### Interview Analysis & Resumes (`/api/interview`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/api/interview/generate` | Upload PDF resume and generate full AI report | **Yes** |
| `GET` | `/api/interview` | List all historical reports (paginated + search) | **Yes** |
| `GET` | `/api/interview/:id` | Get specific interview report details | **Yes** |
| `DELETE` | `/api/interview/:id` | Delete an interview report | **Yes** |
| `PUT` | `/api/interview/:id/progress` | Update question and roadmap checklists | **Yes** |
| `POST` | `/api/interview/:id/resume/generate` | Synthesize targeted ATS resume with AI | **Yes** |
| `PUT` | `/api/interview/:id/resume` | Save manual resume edits | **Yes** |
| `POST` | `/api/interview/:id/resume/ats-score` | Run ATS compatibility analysis | **Yes** |

---

## 🛡️ License

ISC License. Built for modern software engineering and career acceleration.
