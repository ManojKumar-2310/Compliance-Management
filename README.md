# Compliance Management System

This project is a full-stack web application designed for compliance management within an organization. It includes features for tracking regulations, assigning tasks, and generating reports.

## Prerequisites

Before running the application, ensure you have the following installed:
- [Node.js](https://nodejs.org/en/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally on port 27017)

## Getting Started

### 1. Server Setup

Navigate to the server directory and install dependencies:

```bash
cd server
npm install
```

**Configuration:**
Ensure you have a `.env` file in the `server` directory with the following content (already present in the repository):
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/cms_db
JWT_SECRET=supersecretkey_change_in_production
JWT_REFRESH_SECRET=superrefreshsecret_change_in_production
JWT_EXPIRE=1d
JWT_REFRESH_EXPIRE=30d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MAX_FILE_SIZE=5242880
```

**Seed the Database:**
To populate the database with initial data (users, departments, regulations, tasks), run:
```bash
node seed.js
```
*Note: This will clear existing data and re-seed the database.*

**Run the Server:**
Start the backend server:
```bash
npm start
# or for development mode with nodemon:
npm run dev
```
The server will start on `http://localhost:5000`.

### 2. Client Setup

Open a new terminal, navigate to the client directory, and install dependencies:

```bash
cd client
npm install
```

**Run the Client:**
Start the frontend development server:
```bash
npm run dev
```
The client will start on `http://localhost:5173`.

## Login Credentials

Use the following credentials to log in:

**Admin:**
- Email: `cheran@123`
- Password: `cheran`

**Employees:**
- Email: `employee@example.com`
- Password: `password123`

**Auditor:**
- Email: `auditor@example.com`
- Password: `password123`

## Project Structure

- `client/`: React frontend application (Vite)
- `server/`: Node.js/Express backend API (MongoDB)
