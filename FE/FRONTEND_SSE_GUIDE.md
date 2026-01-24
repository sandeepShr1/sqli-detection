# Frontend SSE Integration - Real-time Notifications

## Overview

This guide explains how the Server-Sent Events (SSE) integration works in the frontend to receive real-time SQL injection attack notifications.

## Features Implemented

### ✅ Complete Feature List

1. **Real-time SSE Connection** - Automatic connection for admin users
2. **Redux State Management** - Centralized notification state
3. **Red Dot Indicator** - Visual badge on notification icon showing unread count
4. **Browser Notifications** - Native desktop notifications when attack detected
5. **Sound Alerts** - Audio notification for security alerts
6. **Auto-Reconnection** - Exponential backoff reconnection strategy
7. **Combined Notifications** - Both SSE and database notifications in one view
8. **Visual Indicators** - "NEW" badge for SSE notifications
9. **Responsive Design** - Animated notification badges

## Architecture

### File Structure

```
FE/src/
├── components/
│   ├── layout/Header/
│   │   ├── Navbar.js              # Navbar with notification badge
│   │   └── Navbar.css             # Styles for notification badge
│   └── Notification/
│       ├── Notification.js        # Notification page component
│       └── Notification.css       # Notification styles
├── redux/
│   ├── actions/
│   │   └── notificationActions.js # Redux actions
│   ├── reducers/
│   │   └── notificationReducer.js # Redux reducers (added sseNotificationsReducer)
│   ├── constants/
│   │   └── notificationConstants.js # Redux constants
│   └── store.js                   # Redux store
└── utils/
    └── useSSENotifications.js     # Custom SSE hook
```

## How It Works

### 1. Custom SSE Hook (`useSSENotifications.js`)

**Purpose**: Manages SSE connection lifecycle and dispatches events to Redux

**Features**:

- Auto-connects for admin users (userType "2")
- Handles connection, messages, and errors
- Implements exponential backoff for reconnection
- Dispatches notifications to Redux store
- Shows browser notifications
- Plays sound alerts

**Usage**:

```javascript
import useSSENotifications from "../../../utils/useSSENotifications";

const { markAsRead, clearAll } = useSSENotifications(isAdmin);
```

### 2. Redux Integration

#### Constants (`notificationConstants.js`)

```javascript
export const SSE_NOTIFICATION_RECEIVED = "SSE_NOTIFICATION_RECEIVED";
export const SSE_NOTIFICATION_MARK_READ = "SSE_NOTIFICATION_MARK_READ";
export const SSE_NOTIFICATION_CLEAR_ALL = "SSE_NOTIFICATION_CLEAR_ALL";
export const SSE_CONNECTION_STATUS = "SSE_CONNECTION_STATUS";
```

#### Reducer (`sseNotificationsReducer`)

```javascript
{
  unreadNotifications: [],  // Array of SSE notifications
  unreadCount: 0,           // Count of unread notifications
  isConnected: false        // SSE connection status
}
```

#### Store

The reducer is added to the Redux store:

```javascript
sseNotifications: sseNotificationsReducer;
```

### 3. Navbar Component

**Features**:

- Shows notification icon with badge
- Displays unread count (or "99+" for 99+)
- Pulsing animation on badge
- Marks notifications as read on click

**Key Code**:

```javascript
const { user } = useSelector((state) => state.user);
const { unreadCount } = useSelector((state) => state.sseNotifications);
const isAdmin = user && user.userType === "2";

// Initialize SSE for admin
useSSENotifications(isAdmin);

// Notification icon with badge
<NavLink to="/notification">
  <NotificationsIcon />
  {unreadCount > 0 && (
    <span className="notification-badge">
      {unreadCount > 99 ? "99+" : unreadCount}
    </span>
  )}
</NavLink>;
```

### 4. Notification Component

**Features**:

- Displays both SSE and database notifications
- Shows "NEW" badge for SSE notifications
- Different styling for SSE notifications (orange gradient)
- Detailed attack information
- Auto-marks notifications as read when page is viewed

**Key Code**:

```javascript
const { notifications } = useSelector((state) => state.notifications);
const { unreadNotifications } = useSelector((state) => state.sseNotifications);

// Combine notifications
const allNotifications = [
  ...unreadNotifications.map((n) => ({ ...n, isSSE: true })),
  ...notifications.map((n) => ({ ...n, isSSE: false })),
];

// Render SSE notification
const renderSSENotification = (sseData) => (
  <div>
    <p>Attack Type: {sseData.attackType}</p>
    <p>IP: {sseData.ip}</p>
    <p>Route: {sseData.route}</p>
    <p>Payload: {sseData.payload}</p>
  </div>
);
```

## Styling

### Navbar Badge CSS

```css
.notification-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #ff0000;
  color: #fff;
  border-radius: 50%;
  min-width: 18px;
  height: 18px;
  animation: pulse 2s infinite;
  border: 2px solid #fff;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 0, 0, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(255, 0, 0, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(255, 0, 0, 0);
  }
}
```

