# Chat App Server

Backend server for the real-time chat application built with Node.js, Express, TypeScript, Socket.IO, and MySQL.

## Features

- ✅ JWT-based authentication
- ✅ Real-time messaging with Socket.IO
- ✅ One-to-one and group conversations
- ✅ Message read receipts
- ✅ Typing indicators
- ✅ User online/offline status
- ✅ Message editing and deletion
- ✅ Conversation management
- ✅ MySQL database with Sequelize ORM

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MySQL with Sequelize ORM
- **Real-time**: Socket.IO
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your database credentials and JWT secret:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=chat_app
   DB_USER=root
   DB_PASSWORD=your_password
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

3. **Set up the database**:
   - Create a MySQL database named `chat_app`
   - Run the SQL schema from `../database/schema.sql`:
     ```bash
     mysql -u root -p chat_app < ../database/schema.sql
     ```

4. **Build and run the server**:
   ```bash
   # Development mode with hot reload
   npm run dev
   
   # Production build
   npm run build
   npm start
   ```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - User logout

### Conversations
- `GET /api/conversations` - Get user's conversations
- `POST /api/conversations` - Create new conversation
- `GET /api/conversations/:id` - Get conversation details
- `PUT /api/conversations/:id` - Update conversation (group name)
- `POST /api/conversations/:id/participants` - Add participant
- `DELETE /api/conversations/:id/participants` - Remove participant

### Messages
- `GET /api/messages/conversation/:conversationId` - Get messages
- `POST /api/messages` - Send message
- `PUT /api/messages/:id` - Edit message
- `DELETE /api/messages/:id` - Delete message
- `POST /api/messages/:messageId/read` - Mark message as read
- `POST /api/messages/conversation/:conversationId/read` - Mark conversation as read

## Socket.IO Events

### Client to Server
- `joinConversation` - Join a conversation room
- `leaveConversation` - Leave a conversation room
- `typing` - Send typing indicator
- `markAsRead` - Mark message as read

### Server to Client
- `message` - New message received
- `typing` - User typing indicator
- `userOnline` - User came online
- `userOffline` - User went offline
- `conversationUpdated` - Conversation updated
- `messageRead` - Message read receipt

## Database Schema

The application uses the following main tables:
- `users` - User accounts and profiles
- `conversations` - Chat conversations (direct/group)
- `conversation_participants` - Many-to-many relationship
- `messages` - Chat messages
- `message_reads` - Read receipts
- `typing_indicators` - Real-time typing status

## Development

### Project Structure
```
src/
├── config/          # Database configuration
├── controllers/     # Route controllers
├── middleware/      # Express middleware
├── models/          # Sequelize models
├── routes/          # API routes
├── services/        # Business logic services
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── index.ts         # Server entry point
```

### Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Protected routes middleware
- SQL injection prevention with Sequelize

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | MySQL host | localhost |
| `DB_PORT` | MySQL port | 3306 |
| `DB_NAME` | Database name | chat_app |
| `DB_USER` | Database user | root |
| `DB_PASSWORD` | Database password | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | Token expiration | 7d |
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `CLIENT_URL` | Frontend URL | http://localhost:3000 |
