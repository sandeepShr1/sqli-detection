# Backend Server – Project README

## 📌 Overview

This document provides step-by-step instructions to set up and run the backend server locally. Please follow the instructions carefully to ensure the application runs without issues.

---

## 🛠️ Prerequisites

Before starting, make sure you have the following installed on your system:

- **Node.js** (Recommended: LTS version)
- **npm** (comes with Node.js)
- **PostgreSQL** (for database support)
- **Git** (optional, but recommended)

---

## 📂 Project Setup

### 1️⃣ Environment Configuration (.env file)

Create a `.env` file in the **root directory** of the backend folder (BE folder).

Copy and paste the following configuration into the `.env` file and update the required values:

```env
# Application Environment
NODE_ENV=development
# NODE_ENV=production

APP_PORT=4000

# Database Credentials
DB_USERNAME=postgres
DB_PASSWORD=
DB_NAME=
DB_HOST=localhost
DB_PORT=5432

# JWT Configuration
JWT_SECRET_KEY=
JWT_EXPIRY_IN=90d

# Cloudinary Credentials
CLOUD_NAME=""
API_KEY=""
API_SECRET=""

# Google Mail / SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SERVICE=gmail
SMTP_MAIL=
SMTP_PASSWORD=
SMTP_ADMIN_MAIL=
```

⚠️ **Important Notes:**

- Do **not** commit the `.env` file to version control.
- Make sure PostgreSQL is running before starting the server.
- Use App Passwords for Gmail SMTP (recommended).

---

### 2️⃣ Install Dependencies

Open a terminal in the project root directory and run:

```bash
npm install
```

or

```bash
npm i
```

This will install all required dependencies and generate the `node_modules` folder.

---

### 3️⃣ Run the Server

To start the server in development mode, run:

```bash
npm run start:dev
```

If everything is configured correctly, the server will start on:

```
http://localhost:4000
```

---

## 🚀 Common Commands

| Command             | Description                                  |
| ------------------- | -------------------------------------------- |
| `npm install`       | Install project dependencies                 |
| `npm run start:dev` | Run server in development mode               |
| `npm run build`     | Build project for production (if applicable) |
| `npm start`         | Start production server                      |

---

## 🧪 Troubleshooting

- **Database connection error**: Check PostgreSQL credentials and ensure the DB service is running.
- **Port already in use**: Change `APP_PORT` in `.env`.
- **JWT errors**: Ensure `JWT_SECRET_KEY` is properly set.
- **Email not sending**: Verify SMTP credentials and Gmail app password.

---

## 🔐 Security Best Practices

- Never expose `.env` values publicly
- Use strong secrets for JWT and SMTP
- Enable HTTPS in production
- Restrict database access in production environments

---

## 📄 License

This project is for educational and internal use. Licensing details can be added here if required.

##

---

✅ **You are now ready to run the backend server!**
