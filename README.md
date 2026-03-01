# SkillSwap Local

SkillSwap Local is a hyperlocal skill exchange platform where users can offer their skills and learn from others in their community. Connect with nearby users, chat in real-time, view users on an interactive map, and share posts!

## ✨ Features
- **Smart Matching & Radar**: Find nearby users offering skills you want and wanting skills you offer. View their location on an interactive map (Leaflet).
- **Real-time Chat**: Seamless communication with matches using Socket.io.
- **Community Wall**: Share posts, requests, and tips with the community.
- **Rich User Profiles**: Display skills offered and wanted in a categorized, polished UI.
- **Premium UI**: Modern dark theme with glassmorphism and smooth animations.
- **Database**: Uses SQLite for local development and easily switchable to MySQL for production.

## 🛠️ Tech Stack
- **Backend**: Node.js, Express.js, Sequelize (SQLite/MySQL), Socket.io, JWT Authentication, Multer
- **Frontend**: React, React Router, React Leaflet, Lucide React, Socket.io-client

## 🚀 Getting Started

### Prerequisites
- Node.js (v20.x recommended)
- npm or yarn

### 1. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory. For local development, the application uses **SQLite** by default, meaning you do not need to configure an external database. You only need a simple `.env` file for authentication:
```env
# Required for JWT Authentication
JWT_SECRET=your_super_secret_key_here

# Optional: Set to MySQL related variables ONLY if you are deploying or connecting to an external DB
# DB_HOST=your_host
# DB_USER=your_user
# DB_PASS=your_pass
# DB_NAME=your_db
```

Start the backend server (runs on port 5000):
```bash
npm run dev
```

### 2. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:
```bash
cd frontend
npm install
```

Start the React development server (runs on port 3000):
```bash
npm start
```

### 3. Production Build
To create a production build of the frontend and serve it using the Express backend, run the following from the root directory:
```bash
npm run gcp-build
npm start
```

## 🤝 Contribution
Feel free to open issues or submit pull requests for any improvements or bug fixes.
