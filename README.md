# Friend Wordmap Portal

A web application that allows a group of friends to privately share descriptive words about each other, then reveals a collective "word map" for each person once all inputs are gathered.

## Features

- Authentication system with unique access codes
- Admin and user roles
- Word input interface for describing friends
- Word map visualization
- Profile picture upload
- Administrative controls for user management and word map visibility

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd friend-wordmap-portal
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Create a `.env` file in the backend directory:
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/friend-wordmap
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

5. Initialize the admin user:
```bash
cd ../backend
npm run init-admin
```

## Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Default Admin Account

- Access Code: amos3124
- Name: Amos

## Usage

1. Admin can log in using the admin access code
2. Admin can add new users with their names and access codes
3. Users can log in using their assigned access codes
4. Users can add descriptive words for other users
5. Admin can control when word maps become visible
6. Users can view word maps once they are made visible by the admin

## Security Notes

- Change the JWT_SECRET in the .env file before deploying to production
- Ensure MongoDB is properly secured in production
- Use HTTPS in production
- Implement rate limiting for API endpoints in production 