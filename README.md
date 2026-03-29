# ⛳ GolfGives — Play. Win. Give.

> A subscription-based golf platform combining performance tracking, 
> monthly prize draws, and charitable giving.

🌐 **Live Demo:** [https://golf-project-pi.vercel.app](https://golf-project-pi.vercel.app)

---

## 📸 Screenshots
<img width="1905" height="858" alt="image" src="https://github.com/user-attachments/assets/34714a6e-9596-40f3-ae46-b6678a8c5ce6" />


### 🏠 Homepage
<img width="1917" height="867" alt="image" src="https://github.com/user-attachments/assets/b6a0c748-b04a-4cd9-896a-d6d3746dd2b7" />


### 🔐 Login / Signup
<img width="1916" height="869" alt="image" src="https://github.com/user-attachments/assets/f7d43408-870a-466d-b883-0a7219b45646" />


### 📊 User Dashboard
<img width="1917" height="867" alt="image" src="https://github.com/user-attachments/assets/a69c9c50-5636-45ad-879a-58ef00e5091b" />


### ❤️ Charities Page
<img width="1919" height="869" alt="image" src="https://github.com/user-attachments/assets/d679d6f4-1533-4ad7-b25a-7ed0fbe8e2ba" />



---

## ✨ Features

### 👤 User
- Signup & Login with email verification
- Monthly & Yearly subscription plans
- Stableford score entry (1–45 range)
- Rolling 5-score system — oldest auto-removed
- Charity selection with contribution percentage
- Monthly draw participation (3, 4, 5 number match)
- Winnings overview with payment status
- Full user dashboard

### 🛠️ Admin
- Platform overview & analytics
- User management — view, toggle subscriptions
- Draw management — random & algorithmic modes
- Simulation mode before publishing
- Charity management — add, edit, delete
- Winner verification & payout tracking

### 🎯 Draw & Prize System
| Match Type | Pool Share | Rollover |
|---|---|---|
| 5-Number Match | 40% | ✅ Jackpot |
| 4-Number Match | 35% | ❌ |
| 3-Number Match | 25% | ❌ |

---

## 🧪 Test Credentials

### User Account
```
Email:    test@golfgives.com
Password: test123456
```

### Admin Account
```
Email:    admin@golfgives.com  
Password: admin123456
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Supabase (PostgreSQL + Auth) |
| Hosting | Vercel |
| Payments | Stripe Ready |
| Version Control | GitHub |

---

## 🗄️ Database Schema
```
profiles   — user info, plan, subscription status, role
scores     — stableford scores (rolling 5)
charities  — charity listings with descriptions
winners    — draw results, match type, payout status
draws      — draw history
```

---

## 🚀 Local Setup
```bash
# 1. Clone the repo
git clone https://github.com/dipalikunwar/golf-project

# 2. Open in VS Code
cd golf-project
code .

# 3. Open with Live Server
# Right click index.html → Open with Live Server
```

---

## 📁 Project Structure
```
golf-app/
├── index.html        ← Landing page
├── login.html        ← Login & Signup
├── dashboard.html    ← User dashboard
├── admin.html        ← Admin panel
├── charities.html    ← Charity listings
├── app.js            ← Main Supabase logic
├── admin.js          ← Admin functions
├── style.css         ← Complete stylesheet
└── golf.png          ← Assets
```

---

## 🔐 Environment

- Supabase project hosted on new account
- Vercel deployment on new account
- RLS configured on all tables
- JWT authentication via Supabase Auth

---

## 👩‍💻 Built By

**Dipali Kunwar**  
Built as part of Digital Heroes Full-Stack Development 
Trainee Selection Process — March 2026

---

*Issued by [Digital Heroes](https://digitalheroes.co.in) · 
PRD Version 1.0 · March 2026*
