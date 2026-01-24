# Frontend (FE) Application – Project README

## 📌 Overview

This section describes how to set up and run the **Frontend (React.js) application** locally. The frontend communicates with the backend server via API.

---

## 🛠️ Prerequisites

Ensure the following are installed on your system:

- **Node.js** (Recommended: LTS version)
- **npm** (comes with Node.js)
- **Web browser** (Chrome / Firefox recommended)

---

## 📂 Project Setup

### 1️⃣ Environment Configuration (.env file)

Create a `.env` file in the **root directory of the FE folder**.

Copy and paste the following configuration into the `.env` file:

```env
# Backend API Configuration
REACT_APP_API_URL=http://localhost:4000
REACT_APP_API_KEY=your-secret-api-key

# Ignore source map warnings from node_modules
GENERATE_SOURCEMAP=false
```

⚠️ **Important Notes:**

- The API URL must match the backend server port.
- Restart the frontend server after changing `.env` values.
- Do **not** commit the `.env` file to version control.

---

### 2️⃣ Install Dependencies

Open a terminal in the frontend project root and run:

```bash
npm install
```

or

```bash
npm i
```

This will install all required frontend dependencies and create the `node_modules` folder.

---

### 3️⃣ Run the Frontend Application

Start the React development server using:

```bash
npm start
```

If successful, the application will compile and start automatically.

---

### 4️⃣ Access the Application

Open your browser and navigate to:

```
http://localhost:3000
```

The frontend application should now be running and connected to the backend server.

---

## 🧪 Troubleshooting

- **Blank page or API errors**: Ensure backend server is running on port `4000`
- **Environment variable not detected**: Restart the React server
- **Port already in use**: React may prompt to use another port

---

## 🔐 Best Practices

- Keep API keys secure
- Use HTTPS and environment-based configs for production
- Build production assets using `npm run build`

---

✅ **Frontend application setup completed successfully!**
