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

### Backend (Render - Recommended)

The backend needs to be deployed separately. Render is recommended for its simplicity and free tier.

#### **Option 1: Using render.yaml (Recommended)**

1. **Push your code to GitHub** (already done)
2. **Go to [Render Dashboard](https://dashboard.render.com/)**
3. **Click "New +" → "Blueprint"**
4. **Connect your GitHub repository**: `https://github.com/Aypp23/base-sepolia-faucet`
5. **Render will automatically detect the `render.yaml` configuration**
6. **Click "Apply" to deploy**

#### **Option 2: Manual Deployment**

1. **Go to [Render Dashboard](https://dashboard.render.com/)**
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**: `https://github.com/Aypp23/base-sepolia-faucet`
4. **Configure the service:**
   - **Name**: `base-sepolia-faucet-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: `Free`

5. **Add Environment Variables:**
   ```
   NODE_ENV=production
   PORT=10000
   RPC_URL=https://sepolia.base.org
   PRIVATE_KEY=your_private_key_here
   RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key
   FAUCET_AMOUNT=0.001
   RATE_LIMIT_HOURS=24
   DB_PATH=./faucet.db
   ```

6. **Click "Create Web Service"**

#### **Update Frontend API Endpoint**

After deploying the backend, update the API endpoint in `frontend/vite.config.ts`:

```typescript
proxy: {
  '/api': {
    target: 'https://your-render-service-name.onrender.com',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, ''),
  },
},
```

Replace `your-render-service-name` with your actual Render service name.

#### **Alternative: Railway Deployment**

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and deploy:**
   ```bash
   railway login
   railway init
   railway up
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