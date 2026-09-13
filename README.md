# 🚀 UserDash — User Management Dashboard

A full-stack User Management Dashboard built with **HTML, CSS, JavaScript, Node.js, Express.js, and MySQL**.

---

## ✨ Features

- **👥 User Management (CRUD)** — Add, View, Edit, Delete users
- **🔍 Search** — Search by name, email, phone number, or city
- **🔔 Notifications** — Send email notifications to users
- **📊 Analytics** — Charts showing users grouped by City, State, and Country
- **📍 Cascading Dropdowns** — Country → State → City with international phone codes
- **⬆️ Back to Top** — Floating button for easy navigation
- **✅ Validation** — Both frontend and backend form validation

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | HTML5, CSS3, Vanilla JavaScript, Chart.js |
| Backend | Node.js, Express.js |
| Database | MySQL |
| Email | Nodemailer (Ethereal for testing) |

---

## 📁 Project Structure

```
user-management-app/
├── config/
│   └── db.js               # MySQL connection pool
├── controllers/
│   ├── userController.js
│   ├── notificationController.js
│   └── analyticsController.js
├── models/
│   └── userModel.js        # SQL query functions
├── routes/
│   ├── userRoutes.js
│   ├── notificationRoutes.js
│   └── analyticsRoutes.js
├── public/
│   ├── index.html          # SPA frontend
│   ├── css/style.css
│   └── js/
│       ├── app.js
│       ├── users.js
│       ├── notifications.js
│       └── analytics.js
├── sql/
│   └── schema.sql          # Database schema + seed data
├── .env.example            # Environment variable template
├── server.js               # Express entry point
└── package.json
```

---

## ⚙️ Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [MySQL](https://www.mysql.com/) (v8.0+)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/user-management-app.git
cd user-management-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```
Edit `.env` and set your MySQL password:
```
DB_PASSWORD=your_mysql_password
```

### 4. Set up the database
```bash
mysql -u root -p < sql/schema.sql
```

### 5. Start the server
```bash
npm start
```

### 6. Open in browser
Visit **http://localhost:3000** 🎉

---

## 🌐 API Endpoints

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users (supports `?search=`) |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create new user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/notifications/send` | Send email notification |
| GET | `/api/notifications` | Get notification history |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/summary` | Summary stats |
| GET | `/api/analytics/by-city` | Users grouped by city |
| GET | `/api/analytics/by-state` | Users grouped by state |
| GET | `/api/analytics/by-country` | Users grouped by country |

---

## 📸 Screenshots

> Add screenshots of your dashboard here

---

## 📄 License

MIT License — feel free to use and modify!
