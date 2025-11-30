# 🏥 MediConnect - Complete Telemedicine Platform

MediConnect is a comprehensive full-stack telemedicine platform that connects patients with healthcare providers through real-time video consultations, AI-powered health tools, secure chat, online medicine ordering, and role-based management dashboards.

## 🔗 Live Demo

**Frontend:** https://virtual-health-assistant-app.onrender.com/

## ✨ Key Features

| Feature | Description |
| ------- | ----------- |
| 🎥 **Video Consultations** | WebRTC-powered real-time video calls between patients and doctors with camera/mic controls |
| 💬 **Real-Time Chat** | Socket.IO-based instant messaging with typing indicators and message history |
| 🤖 **AI Health Chatbot** | Intelligent chatbot for health queries and general medical information |
| 🔍 **Symptom Checker** | ML-powered disease prediction based on patient-reported symptoms |
| 💊 **Online Medicine Store** | Browse, search, and order medicines with cart management and order tracking |
| 📋 **Health Records** | Upload, view, and manage medical records (PDF, images) with secure storage |
| 🔔 **Medicine Reminders** | Automated email reminders for medication schedules |
| 📊 **Admin Dashboard** | Comprehensive admin panel to manage doctors, medicines, appointments, and orders |
| 👨‍⚕️ **Doctor Dashboard** | Doctor portal to manage appointments, patient chats, video calls, and earnings |
| 🔐 **Role-Based Access** | Secure JWT authentication with separate interfaces for patients, doctors, and admins |
| 💳 **Payment Integration** | Razorpay integration for appointment bookings and medicine purchases |
| 📧 **Email Notifications** | Automated appointment confirmations and medicine reminder emails |

## 🛠️ Tech Stack

### Frontend
- **React 19** with Vite for fast development
- **Tailwind CSS** for modern, responsive UI
- **Lucide React** for beautiful icons
- **Axios** for API communication
- **React Router** for navigation
- **Socket.IO Client** for real-time features
- **WebRTC** for video calling

### Backend
- **Node.js** with Express framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Socket.IO** for real-time chat and video signaling
- **Multer** for file uploads
- **Cloudinary** for image/document storage
- **Razorpay** for payment processing
- **NodeMailer** for email notifications
- **Node-Cron** for scheduled reminders

### AI/ML
- **Flask** backend for ML model serving
- **Groq API** for AI chatbot responses
- **scikit-learn** for disease prediction model

## 🏗️ Project Structure

```
MediConnect/
├── frontend/          # Patient-facing React application
├── admin/            # Admin & Doctor dashboard React app
├── backend/          # Node.js/Express API server
├── flask/            # Python Flask ML service
└── README.md
```

## 💡 How It Works

### For Patients
1. **Register/Login** - Create account or sign in
2. **Browse Doctors** - Filter by specialty and book appointments
3. **Video Consultation** - Join video calls with doctors at scheduled time
4. **Chat with Doctor** - Real-time messaging during or after appointments
5. **Order Medicines** - Browse medicine catalog, add to cart, and checkout
6. **Health Records** - Upload and manage medical documents
7. **AI Chatbot** - Get instant answers to health questions
8. **Symptom Checker** - Input symptoms to get possible diagnoses
9. **Medicine Reminders** - Set up automated email reminders

### For Doctors
1. **Login** - Access doctor dashboard
2. **Manage Profile** - Update availability, fees, and specialization
3. **View Appointments** - See scheduled patient consultations
4. **Video Calls** - Conduct video consultations with patients
5. **Patient Chat** - Communicate via secure messaging
6. **Track Earnings** - Monitor consultation fees and payments

### For Admins
1. **Dashboard** - View platform statistics and analytics
2. **Manage Doctors** - Add, edit, approve doctor registrations
3. **Manage Medicines** - Add/update medicine inventory
4. **Appointments** - View and manage all appointments
5. **Orders** - Track medicine orders and delivery status

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Python 3.8+ (for Flask ML service)
- Cloudinary account (for file storage)
- Razorpay account (for payments)

