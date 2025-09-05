# Chat App Frontend

Frontend for the real-time chat application built with React, TypeScript, and TailwindCSS.

## Features

- ✅ Modern React 18 with TypeScript
- ✅ TailwindCSS for styling
- ✅ Real-time messaging with Socket.IO
- ✅ JWT authentication
- ✅ Responsive design
- ✅ Custom hooks for state management
- ✅ Component-based architecture
- ✅ Form validation
- ✅ Loading states and error handling

## Tech Stack

- **Framework**: React 18
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Real-time**: Socket.IO Client
- **Routing**: React Router DOM
- **HTTP Client**: Fetch API
- **Build Tool**: Create React App

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Button, Input, Avatar, etc.)
│   ├── forms/          # Form components (LoginForm, RegisterForm)
│   └── chat/           # Chat-specific components
├── hooks/              # Custom React hooks
│   ├── useAuth.ts      # Authentication state management
│   └── useChat.ts      # Chat state management
├── pages/              # Page components
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   └── ChatPage.tsx
├── services/           # API and Socket services
│   ├── api.ts          # HTTP API client
│   └── socket.ts       # Socket.IO client
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── App.tsx             # Main app component
└── index.tsx           # App entry point
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend server running on port 5000

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file in the client directory:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

The app will open at `http://localhost:3000`.

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

## Features Overview

### Authentication
- User registration and login
- JWT token management
- Protected routes
- Automatic token refresh

### Chat Interface
- Real-time messaging
- One-to-one and group conversations
- Message read receipts
- Typing indicators
- Online/offline status
- Message timestamps

### UI Components
- Responsive design
- Dark/light mode support (ready for implementation)
- Loading states
- Error handling
- Form validation

## Component Architecture

### Custom Hooks

#### `useAuth`
Manages authentication state including:
- User login/logout
- Token management
- Profile updates
- Socket connection

#### `useChat`
Manages chat functionality including:
- Conversation list
- Message handling
- Real-time updates
- Typing indicators

### Services

#### `apiService`
HTTP client for backend communication:
- Authentication endpoints
- Conversation management
- Message operations
- Error handling

#### `socketService`
Socket.IO client for real-time features:
- Message broadcasting
- Typing indicators
- User presence
- Event management

## Styling

The app uses TailwindCSS with custom configuration:
- Primary color scheme
- Responsive design
- Custom animations
- Component utilities

## State Management

The app uses React hooks for state management:
- `useState` for local component state
- Custom hooks for global state
- Context API for shared state (if needed)

## Real-time Features

Socket.IO integration provides:
- Instant message delivery
- Typing indicators
- User online/offline status
- Message read receipts
- Conversation updates

## Error Handling

Comprehensive error handling includes:
- API error responses
- Network failures
- Validation errors
- User-friendly error messages

## Performance Optimizations

- Component memoization
- Lazy loading (ready for implementation)
- Efficient re-renders
- Optimized bundle size

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

### Adding New Features

1. Create components in appropriate directories
2. Add TypeScript types in `types/`
3. Update services if needed
4. Add tests for new functionality

### Code Style

- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Component-based architecture

## Deployment

### Production Build

```bash
npm run build
```

### Environment Variables

Set the following environment variables for production:
- `REACT_APP_API_URL` - Backend API URL
- `REACT_APP_SOCKET_URL` - Socket.IO server URL

## Troubleshooting

### Common Issues

1. **Socket connection fails**: Check backend server is running
2. **API requests fail**: Verify API_URL environment variable
3. **Build errors**: Clear node_modules and reinstall

### Development Tips

- Use React DevTools for debugging
- Check browser console for errors
- Verify network requests in DevTools
- Test on different screen sizes
