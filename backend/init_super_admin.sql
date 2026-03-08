-- ============================================================
-- Initial SUPER_ADMIN Setup Script
-- ============================================================
-- Run this script AFTER:
--   1. The application has started (so the `users` table exists)
--   2. You have registered your account via the /register page
--
-- This script promotes an existing user to SUPER_ADMIN.
-- It does NOT insert a new user — register via the UI first.
-- ============================================================

-- Replace the email below with the one you registered with
UPDATE users
SET role = 'SUPER_ADMIN'
WHERE email = 'saikiranmadhavaram@gmail.com';

-- ============================================================
-- WORKFLOW:
-- 1. Start the backend (tables auto-created by Hibernate)
-- 2. Open http://localhost:5173 → Register with your email
-- 3. Run this SQL script in MySQL
-- 4. Log out and log back in — JWT will now carry SUPER_ADMIN role
-- 5. The "👑 Users" nav item will appear in the header
--
-- To promote a different email, edit the WHERE clause above.
-- ============================================================
