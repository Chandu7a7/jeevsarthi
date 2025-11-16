# MongoDB Setup Guide for JEEVSARTHI

## 🔴 Error: MongoDB Connection Failed

If you see this error:
```
Error: connect ECONNREFUSED ::1:27017, connect ECONNREFUSED 127.0.0.1:27017
```

This means MongoDB is not running. Follow one of these options:

---

## Option 1: MongoDB Atlas (Cloud - Recommended) ☁️

**Easiest way - Free cloud database**

1. **Sign up at MongoDB Atlas**
   - Go to: https://www.mongodb.com/cloud/atlas
   - Create a free account

2. **Create a Cluster**
   - Choose "FREE" tier (M0 Sandbox)
   - Select a region closest to you
   - Click "Create Cluster"

3. **Setup Database Access**
   - Go to "Database Access" → "Add New Database User"
   - Choose "Password" authentication
   - Username: `jeevsarthi` (or your choice)
   - Password: Create a strong password
   - Database User Privileges: "Atlas admin" or "Read and write to any database"
   - Click "Add User"

4. **Setup Network Access**
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Or add your IP address for security
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Clusters" → Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster.mongodb.net/jeevsarthi`

6. **Update .env file**
   - Open `server/.env`
   - Replace `MONGODB_URI` with your Atlas connection string:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jeevsarthi
   ```
   - **Important**: Replace `username` and `password` with your actual credentials

7. **Restart Server**
   - Close the server window
   - Run `npm run dev` again

---

## Option 2: Local MongoDB Installation 💻

**For local development**

### Windows:

1. **Download MongoDB Community Server**
   - Go to: https://www.mongodb.com/try/download/community
   - Select Windows version
   - Download MSI installer

2. **Install MongoDB**
   - Run the installer
   - Choose "Complete" installation
   - Install as Windows Service (recommended)
   - Install MongoDB Compass (optional GUI)

3. **Start MongoDB Service**
   ```powershell
   # Check if MongoDB service is running
   Get-Service -Name MongoDB
   
   # Start MongoDB service if not running
   Start-Service -Name MongoDB
   ```

4. **Verify Installation**
   ```powershell
   # Test connection
   mongosh
   # or
   mongo
   ```

5. **Update .env (if needed)**
   ```env
   MONGODB_URI=mongodb://localhost:27017/jeevsarthi
   ```

6. **Restart Server**
   - Close the server window
   - Run `npm run dev` again

### macOS:

```bash
# Install using Homebrew
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Linux (Ubuntu/Debian):

```bash
# Install MongoDB
sudo apt-get install -y mongodb

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

---

## Option 3: Docker 🐳

If you have Docker installed:

```bash
# Run MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Check if running
docker ps
```

Then use:
```env
MONGODB_URI=mongodb://localhost:27017/jeevsarthi
```

---

## ✅ Verify Connection

After setting up MongoDB:

1. **Check Server Logs**
   - Look for: `✅ MongoDB Connected: ...`
   - If you see connection errors, check your connection string

2. **Test Health Endpoint**
   ```bash
   curl http://localhost:5000/health
   ```

3. **Seed Test Data (Optional)**
   ```powershell
   cd server
   node scripts/seedData.js
   ```

---

## 🆘 Troubleshooting

### Error: "Authentication failed"
- Check username/password in connection string
- Ensure database user has correct permissions

### Error: "IP not whitelisted" (Atlas)
- Add your IP address in Network Access settings
- Use "Allow from anywhere" for development only

### Error: "Connection timeout"
- Check internet connection (for Atlas)
- Verify MongoDB service is running (for local)
- Check firewall settings

### MongoDB Service Won't Start
```powershell
# Check MongoDB logs
Get-Content "C:\Program Files\MongoDB\Server\*\log\mongod.log" -Tail 50

# Restart service
Restart-Service -Name MongoDB
```

---

## 📝 Quick Setup Script

For Windows, create `start-mongodb.ps1`:

```powershell
# Check if MongoDB service exists
$service = Get-Service -Name MongoDB -ErrorAction SilentlyContinue

if ($service) {
    if ($service.Status -ne 'Running') {
        Write-Host "Starting MongoDB..." -ForegroundColor Yellow
        Start-Service -Name MongoDB
        Start-Sleep -Seconds 3
    }
    Write-Host "✅ MongoDB is running!" -ForegroundColor Green
} else {
    Write-Host "❌ MongoDB service not found. Please install MongoDB first." -ForegroundColor Red
    Write-Host "Download from: https://www.mongodb.com/try/download/community" -ForegroundColor Cyan
}
```

---

**Recommended**: Use MongoDB Atlas (Option 1) for easiest setup!

