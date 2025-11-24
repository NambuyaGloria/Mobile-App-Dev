# Glovo Backend API

Backend API for Glovo mobile app built with Node.js, Express, and MySQL.

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update database credentials in `.env`

3. **Set up MySQL database:**
   - Make sure MySQL is running
   - Update database credentials in `.env`
   - The database and tables will be created automatically on first run

4. **Run the server:**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile (requires auth)
- `PUT /api/auth/me` - Update user profile (requires auth)
- `DELETE /api/auth/me` - Delete user account (requires auth)

### Health Check

- `GET /api/health` - Check API status

## Environment Variables

- `PORT` - Server port (default: 3000)
- `DB_HOST` - Database host
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `DB_PORT` - Database port
- `JWT_SECRET` - Secret key for JWT tokens



