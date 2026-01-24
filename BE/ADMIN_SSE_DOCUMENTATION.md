# Admin SSE (Server-Sent Events) - Real-time SQL Injection Notifications

## Overview

The Admin SSE feature provides real-time notifications to administrators whenever SQL injection attacks are detected. This allows security teams to monitor threats as they happen and respond immediately.

## How It Works

### 1. Architecture

- **SSE Endpoint**: `/api/v1/notifications/admin/events`
- **Authentication**: Requires admin user (userType "2") with valid JWT token
- **Protocol**: Server-Sent Events (SSE) - one-way communication from server to client
- **Connection**: Long-lived HTTP connection that remains open

### 2. Event Flow

```
SQL Injection Detected
        ↓
Middleware detects attack
        ↓
Creates notification in DB
        ↓
Sends email to admin
        ↓
Broadcasts to SSE connection (if connected)
        ↓
Admin dashboard receives real-time alert
```

## API Endpoint

### Connect to SSE Stream

```
GET /api/v1/notifications/admin/events
Authorization: Bearer <admin_jwt_token>
```

**Requirements:**

- Must be authenticated as admin (userType "2")
- Valid JWT token in Authorization header

**Response Headers:**

```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
X-Accel-Buffering: no
```

## Event Types

### 1. CONNECTION Event

Sent immediately when connection is established.

```json
{
  "type": "CONNECTION",
  "message": "Connected to admin notification stream",
  "timestamp": "2026-01-16T10:30:00.000Z"
}
```

### 2. SECURITY_ALERT Event

Sent when SQL injection is detected.

```json
{
  "type": "SECURITY_ALERT",
  "attackType": "SQL Injection",
  "message": "🚨 SQL Injection detected on /api/v1/auth/signin. Field: body.email, Confidence: 95.5%, IP: 192.168.1.100",
  "payload": "admin' OR '1'='1",
  "field": "body.email",
  "confidence": 95.5,
  "ip": "192.168.1.100",
  "route": "/api/v1/auth/signin",
  "method": "POST",
  "userId": null,
  "userEmail": "attacker@example.com",
  "timestamp": "2026-01-16T10:35:24.123Z"
}
```

### 3. Heartbeat (Comment)

Sent every 30 seconds to keep connection alive.

```
:heartbeat 2026-01-16T10:35:00.000Z
```

## Client Implementation

### JavaScript (Browser)

```javascript
const eventSource = new EventSource(
  "http://localhost:4000/api/v1/notifications/admin/events"
);

eventSource.onopen = function () {
  console.log("Connected to SSE");
};

eventSource.onmessage = function (event) {
  const data = JSON.parse(event.data);
  console.log("Received:", data);

  if (data.type === "SECURITY_ALERT") {
    // Handle security alert
    showAlert(data);
  }
};

eventSource.onerror = function (error) {
  console.error("SSE Error:", error);
  eventSource.close();
};
```

**Note:** EventSource doesn't support custom headers. You have two options:

1. Pass token as query parameter: `/admin/events?token=<jwt_token>`
2. Use a proxy or custom implementation with fetch + ReadableStream

### React Example

