# FuturePath Eswatini 🌍

> Helping Emaswati youth access employment opportunities, internships, career guidance, CV creation tools, and online learning.

---

## Tech Stack

| Layer        | Technology                             |
| ------------ | -------------------------------------- |
| Frontend     | React 18 + TypeScript + Vite           |
| Styling      | Tailwind CSS + custom design tokens    |
| Routing      | React Router v6                        |
| State        | Zustand (auth) + React Hook Form       |
| Backend / DB | Supabase (PostgreSQL + Auth + Storage) |
| PDF          | jsPDF (CV export + Certificates)       |
| QR Codes     | qrcode library                         |
| Hosting      | Vercel / Netlify                       |

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy your Project URL and anon key from **Settings → API**
3. Create `.env.local`:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run the database schema

1. Open your Supabase project → **SQL Editor**
2. Paste the contents of `schema.sql`
3. Click **Run**

### 4. Run dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Features

### Authentication

- Email/password registration with phone number
- Email verification flow
- Forgot password via email
- Session persistence (stays logged in)
- Role-based access: `user` | `admin`

### Dashboard (Home)

- Personalised welcome with real avatar photo
- Active course progress ring
- Build CV CTA
- Verification status
- Recommended jobs carousel
- Career path timeline
- Stats grid

### Jobs Module

- Search by title / company
- Filter by type (Full-time, Internship, Remote)
- Filter by category (Technology, Finance, etc.)
- Company logos (real photos from design)
- Job detail page with requirements
- Save / unsave jobs
- Apply → Application Sent confirmation screen
- Applications stored in Supabase

### CV Builder

- 4-step wizard: Personal → Education → Experience → Skills
- Dynamic field arrays (add/remove entries)
- Skill tag manager with suggestions
- Project + Certification sections
- Live ATS-formatted preview
- **PDF download** via jsPDF
- Auto-save to Supabase

### Learning Academy

- Course cards with thumbnail images + progress bars
- Category filter chips
- Module player with video thumbnail + play/pause
- **Quiz engine**: 4 questions, instant grading, correct/wrong highlight
- Pass/fail with retake option
- Certificate unlock flow

### Certificate System

- Digital certificates with QR codes
- PDF download with landscape A4 layout
- Public verification portal (enter cert ID)
- Supabase storage + revocation support

### Interview Prep

- Prep guide with topic checklist
- Eswatini Corporate Q&A accordion
- Local etiquette & culture tips
- **Mock interview session** with real photos:
  - Interviewer + interviewee split screen
  - RECORDING badge
  - Live feedback panel (Tone, Pacing, Audio)
  - Question navigation
  - Skip / End controls

### Notifications

- Slide-up panel from bottom
- Unread badge on bell icon
- Mark all as read
- Types: job, course, certificate, system

### Admin Dashboard

- Overview stats grid
- Recent activity feed
- **Jobs**: Add / Edit / Delete with full form
- **Courses**: Add / Delete
- **Users**: View / Suspend
- **Certificates**: View / Revoke

---

## Project Structure

```
src/
├── components/
│   ├── layout/         AppShell (header + nav)
│   └── notifications/  NotificationPanel
├── hooks/
│   ├── useAuth.ts       Supabase auth
│   ├── useAuthStore.ts  Zustand persistence
│   ├── useCourses.ts    Courses + certificates
│   └── useJobs.ts       Jobs + saved + applications
├── lib/
│   ├── supabase.ts      Client setup
│   ├── images.ts        All real photo URLs
│   ├── data.ts          Seed / mock data
│   ├── cvPDF.ts         CV PDF generator
│   └── certPDF.ts       Certificate PDF generator
├── pages/
│   ├── AuthPage.tsx
│   ├── HomePage.tsx
│   ├── JobsPage.tsx
│   ├── CVPage.tsx
│   ├── LearnPage.tsx
│   ├── VerifyPage.tsx
│   ├── InterviewPrepPage.tsx
│   └── AdminPage.tsx
├── styles/
│   └── globals.css      Design tokens + utilities
├── types/
│   └── index.ts         All TypeScript types
├── App.tsx              Router + auth bootstrap
└── main.tsx             Entry point
```

---

## Database Tables

| Table            | Purpose                                |
| ---------------- | -------------------------------------- |
| `profiles`       | Extended user data (name, phone, role) |
| `jobs`           | Job listings                           |
| `internships`    | Internship listings                    |
| `applications`   | User applications (jobs + internships) |
| `saved_jobs`     | User bookmarked jobs                   |
| `courses`        | Learning courses                       |
| `course_modules` | Lessons within courses                 |
| `quizzes`        | Quiz per module                        |
| `quiz_questions` | Questions + options + correct index    |
| `quiz_attempts`  | User quiz history                      |
| `certificates`   | Issued certificates with unique UID    |
| `notifications`  | In-app notifications                   |
| `user_progress`  | Per-course completion % + streaks      |
| `cv_data`        | JSONB CV storage per user              |

All tables have **Row Level Security** policies. Users can only access their own data. Admins bypass all policies.

---

## Deployment

### Vercel (recommended)

```bash
npm run build
# Push to GitHub, then import repo in vercel.com
# Add environment variables in Vercel dashboard
```

### Netlify

1. Import this GitHub repository in Netlify. The included `netlify.toml` configures `npm run build`, publishes `dist/`, and supports React Router routes.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in **Site configuration → Environment variables**.
3. Deploy the site.

The AI Career Copilot API is an Express server (`server/index.js`), so it is not included in the static Netlify build. Host that API separately and configure the frontend to use its deployed URL before expecting the AI features to work in production.

### Environment Variables (required)

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

---

## Making the First Admin User

1. Register a user via the app
2. In Supabase SQL Editor, run:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

3. Log in — you'll see the "Admin" badge in the header

---

## Design System

Colors are defined as CSS variables in `src/styles/globals.css`:

| Variable      | Value     | Usage               |
| ------------- | --------- | ------------------- |
| `--primary`   | `#00355f` | Main navy blue      |
| `--secondary` | `#006c49` | Green accent        |
| `--sec-c`     | `#6cf8bb` | Light green chip bg |
| `--bg`        | `#f8f9ff` | Page background     |
| `--surf-low`  | `#eff4ff` | Card background     |

Fonts: **Hanken Grotesk** (UI) · **Source Serif 4** (certificates)

# futurepath-ai

FuturePath AI is an intelligent career navigation agent that helps students and job seekers identify career pathways, discover opportunities, analyze skill gaps, generate professional CVs, and create personalized development roadmaps through AI-powered reasoning and guidance.
