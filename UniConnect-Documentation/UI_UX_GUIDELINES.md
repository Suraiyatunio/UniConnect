# UniConnect – UI/UX Design System & Guidelines

This document outlines the visual design language, layout architecture, typography, color palettes, and component behaviors for the **UniConnect** desktop application.

---

## 1. Design Philosophy

UniConnect is built for daily university productivity. Its visual design follows three foundational principles:

1. **Clarity over Clutter**: Maximize whitespace, establish clear typographic hierarchy, and avoid distracting animations or excessive gradients.
2. **Professional & Trustworthy**: Anchor the interface in institutional deep navy blues, crisp slate neutrals, and intentional vibrant blue accents.
3. **High Affordance & Immediate Feedback**: Every interactive control (button, input, tab, icon) must have explicit hover, active, focus, and disabled states with immediate visual feedback.

---

## 2. Color Palette & Theming

```
Primary Navy:       #0F172A (slate-900)  - Dark sidebar, primary headers
Navy Accent:        #1E293B (slate-800)  - Dark secondary elements, borders
Brand Blue:         #2563EB (blue-600)   - Primary CTA buttons, active tabs
Brand Light Blue:   #3B82F6 (blue-500)   - Highlights, hover states
Soft Blue Tint:     #EFF6FF (blue-50)    - Active item background, badges
Surface White:      #FFFFFF (white)      - Cards, modals, main content area
Canvas Background:  #F8FAFC (slate-50)   - Application main background
Border Gray:        #E2E8F0 (slate-200)  - Clean divider lines, input borders
Muted Text:         #64748B (slate-500)  - Subtitles, labels, placeholders
Body Text:          #1E293B (slate-800)  - High-readability body copy

Feedback Colors:
- Success Emerald:  #10B981 (emerald-500) / #ECFDF5 (emerald-50) - Completed, graded, high marks
- Warning Amber:    #F59E0B (amber-500)   / #FFFBEB (amber-50)   - Due soon, pending review
- Danger Rose:      #EF4444 (red-500)     / #FEF2F2 (red-50)     - Overdue, delete actions, errors
- Info Indigo:      #6366F1 (indigo-500)  / #EEF2FF (indigo-50)  - System updates, lecture notes
```

---

## 3. Typography Hierarchy

The application leverages system-native font stacks (`Inter`, `Segoe UI`, `SF Pro Display`, `Roboto`, `system-ui`) for zero font-loading latency and crisp text rendering on Windows displays.

| Level | Size | Weight | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Display Header** | 24px (`text-2xl`) | Bold (700) | 32px | Page titles (e.g., "Student Dashboard", "Course Catalog") |
| **Section Header** | 18px (`text-lg`) | Semibold (600) | 28px | Card headings, modal titles, section divisions |
| **Card / Widget Subtitle** | 14px (`text-sm`) | Medium (500) | 20px | Table column headers, field group labels |
| **Body Primary** | 14px (`text-sm`) | Regular (400) | 20px | Standard body content, table cell data, descriptions |
| **Caption / Meta** | 12px (`text-xs`) | Medium (500) | 16px | Timestamps, badge tags, helper text, breadcrumbs |

---

## 4. Desktop Layout Blueprint

```
+---------------------------------------------------------------------------------------------------+
|  [UniConnect Logo]       | [Page Title]    [ Search anything... ]   [🔔 3]   [Alex Johnson (Student) v] |
+--------------------------+------------------------------------------------------------------------+
| 📊 Dashboard             |                                                                        |
| 📚 Courses               |   [ Welcome Back, Alex! ]                                              |
| 📝 Assignments           |   Bachelor of Science in Computer Science - Semester 5                 |
| 📁 Study Resources       |                                                                        |
| 📅 Weekly Timetable      |   +------------------+ +------------------+ +------------------+       |
| 💬 Messages              |   | Enrolled Courses | | Pending Tasks    | | Today's Classes  |       |
| 📢 Announcements         |   |      5 Active    | |     2 Due Soon   | |     3 Lectures   |       |
| 🎯 Events & Activities   |   +------------------+ +------------------+ +------------------+       |
|                          |                                                                        |
|                          |   [ Upcoming Assignments ]               [ Today's Schedule ]          |
|                          |   +------------------------------------+ +---------------------------+ |
|                          |   | Algorithms HW 3 - Due Tomorrow     | | 09:00 AM - Data Structures| |
|                          |   | Cloud Computing Project - Due Fri  | | 11:30 AM - Database Sys   | |
|                          |   +------------------------------------+ +---------------------------+ |
|                          |                                                                        |
| ⚙️ Settings              |                                                                        |
| 🚪 Log Out               |                                                                        |
+--------------------------+------------------------------------------------------------------------+
```

### 4.1 Layout Components
1. **Left Navigation Sidebar**:
   - Fixed width (260px), dark slate background (`#0F172A`) for high visual contrast.
   - Top branding: UniConnect emblem with clean typographic wordmark.
   - Vertical navigation list with Lucide icon + label.
   - Dynamic role-gating: Only displays navigation items permitted for the active user role.
   - Bottom pinned section: Quick access to "Settings" and "Log Out".
2. **Top Navigation Header**:
   - Fixed height (64px), crisp white surface (`#FFFFFF`), subtle bottom border (`#E2E8F0`).
   - Left: Current module/view title with contextual breadcrumb.
   - Center: Global search input with instant results shortcut.
   - Right: Notification bell with animated unread counter, user avatar, full name, role pill, and dropdown menu.
3. **Main Content Canvas**:
   - Fluid scrollable container with soft background (`#F8FAFC`).
   - Standard 24px padding (`p-6`) for visual comfort.
   - Clean responsive grid layout for statistic cards (1 to 4 columns depending on window width).

---

## 5. UI Component Library Standards

### 5.1 Buttons
- **Primary Action**: Solid blue background (`bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition shadow-sm`).
- **Secondary Action**: White button with subtle border (`bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg px-4 py-2 text-sm font-medium transition`).
- **Danger Action**: Red button (`bg-red-600 hover:bg-red-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition`).
- **Ghost Action**: Transparent button with hover background (`text-slate-600 hover:bg-slate-100 rounded-lg p-2 transition`).

### 5.2 Form Inputs & Validation
- Standard inputs: White background, subtle border (`border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-lg px-3 py-2 text-sm text-slate-800 transition outline-none`).
- Labels: `text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1 block`.
- Error state: `border-red-500 focus:border-red-500 focus:ring-red-100` with inline red caption below input.

### 5.3 Modals & Dialogs
- Backdrop overlay: Semitransparent black with backdrop blur (`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4`).
- Modal card: Elevated white card (`bg-white rounded-xl shadow-2xl max-w-lg w-full border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150`).
- Header: Title, subtitle, and top-right close 'X' button.
- Footer: Cancel button (secondary) and Action button (primary) aligned to the right.

### 5.4 Data Tables & Lists
- Table wrapper: Card with rounded borders and overflow-x auto (`bg-white rounded-xl border border-slate-200 overflow-hidden`).
- Table header: Light slate background (`bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider text-left py-3 px-4 border-b border-slate-200`).
- Table rows: Clean dividers (`border-b border-slate-100 hover:bg-slate-50/80 transition text-sm text-slate-700`).
- Empty state: Friendly illustration/icon with helpful prompt (e.g., "No assignments found. Click 'Create Assignment' to publish one.").
