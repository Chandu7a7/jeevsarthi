# Quick MongoDB Atlas Setup Guide

## 🚀 Fast Setup (5 Minutes)

### Step 1: Sign Up
1. Go to: **https://www.mongodb.com/cloud/atlas/register**
2. Sign up with Google/Email (free)

### Step 2: Create Free Cluster
1. Click **"Build a Database"**
2. Choose **"FREE" (M0 Sandbox)** tier
3. Select region closest to you (e.g., `Mumbai` for India)
4. Click **"Create Cluster"** (takes 3-5 minutes)

### Step 3: Create Database User
1. Go to **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Username: `jeevsarthi`
5. Password: **Create a strong password** (save it!)
6. Database User Privileges: **"Atlas admin"**
7. Click **"Add User"**

### Step 4: Configure Network Access
1. Go to **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for development)
   - Or add your IP address for security
4. Click **"Confirm"**

### Step 5: Get Connection String
1. Go to **"Clusters"** (left sidebar)
2. Click **"Connect"** button
3. Choose **"Connect your application"**
4. Driver: **Node.js**, Version: **5.5 or later**
5. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 6: Update .env File
1. Open `server/.env`
2. Replace `MONGODB_URI` with your connection string:
   ```env
   MONGODB_URI=mongodb+srv://jeevsarthi:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/jeevsarthi?retryWrites=true&w=majority
   ```
   **Important:** 
   - Replace `<username>` with `jeevsarthi` (or your username)
   - Replace `<password>` with your database user password
   - Add `/jeevsarthi` before `?` for database name

### Step 7: Restart Server
1. In the server PowerShell window, press `Ctrl+C` to stop
2. Run `npm run dev` again
3. You should see: `✅ MongoDB Connected: cluster0.xxxxx.mongodb.net`

---

## ✅ Verify Connection

After restarting, you should see:
```
info: ✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
```

Instead of:
```
error: ❌ MongoDB Connection Error: ...
```

---

## 🎯 Example Connection String

Your final `.env` should look like:
```env
MONGODB_URI=mongodb+srv://jeevsarthi:mypassword123@cluster0.abc123.mongodb.net/jeevsarthi?retryWrites=true&w=majority
```

**Note:** Replace `mypassword123` with your actual password and `abc123` with your actual cluster ID.

---

## 🆘 Troubleshooting

### Error: "Authentication failed"
- Check username and password in connection string
- Ensure password doesn't have special characters (or URL encode them)
- Verify database user exists in Database Access

### Error: "IP not whitelisted"
- Go to Network Access
- Add your IP address or "Allow from anywhere"

### Error: "Timeout"
- Check internet connection
- Verify cluster is running (not paused)

---

## 📝 After MongoDB is Connected

1. **Seed Test Data** (optional):
   ```powershell
   cd server
   node scripts/seedData.js
   ```

2. **Test Credentials** (after seeding):
   - Farmer: `farmer1@example.com` / `password123`
   - Vet: `vet@example.com` / `password123`
   - Lab: `lab@example.com` / `password123`
   - Regulator: `regulator@example.com` / `password123`

---

**That's it! You're all set! 🎉**

