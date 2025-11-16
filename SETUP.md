# JEEVSARTHI Setup Guide

Complete setup instructions for the JEEVSARTHI MERN application.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (Local or Atlas account)
- Python 3.8+ (for ML service)
- npm or yarn

## Step-by-Step Setup

### 1. Clone and Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Install ML service dependencies
cd ../ml-service
pip install -r requirements.txt
```

### 2. Configure Environment Variables

#### Server Configuration

Create `server/.env` from `server/.env.example`:

```bash
cd server
cp .env.example .env
```

Edit `server/.env` with your MongoDB URI and secrets:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/jeevsarthi
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
NODE_ENV=development

# Optional: Add Twilio, Firebase, etc.
```

#### Client Configuration

Create `client/.env` from `client/.env.example`:

```bash
cd client
cp .env.example .env
```

### 3. Setup MongoDB

#### Option A: Local MongoDB

1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/jeevsarthi`

#### Option B: MongoDB Atlas

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `server/.env`

### 4. Seed Dummy Data (Optional)

```bash
cd server
node scripts/seedData.js
```

This will create test users and sample data:
- Farmer: `farmer1@example.com` / `password123`
- Vet: `vet@example.com` / `password123`
- Lab: `lab@example.com` / `password123`
- Regulator: `regulator@example.com` / `password123`

### 5. Train ML Model (Optional)

```bash
cd ml-service
python train.py
```

This creates a simple linear regression model for MRL prediction.

### 6. Start Development Servers

#### Terminal 1: Backend Server

```bash
cd server
npm run dev
```

Server will run on `http://localhost:5000`

#### Terminal 2: Frontend Client

```bash
cd client
npm run dev
```

Client will run on `http://localhost:3000`

#### Terminal 3: ML Service (Optional)

```bash
cd ml-service
python app.py
```

ML service will run on `http://localhost:5001`

### 7. Access the Application

1. Open browser: `http://localhost:3000`
2. Register a new user or login with seeded credentials
3. Explore different dashboards based on your role

## Project Structure

```
JEEVSARTHI/
├── server/              # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/      # Database, logger, blockchain config
│   │   ├── models/      # Mongoose models
│   │   ├── routes/      # API routes
│   │   ├── controllers/ # Route controllers
│   │   ├── services/    # Business logic
│   │   ├── middleware/  # Auth, error handling
│   │   ├── utils/       # Helper functions
│   │   ├── jobs/        # Cron jobs
│   │   └── sockets/     # Socket.IO handlers
│   └── scripts/         # Seed data scripts
│
├── client/              # Frontend (React + Tailwind)
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── layouts/     # Layout components
│   │   ├── services/    # API services
│   │   ├── context/     # React context
│   │   └── router/      # React Router config
│
├── ml-service/          # AI/ML Microservice
│   ├── app.py          # Flask API
│   ├── train.py        # Model training
│   └── model/          # Trained models
│
└── docs/               # Documentation
```

## Features by Role

### 👨‍🌾 Farmer
- Register animals
- Add treatments
- View dashboard with charts
- Receive smart alerts
- Scan QR codes
- Consult with vets

### 👨‍⚕️ Veterinarian
- Add prescriptions
- View active treatments
- AI recommendations
- Verify farmer requests
- Consultation requests

### 🧪 Lab Officer
- Upload test results
- View pending samples
- MRL validation
- Generate reports
- Blockchain hash generation

### 🏛️ Regulator
- Monitor violations
- View analytics
- Region-wise statistics
- Generate compliance reports
- Issue warnings

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Farmer
- `GET /api/farmer/dashboard` - Dashboard data
- `POST /api/farmer/animals` - Register animal
- `GET /api/farmer/alerts` - Get alerts

### Treatments
- `POST /api/treatments` - Add treatment
- `GET /api/treatments` - Get treatments

### Lab
- `POST /api/lab/tests` - Upload test result
- `GET /api/lab/dashboard` - Lab dashboard

### Regulator
- `GET /api/regulator/dashboard` - Regulator dashboard
- `GET /api/regulator/regions` - Region stats

### Blockchain
- `GET /api/verify/:hash` - Verify blockchain hash

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network access for Atlas

### Port Already in Use
- Change PORT in `.env`
- Kill process using the port

### Module Not Found
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

### ML Service Not Running
- Install Python dependencies
- Train model first: `python train.py`

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Build frontend: `cd client && npm run build`
3. Use process manager (PM2) for Node.js
4. Configure reverse proxy (Nginx)
5. Enable HTTPS
6. Setup MongoDB Atlas production cluster

## Support

For issues, please check:
1. Environment variables are set correctly
2. MongoDB connection is working
3. All dependencies are installed
4. Ports are not in use

---

**Developed by Team Cattle-Coders | SIH 2025**

