# FastAPI & ML Model Server – Project README

## 📌 Overview

This service runs a **FastAPI-based machine learning model server** used for SQL injection or query detection. It loads pre-trained models and exposes an API endpoint consumed by the backend (BE) service.

---

## 🛠️ Prerequisites

Ensure the following are installed:

- **Python 3.8+**
- **pip** (Python package manager)
- **Uvicorn** (ASGI server)
- **Git** (optional)

---

## 📂 Project Setup

### 1️⃣ Download Models & Dataset

Download the required models and dataset from the link below:

📥 **Google Drive**
[https://drive.google.com/file/d/1jfbfkaQiXdnZpvzml-0Zn68QK0pDPPLy/view?usp=sharing](https://drive.google.com/file/d/1jfbfkaQiXdnZpvzml-0Zn68QK0pDPPLy/view?usp=sharing)

---

### 2️⃣ Extract Files

1. Extract `model&dataset.zip`
2. Place the extracted contents **inside the `FastAPIAndModel` folder**

After extraction, the folder structure **must** contain:

- `randomforest_tfidf.pkl`
- `tfidf_vectorizer.pkl`
- `MixDataset.1.0.0.csv`

📁 Example structure:

```
FastAPIAndModel/
├── main.py
├── requirements.txt
├── randomforest_tfidf.pkl
├── tfidf_vectorizer.pkl
├── MixDataset.1.0.0.csv
```

---

### 3️⃣ Install Python Dependencies

Navigate to the `FastAPIAndModel` directory and run:

```bash
pip install --no-cache-dir -r requirements.txt
```

This will install all required Python packages.

---

### 4️⃣ Backend Configuration Change

Update the backend middleware so it points to the FastAPI service.

In the **`sqlDetectionMiddleware`** function of the BE project:

🔁 Change this:

```
http://127.0.0.1:5000/detect
```

✅ To this:

```
http://FastAndModel:5000/detect
```

⚠️ This is required for proper inter-service communication (e.g., Docker or networked services).

---

### 5️⃣ Run the FastAPI Server

Start the FastAPI application using Uvicorn:

```bash
uvicorn main:app --reload --port 5000
```

If successful, the server will be available at:

```
http://127.0.0.1:5000
```

Detection endpoint:

```
POST /detect
```

---

## 🧪 Troubleshooting

- **Model not found error**: Ensure `.pkl` files are inside `FastAPIAndModel`
- **Import error**: Reinstall dependencies using `requirements.txt`
- **Port conflict**: Change the port in the Uvicorn command
- **Connection refused from BE**: Confirm FastAPI server is running

---

## 🔐 Best Practices

- Keep `.pkl` model files secure
- Do not expose the FastAPI server publicly without authentication
- Use Docker networking for production deployments

---

## 📄 Notes

This FastAPI service is tightly coupled with the backend server and must be running before backend requests that rely on SQL detection.

---

✅ **FastAPI & Model Server setup completed successfully!**

---
