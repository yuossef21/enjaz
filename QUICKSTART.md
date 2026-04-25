# 🚀 Enjaz Management System - Quick Start Card

## ⚡ Get Running in 5 Minutes

### 1️⃣ Install (1 min)
```bash
npm install
```

### 2️⃣ Setup Supabase (2 min)
1. Go to https://supabase.com → Create project
2. SQL Editor → Paste `apps/backend/migrations/001_initial_schema.sql` → Run
3. Settings → API → Copy credentials

### 3️⃣ Configure (1 min)
```bash
cd apps/backend
cp .env.example .env
# Edit .env - paste your Supabase URL, keys, and JWT secrets
```

### 4️⃣ Start (1 min)
```bash
npm run dev
```

### 5️⃣ Login
- Open http://localhost:5173
- Login: `admin@enjaz.com` / `admin123`

---

## 📋 What You Can Do Now

✅ **Login** with 3 different roles (admin/quality/promoter)  
✅ **Create leads** as promoter  
✅ **Approve/reject leads** as quality  
✅ **Check-in/out** for attendance  
✅ **Export to Excel** (leads & attendance)  
✅ **Manage users** as admin  
✅ **View dashboard** with real-time stats  

---

## 🔑 Test Accounts

| Email | Password | Role |
|-------|----------|------|
| admin@enjaz.com | admin123 | Admin |
| quality@enjaz.com | quality123 | Quality |
| promoter@enjaz.com | promoter123 | Promoter |

---

## 📂 Key Files

- **Setup Guide:** `docs/SETUP.md`
- **Full Details:** `docs/PHASE1_COMPLETE.md`
- **Requirements:** `docs/PRD.md`
- **Backend Config:** `apps/backend/.env`
- **Database Schema:** `apps/backend/migrations/001_initial_schema.sql`

---

## 🆘 Troubleshooting

**Backend won't start?**
→ Check `.env` file has all Supabase credentials

**Login fails?**
→ Verify database migration ran successfully

**Port already in use?**
→ Backend uses 5000, Frontend uses 5173

---

## 📞 Need Help?

Check `docs/SETUP.md` for detailed instructions.

---

**Built:** April 22, 2026  
**Status:** ✅ Ready for Testing