### 1. Clone Repository
```bash
git clone https://github.com/ajaykumar11234/MediConnect.git
cd MediConnect
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `.env` file in backend:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
ADMIN_EMAIL=admin@mediconnect.com
ADMIN_PASSWORD=admin_password
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Create `.env` file in frontend:
```env
VITE_BACKEND_URL=http://localhost:4000
VITE_RAZORPAY_KEY_ID=your_razorpay_key
```

### 4. Admin Panel Setup
```bash
cd ../admin
npm install
```

Create `.env` file in admin:
```env
VITE_BACKEND_URL=http://localhost:4000
```

### 5. Flask ML Service Setup
```bash
cd ../flask
python -m venv venv
.\venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

Create `.env` file in flask:
```env
GROQ_API_KEY=your_groq_api_key
```

## 🚀 Running the Application

### Start Backend Server
```bash
cd backend
npm run server
# Server runs on http://localhost:4000
```

### Start Frontend
```bash
cd frontend
npm run dev
# App runs on http://localhost:5174
```

### Start Admin Panel
```bash
cd admin
npm run dev
# Admin panel runs on http://localhost:5173
```

### Start Flask ML Service
```bash
cd flask
.\venv\Scripts\activate
python app.py
# Flask runs on http://localhost:5000
```

## 🔑 Access Credentials

### Admin Login
- Navigate to: `http://localhost:5173/login`
- Email: Set in backend `.env` (ADMIN_EMAIL)
- Password: Set in backend `.env` (ADMIN_PASSWORD)

### Doctor Login
- Doctors must be added by admin first
- Login at: `http://localhost:5173/login`
- Select "Doctor" role

### Patient Access
- Register at: `http://localhost:5174/register`
- Or login at: `http://localhost:5174/login`

## 📸 Features Showcase

### Patient Features
- 🏠 Modern homepage with specialty menu and top doctors
- 👨‍⚕️ Doctor browsing with specialty filtering
- 📅 Appointment booking with calendar
- 🎥 HD video consultations with WebRTC
- 💬 WhatsApp-style chat interface
- 💊 Medicine store with search and cart
- 📋 Health record management with PDF viewer
- 🤖 AI-powered health chatbot
- 🔍 Symptom checker with ML predictions

### Doctor Features
- 📊 Dashboard with appointment overview
- 👥 Patient appointment management
- 🎥 Video call interface with controls
- 💬 Patient messaging system
- 💰 Earnings tracking

### Admin Features
- 📈 Analytics dashboard
- ➕ Add/manage doctors
- 💊 Medicine inventory management
- 📋 Appointment oversight
- 📦 Order management

## 🎯 API Endpoints

### User Routes (`/api/user`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /profile` - Get user profile
- `POST /book-appointment` - Book appointment
- `GET /appointments` - Get user appointments

### Doctor Routes (`/api/doctor`)
- `POST /login` - Doctor login
- `GET /appointments` - Get doctor appointments
- `POST /complete-appointment` - Mark appointment complete

### Admin Routes (`/api/admin`)
- `POST /login` - Admin login
- `POST /add-doctor` - Add new doctor
- `GET /doctors` - Get all doctors
- `POST /add-medicine` - Add medicine
- `GET /appointments` - Get all appointments

### Medicine Routes (`/api/medicine`)
- `GET /list` - Get all medicines
- `POST /order` - Place medicine order
- `GET /orders` - Get user orders

### Chat Routes (`/api/chat`)
- `GET /:appointmentId` - Get chat history
- Socket.IO events for real-time messaging

### Video Routes (WebRTC Signaling)
- Socket.IO events for video call setup

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control
- ✅ Secure file upload validation
- ✅ Environment variable protection
- ✅ CORS configuration
- ✅ Input sanitization

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🐛 Known Issues & Future Enhancements

### Planned Features
- [ ] Group video calls for multiple doctors
- [ ] Screen sharing during video consultations
- [ ] Prescription generation and download
- [ ] Lab test integration
- [ ] Insurance claim management
- [ ] Multi-language support
- [ ] Mobile app (React Native)

## 📄 License

MIT License © 2025 Mekala Ajay Kumar

## 👨‍💻 Author

**Mekala Ajay Kumar**
- GitHub: [@ajaykumar11234](https://github.com/ajaykumar11234)

## 🙏 Acknowledgments

- Groq API for AI capabilities
- Cloudinary for media storage
- Razorpay for payment processing
- Socket.IO for real-time features
- WebRTC for video technology

---

⭐ Star this repository if you found it helpful!
