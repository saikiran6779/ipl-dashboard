-- ============================================================
-- Initial SUPER_ADMIN Setup Script
-- ============================================================
-- Run this script against your ipl_dashboard database ONCE
-- after the application has started (so tables are created).
--
-- Plain-text password for first login: IPL@SuperAdmin2025
-- (change it immediately via the Reset Password flow)
--
-- BCrypt hash of: IPL@SuperAdmin2025
-- Generated with BCrypt cost factor 10
-- ============================================================

INSERT INTO users (name, email, password, role, created_at)
VALUES (
    'Sai Kiran',
    'saikiranmadhavaram@gmail.com',
    '$2a$10$xn3LI/AjqicFYZFruSwve.681477XaVNaUQbr1gioaWPn4t1KiLai',
    'SUPER_ADMIN',
    NOW()
)
ON DUPLICATE KEY UPDATE
    role = 'SUPER_ADMIN';  -- Safe to re-run: keeps role as SUPER_ADMIN

-- ============================================================
-- IMPORTANT NOTES:
-- 1. This is the ONLY way to create/set a SUPER_ADMIN.
--    The application API cannot create or demote SUPER_ADMINs.
-- 2. Change the password immediately after first login via:
--    Settings → Forgot Password → reset via email link
-- 3. The ON DUPLICATE KEY UPDATE ensures this is idempotent.
-- ============================================================
