# Changelog

## [0.1.0] - 2025-09-26
### Added
- Bootstrapped new `afternoon-academy` monorepo from SupplyDropp baseline.
- Integrated Supabase for authentication across web and mobile.
- Implemented sign-up, sign-in, auth callback flows with role-based redirects.
- Added temporary dashboards for **Admin, Parent, Student, Teacher** roles.
- Verified both **Next.js web app** and **Expo mobile app** run successfully with Supabase auth.

### Notes
- Current dashboards are placeholders and will be replaced with functional UI.  
- Both apps share Tailwind/NativeWind styling with unified developer workflow.  

## [0.2.0] - 2025-09-30
### Added
- **Admin Dashboard** with KPI cards (Users, Subjects, Reports).
- **Users Management**:  
  * View all users (parents, teachers, students).  
  * Add teachers (creates in `auth.users` + `public.users`).  
  * Delete teachers (syncs across tables).  
- **Subjects**: create/edit with safe delete protection.  
- **Sessions**:  
  * Linked to subjects, teachers, venues.  
  * Capacity support added.  
  * Can be created without teacher assignment (flexible scheduling).  
- **Venues**:  
  * New `venues` table (name, address, capacity).  
  * Seeded coworking spaces (WeWork, Spaces, Impact Hub).  
  * Management page with modal for add/edit.  
- **Bookings**:  
  * Bookings linked to parent (payer) + student (attendee).  
  * BookingModal flow: select parent → student → session.  
  * Students table supports multiple children per parent.  
  * Capacity enforcement at booking.  
- **Availabilities (v1)**:  
  * Teacher availabilities via `react-big-calendar`.  
  * Modal to add/edit slots.  
  * Range select → create availability.  
  * Tailwind overrides for toolbar/buttons/events.  
- **Availability & Session Modals (v2)**:  
  * Snap start/end times to 15-min increments (00/15/30/45).  
  * Unified design with labelled fields + combobox + avatars.  
  * Delete availability button.  
  * Status colors (green=open, blue=booked, red=cancelled).  
- **Scheduler (v1 – custom cross-platform)**:  
  * Teachers on Y-axis, hours on X-axis.  
  * Click slots to create availability/session.  
  * Events stack without overlap.  
  * Snap to 1-hour blocks.  
  * **Day / Week / Month views** with navigation + Today reset.  
- **Realtime Updates**:  
  * Availabilities auto-refresh via Supabase subscriptions.  

### Changed
- Schema:  
  * `availabilities.teacher_id` now FK to `users(id)`.  
  * Normalised `status` across sessions + availabilities.  
- Time handling:  
  * Always stored in UTC, displayed in local timezone.  
- Consolidated calendars: replaced `react-big-calendar` with custom Scheduler.  
- Title formatting by view:  
  * Day = “Tue 30 Sept 2025”.  
  * Week = “Mon 29 – Sun 5”.  
  * Month = “September 2025”.  

### Fixed
- Modal transparency (`bg-black/50`, `z-50`).  
- Crash when teacher was null.  
- Supabase “multiple relationship” query errors fixed.  
- Events no longer overlap (stacked with offsets).  
- Day/Week/Month buttons made responsive.  
- Sidebar responsiveness restored when Scheduler mounted.  

## [0.3.0] - 2025-10-03
### Added
- **Universal Sidebar**  
  * Role-based menus for Admin and Teacher.  
  * Priority bubble items (**Alerts, Applications, Jobs**).  
  * Profile dropdown with avatar, name, email, and logout.  
- **Jobs Board (Teacher)**  
  * `/teacher/jobs` shows all **unassigned sessions** as job posts.  
  * `/teacher/jobs/[id]` detail page with subject, venue, schedule, and apply/withdraw actions.  
  * Jobs menu item includes **live bubble count** of open jobs.  
- **Profile Management**  
  * Teacher and Admin profile pages redesigned.  
  * **Edit Profile Modal**: update name, bio, avatar.  
  * Avatar uploads via Supabase Storage (`avatars` bucket).  
  * Zustand store updates user state after profile edits.  
- **Alerts System (v1)**  
  * Sidebar bubble shows **unread count** for alerts.  
  * Alerts included in sidebar priority section.  
- **Scheduler Rules (v2)**  
  * Availabilities split automatically around sessions.  
  * Session clicks are locked (read-only).  
  * Availability clicks open edit/delete modal.  

### Changed
- **Teacher Dashboard**  
  * Removed profile section (moved to sidebar).  
  * Dashboard now focused on Scheduler, Availabilities, Sessions, and Bookings.  
- **Dark Mode**  
  * Enabled `darkMode: "class"`.  
  * Sidebar and modals styled consistently in light/dark themes.  

### Fixed
- Avatar standardised to `avatar_url` column.  
- Sidebar role filtering corrected (admin vs teacher).  

### Notes
- Next: enable real-time updates for alerts and jobs.  
- Jobs board forms the basis of a supply-teacher marketplace.  
- Add RLS policies for jobs and alerts to restrict visibility by role.  
