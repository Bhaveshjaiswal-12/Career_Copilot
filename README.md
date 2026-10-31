# Career Copilot — AI Career Platform & ATS Resume Engine

> **Turn any target job description into your personalized career game plan.**

Career Copilot is a production-grade, full-stack AI career preparation platform built with the MERN stack and Google Gemini AI. It analyzes candidate resumes against job descriptions, identifies skill gaps, generates targeted interview question banks (technical & behavioral), builds actionable 7-day preparation roadmaps, outputs ATS-optimized resumes with live editing, and provides an English-first real-time job discovery engine with intelligent resume-based location resolution.

---

## 📸 Application Preview

### 1. Landing Page & Product Overview
Clean, modern entry experience with step-by-step feature breakdown and dynamic dashboard navigation.
![Landing Page & Product Overview]<img width="1912" height="988" alt="image" src="https://github.com/user-attachments/assets/6e7771f7-8141-4f1e-a3eb-1fa2af52dbb9" />



### 2. Sign In & Session Access
Secure authentication with JWT HTTP-only cookies, password visibility toggle, and credential validation.
![Sign In Experience]<img width="1903" height="972" alt="image" src="https://github.com/user-attachments/assets/af1bf096-6254-4463-a8e5-bf93dc509bee" />


### 3. Account Registration & Onboarding
Intuitive registration flow guiding candidates into personalized interview preparation and ATS resume tailoring.
![Create Account]<img width="1912" height="962" alt="image" src="https://github.com/user-attachments/assets/165b1a9a-6ae3-42b6-9ddd-e22effac8e01" />


### 4. Unified Career Dashboard
Track interview analyses, job compatibility trends, profile strength gauges, and recent reports in one cohesive workspace.
![Unified Career Dashboard]<img width="1912" height="990" alt="image" src="https://github.com/user-attachments/assets/e0fa4036-62e9-4b3c-9721-7db199145b3f" />


### 5. Multi-Step Analysis Wizard
Upload PDF resumes or paste plain text, configure target roles, and input job descriptions for deep AI parsing.
![Multi-Step Analysis Wizard]<img width="1910" height="973" alt="image" src="https://github.com/user-attachments/assets/8207cffc-e86f-4df8-ae75-9ba1052b540f" />


### 6. Detailed Interview & Skill Gap Report
View granular compatibility ratings, candidate strengths, areas for improvement, skill gap priority meters, technical and behavioral interview questions, and a 7-day preparation roadmap.
![Detailed Interview & Skill Gap Report]<img width="1914" height="987" alt="image" src="https://github.com/user-attachments/assets/d9b828cf-cf5f-421d-acd7-f8d87d29d446" />


### 7. Candidate Profile & Discovery Preferences
Manage career preferences, target roles, preferred work modes, contact information, education, and skill tags that calibrate job compatibility scores.
![Candidate Profile & Discovery Preferences]<img width="1917" height="988" alt="image" src="https://github.com/user-attachments/assets/05ec3007-4f36-4feb-8452-afd8cd5f3e88" />


### 8. Settings, Security & Data Portability
Manage authentication credentials, password updates, JSON data export, and account retention controls.
![Settings & Security]<img width="1902" height="989" alt="image" src="https://github.com/user-attachments/assets/00b12fea-2f7f-4add-974b-f6a197a70ae0" />


---

## ✨ Core Features

# Career Copilot

**Career Copilot** is an AI-powered career preparation platform that helps job seekers understand how their resume aligns with a target role, identify skill gaps, prepare for interviews, generate tailored resumes, and discover job opportunities.

The application combines a React frontend with a Node.js/Express backend, MongoDB for persistence, and Google's Gemini API for AI-powered career insights.

> **Project status:** This README describes the features and integrations currently identified in the project context. Verify environment-variable names, npm scripts, and provider configuration against the actual repository before publishing this file.

## Features

### Resume and Job Description Analysis

- Upload a resume and provide a target job description.
- Parse resume content for analysis.
- Generate an AI-assisted candidate summary and role summary.
- Identify matching skills, partial matches, and potential skill gaps.
- Provide a compatibility score based on the available resume and role information.
- Highlight strengths and areas to improve.

### Interview Preparation

- Generate role-specific technical interview questions.
- Generate behavioral interview questions.
- Provide a structured preparation roadmap based on the analysis.
- Save analysis reports so users can revisit their preparation materials.

### Tailored Resume Generation

- Generate a resume tailored to a target role using the available profile and analysis data.
- Produce a downloadable PDF using the existing resume-generation flow.
- Support more focused application preparation without replacing the user's source resume silently.

### Reports and Dashboard

- View previous analysis reports.
- Open report details, including match insights and interview questions.
- Track available analysis and resume statistics.
- See recent reports and match-score history when enough real data exists.

### Profile and Account Management

- Manage career profile information and skills.
- Use saved profile information to improve analysis and recommendations.
- Access protected user-specific reports and resources.
- Manage account/session settings supported by the application.

### Job Discovery

- Search job listings from the providers configured in the backend.
- Review job title, company, location, and other metadata supplied by the source.
- Follow the original external application link.
- Save jobs if that capability is enabled in the current implementation.

**Provider note:** The current project context identifies integrations with Arbeitnow and Remotive. Their coverage and location behavior differ, so results may include international or remote opportunities. Do not assume that all remote roles accept applicants from India. An India-focused provider such as JSearch or Adzuna should only be described as integrated after it has actually been configured and tested.

