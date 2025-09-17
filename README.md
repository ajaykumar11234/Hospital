MediConnect is a full-stack telemedicine platform that connects patients with doctors through AI-powered disease prediction, live chat, and role-based dashboards.

🔗 Demo

https://virtual-health-assistant-app.onrender.com/

| Feature                              | Description                                                
| ------------------------------------ | ---------------------------------------------------------- 
| Symptom Checker & Disease Prediction | ML model predicts possible diseases based on user symptoms 
| AI Doctor Chatbot                    | Patient-focused AI chatbot answers health queries          
| Personalized Recommendations         | Tailored advice for medications, diet, and exercise        
| History & Records                    | Track previous symptom inputs & disease predictions                |
| Notifications & Reminders            | Automated medicine reminders via email                    
| Secure Role-Based Access             | JWT-based authentication for patients & admins             
| Dashboard Visualizations             | Interactive dashboards for health metrics & AI insights    

🛠️ Tech Stack

Frontend: React, Tailwind CSS

Backend: Node.js, Express, JWT authentication

Database: MongoDB

AI/ML: Groq API for disease prediction, ML model integration

Other Tools: Socket.io (live chat), NodeMailer & NodeCron (notifications), Payment Gateway Integration

💡 How it Works

Patient Symptom Input: Patients enter their symptoms on the portal.

AI Prediction: System predicts potential diseases using ML/Groq API.

Live Chat: Patients can chat with doctors in real-time.

Dashboard Access: Admins and doctors have role-based dashboards to manage schedules, payments, and patients.

Reminders & Notifications: Automated email notifications for appointments and medicines.

🏗️ Setup & Installation
# Clone the repository
git clone https://github.com/ajaykumar11234/MediConnect.git
cd MediConnect

# Backend setup
cd backend
npm install

# Frontend setup
cd ../frontend
npm install


Create .env files in backend & frontend with MongoDB URI, JWT secret, email API keys, and payment gateway keys.

Start servers:

# Backend
cd backend
npm start

# Frontend
cd ../frontend
npm start


Open browser at http://localhost:5173 (or your configured port).

🏆 Achievements

Developed a secure, AI-powered telemedicine platform connecting patients and doctors.

Implemented real-time chat with Socket.io for seamless doctor-patient interaction.

Automated notifications and payment integration for better user experience.

👨‍💻 Contributing

Contributions are welcome! Open an issue or submit a pull request for bug fixes, improvements, or new features.

📄 License

MIT License © 2025 Mekala Ajay Kumar
