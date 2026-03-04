# 🏏 IPL 2025 Season Dashboard

A full-stack stats dashboard for tracking IPL 2025 — built with **Spring Boot** (backend) + **React + Vite** (frontend).

---

## 📁 Project Structure

```
ipl-dashboard/
├── backend/          # Spring Boot (Maven)
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/ipl/dashboard/
│       │   ├── IplDashboardApplication.java
│       │   ├── config/         # CORS, GlobalExceptionHandler
│       │   ├── controller/     # MatchController
│       │   ├── dto/            # MatchDTO, StatsDTO
│       │   ├── model/          # Match entity
│       │   ├── repository/     # MatchRepository
│       │   └── service/        # MatchService (all stats logic)
│       └── resources/
│           └── application.properties
└── frontend/         # React + Vite
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── components/
        │   ├── Header.jsx
        │   └── UI.jsx            # Reusable components
        ├── pages/
        │   ├── Dashboard.jsx
        │   ├── Matches.jsx
        │   └── MatchForm.jsx
        └── services/
            ├── api.js            # Axios API calls
            └── constants.js      # Teams, venues
```

---

## ⚙️ Prerequisites

- **Java 17+**
- **Maven 3.8+**
- **Node.js 18+**
- **MySQL 8+**

---

## 🗄️ Database Setup

```sql
CREATE DATABASE ipl_dashboard;
CREATE USER 'ipl_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON ipl_dashboard.* TO 'ipl_user'@'localhost';
FLUSH PRIVILEGES;
```

Then update `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ipl_dashboard?useSSL=false&serverTimezone=UTC
spring.datasource.username=ipl_user
spring.datasource.password=your_password
```

Hibernate will auto-create the `matches` table on first run (`ddl-auto=update`).

---

## 🚀 Running the App

### 1. Start the Backend

```bash
cd backend
mvn spring-boot:run
```

Backend runs on: **http://localhost:8080**

### 2. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: **http://localhost:5173**

> Vite proxies `/api` requests to `http://localhost:8080` — no CORS issues.

---

## 🌐 API Endpoints

| Method | Endpoint         | Description              |
|--------|-----------------|--------------------------|
| GET    | `/api/matches`  | List all matches         |
| GET    | `/api/matches/{id}` | Get one match        |
| POST   | `/api/matches`  | Create a match           |
| PUT    | `/api/matches/{id}` | Update a match       |
| DELETE | `/api/matches/{id}` | Delete a match       |
| GET    | `/api/stats`    | Full season stats        |

### POST `/api/matches` — Example Payload

```json
{
  "matchNo": 1,
  "date": "2025-03-22",
  "venue": "Wankhede Stadium, Mumbai",
  "team1": "MI",
  "team2": "CSK",
  "team1Score": 187,
  "team1Wickets": 5,
  "team1Overs": 20.0,
  "team2Score": 162,
  "team2Wickets": 9,
  "team2Overs": 20.0,
  "tossWinner": "MI",
  "tossDecision": "bat",
  "winner": "MI",
  "winMargin": "25",
  "winType": "runs",
  "playerOfMatch": "Rohit Sharma",
  "topScorer": "Rohit Sharma",
  "topScorerRuns": 74,
  "topWicketTaker": "Bumrah",
  "topWicketTakerWickets": 3
}
```

---

## 📊 Features

- **Points Table** — auto-sorted by points + NRR
- **Orange Cap** — top run-scorers leaderboard
- **Purple Cap** — top wicket-takers leaderboard
- **MOM Awards** — player of the match tracker
- **Match History** — full list with edit/delete
- **Add/Edit Match** — form with full match details
- **Live NRR** — calculated from runs/balls for each team

---

## 🏗️ Build for Production

```bash
# Frontend
cd frontend && npm run build   # outputs to frontend/dist/

# Backend (serve frontend from Spring Boot optionally)
cd backend && mvn clean package
java -jar target/ipl-dashboard-1.0.0.jar
```