```jsx
import { useEffect, useState } from "react";

function AdminDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const eventSource = new EventSource(
      `http://localhost:4000/api/v1/notifications/admin/events?token=${token}`
    );

    eventSource.onopen = () => {
      setConnected(true);
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "SECURITY_ALERT") {
        setAlerts((prev) => [data, ...prev]);
        // Show notification
        showNotification(data);
      }
    };

    eventSource.onerror = () => {
      setConnected(false);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div>
      <h1>Security Dashboard</h1>
      <div>Status: {connected ? "✅ Connected" : "❌ Disconnected"}</div>
      <div>
        {alerts.map((alert, idx) => (
          <div key={idx} className="alert">
            <h3>{alert.attackType}</h3>
            <p>{alert.message}</p>
            <code>{alert.payload}</code>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Node.js Client Example

```javascript
const EventSource = require("eventsource");

const token = "your_admin_jwt_token";
const eventSource = new EventSource(
  "http://localhost:4000/api/v1/notifications/admin/events",
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log("Alert received:", data);
};

eventSource.onerror = (error) => {
  console.error("Connection error:", error);
};
```

## Testing

### 1. Get Admin Token

First, login as admin to get JWT token:

```bash
curl -X POST http://localhost:4000/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

Save the token from the response.

### 2. Connect to SSE

Open the provided HTML test file:

```
test-admin-sse.html
```

Or use curl to test:

```bash
curl -N -H "Authorization: Bearer <your_admin_token>" \
  http://localhost:4000/api/v1/notifications/admin/events
```

### 3. Trigger SQL Injection

In another terminal, send a malicious request:

```bash
curl -X POST http://localhost:4000/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin'\'' OR '\''1'\''='\''1",
    "password": "test"
  }'
```

You should see the alert appear in your SSE connection immediately!

## Features

### ✅ Implemented

- Real-time SSE connection for admin users
- Authentication and authorization checks
- Heartbeat to keep connection alive
- Detailed attack information in events
- Connection state management
- Graceful disconnection handling
- Error handling with try-catch
- Database notification storage
- Email notifications to admin

### Connection Management

- Only one admin can be connected at a time
- New connection replaces old one
- Automatic cleanup on disconnect
- Heartbeat every 30 seconds
- Handles client disconnection gracefully

## Deployment Considerations

### Production Setup

1. **CORS Configuration**

   ```javascript
   app.use(
     cors({
       origin: "https://your-admin-dashboard.com",
       credentials: true,
     })
   );
   ```

2. **Nginx Configuration**

   ```nginx
   location /api/v1/notifications/admin/events {
       proxy_pass http://localhost:4000;
       proxy_http_version 1.1;
       proxy_set_header Connection '';
       proxy_set_header Cache-Control 'no-cache';
       proxy_buffering off;
       chunked_transfer_encoding on;
       proxy_read_timeout 86400s;
   }
   ```

3. **Security**

   - Always use HTTPS in production
   - Validate admin privileges on each connection
   - Implement rate limiting
   - Log connection attempts
   - Monitor for suspicious activity

4. **Scalability**
   - For multiple servers, use Redis Pub/Sub
   - Implement reconnection logic on client
   - Consider WebSocket for bidirectional communication
   - Use load balancer with sticky sessions

## Monitoring

### Check Active Connections

```javascript
// Add to notificationController.js
const getSSEStatus = catchAsyncError(async (req, res) => {
  res.json({
    connected: adminSSE !== null,
    timestamp: new Date(),
  });
});
```

### Logs

Monitor server logs for:

- SSE connection established
- SSE connection closed
- SSE send errors
- Attack detections

## Troubleshooting

### Connection Fails

- Check if user is admin (userType "2")
- Verify JWT token is valid
- Check CORS settings
- Ensure endpoint is correct

### Events Not Received

- Check if SQL detection middleware is running
- Verify attack actually triggered detection
- Check server logs for errors
- Ensure connection is still alive

### Connection Drops

- Implement reconnection logic on client
- Check network stability
- Verify heartbeat is working
- Check server resources

## Related Files

- **Controller**: `controller/notificationControlller.js`
- **Middleware**: `middleware/sqliDetection.middleware.js`
- **Routes**: `route/notificationRoute.js`
- **Test File**: `test-admin-sse.html`
- **Model**: `db/models/notification.js`

## Next Steps

1. Open `test-admin-sse.html` in browser
2. Update ADMIN_TOKEN with your admin JWT
3. Click "Connect to SSE"
4. Trigger a SQL injection attack
5. Watch real-time alerts appear!

## Support

For issues or questions:

1. Check server logs
2. Verify admin authentication
3. Test with provided HTML file
4. Check network tab in browser DevTools
