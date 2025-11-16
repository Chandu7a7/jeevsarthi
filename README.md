# JEEVSARTHI 🐄

**AI + Blockchain Enabled Portal for Monitoring Antimicrobial Usage (AMU) and Maximum Residue Limits (MRL) in Livestock**

---

## 📋 Project Overview

JEEVSARTHI is a comprehensive MERN stack application designed to help farmers, veterinarians, lab officers, and regulators monitor and manage antimicrobial usage in livestock, ensuring food safety compliance and traceability through AI predictions and blockchain verification.

---

## 🏗️ Tech Stack

### Backend
- **Node.js** + **Express.js**
- **MongoDB** (Mongoose ODM)
- **JWT** Authentication
- **Socket.IO** (Real-time notifications)
- **Node-Cron** (Automated alerts)
- **bcrypt** (Password hashing)

### Frontend
- **React.js**
- **Tailwind CSS**
- **Recharts** (Data visualization)
- **React Router**
- **Axios**
- **Socket.IO Client**

### AI/ML
- **Python** (Flask/FastAPI)
- **Scikit-learn** (ML models)
- **Pandas** (Data processing)

### Blockchain
- **SHA256** Hash generation
- **QR Code** generation for traceability

---

## 📁 Project Structure

```
JEEVSARTHI/
├── server/                 # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── jobs/
│   ├── package.json
│   └── .env.example
│
├── client/                 # Frontend (React + Tailwind)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── context/
│   │   └── utils/
│   └── package.json
│
├── ml-service/            # AI/ML Microservice
│   ├── app.py
│   ├── train.py
│   └── requirements.txt
│
└── docs/                  # Documentation
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)
- Python 3.8+
- npm or yarn

### Installation

#### 1. Clone the repository
```bash
git clone <repository-url>
cd jeevsarthi
```

#### 2. Backend Setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

#### 3. Frontend Setup
```bash
cd client
npm install
npm start
```

#### 4. ML Service Setup
```bash
cd ml-service
pip install -r requirements.txt
python app.py
```

---

## 🔐 Authentication & Roles

The system supports 4 user roles:

1. **Farmer** 👨‍🌾
   - Register animals
   - Add treatments
   - View alerts
   - Scan QR codes
   - Consult with vets

2. **Veterinarian** 👨‍⚕️
   - Add prescriptions
   - Verify treatments
   - Monitor compliance
   - AI recommendations

3. **Lab Officer** 🧪
   - Upload test results
   - MRL validation
   - Generate reports
   - Blockchain hash generation

4. **Regulator** 🏛️
   - Monitor violations
   - View analytics
   - Generate compliance reports
   - Issue warnings

---

## 📊 Key Features

- ✅ **Smart Alerts System** - Automated warnings for withdrawal periods, MRL violations
- ✅ **AI-Powered Predictions** - MRL violation risk assessment
- ✅ **Blockchain Traceability** - SHA256 hashing for all records
- ✅ **QR Code Generation** - Quick verification and animal registration
- ✅ **Real-time Notifications** - WebSocket-based alerts
- ✅ **Multi-language Support** - Hindi, English, Marathi, Gujarati
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Dark Mode** - Toggleable theme

---

## 🔧 Environment Variables

### Server (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/jeevsarthi
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
NODE_ENV=development

# Twilio (SMS)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE=

# Firebase (Push Notifications)
FIREBASE_SERVER_KEY=

# Socket.IO
SOCKET_PORT=5001
```

---

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user

### Animals
- `POST /api/animals` - Register new animal
- `GET /api/animals` - Get user's animals
- `GET /api/animals/:id` - Get animal details

### Treatments
- `POST /api/treatments` - Add treatment
- `GET /api/treatments` - Get treatments
- `PUT /api/treatments/:id` - Update treatment

### Lab Tests
- `POST /api/lab-tests` - Upload test result
- `GET /api/lab-tests` - Get test results
- `GET /api/lab-tests/:id` - Get test details

### Alerts
- `GET /api/alerts` - Get user alerts
- `PUT /api/alerts/:id/read` - Mark as read

---

## 🤝 Contributing

This project is developed for SIH 2025 (Smart India Hackathon).

---

## 📄 License

MIT License

---

## 👥 Team

**Developed by Team Cattle-Coders | SIH 2025**

---

## 🆘 Support

For issues and questions, please open an issue on GitHub.

