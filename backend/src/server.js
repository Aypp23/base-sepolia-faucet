require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const FaucetDatabase = require('./database');
const RecaptchaVerifier = require('./recaptcha');
const EthereumService = require('./ethereum');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize services
let db, recaptcha, ethereum;

async function initializeServices() {
  try {
    db = new FaucetDatabase(process.env.DB_PATH);
    await db.initDatabase();
    recaptcha = new RecaptchaVerifier(process.env.RECAPTCHA_SECRET_KEY);
    ethereum = new EthereumService(process.env.RPC_URL, process.env.PRIVATE_KEY);
    console.log('✅ Services initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    process.exit(1);
  }
}

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

// Rate limiting for all requests
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  }
});

app.use(generalLimiter);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const networkInfo = await ethereum.getNetworkInfo();
    const stats = await db.getStats();
    
    res.json({
      success: true,
      status: 'healthy',
      network: networkInfo,
      stats: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      details: error.message
    });
  }
});

// Stats endpoint
app.get('/stats', async (req, res) => {
  try {
    const stats = await db.getStats();
    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics'
    });
  }
});

// Main faucet request endpoint
app.post('/request', async (req, res) => {
  const { address, captchaToken } = req.body;
  const clientIp = req.ip || req.connection.remoteAddress;

  try {
    // Validate request body
    if (!address || !captchaToken) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: address and captchaToken are required'
      });
    }

    // Validate Ethereum address
    if (!ethereum.isValidAddress(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Ethereum address format'
      });
    }

    // Check rate limiting (24 hours per address)
    const rateLimitHours = parseInt(process.env.RATE_LIMIT_HOURS) || 24;
    const hasRecent = await db.hasRecentRequest(address, rateLimitHours);
    if (hasRecent) {
      const timeInfo = await db.getTimeUntilNextRequest(address, rateLimitHours);
      const hours = Math.floor(timeInfo.secondsRemaining / 3600);
      const minutes = Math.floor((timeInfo.secondsRemaining % 3600) / 60);
      const seconds = timeInfo.secondsRemaining % 60;
      
      let timeString = '';
      if (hours > 0) {
        timeString = `${hours}h ${minutes}m ${seconds}s`;
      } else if (minutes > 0) {
        timeString = `${minutes}m ${seconds}s`;
      } else {
        timeString = `${seconds}s`;
      }
      
      return res.status(429).json({
        success: false,
        error: `Rate limit exceeded. You can only request once every ${rateLimitHours} hours.`,
        timeRemaining: timeInfo.secondsRemaining,
        timeString: timeString,
        nextAllowed: timeInfo.nextAllowed
      });
    }

    // Verify reCAPTCHA
    try {
      await recaptcha.verifyToken(captchaToken, clientIp);
    } catch (captchaError) {
      return res.status(400).json({
        success: false,
        error: captchaError.message
      });
    }

    // Record the request in database
    const faucetAmount = parseFloat(process.env.FAUCET_AMOUNT) || 0.001;
    await db.recordRequest(address, faucetAmount.toString());

    // Send transaction
    try {
      const txResult = await ethereum.sendTransaction(address, faucetAmount);
      
      // Update database with transaction hash
      await db.updateRequestWithTx(address, txResult.txHash);

      res.json({
        success: true,
        txHash: txResult.txHash,
        amount: faucetAmount,
        blockNumber: txResult.blockNumber,
        message: `Successfully sent ${faucetAmount} ETH to ${address}`
      });

    } catch (txError) {
      // Update database with error
      await db.updateRequestWithError(address, txError.message);

      res.status(500).json({
        success: false,
        error: txError.message
      });
    }

  } catch (error) {
    console.error('Faucet request error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Transaction status endpoint
app.get('/transaction/:txHash', async (req, res) => {
  try {
    const { txHash } = req.params;
    
    if (!txHash || !/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid transaction hash format'
      });
    }

    const status = await ethereum.getTransactionStatus(txHash);
    
    res.json({
      success: true,
      txHash: txHash,
      ...status
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  db.close();
  process.exit(0);
});

// Start server
async function startServer() {
  await initializeServices();
  
  app.listen(PORT, () => {
    console.log(`🚰 Base Sepolia Faucet Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📈 Stats: http://localhost:${PORT}/stats`);
  });
}

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
}); 