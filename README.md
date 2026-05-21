# 🎓 AI Exam System

A full-stack online examination platform with role-based access control, PDF result generation, result verification, and real-time exam monitoring.

> 🔗 **Live Demo:** [Add your Vercel URL here]  
> 🔗 **Backend API:** [Add your Render URL here]

---

## 📸 Screenshots

> Add screenshots here after deployment — paste images directly into GitHub README

---

## ✨ Features

### 👨‍💼 Admin
- Create and manage user accounts with role assignment
- Assign examiners to specific exams
- View complete system activity logs
- Dashboard with charts and analytics (Recharts)
- Export data to Excel (xlsx)

### 👨‍🏫 Examiner
- Create, edit, and delete exams
- Upload and manage answer keys
- Monitor student exam attempts in real time
- View detailed submission reports
- Download student result PDFs

### 👨‍🎓 Student
- Browse and attempt available exams
- Auto-submit on timer expiry
- View instant results after evaluation
- Download result certificate as PDF (jsPDF)
- Verify result authenticity via unique submission ID

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js + Express | v5.2.1 | REST API server |
| MongoDB + Mongoose | v9.2.0 | Database |
| JSON Web Token | v9.0.3 | Authentication |
| Bcrypt | v6.0.0 | Password hashing |
| PDFKit | v0.18.0 | Server-side PDF generation |
| Zod | v4.3.6 | Request validation |
| Nodemon | v3.1.11 | Dev auto-reload |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | v19.2.0 | UI framework |
| Vite | v7.3.1 | Build tool |
| React Router DOM | v7.13.0 | Client-side routing |
| Axios | v1.13.5 | HTTP client with interceptors |
| Tailwind CSS | v4.1.18 | Styling |
| Headless UI | v2.2.9 | Accessible UI components |
| Recharts | v3.8.0 | Charts and analytics |
| jsPDF | v4.2.1 | Client-side PDF export |
| XLSX | v0.18.5 | Excel export |
| Lucide React | v0.577.0 | Icons |

---

## 📁 Project Structure

```
AI-Exam-System/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                  # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── examController.js
│   │   │   ├── resultController.js
│   │   │   ├── submissionController.js
│   │   │   └── verifyController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js       # JWT verification
│   │   │   ├── adminMiddleware.js      # Admin-only guard
│   │   │   ├── role.middleware.js      # RBAC guard
│   │   │   └── logger.middleware.js    # Request logging
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Exam.js
│   │   │   ├── AnswerKey.js
│   │   │   ├── Submission.js
│   │   │   ├── Result.js
│   │   │   └── Log.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── adminRoutes.js
│   │   │   ├── examRoutes.js
│   │   │   ├── examinerRoutes.js
│   │   │   ├── studentRoutes.js
│   │   │   ├── submissionRoutes.js
│   │   │   ├── resultRoutes.js
│   │   │   ├── verifyRoutes.js
│   │   │   └── log.routes.js
│   │   ├── utils/
│   │   │   ├── generateResultPDF.js
│   │   │   ├── security.js
│   │   │   └── logger.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env                            # never pushed to GitHub
│   ├── .env.example                    # safe template for setup
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── PageHeader.jsx
│   │   │   └── ui/
│   │   │       ├── NeuButton.jsx
│   │   │       ├── NeuCard.jsx
│   │   │       ├── NeuInput.jsx
│   │   │       ├── Sidebar.jsx
│   │   │       └── VerifyBadge.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── layouts/
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── ExaminerLayout.jsx
│   │   │   └── StudentLayout.jsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   ├── examiner/
│   │   │   └── student/
│   │   ├── services/
│   │   │   ├── api.js                  # Axios instance + JWT interceptor
│   │   │   ├── authService.js
│   │   │   └── verifyService.js
│   │   └── routes/
│   │       └── ProtectedRoute.jsx
│   ├── .env.example
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+
- MongoDB running locally **or** a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/ai-exam-system.git
cd ai-exam-system
```

### 2. Setup backend
```bash
cd backend
npm install
cp .env.example .env
# Open .env and fill in your values (MONGODB_URI, JWT_SECRET, EMAIL_USER, EMAIL_PASS)
npm run dev
# API running at http://localhost:5000
```

### 3. Setup frontend
```bash
cd ../frontend
npm install
cp .env.example .env
# .env already has VITE_API_URL=http://localhost:5000/api — no change needed for local
npm run dev
# App running at http://localhost:5173
```

---

## 🔑 Demo Credentials

| Role     | Email                 | Password   |
|----------|-----------------------|------------|
| Admin    | admin@demo.com        | admin123   |
| Examiner | examiner@demo.com     | exam123    |
| Student  | student@demo.com      | student123 |

---

## 🔒 Security

- **JWT Authentication** — stateless, token sent via `Authorization: Bearer` header on every request using an Axios interceptor
- **RBAC Middleware** — each route protected by role check (`admin`, `examiner`, `student`)
- **Bcrypt** — passwords hashed with 10 salt rounds, never stored in plain text
- **Zod Validation** — all incoming request bodies validated before hitting controllers
- **CORS** — restricted to known frontend origins only via `CLIENT_URL` env variable
- **Environment Variables** — all secrets in `.env`, never committed to git

---

## 🌐 API Overview

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login, returns JWT + user info |
| POST | `/api/auth/register` | Public | Register new user |

### Exams
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/exams` | Student | List available exams |
| POST | `/api/exams` | Examiner | Create exam |
| PUT | `/api/exams/:id` | Examiner | Update exam |
| DELETE | `/api/exams/:id` | Examiner | Delete exam |

### Submissions
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/submissions` | Student | Submit exam answers |
| GET | `/api/submissions/:id` | Examiner | View a submission |

### Results
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/results` | Student | My results |
| GET | `/api/results/:id/pdf` | Student | Download result PDF |

### Verification
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/verify/:submissionId` | Public | Verify result authenticity |

### Admin
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/admin/users` | Admin | All users |
| POST | `/api/admin/assign-examiner` | Admin | Assign examiner to exam |
| GET | `/api/logs` | Admin | System activity logs |

---

## 🚀 Deployment

| Layer | Service | Notes |
|---|---|---|
| Frontend | [Vercel](https://vercel.com) | Auto-deploys on push to `main` |
| Backend | [Render](https://render.com) | Node.js web service |
| Database | [MongoDB Atlas](https://www.mongodb.com/atlas) | Free M0 cluster |

### Deploy backend on Render
```
Root Directory : backend
Build Command  : npm install
Start Command  : node src/server.js
```
Add all your `.env` keys in Render's Environment tab. Set:
```
NODE_ENV=production
CLIENT_URL=https://your-app.vercel.app
```

### Deploy frontend on Vercel
```
Root Directory : frontend
Framework      : Vite
Build Command  : npm run build
Output Dir     : dist
```
Add environment variable:
```
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## 👨‍💻 Author

**Your Name Here**  
B.Tech [Branch] | [College Name]

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-blue?logo=linkedin)](https://linkedin.com/in/yourprofile)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-black?logo=github)](https://github.com/yourusername)

---

## 📄 License

Developed as a Final Year Project for academic purposes.