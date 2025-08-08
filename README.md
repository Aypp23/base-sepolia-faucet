# Base Sepolia Faucet

A complete Base Sepolia testnet faucet application with a modern React frontend and secure Node.js backend.

## 🏗️ Project Structure

```
inco-base/
├── frontend/          # React + TypeScript + Vite application
├── backend/           # Node.js + Express server
├── package.json       # Root package.json with workspace scripts
└── README.md         # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Base Sepolia testnet ETH in faucet wallet

### Installation

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Configure backend environment:**
   ```bash
   cd backend
   cp .env.example .env  # Create from template if available
   # Edit .env with your configuration
   ```

3. **Start development servers:**
   ```bash
   npm run dev
   ```

This will start both frontend (port 8080/8081) and backend (port 3001) servers concurrently.

## 📁 Individual Commands

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build
```

### Backend (Node.js + Express)
```bash
cd backend
npm install
npm run dev          # Development with nodemon
npm start            # Production server
```

## 🔧 Environment Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=3001

# Base Sepolia Configuration
RPC_URL=https://sepolia.base.org
PRIVATE_KEY=your_wallet_private_key_here

# Google reCAPTCHA Configuration
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here

# Faucet Configuration
FAUCET_AMOUNT=0.001
RATE_LIMIT_HOURS=24

# Database Configuration
DB_PATH=./faucet.db

# Optional: Frontend URL for CORS
FRONTEND_URL=http://localhost:8080
```

## 🛠️ Available Scripts

- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:frontend` - Start only frontend development server
- `npm run dev:backend` - Start only backend development server
- `npm run start` - Start both in production mode
- `npm run build` - Build frontend for production
- `npm run install:all` - Install dependencies for all workspaces
- `npm run clean` - Clean all build artifacts and node_modules

## 🌐 Deployment

### Frontend (Vercel)
The frontend is configured for Vercel deployment:

1. **Connect your GitHub repository to Vercel**
2. **Vercel will automatically detect the configuration** from `vercel.json`
3. **Deploy with one click**

### Backend (Railway/Render/Heroku)
The backend needs to be deployed separately:

1. **Deploy to Railway:**
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login and deploy
   railway login
   railway init
   railway up
   ```

2. **Deploy to Render:**
   - Create a new Web Service
   - Connect your GitHub repository
   - Set build command: `cd backend && npm install`
   - Set start command: `cd backend && npm start`
   - Add environment variables

3. **Update API endpoint:**
   After deploying the backend, update the API endpoint in `frontend/vite.config.ts`:
   ```typescript
   proxy: {
     '/api': {
       target: 'https://your-backend-url.com',
       changeOrigin: true,
       rewrite: (path) => path.replace(/^\/api/, ''),
     },
   },
   ```

## 🌐 Access Points

- **Frontend**: http://localhost:8080 (or 8081 if 8080 is busy)
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- **API Stats**: http://localhost:3001/stats

## 📚 API Documentation

See `backend/API.md` for detailed API documentation.

## 🏛️ Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Query for server state
- **Routing**: React Router DOM

### Backend
- **Framework**: Express.js
- **Blockchain**: ethers.js for Ethereum interactions
- **Database**: SQLite for request tracking
- **Security**: Helmet, CORS, Rate limiting
- **Verification**: Google reCAPTCHA v2

## 🔒 Security Features

- Rate limiting (24 hours per address)
- reCAPTCHA verification
- Input validation and sanitization
- CORS protection
- Helmet security headers
- SQL injection prevention

## 📝 License

MIT License 