# n8n Exchange API

A RESTful API built with Express.js and Firebase Authentication for user management and authentication.

## 🚀 Features

- **Firebase Authentication** - Secure user authentication using Firebase Admin SDK
- **User Registration** - Create new user accounts
- **User Login** - Authenticate existing users
- **Password Reset** - Generate password reset links
- **Session Management** - Token-based authentication with logout functionality

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase project with Admin SDK credentials

## 🛠️ Installation

1. Clone the repository:

```bash
git clone https://github.com/Udit-Nayak/n8n-exchange.git
cd n8n-exchange
```

2. Navigate to the backend folder:

```bash
cd backend
```

3. Install dependencies:

```bash
npm install
```

4. Configure environment variables:
   - Copy `.env.example` to `.env` (if exists) or create a `.env` file
   - Update the following variables:

```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
```

5. Add Firebase credentials:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Navigate to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file as `n8n-exchange-d9fef-firebase-adminsdk-fbsvc-239e00ad71.json` in the `backend` folder

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:3000`

## 📡 API Endpoints

### Base URL

```
http://localhost:3000/api
```

### Authentication Endpoints

#### 1. Register User

- **POST** `/api/auth/register`
- **Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "displayName": "John Doe" // optional
}
```

- **Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "uid": "firebase-user-id",
    "email": "user@example.com",
    "displayName": "John Doe"
  },
  "token": "custom-firebase-token"
}
```

#### 2. Login User

- **POST** `/api/auth/login`
- **Body:**

```json
{
  "email": "user@example.com"
}
```

- **Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "uid": "firebase-user-id",
    "email": "user@example.com",
    "displayName": "John Doe",
    "emailVerified": false
  },
  "token": "custom-firebase-token"
}
```

#### 3. Logout User

- **POST** `/api/auth/logout`
- **Body:**

```json
{
  "uid": "firebase-user-id"
}
```

- **Response:**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### 4. Forgot Password

- **POST** `/api/auth/forgot-password`
- **Body:**

```json
{
  "email": "user@example.com"
}
```

- **Response:**

```json
{
  "success": true,
  "message": "Password reset link generated",
  "resetLink": "https://firebase-reset-link"
}
```

## 🗂️ Project Structure

```
n8n-exchange/
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── firebase.js          # Firebase Admin SDK configuration
│   ├── controllers/
│   │   └── auth.controllers.js  # Authentication controllers
│   ├── middleware/
│   │   └── authMiddleware.js    # (Future) Auth middleware
│   ├── routes/
│   │   └── auth.routes.js       # Authentication routes
│   ├── .env                      # Environment variables
│   ├── .gitignore
│   ├── package.json
│   ├── server.js                 # Express server entry point
│   └── n8n-exchange-d9fef-firebase-adminsdk-fbsvc-239e00ad71.json
└── README.md
```

## 🔧 Technologies Used

- **Express.js** - Web framework for Node.js
- **Firebase Admin SDK** - Backend authentication and user management
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management
- **Mongoose** - MongoDB object modeling (ready for database integration)
- **Nodemon** - Development auto-reload

## 🔐 Security

- Firebase service account credentials are stored securely
- The `.gitignore` file excludes sensitive files from version control
- CORS is configured for secure cross-origin requests
- Password reset links are generated securely through Firebase

## 🚨 Error Handling

All endpoints include comprehensive error handling:

- **400** - Bad Request (missing required fields)
- **404** - Not Found (user doesn't exist)
- **409** - Conflict (email already exists)
- **500** - Internal Server Error

## 📝 Notes

- The login endpoint generates a custom token but doesn't verify passwords (client-side authentication expected)
- Password reset links should be sent via email in production
- Custom tokens should be exchanged for ID tokens on the client side

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

ISC

## 👤 Author

**Udit Nayak**

- GitHub: [@Udit-Nayak](https://github.com/Udit-Nayak)

---

Made with ❤️ for n8n Exchange
