# 📚 Knowledge-Drop

A secure file sharing portal for college, built with React and Supabase.

## 📌 Overview

Knowledge-Drop is a web platform where college admins, teachers, and students can securely upload, manage, and access study materials. Access is controlled by role and verified through OTP-based login.

## ❗ Problem Statement

In most colleges, study materials are shared through WhatsApp groups, email, or personal drives. This causes:
- Files getting lost or buried in chats
- No control over who can upload or view a file
- No verification of who is accessing the material
- No single, organized place to find resources

## ✅ Solution

Knowledge-Drop provides one centralized, secure portal:
- **OTP-based login** to verify users
- **Role-based access** for admins, teachers, and students, so each role only sees and does what it should
- **Organized file storage** across 2 storage buckets
- **Structured database** with 6 tables managing users, roles, and files
- Tested with 3 accounts, one per role

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, CSS |
| Backend / Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth (OTP) |
| Storage | Supabase Storage (2 buckets) |
