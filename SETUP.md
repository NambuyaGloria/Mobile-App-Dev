# Glovo App - Setup Instructions

This project consists of a React Native frontend (Expo) and a Node.js/Express backend with MySQL database.

## Prerequisites

- Node.js (v16 or higher)
- MySQL Server (v8.0 or higher)
- npm or yarn

## Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure database:**
   - Make sure MySQL is running
   - Update `backend/.env` with your MySQL credentials:
     ```
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=your_mysql_password
     DB_NAME=glovo_db
     DB_PORT=3306
     ```

4. **Start the backend server:**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

   The server will run on `http://localhost:3000`
   - Database and tables will be created automatically on first run

## Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure API URL:**
   - Update `frontend/.env` with your backend URL:
     ```
     EXPO_PUBLIC_API_URL=http://localhost:3000/api
     ```
   - **For physical devices:** Replace `localhost` with your computer's IP address
     ```
     EXPO_PUBLIC_API_URL=http://192.168.1.XXX:3000/api
     ```

4. **Start the Expo development server:**
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile (requires auth token)
- `PUT /api/auth/me` - Update user profile (requires auth token)
- `DELETE /api/auth/me` - Delete user account (requires auth token)

### Health Check
- `GET /api/health` - Check API status

## Database Schema

The `users` table is automatically created with the following structure:
- `id` - Primary key (auto-increment)
- `name` - User's full name
- `email` - User's email (unique)
- `password` - Hashed password
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

## CRUD Operations

All CRUD operations are implemented:

- **CREATE:** User registration (`POST /api/auth/register`)
- **READ:** Get user profile (`GET /api/auth/me`)
- **UPDATE:** Update user profile (`PUT /api/auth/me`)
- **DELETE:** Delete user account (`DELETE /api/auth/me`)

## Environment Variables

### Backend (.env)
```
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=glovo_db
DB_PORT=3306
JWT_SECRET=your_super_secret_jwt_key
```

### Frontend (.env)
```
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

## Troubleshooting

1. **Database connection errors:**
   - Ensure MySQL is running
   - Check database credentials in `backend/.env`
   - Verify MySQL port (default: 3306)

2. **API connection errors in frontend:**
   - Ensure backend server is running
   - Check API URL in `frontend/.env`
   - For physical devices, use your computer's IP instead of localhost

3. **Port already in use:**
   - Change PORT in `backend/.env` to a different port
   - Update frontend API URL accordingly

## Running the Full Stack

1. Start MySQL server
2. Start backend: `cd backend && npm start`
3. Start frontend: `cd frontend && npm start`
4. Scan QR code or press platform key (a/i/w) to open app



