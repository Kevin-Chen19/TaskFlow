# Redis Setup Guide for Windows

## Option 1: Download Redis for Windows (Recommended)

### Step 1: Download Redis
1. Visit: https://github.com/tporadowski/redis/releases
2. Download the latest version (e.g., `Redis-x64-5.0.14.1.zip`)

### Step 2: Extract and Run
```powershell
# Extract the zip file to a location, e.g., D:\Redis
cd D:\Redis

# Run Redis server
.\redis-server.exe
```

### Step 3: Add to System PATH (Optional)
```powershell
# Open PowerShell as Administrator
$redisPath = "D:\Redis"
$env:Path += ";$redisPath"

# Or manually add to System Environment Variables:
# Control Panel → System → Advanced system settings → Environment Variables
# Add D:\Redis to the Path variable
```

### Step 4: Verify Installation
```powershell
redis-server --version
```

## Option 2: Using Docker

If you have Docker installed:

```powershell
docker run -d -p 6379:6379 --name redis redis:latest
```

## Option 3: Quick Test (No Redis Required)

If you just want to test the application without Redis, modify the code:

### 1. Comment out Redis in `server/src/index.js`

```javascript
// Comment out Redis client creation
// import { createClient } from 'redis';

// const redisClient = createClient({
//   url: process.env.REDIS_URL || 'redis://localhost:6379'
// });

// redisClient.on('error', (err) => console.error('Redis Client Error', err));

// (async () => {
//   await redisClient.connect();
//   console.log('📦 Redis connected successfully');
// })();

// Comment out in io.use middleware
// await redisClient.setEx(`user_online:${decoded.userId}`, 300, socket.id);

// Comment out in disconnect handler
// await redisClient.del(`user_online:${socket.userId}`);

// Comment out app.set
// app.set('redis', redisClient);
```

### 2. Comment out Redis in `server/src/routes/notifications.js`

```javascript
// In the POST /notifications route, comment out:
// const redis = req.app.get('redis');
// const socketId = await redis.get(`user_online:${receiver_id}`);
// 
// if (socketId) {
//   io.to(`user:${receiver_id}`).emit('notification:new', notificationWithSender);
//   console.log(`📢 Notification pushed to user ${receiver_id}`);
// }
```

### 3. Run without Redis
```powershell
cd "E:\项目管理协作平台\TaskFlow\server"
npm run dev
```

## Verification

After installing Redis, verify it's working:

```powershell
# Start Redis server
redis-server

# In another terminal, test connection
redis-cli ping
# Should return: PONG
```

## Redis Commands

```powershell
# Start Redis server
redis-server

# Connect with CLI
redis-cli

# Check if Redis is running
redis-cli ping

# Stop Redis (in CLI)
shutdown

# Or find and kill the process
tasklist | findstr redis-server
taskkill /PID <pid> /F
```

## Troubleshooting

### Redis not in PATH
If you get "redis-server is not recognized":
```powershell
# Use full path
D:\Redis\redis-server.exe

# Or add to PATH temporarily
$env:Path += ";D:\Redis"
redis-server
```

### Port already in use
If port 6379 is already in use:
```powershell
# Find what's using the port
netstat -ano | findstr :6379

# Kill the process
taskkill /PID <pid> /F

# Or use different port
redis-server --port 6380
```

### Redis connection refused
Make sure Redis server is running before starting the Node.js application.