### 🎨 Design System & Aesthetics
- **Modern Lavender & Purple Theme**: Curated palette utilizing `#6845C5` primary accents, `#F8F7FC` neutral backgrounds, subtle `#E7E1F1` borders, and `#F2EDFC` interactive chips.
- **Responsive Layout**: Designed for mobile, tablet, and desktop with accessible ARIA landmarks, focus states, and smooth micro-interactions.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Lucide Icons, Sonner Toasts, React Router v7, Axios, Recharts |
| **Backend** | Node.js (v20+), Express v5, MongoDB, Mongoose, Multer, pdf-parse, PDFKit |
| **AI & LLM** | Google Gemini API (`@google/genai` with `gemini-3.5-flash` / `gemini-3.1-flash-lite`), Zod schema validation |
| **Job Providers** | Live authorized REST feeds (Arbeitnow Job Board API & Remotive API) |
| **Security & Utilities** | Helmet, CORS, Cookie-Parser, Express-Rate-Limit, BcryptJS, JSONWebToken |
| **Testing** | Node.js native test runner (`node --test`), assert strict |

---

## 📂 Project Structure

```
Resume_Builder/
├── package.json              # Workspace scripts & project runner
├── README.md                 # Project documentation
├── docs/
│   └── images/               # Application UI screenshots
│       ├── landing_hero.png
│       ├── login.png
│       ├── register.png
│       ├── dashboard.png
│       ├── new_analysis.png
│       ├── report_analysis.png
│       ├── profile.png
│       └── settings.png
│
├── client/                   # Frontend SPA (React + Vite)
│   ├── index.html
│   ├── vite.config.js
│   ├── public/
│   └── src/
│       ├── components/       # Reusable UI library (Card, Button, Badge, EmptyState, etc.)
│       ├── context/          # AuthContext & session management
│       ├── layouts/          # AppLayout with sidebar & header
│       ├── pages/            # Dashboard, JobDiscovery, NewAnalysis, Reports, Profile, Settings
│       ├── services/         # Axios API clients (auth, interview, jobService)
│       └── index.css         # Lavender & purple design system tokens
│
└── server/                   # Backend REST API (Node.js + Express)
    ├── package.json
    ├── .env.example
    ├── tests/                # Automated test suites
    │   ├── jobDiscovery.test.js  # 12 test scenarios for country resolution & translation
    │   ├── job.test.js           # Job matching heuristics
    │   ├── ai.test.js            # Gemini error classification
    │   └── unit.test.js          # Auth validators & PDF generation
    └── src/
        ├── app.js            # Express app configuration & middleware
        ├── server.js         # Server bootstrap & MongoDB connection
        ├── controllers/      # Auth, interview, and job controllers
        ├── middleware/       # JWT protection, Multer upload, error handling
        ├── models/           # User, InterviewReport, SavedJob schemas
        ├── routes/           # Auth, interview, and job routes
        └── services/         # AI service, Location service, Translation service, Job service
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas cluster)
- [Google Gemini API Key](https://aistudio.google.com/)

### 1. Environment Configuration

In the `server` directory, create a `.env` file based on `.env.example`:

```bash
cd server
cp .env.example .env
```

Ensure the following variables are defined in `server/.env`:

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000

# MongoDB Connection String
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/career-copilot?retryWrites=true&w=majority

# JWT Credentials
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
JWT_EXPIRE=7d

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.5-flash
```

### 2. Install Dependencies

From the project root:

```bash
npm run install:all
```

*(Or run `npm install` inside both `server/` and `client/` directories.)*

---

## 💻 Running the Application

### Start Backend Development Server (Port 5000)
```bash
npm run dev:server
```

### Start Frontend Vite Server (Port 5173)
```bash
npm run dev:client
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing & Verification

Run the comprehensive backend test suite (covering location resolution, translations, match heuristics, auth validation, and PDF rendering):

```bash
cd server
npm test
```

Build the frontend bundle to verify bundling and typing:

```bash
cd client
npm run build
```

---

## 📡 Key API Endpoints

### Job Discovery (`/api/jobs`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `GET` | `/api/jobs` | Discover jobs with location resolution & English translation | **Yes** |
| `GET` | `/api/jobs/saved` | Retrieve user's shortlisted jobs | **Yes** |
| `POST` | `/api/jobs/save` | Bookmark a job to candidate's shortlist | **Yes** |
| `DELETE` | `/api/jobs/:jobId/save` | Remove a job from shortlist | **Yes** |
| `PATCH` | `/api/jobs/:jobId/saved` | Update application status or notes | **Yes** |

### Interview Analysis & Resumes (`/api/interview`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/api/interview/generate` | Upload PDF resume and generate full AI report | **Yes** |
| `GET` | `/api/interview` | List all historical reports (paginated + search) | **Yes** |
| `GET` | `/api/interview/:id` | Get specific report details | **Yes** |
| `DELETE` | `/api/interview/:id` | Delete an interview report | **Yes** |
| `POST` | `/api/interview/:id/resume/generate` | Synthesize targeted ATS resume with AI | **Yes** |
| `PUT` | `/api/interview/:id/resume` | Save manual resume edits | **Yes** |
| `POST` | `/api/interview/:id/resume/ats-score` | Run ATS compatibility analysis | **Yes** |
| `GET` | `/api/interview/:id/resume/pdf` | Download ATS resume as formatted PDF | **Yes** |

### Authentication & Profile (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Authenticate with credentials | No |
| `POST` | `/api/auth/logout` | Clear HTTP-only session cookie | No |
| `GET` | `/api/auth/me` | Fetch active authenticated session | **Yes** |
| `PUT` | `/api/auth/profile` | Update profile information, skills, and target role | **Yes** |
| `PUT` | `/api/auth/change-password` | Update account password | **Yes** |

---

## 🛡️ License

ISC License. Built for modern software engineering and career acceleration.
