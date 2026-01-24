# SQL Injection Detection System

## Overview

This system integrates a FastAPI-based machine learning model to detect SQL injection attacks in real-time. When malicious input is detected, it logs the attack details to the database and blocks the request.

## Components

### 1. SQL Detection Middleware (`middleware/sqliDetection.middleware.js`)

- Intercepts incoming requests
- Sends request body to FastAPI detection service
- Logs detected attacks with full details
- Blocks malicious requests with 403 status

### 2. Attack Logs Table (`db/models/attackLog.js`)

Stores the following information for each attack:

- **payload**: The malicious input that was detected
- **confidence**: ML model confidence score (0-1)
- **ip**: IP address of the attacker
- **route**: API endpoint that was targeted
- **method**: HTTP method (GET, POST, PUT, DELETE)
- **userId**: User ID if the attacker was authenticated
- **userAgent**: Browser/client information
- **createdAt/updatedAt**: Timestamps

### 3. Protected Routes

The middleware is integrated into:

#### Authentication Routes:

- `/api/v1/auth/signup` - User registration
- `/api/v1/auth/signin` - User login
- `/api/v1/auth/password/forgot` - Forgot password
- `/api/v1/auth/password/reset/:token` - Reset password
- `/api/v1/auth/password/update` - Update password
- `/api/v1/auth/me/update` - Update profile

#### Product Routes:

- `/api/v1/products` - Product search (GET with query params)
- `/api/v1/products/review` - Submit product review
- `/api/v1/products/new` - Create new product
- `/api/v1/products/update/:id` - Update product
- `/api/v1/products/patch/:id` - Patch product

#### Order Routes:

- `/api/v1/orders/new` - Create order
- `/api/v1/orders/admin/order/:id` - Update order

#### Banner Routes:

- `/api/v1/banners/admin/banner` - Create banner
- `/api/v1/banners/admin/banner/:id` - Update banner

### 4. Admin Endpoints to View Attack Logs

#### Get All Attack Logs

```
GET /api/v1/admin/attacks?page=1&limit=20
```

**Headers**: Authorization: Bearer {token}

**Response**:

```json
{
  "success": true,
  "totalLogs": 150,
  "totalPages": 8,
  "currentPage": 1,
  "logs": [
    {
      "id": 1,
      "payload": "{\"email\":\"admin' OR '1'='1\",\"password\":\"test\"}",
      "confidence": 0.95,
      "ip": "192.168.1.100",
      "route": "/api/v1/auth/signin",
      "method": "POST",
      "userId": null,
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2025-12-24T10:30:00Z",
      "user": null
    }
  ]
}
```

#### Get Attack Statistics

```
GET /api/v1/admin/attacks/stats
```

**Headers**: Authorization: Bearer {token}

**Response**:

```json
{
  "success": true,
  "stats": {
    "totalAttacks": 150,
    "highConfidenceAttacks": 120,
    "last24Hours": 25
  }
}
```

## FastAPI Detection Service

The detection service should be running at `http://127.0.0.1:8000/detect`

Example FastAPI endpoint:

```python
from fastapi import FastAPI
import joblib

app = FastAPI()

model = joblib.load("attack_detector_model.pkl")
vectorizer = joblib.load("tfidf_vectorizer.pkl")

@app.post("/detect")
def detect(payload: dict):
    text = payload["query"]
    vec = vectorizer.transform([text])
    prob = model.predict_proba(vec)[0][1]

    if prob > 0.7:
        return {"attack": True, "confidence": float(prob)}
    else:
        return {"attack": False, "confidence": float(prob)}
```

## Setup Instructions

1. **Run Database Migration**:

   ```bash
   npx sequelize-cli db:migrate
   ```

2. **Start FastAPI Detection Service**:

   ```bash
   cd path/to/fastapi/service
   uvicorn main:app --host 127.0.0.1 --port 8000
   ```

3. **Start Node.js API**:
   ```bash
   npm start
   ```

## How It Works

1. User submits a form (login, search, review, etc.)
2. Request hits the protected route
3. SQL Detection Middleware intercepts the request
4. Request body is sent to FastAPI service at `/detect`
5. If attack is detected (confidence > 0.7):
   - Attack details are logged to `attack_logs` table
   - Request is blocked with 403 response
   - User receives "SQL Injection detected" message
6. If no attack is detected:
   - Request proceeds normally to the controller

## Security Features

- **Real-time Detection**: Every form submission is checked
- **Detailed Logging**: All attack attempts are logged with:
  - User identity (if logged in)
  - IP address
  - Target endpoint
  - Exact malicious payload
  - ML confidence score
- **Graceful Degradation**: If detection service is down, requests are allowed (logged error)
- **Comprehensive Coverage**: Protects authentication, search, forms, and admin operations

## Testing SQL Injection Detection

Try these payloads in login form to test:

```json
{
  "email": "admin' OR '1'='1",
  "password": "anything"
}
```

```json
{
  "email": "test@email.com'; DROP TABLE users--",
  "password": "test123"
}
```

The system should:

1. Block the request with 403 status
2. Return: `{"message": "SQL Injection detected", "confidence": 0.95}`
3. Log the attack in the database

## Monitoring

Admins can monitor attacks by:

1. Viewing all attack logs with pagination
2. Checking attack statistics
3. Filtering by IP, confidence, date range
4. Identifying targeted endpoints
5. Tracking if attackers are authenticated users

## Database Schema

```sql
CREATE TABLE attack_logs (
  id SERIAL PRIMARY KEY,
  payload TEXT NOT NULL,
  confidence FLOAT NOT NULL,
  ip VARCHAR(255),
  route VARCHAR(255) NOT NULL,
  method VARCHAR(255) NOT NULL,
  userId INTEGER REFERENCES user(id),
  userAgent TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attack_logs_ip ON attack_logs(ip);
CREATE INDEX idx_attack_logs_userId ON attack_logs(userId);
CREATE INDEX idx_attack_logs_createdAt ON attack_logs(createdAt);
```

## Notes

- Confidence threshold is set to 0.7 in FastAPI service
- Middleware includes error handling to prevent service disruption
- All logs include timestamps for audit trails
- IP addresses are captured from `req.ip` or `req.connection.remoteAddress`
