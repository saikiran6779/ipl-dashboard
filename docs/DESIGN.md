# IPL 2025 Season Dashboard — Design Document

> **Last updated:** 2026-03-14
> **Version:** 2.0.0
> This document is the living design reference for the IPL 2025 Dashboard.
> It must be updated whenever a feature, architectural change, or UI change is merged.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [Frontend Structure](#4-frontend-structure)
5. [Backend Structure](#5-backend-structure)
6. [Feature Catalogue](#6-feature-catalogue)
7. [Pages & Views](#7-pages--views)
8. [Component Library](#8-component-library)
9. [Authentication & Authorization](#9-authentication--authorization)
10. [Data Model](#10-data-model)
11. [API Reference](#11-api-reference)
12. [Routing](#12-routing)
13. [Styling System](#13-styling-system)
14. [State Management](#14-state-management)
15. [Changelog](#15-changelog)

---

## 1. Project Overview

IPL 2025 Season Dashboard is a full-stack web application for tracking all aspects of the IPL 2025 cricket season. It is designed around three user roles — **viewer**, **admin**, and **super-admin** — each with progressively more capability.

**Primary use cases:**
- Fans browse the points table, leaderboards, team squads, and match scorecards.
- Admins enter match results and manage player rosters.
- Super-admins manage user roles.

**Data philosophy:** All match and player data is manually entered by admins via forms. There are no external data feed integrations. Teams are hardcoded as IPL constants.

---

## 2. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend framework | React | 18.2 |
| Frontend build | Vite | 5.0 |
| Frontend HTTP | Axios | latest |
| Frontend notifications | react-hot-toast | latest |
| Backend framework | Spring Boot | 3.2.0 |
| Backend language | Java | 17 |
| Backend build | Maven | 3.8+ |
| ORM | Spring Data JPA / Hibernate | — |
| Database | MySQL | 8+ |
| Auth | JWT (JJWT 0.12.3) + Refresh Tokens | — |
| Email | Spring Mail (SMTP) | — |
| Styling | Inline CSS + Global CSS (`index.css`) | — |

---

## 3. Architecture

```
Browser (React + Vite)
        │  HTTP (Axios, Bearer JWT)
        ▼
Spring Boot API (port 8080)
   ├── SecurityConfig  — JWT filter, RBAC rules
   ├── Controllers     — REST endpoints
   ├── Services        — Business logic, stats computation
   ├── Repositories    — Spring Data JPA
   └── MySQL Database
```

**Dev proxy:** Vite proxies `/api/*` to `http://localhost:8080` so the frontend runs on port 5173 without CORS issues in development.

**Auth flow:**
1. Login → backend issues `accessToken` (short-lived JWT) + `refreshToken` (stored in DB).
2. Axios request interceptor attaches `Authorization: Bearer <accessToken>` to every request.
3. On `401`, the response interceptor silently calls `/api/auth/refresh`, rotates the refresh token, and retries the original request — zero user interruption.
4. On refresh failure, localStorage is cleared and the user is redirected to the dashboard.

---

## 4. Frontend Structure

```
frontend/src/
├── main.jsx                    # React root — AuthProvider, Toaster, AuthOverlay
├── App.jsx                     # View state machine (no React Router), route guards
├── index.css                   # Global styles, animations, responsive breakpoints
├── context/
│   └── AuthContext.jsx         # Auth state, JWT storage, login/logout/register,
│                               #   authAction state for overlay
├── components/
│   ├── Header.jsx              # Sticky navbar (desktop + mobile hamburger)
│   ├── AuthOverlay.jsx         # Full-screen animated login/logout overlay
│   └── UI.jsx                  # Reusable primitives: Card, Input, Select, Button,
│                               #   TeamChip, StatBar, EmptyState, Spinner
├── services/
│   ├── api.js                  # Axios instance, interceptors, all API functions
│   └── constants.js            # TEAMS array (10 IPL teams), VENUES, getTeam()
└── pages/
    ├── Dashboard.jsx           # Home: summary cards, standings, cap leaderboards, MOM
    ├── Teams.jsx               # Teams grid + team detail (squad, form, matches)
    ├── Matches.jsx             # Match list with edit/delete
    ├── MatchForm.jsx           # Add / Edit match form
    ├── Players.jsx             # Player registry, grouped by team, add/edit modal
    ├── PlayerProfile.jsx       # Individual player stats and match history
    ├── Scorecard.jsx           # Match scorecard modal
    ├── Login.jsx               # Login form
    ├── Register.jsx            # Registration form
    ├── ForgotPassword.jsx      # Email-based password reset request
    ├── ResetPassword.jsx       # Token-based password reset form
    └── SuperAdminUsers.jsx     # User management (promote / demote roles)
```

---

## 5. Backend Structure

```
backend/src/main/java/com/ipl/dashboard/
├── IplDashboardApplication.java
├── config/
│   ├── CorsConfig.java
│   ├── GlobalExceptionHandler.java
│   └── SecurityConfig.java
├── controller/
│   ├── AuthController.java
│   ├── MatchController.java
│   ├── PlayerController.java
│   └── SuperAdminController.java
├── dto/
│   ├── AuthDTO.java        # RegisterRequest, LoginRequest, TokenResponse, UserInfo
│   ├── MatchDTO.java
│   ├── PlayerDTO.java
│   └── StatsDTO.java       # Summary, StandingsRow, LeaderboardEntry, MomEntry
├── model/
│   ├── User.java           # JPA entity, implements UserDetails
│   ├── Role.java           # Enum: USER | ADMIN | SUPER_ADMIN
│   ├── Match.java
│   ├── Player.java
│   ├── PlayerMatchStats.java
│   ├── RefreshToken.java
│   └── PasswordResetToken.java
├── repository/             # Spring Data JPA interfaces (one per entity)
├── security/
│   └── JwtAuthFilter.java
└── service/
    ├── AuthService.java
    ├── JwtService.java
    ├── MatchService.java       # Stats computation (standings, NRR, leaderboards)
    ├── PlayerService.java
    ├── EmailService.java
    ├── SuperAdminService.java
    └── UserDetailsServiceImpl.java
```

---

## 6. Feature Catalogue

### 6.1 Season Stats Dashboard
- **Summary cards** — Matches Played, Total Runs, Highest Score, Teams Active. All values animate with a count-up effect on load.
- **Points Table** — Full 10-team standings sorted by Points then NRR. Top-4 are highlighted as playoff contenders. Each row shows P / W / L / Win% ring chart / Pts badge / NRR bar. **Rows are clickable → navigates to that team's detail page.**
- **Orange Cap** — Top run-scorers with animated progress bars and medal icons for top 3.
- **Purple Cap** — Top wicket-takers with the same treatment.
- **MOM Awards** — Podium display for top 3 Man of the Match winners + full ranked list.
- **Recent Results** — Last 5 match results shown inline on the dashboard.

### 6.2 Teams
- **Teams Grid** — All 10 IPL teams shown as colour-coded cards with live standings stats (P/W/L/Pts), NRR bar, playoff badge, and hover glow in team colour.
- **Team Detail** — Three-tab view per team:
  - *Overview*: team colours, season form (W/L badge sequence for all matches).
  - *Squad*: players fetched from `/api/teams/{id}/squad`. Each row shows role (colour-coded), nationality; click a player to open their profile.
  - *Matches*: all matches for that team with W/L result badge, opponent, score, and win/loss margin.
- **Access points:** 🛡️ Teams nav link (header), clicking a standings row from the Dashboard, or clicking a team card from the Teams grid.

### 6.3 Matches
- Full paginated list of all matches (date, teams, scores, venue, result).
- Admins can **edit** or **delete** any match.
- Link to open the full **Scorecard** modal per match.

### 6.4 Match Entry (Admin)
- Form with full match details: Match No., Date, Venue, Team 1 & 2, Scores (runs/wickets/overs), Toss, Winner, Win Margin/Type, Player of Match, Top Scorer + Runs, Top Wicket Taker + Wickets.

### 6.5 Players
- Registry of all registered players across all 10 teams.
- Grouped by team with team-colour strips and player counts.
- Filter by team, search by name.
- Admins can **add**, **edit**, or **delete** players.
- Click a player → **Player Profile** page.

### 6.6 Player Profile
- Hero section with player name, team, role, nationality.
- Season aggregate stats (runs, wickets, matches played, MOM awards).
- Match-by-match performance table.

### 6.7 Scorecards
- Per-match batting and bowling scorecards.
- Admins can enter detailed ball-by-ball or per-innings data.

### 6.8 Authentication
- **Register** — name, email, password (min 8 chars). Issues JWT on success.
- **Login** — email + password. Issues JWT + refresh token.
- **Forgot Password** — sends a password-reset link via SMTP email.
- **Reset Password** — token-validated password reset form.
- **Auto token refresh** — transparent, handled by Axios interceptor.
- **Logout** — invalidates refresh token on server, clears localStorage.
- **Auth Overlay** — animated full-screen overlay shown during login, register, and logout so transitions are visible (not instant).

### 6.9 Super-Admin Panel
- Lists all registered users.
- Promote a user to ADMIN or demote back to USER.

---

## 7. Pages & Views

The app uses a **view state machine** (no React Router). `App.jsx` holds a `view` string and conditionally renders the matching page component.

| View key | Component | Auth required | Role guard |
|---|---|---|---|
| `dashboard` | `Dashboard.jsx` | No | — |
| `teams` | `Teams.jsx` | No | — |
| `matches` | `Matches.jsx` | No | — |
| `add` | `MatchForm.jsx` | Yes | ADMIN+ |
| `players` | `Players.jsx` | No | — |
| `profile` | `PlayerProfile.jsx` | No | — |
| `login` | `Login.jsx` | No | — |
| `register` | `Register.jsx` | No | — |
| `forgot-password` | `ForgotPassword.jsx` | No | — |
| `reset-password` | `ResetPassword.jsx` | No | — |
| `super-admin` | `SuperAdminUsers.jsx` | Yes | SUPER_ADMIN |

**Initial view detection:** On page load, if `?token=` is in the URL the app opens `reset-password` directly (password reset deep-link).

---

## 8. Component Library

All reusable primitives live in `frontend/src/components/UI.jsx`.

| Component | Props | Purpose |
|---|---|---|
| `Card` | `children, style, className` | Glassmorphism card container with `backdrop-filter` |
| `CardHeader` | `title, subtitle` | Consistent card title row |
| `SectionLabel` | `children` | Orange uppercase section divider with lines |
| `Input` | `label, ...inputProps` | Labelled text input with orange focus ring |
| `Select` | `label, children, ...selectProps` | Labelled dropdown |
| `Label` | `children` | Small uppercase field label |
| `Button` | `children, variant, onClick, type, style, disabled` | Variants: `primary` `ghost` `danger` `active` `inactive` |
| `TeamChip` | `teamId, score, wickets, overs, won, size` | Team name + score chip with team-colour bar |
| `StatBar` | `rank, name, value, label, max, color` | Horizontal stat bar row |
| `EmptyState` | `icon, text, sub` | Centred empty-state placeholder |
| `Spinner` | `size, color, label` | SVG ring spinner with optional label |

**AuthOverlay** (`components/AuthOverlay.jsx`) — separate component rendered at the root level (in `main.jsx`). Reads `authAction` from `AuthContext` and shows a themed full-screen overlay for `login`, `register`, and `logout`.

---

## 9. Authentication & Authorization

### Token Storage
| Key | Value |
|---|---|
| `ipl_access_token` | Short-lived JWT access token |
| `ipl_refresh_token` | Long-lived refresh token |
| `ipl_user` | JSON-serialised user object `{id, name, email, role}` |

### Role Definitions
| Role | Capabilities |
|---|---|
| `USER` | Read-only — all GET endpoints |
| `ADMIN` | Read + write — create/update/delete matches and players |
| `SUPER_ADMIN` | All ADMIN capabilities + user role management |

### Spring Security Rules
- Public: `/api/auth/**`, `/actuator/info`, `/actuator/health`
- `GET /api/**` → any authenticated user
- `POST/PUT/DELETE /api/**` → ADMIN or SUPER_ADMIN
- `/api/super-admin/**` → SUPER_ADMIN only

### Refresh Token Rotation
Every token refresh issues a new refresh token and invalidates the old one. On logout all refresh tokens for the user are deleted server-side.

---

## 10. Data Model

### `users`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK | |
| name | VARCHAR | |
| email | VARCHAR UNIQUE | |
| password | VARCHAR | BCrypt hashed |
| role | ENUM | USER / ADMIN / SUPER_ADMIN |

### `matches`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK | |
| match_no | INT | |
| date | DATE | |
| venue | VARCHAR | |
| team1 / team2 | VARCHAR | Team ID (e.g. "MI") |
| team1_score / team2_score | INT | Runs |
| team1_wickets / team2_wickets | INT | |
| team1_overs / team2_overs | DECIMAL | |
| toss_winner / toss_decision | VARCHAR | |
| winner | VARCHAR | Team ID |
| win_margin / win_type | VARCHAR | e.g. "25 runs" |
| player_of_match | VARCHAR | |
| top_scorer / top_scorer_runs | VARCHAR / INT | |
| top_wicket_taker / top_wicket_taker_wickets | VARCHAR / INT | |

### `players`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK | |
| name | VARCHAR | |
| team | VARCHAR | Team ID |
| role | VARCHAR | BATSMAN / BOWLER / ALL-ROUNDER / WICKET-KEEPER |
| nationality | VARCHAR | |

### `player_match_stats`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK | |
| player_id | FK → players | |
| match_id | FK → matches | |
| runs / wickets / catches | INT | Per-match performance |

### `refresh_tokens`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK | |
| token | VARCHAR UNIQUE | |
| user_id | FK → users | |
| expiry_date | DATETIME | |

### `password_reset_tokens`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK | |
| token | VARCHAR UNIQUE | UUID |
| user_id | FK → users | |
| expiry_date | DATETIME | |
| used | BOOLEAN | |

### Teams (frontend constants only)
Teams are **not stored in the database**. They are defined in `frontend/src/services/constants.js`:

```js
{ id: 'MI',   name: 'Mumbai Indians',              color: '#004BA0', accent: '#D1AB3E' }
{ id: 'CSK',  name: 'Chennai Super Kings',         color: '#F9CD1C', accent: '#0081C8' }
{ id: 'RCB',  name: 'Royal Challengers Bengaluru', color: '#C8102E', accent: '#231F20' }
{ id: 'KKR',  name: 'Kolkata Knight Riders',       color: '#3A225D', accent: '#F2A900' }
{ id: 'DC',   name: 'Delhi Capitals',              color: '#0078BC', accent: '#EF1B23' }
{ id: 'PBKS', name: 'Punjab Kings',                color: '#ED1B24', accent: '#A7A9AC' }
{ id: 'RR',   name: 'Rajasthan Royals',            color: '#EA1A85', accent: '#254AA5' }
{ id: 'SRH',  name: 'Sunrisers Hyderabad',         color: '#FF822A', accent: '#1B1B1B' }
{ id: 'GT',   name: 'Gujarat Titans',              color: '#1C1C59', accent: '#B8D1D9' }
{ id: 'LSG',  name: 'Lucknow Super Giants',        color: '#A72B6D', accent: '#00AEEF' }
```

---

## 11. API Reference

### Auth (`/api/auth`)
| Method | Path | Auth | Body | Description |
|---|---|---|---|---|
| POST | `/register` | Public | `{name, email, password}` | Register → returns tokens + user |
| POST | `/login` | Public | `{email, password}` | Login → returns tokens + user |
| POST | `/refresh` | Public | `{refreshToken}` | Rotate refresh token |
| POST | `/logout` | Authenticated | — | Invalidate refresh token |
| POST | `/forgot-password` | Public | `{email}` | Send reset email |
| POST | `/reset-password` | Public | `{token, newPassword}` | Reset with email token |

### Matches (`/api/matches`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | List all matches |
| GET | `/{id}` | Public | Get one match |
| POST | `/` | ADMIN+ | Create match |
| PUT | `/{id}` | ADMIN+ | Update match |
| DELETE | `/{id}` | ADMIN+ | Delete match |
| GET | `/{id}/scorecard` | Public | Get scorecard |
| POST | `/{id}/scorecard` | ADMIN+ | Save scorecard |

### Stats (`/api/stats`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/` | Public | Full season stats: standings, top batters/bowlers, MOM, summary |

### Players (`/api/players`, `/api/teams`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/players` | Public | All players |
| POST | `/players` | ADMIN+ | Create player |
| PUT | `/players/{id}` | ADMIN+ | Update player |
| DELETE | `/players/{id}` | ADMIN+ | Delete player |
| GET | `/players/{id}/profile` | Public | Player profile + aggregate stats |
| GET | `/teams/{teamId}/squad` | Public | All players for a team |

### Leaderboards
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/leaderboard/batting` | Public | Top batters |
| GET | `/leaderboard/bowling` | Public | Top bowlers |

### Super-Admin (`/api/super-admin`)
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/users` | SUPER_ADMIN | List all users |
| PUT | `/users/{id}/promote` | SUPER_ADMIN | Set role → ADMIN |
| PUT | `/users/{id}/demote` | SUPER_ADMIN | Set role → USER |

### Actuator
| Path | Description |
|---|---|
| `/actuator/health` | Service health |
| `/actuator/info` | Git commit info |

---

## 12. Routing

The app does **not use React Router**. Navigation is managed by a `view` state string in `App.jsx`. The `navigate(target)` function applies guards before calling `setView(target)`.

```
navigate('teams')        → clears teamId → shows Teams grid
navigate('super-admin')  → guard: SUPER_ADMIN only
navigate('add')          → guard: ADMIN+ only
```

Special cases:
- `handleOpenTeam(id)` — sets `teamId` state then navigates to `teams` → Teams mounts with `initialTeamId` → renders detail view directly.
- `handleOpenProfile(id)` — sets `profileId` state then navigates to `profile`.
- On page load, `?token=` in URL → initial view is `reset-password`.

---

## 13. Styling System

### Approach
All component styles are written as **inline style objects** in JSX. Global CSS (`index.css`) handles:
- CSS reset (`*, *::before, *::after`)
- Body font & background
- Custom scrollbar
- Keyframe animations (referenced by class)
- Responsive breakpoints (media queries)
- Utility classes (`fade-up`, `slide-in`, `glass-card`, `gradient-text`)

### Colour Palette
| Token | Hex | Usage |
|---|---|---|
| Background | `#080c12` | Page background |
| Surface | `rgba(22,27,34,0.9)` | Cards, panels |
| Border | `rgba(48,54,61,0.6)` | Card borders |
| Hover | `#1c2128` | Table row hover |
| Text primary | `#e6edf3` | Body text |
| Text secondary | `#8b949e` | Labels, captions |
| Brand orange | `#f97316` | Primary accent, active states |
| Brand red | `#dc2626` | Gradient partner |
| Success | `#22c55e` | Wins, positive NRR |
| Danger | `#ef4444` | Losses, negative NRR |
| Purple | `#8b5cf6` | Bowling / purple cap |
| Blue | `#3b82f6` | Matches played, info |

### Typography
| Font | Usage |
|---|---|
| `'DM Sans'` | All body text, labels, buttons |
| `'Bebas Neue'` | Hero numbers, team IDs, big stats |

### Animation Classes
| Class | Keyframe | Duration |
|---|---|---|
| `.fade-up` | `fadeUp` (opacity 0→1, translateY 16px→0) | 0.4s |
| `.slide-in` | `slideIn` (opacity 0→1, translateX 30px→0) | 0.3s |

### Glassmorphism Pattern
```css
background: rgba(22, 27, 34, 0.9);
backdrop-filter: blur(8px);
border: 1px solid rgba(48, 54, 61, 0.6);
border-radius: 16px;
```

### Responsive Breakpoints
| Breakpoint | Behaviour |
|---|---|
| `≤ 768px` | Hide desktop nav, show hamburger |
| `≤ 640px` | Reduce padding, collapse form grids to 1 col, stack result rows |
| `≤ 480px` | Summary cards in 2-column grid |

---

## 14. State Management

No external state library (no Redux, Zustand, etc.). State is held at three levels:

### AuthContext (`context/AuthContext.jsx`)
Global auth state shared app-wide via React Context.

| State | Type | Purpose |
|---|---|---|
| `user` | `{id, name, email, role}` or `null` | Current logged-in user |
| `loading` | `boolean` | True during login/register API call |
| `authAction` | `'login' \| 'logout' \| 'register' \| null` | Drives `AuthOverlay` display |

Exposed: `user`, `loading`, `authAction`, `login()`, `register()`, `logout()`, `doRefresh()`, `isAdmin`, `isSuperAdmin`.

### App.jsx (root state)
| State | Type | Purpose |
|---|---|---|
| `view` | `string` | Current page/view |
| `matches` | `Match[]` | All matches fetched on load |
| `stats` | `StatsDTO` or `null` | Season stats fetched on load |
| `editMatch` | `Match` or `null` | Match being edited |
| `loading` | `boolean` | Data fetch in progress |
| `saving` | `boolean` | Match create/update in progress |
| `profileId` | `number` or `null` | Player being viewed |
| `teamId` | `string` or `null` | Team being viewed in detail |

### Page-level state
Each page manages its own local state (form values, modal open, active tab, etc.) using `useState` / `useEffect`.

---

## 15. Changelog

### v2.0.0 — 2026-03-14
**Teams Page**
- New `Teams.jsx` page with full grid of all 10 IPL team cards.
- Team cards show W/L/Pts stats, NRR progress bar, playoff badge, team-colour hover glow.
- Team Detail view: Overview (colours, season form), Squad (live from API), Matches (per-team history).
- Players in squad are clickable → opens Player Profile.

**Standings — clickable rows**
- Every row in the Points Table now navigates to that team's detail page on click.
- "Click a team row to view details →" hint added to table footer.

**Navigation**
- 🛡️ Teams added to Header nav (desktop + mobile).
- `navigate('teams')` clears `teamId` so nav link always shows the grid, not a specific team.

**Auth Overlays**
- New `AuthOverlay.jsx` component — full-screen animated overlay (SVG ring + pulsing icon + bouncing dots + gradient text) shown during login, register, and logout.
- `AuthContext` exposes `authAction` state; deliberate pauses added to login/register/logout so the overlay is visible.

**Visual Overhaul**
- Page background darkened to `#080c12`.
- Header rebuilt: rainbow top gradient bar, glassmorphism background, avatar chip with user initial, coloured logout button.
- Cards upgraded to glassmorphism pattern (`rgba` + `backdrop-filter: blur`).
- `SummaryCard`: icon badge with coloured background; stronger hover glow + shadow.
- `Spinner` replaced with SVG ring spinner + label text.
- Login page: large gradient hero icon, glass card with accent top bar, gradient submit button.
- Register page: green-themed hero, matching button.
- `index.css`: `@import` moved to top; `glass-card`, `gradient-text`, `ticker` utilities added.

---

### v1.0.0 — Initial Release
- Spring Boot + React full-stack setup.
- JWT authentication with refresh token rotation.
- Password reset via SMTP email.
- Points Table with NRR calculation.
- Orange Cap / Purple Cap / MOM leaderboards.
- Match CRUD for admins.
- Player registry with profiles.
- Match scorecards.
- Super-admin user management.
- Responsive layout (desktop + mobile hamburger menu).
