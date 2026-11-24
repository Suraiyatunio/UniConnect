# UniConnect – University Management & Student Collaboration Desktop Application

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/uniconnect)
[![Platform](https://img.shields.io/badge/platform-Windows%20x64-brightgreen.svg)]()
[![Tech Stack](https://img.shields.io/badge/tech-Electron%20%7C%20React%20%7C%20TypeScript%20%7C%20TailwindCSS%20%7C%20SQLite-indigo.svg)]()

UniConnect is an enterprise-grade, centralized university management and student collaboration desktop application. Built with **Electron, React 18, TypeScript, Tailwind CSS, and SQLite**, it consolidates academic administration, course delivery, grading, timetables, resource sharing, campus events, and direct messaging into a unified, secure, high-performance desktop experience.

---

## 📌 Table of Contents
1. [Overview](#-overview)
2. [Key Architecture & Tech Stack](#-key-architecture--tech-stack)
3. [Project Folder Structure](#-project-folder-structure)
4. [User Roles & Demo Credentials](#-user-roles--demo-credentials)
5. [Core Modules](#-core-modules)
6. [Getting Started & Installation](#-getting-started--installation)
7. [Building the Windows Installer (.exe)](#-building-the-windows-installer-exe)
8. [Documentation Links](#-documentation-links)

---

## 🚀 Overview

University workflows are traditionally fragmented across disjointed web portals, spreadsheets, and external messaging channels. Students miss submission deadlines, teachers face cumbersome grading interfaces, and administrators struggle with cross-department scheduling and record management.

**UniConnect** solves this by providing:
- **Offline-First & Local-First Speed**: Powered by an embedded SQLite database persisted on the local filesystem.
- **Secure Desktop Shell**: Built on Electron with context isolation, secure IPC boundaries, and zero direct renderer-to-database exposure.
- **Role-Based Workspaces**: Tailored user experiences for **Students**, **Teachers**, and **Administrators**.
- **Interactive Academic Workflow**: Real assignment submission, grading, study material management, dynamic timetabling, instant messaging, and automated event notifications.

---

## 🛠 Key Architecture & Tech Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Desktop Shell** | Electron (v33+) | Native Windows desktop container with OS-level window controls, file dialogs, and native installer packaging. |
| **Frontend Framework** | React 18 & TypeScript | Component-driven UI with strong typing, strict state management, and reusable widgets. |
| **Styling** | Tailwind CSS & Lucide Icons | Modern, clean SaaS-inspired design system with polished navy/blue university themes. |
| **Local Database** | SQLite (sql.js / embedded) | Relational SQL storage with foreign keys, relational joins, indexes, and automatic disk persistence in `userData`. |
| **Communication / IPC** | Electron IPC (`ipcRenderer` <-> `ipcMain`) | Type-safe IPC bridge exposing secured APIs via `preload.ts` under `window.api`. |
| **Build & Packaging** | Vite & Electron Builder | High-speed HMR development builds and production Windows NSIS installer (`UniConnect-Setup.exe`). |

---

## 📁 Project Folder Structure

```
UniConnect/
├── UniConnect-Documentation/        # Comprehensive Technical Documentation
│   ├── README.md                   # Project overview, setup, and credentials
│   ├── PRODUCT_SPECIFICATION.md    # Functional & non-functional technical specs
│   ├── FEATURES.md                 # Complete feature matrix and user flows
│   ├── UI_UX_GUIDELINES.md         # Visual hierarchy, palettes, typography, components
│   ├── DATABASE_SCHEMA.md          # Relational tables, ERD, foreign keys, triggers
│   ├── USER_ROLES.md               # RBAC matrix and role permissions
│   ├── DEVELOPMENT_ROADMAP.md      # Development stages and verification steps
│   └── ANTIGRAVITY_PROMPT.md       # Original development requirements & constraints
│
└── UniConnect-App/                  # Actual Application Source Code
    ├── electron/                   # Electron Main & Preload Processes
    │   ├── main.ts                 # Main process window lifecycle & IPC routing
    │   ├── preload.ts              # Secure context-isolated bridge API
    │   ├── database/               # Database management
    │   │   ├── index.ts            # SQLite database initialization & persistence
    │   │   ├── schema.sql          # SQL table creation DDL
    │   │   └── seed.ts             # Default seed records and demo accounts
    │   └── ipc/                    # Modular IPC handlers (auth, courses, assignments, etc.)
    ├── src/                        # React Frontend
    │   ├── components/             # Reusable UI components (Sidebar, TopNav, Modal, Card, Table)
    │   ├── pages/                  # Role dashboards & module pages
    │   ├── context/                # AuthContext, NotificationContext, UIContext
    │   ├── services/               # IPC API client wrappers
    │   ├── types/                  # Shared TypeScript interfaces & models
    │   ├── index.css               # Tailwind CSS directives and custom scrollbars
    │   ├── App.tsx                 # App router and role-gated page switcher
    │   └── main.tsx                # React DOM mount point
    ├── package.json                # Dependencies, scripts, and build configuration
    ├── vite.config.ts              # Vite bundle configuration
    └── electron-builder.json5      # Windows NSIS executable packaging config
```

---

## 👥 User Roles & Demo Credentials

UniConnect comes pre-seeded with realistic demo accounts for instant testing:

| Role | Email | Password | Full Name | Department |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin@uniconnect.edu` | `Admin@123` | Dr. Arthur Vance | Administration |
| **Teacher** | `teacher@uniconnect.edu` | `Teacher@123` | Prof. Eleanor Hayes | Computer Science |
| **Student** | `student@uniconnect.edu` | `Student@123` | Alex Johnson | Computer Science (Sem 5) |
| **Student (2)** | `sarah@uniconnect.edu` | `Student@123` | Sarah Miller | Software Engineering (Sem 3) |

> 💡 *Note: Users can also register new accounts directly from the Registration screen with automatic role allocation.*

---

## 📦 Core Modules

1. **Authentication System**: Secure role-based login, registration with password confirmation, auto-login persistence, and logout.
2. **Role-Based Dashboards**: Real-time KPI statistics, schedule previews, recent announcements, urgent assignments, and upcoming events.
3. **Student Directory & Management**: Admin management of students, program/semester assignments, and enrollment registries.
4. **Course Management**: Course code creation, department association, teacher assignment, credit configuration, and student enrollment.
5. **Assignment Hub**: Teachers publish assignments with deadlines and guidelines; students submit solutions; teachers grade and give feedback.
6. **Study Resources**: Centralized digital repository for course notes, lecture slides, syllabus documents, and exam preparation guides.
7. **University Announcements**: Campus-wide and department-specific broadcast system with priority badges (High, Normal, Low).
8. **Weekly Timetable Matrix**: Interactive, filterable schedule displaying course name, instructor, classroom, and time slot.
9. **Internal Communication**: Direct 1-on-1 messaging between students and teachers with unread badges and search.
10. **Events & Campus Activities**: University event calendar with RSVP tracking, venue details, and organizer information.
11. **Live Notifications**: Automated alerts for newly published assignments, submitted work, grades, and announcement broadcasts.
12. **Profile & App Preferences**: Profile details editing, password updates, theme customizations, and notification toggles.

---

## 💻 Getting Started & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher (v24.x tested and supported)
- **npm**: v9.0.0 or higher
- **OS**: Windows 10/11 (64-bit)

### Development Setup

```bash
# 1. Navigate to the application directory
cd UniConnect/UniConnect-App

# 2. Install dependencies
npm.cmd install

# 3. Start development server with live reload
npm.cmd run dev
```

The Electron window will launch automatically with live hot-module reloading enabled for both frontend and Electron main processes.

---

## 🔨 Building the Windows Installer (.exe)

UniConnect packages into a standalone Windows installer (`UniConnect-Setup-1.0.0.exe`) using `electron-builder`:

```bash
# Inside UniConnect/UniConnect-App:
npm.cmd run build:win
```

The output installer is generated in:
`UniConnect/UniConnect-App/dist/UniConnect-Setup-1.0.0.exe`

Users can double-click this executable to install UniConnect on any Windows computer without opening VS Code, a terminal, or a browser.

---

## 📚 Documentation Links

- [Product Specification](file:///c:/Users/HP/Downloads/UniConnect-Documentation/UniConnect/UniConnect-Documentation/PRODUCT_SPECIFICATION.md)
- [Feature Details & User Flows](file:///c:/Users/HP/Downloads/UniConnect-Documentation/UniConnect/UniConnect-Documentation/FEATURES.md)
- [UI/UX & Design Guidelines](file:///c:/Users/HP/Downloads/UniConnect-Documentation/UniConnect/UniConnect-Documentation/UI_UX_GUIDELINES.md)
- [Database Schema & ERD](file:///c:/Users/HP/Downloads/UniConnect-Documentation/UniConnect/UniConnect-Documentation/DATABASE_SCHEMA.md)
- [User Roles & RBAC Matrix](file:///c:/Users/HP/Downloads/UniConnect-Documentation/UniConnect/UniConnect-Documentation/USER_ROLES.md)
- [Development Roadmap](file:///c:/Users/HP/Downloads/UniConnect-Documentation/UniConnect/UniConnect-Documentation/DEVELOPMENT_ROADMAP.md)
- [Antigravity Prompt & Mandates](file:///c:/Users/HP/Downloads/UniConnect-Documentation/UniConnect/UniConnect-Documentation/ANTIGRAVITY_PROMPT.md)