### SSE Notification Styling

```css
.sse-notification {
  background: linear-gradient(135deg, #fff8e1 0%, #ffe0b2 100%);
  border-left: 5px solid #ff6f00 !important;
  animation: slideInRight 0.5s ease-out;
}

.new-badge {
  background: #ff0000;
  color: #fff;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: bold;
  animation: pulse 2s infinite;
}
```

## User Flow

### For Admin Users:

1. **Login as Admin** (userType "2")

   ```
   User logs in → User data loaded → isAdmin = true
   ```

2. **SSE Auto-Connects**

   ```
   useSSENotifications(true) → EventSource created → Connected to backend
   ```

3. **SQL Injection Detected**

   ```
   Backend detects attack → Sends SSE event → Frontend receives event
   ```

4. **Notification Displayed**

   ```
   Redux state updated → unreadCount++ → Red badge appears on navbar
   ```

5. **User Clicks Notification Icon**

   ```
   Navigate to /notification → markAsRead() called → Badge disappears
   ```

6. **View Notifications**
   ```
   SSE + DB notifications combined → Sorted by time → "NEW" badge on SSE
   ```

### For Regular Users:

- SSE connection is **not** established (isAdmin = false)
- Only database notifications are shown
- No red badge for SSE notifications

## Testing the Implementation

### 1. Setup

```bash
# Make sure backend is running
cd API
npm start

# Make sure frontend is running
cd FE
npm start
```

### 2. Login as Admin

- User must have `userType: "2"` in database
- Login and check browser console for SSE connection logs

### 3. Trigger SQL Injection

```bash
# In another terminal, send malicious request
curl -X POST http://localhost:4000/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin'\'' OR '\''1'\''='\''1",
    "password": "test"
  }'
```

### 4. Observe Results

✅ Console logs: "📨 SSE Event received"
✅ Browser notification appears (if permitted)
✅ Sound plays
✅ Red badge appears on notification icon
✅ Number shows unread count
✅ Badge pulses with animation

### 5. View Notifications

- Click notification icon
- Badge disappears
- See SSE notification with "NEW" badge
- Orange gradient background for SSE notifications

## Browser Notification Permission

The hook automatically requests notification permission:

```javascript
if ("Notification" in window && Notification.permission === "default") {
  Notification.requestPermission();
}
```

To enable:

1. Allow notifications when prompted
2. Or manually enable in browser settings
3. Check browser console for permission status

## Connection Status

Monitor SSE connection in Redux DevTools:

```javascript
state.sseNotifications = {
  unreadNotifications: [...],
  unreadCount: 5,
  isConnected: true  // Connection status
}
```

## Reconnection Logic

- Max attempts: 5
- Backoff strategy: Exponential (1s, 2s, 4s, 8s, 16s)
- Auto-reconnect on disconnect
- Manual refresh needed after max attempts

## Debugging

### Console Logs to Watch For:

```
✅ "Attempting to connect to SSE..."
✅ "SSE Connected successfully"
📨 "SSE Event received: {...}"
🔗 "Connection established: Connected to admin notification stream"
❌ "SSE Error: ..."
🔄 "Reconnecting in X seconds..."
```

### Common Issues:

**SSE Not Connecting**

- Check if user is admin (userType "2")
- Verify token in localStorage
- Check backend is running on port 4000
- Check CORS settings

**Badge Not Showing**

- Verify Redux store has sseNotifications reducer
- Check if unreadCount > 0
- Inspect element to see if badge exists but hidden

**Notifications Not Appearing**

- Check Redux DevTools for SSE_NOTIFICATION_RECEIVED action
- Verify notification component is reading from both stores
- Check browser console for errors

**Sound Not Playing**

- Check browser autoplay policies
- User interaction may be required first
- Try clicking something before first notification

## Performance Considerations

- Only admins connect to SSE (reduces server load)
- Notifications limited to 50 in UI (prevents memory issues)
- Heartbeat every 30 seconds (keeps connection alive)
- Auto-cleanup on component unmount

## Security

- JWT token passed as query parameter (EventSource limitation)
- Backend validates admin privileges
- Connection auto-closes on token expiration
- No sensitive data in client-side state

## Next Steps

### Possible Enhancements:

1. ✨ Add filter for notification severity
2. ✨ Group notifications by attack type
3. ✨ Export notifications to CSV
4. ✨ Notification settings (sound on/off, desktop notifications)
5. ✨ Real-time stats dashboard with SSE data
6. ✨ Mark individual notifications as read/unread
7. ✨ Delete individual notifications

## Summary

The SSE integration provides a complete real-time notification system:

- ✅ Auto-connects for admin users
- ✅ Shows red badge with count
- ✅ Combines SSE + DB notifications
- ✅ Browser and sound alerts
- ✅ Auto-reconnection
- ✅ Clean Redux integration
- ✅ Responsive and animated UI

The system is production-ready and fully functional! 🎉
