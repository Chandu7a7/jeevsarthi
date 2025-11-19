# 🔐 Admin Login Guide - JEEVSARTHI

## Super Admin कैसे बनाएं और Login करें

### Step 1: Super Admin User बनाएं

Terminal में server folder में जाएं और यह command run करें:

```bash
cd server
npm run create-super-admin
```

यह script Super Admin user बना देगी:
- **Email:** `superadmin@jeevsarthi.gov.in`
- **Password:** `Admin@123`
- **Role:** `super_admin`

### Step 2: Server Start करें

```bash
# Terminal 1: Backend Server
cd server
npm run dev

# Terminal 2: Frontend Client
cd client
npm run dev
```

### Step 3: Login करें

1. Browser में जाएं: `http://localhost:3000`
2. Login page पर जाएं
3. यह credentials use करें:
   - **Email:** `superadmin@jeevsarthi.gov.in`
   - **Password:** `Admin@123`
4. Login button पर click करें

### Step 4: Super Admin Dashboard

Login के बाद आप automatically Super Admin Dashboard पर redirect हो जाएंगे जहां आप:
- State Admins create कर सकते हैं
- National Analytics देख सकते हैं
- All farms, vets, labs manage कर सकते हैं
- AI Alerts और Blockchain Logs देख सकते हैं

---

## State Admin और District Admin कैसे बनाएं

### State Admin बनाना:

1. Super Admin के रूप में login करें
2. Sidebar में "Create State Admin" पर click करें
3. Form भरें:
   - Name
   - Email
   - Mobile Number
   - State (dropdown से select करें)
   - Password
   - Confirm Password
4. "Create Admin" button click करें

### District Admin बनाना:

1. State Admin के रूप में login करें
2. Sidebar में "Create District Admin" पर click करें
3. Form भरें:
   - Name
   - Email
   - Mobile Number
   - District (dropdown से select करें)
   - Password
   - Confirm Password
4. "Create District Admin" button click करें

---

## Test Admin Users (Quick Setup)

अगर आप quick testing के लिए test admins चाहते हैं, तो नीचे दी गई script चलाएं:

```bash
cd server
node -e "
const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Super Admin
  await User.findOneAndUpdate(
    { email: 'superadmin@jeevsarthi.gov.in' },
    { 
      name: 'Super Admin',
      email: 'superadmin@jeevsarthi.gov.in',
      password: 'Admin@123',
      role: 'super_admin',
      isActive: true
    },
    { upsert: true, new: true }
  );
  
  // State Admin (Maharashtra)
  await User.findOneAndUpdate(
    { email: 'stateadmin@maharashtra.gov.in' },
    {
      name: 'State Admin Maharashtra',
      email: 'stateadmin@maharashtra.gov.in',
      password: 'State@123',
      role: 'state_admin',
      state: 'Maharashtra',
      isActive: true
    },
    { upsert: true, new: true }
  );
  
  // District Admin
  await User.findOneAndUpdate(
    { email: 'districtadmin@pune.gov.in' },
    {
      name: 'District Admin Pune',
      email: 'districtadmin@pune.gov.in',
      password: 'District@123',
      role: 'district_admin',
      state: 'Maharashtra',
      district: 'Pune',
      isActive: true
    },
    { upsert: true, new: true }
  );
  
  console.log('✅ All admin users created!');
  console.log('Super Admin: superadmin@jeevsarthi.gov.in / Admin@123');
  console.log('State Admin: stateadmin@maharashtra.gov.in / State@123');
  console.log('District Admin: districtadmin@pune.gov.in / District@123');
  
  await mongoose.disconnect();
})();
"
```

---

## Admin Login Credentials Summary

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Super Admin** | `superadmin@jeevsarthi.gov.in` | `Admin@123` | National (All India) |
| **State Admin** | `stateadmin@maharashtra.gov.in` | `State@123` | State-level (Maharashtra) |
| **District Admin** | `districtadmin@pune.gov.in` | `District@123` | District-level (Pune) |

---

## Troubleshooting

### Problem: "User not found" error
**Solution:** Make sure you've run `npm run create-super-admin` script first

### Problem: "Invalid credentials" error
**Solution:** Check that you're using the correct email and password (case-sensitive)

### Problem: Dashboard not showing
**Solution:** 
1. Check browser console for errors
2. Verify user role in database: `db.users.findOne({email: 'superadmin@jeevsarthi.gov.in'})`
3. Clear browser cache and try again

### Problem: Can't access admin routes
**Solution:** 
1. Check if user role is correctly set to `super_admin`, `state_admin`, or `district_admin`
2. Verify JWT token is being sent in requests (check Network tab)
3. Make sure backend server is running

---

## Next Steps

1. ✅ Create Super Admin
2. ✅ Login as Super Admin
3. ✅ Create State Admins for different states
4. ✅ State Admins can create District Admins
5. ✅ Start using the admin portal!

**Happy Admin Management! 🎉**

