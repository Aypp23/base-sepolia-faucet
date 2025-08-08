# Base Sepolia Faucet Backend

A Node.js backend server for dispensing Base Sepolia testnet ETH with rate limiting, reCAPTCHA verification, and transaction tracking.

## Features

- ✅ **Express.js server** with security middleware
- ✅ **POST /request endpoint** for faucet requests
- ✅ **Google reCAPTCHA v2 verification** 
- ✅ **0.001 ETH dispensation** per valid request
- ✅ **ethers.js integration** for blockchain transactions
- ✅ **Base Sepolia RPC** connection
- ✅ **24-hour rate limiting** per address
- ✅ **SQLite database** for request tracking
- ✅ **Environment variable configuration**
- ✅ **Comprehensive error handling**
- ✅ **Health check and stats endpoints**

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Base Sepolia testnet ETH in faucet wallet

## Installation

1. **Clone and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

## Environment Variables

Create a `.env` file in the backend directory:

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
FRONTEND_URL=http://localhost:3000
```

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will start on port 3001 (or the port specified in your .env file).

## API Endpoints

### POST /request
Request testnet ETH from the faucet.

**Request Body:**
```json
{
  "address": "0x1234567890123456789012345678901234567890",
  "captchaToken": "recaptcha_token_from_frontend"
}
```

**Success Response:**
```json
{
  "success": true,
  "txHash": "0xabc123...",
  "amount": 0.001,
  "blockNumber": 12345,
  "message": "Successfully sent 0.001 ETH to 0x1234..."
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message here"
}
```

### GET /health
Check server health and get network information.

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "network": {
    "chainId": 84532,
    "name": "Base Sepolia",
    "blockNumber": 12345,
    "walletBalance": "1.234",
    "walletAddress": "0x..."
  },
  "stats": {
    "total": 100,
    "success": 95,
    "failed": 5
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### GET /stats
Get faucet usage statistics.

**Response:**
```json
{
  "success": true,
  "stats": {
    "total": 100,
    "success": 95,
    "failed": 5
  }
}
```

### GET /transaction/:txHash
Check transaction status.

**Response:**
```json
{
  "success": true,
  "txHash": "0xabc123...",
  "status": "success",
  "message": "Transaction successful",
  "blockNumber": 12345,
  "gasUsed": "21000"
}
```

## Error Codes

| Status | Error Message | Description |
|--------|---------------|-------------|
| 400 | Missing required fields | address or captchaToken missing |
| 400 | Invalid Ethereum address format | Invalid address format |
| 400 | reCAPTCHA verification failed | Invalid or expired captcha token |
| 429 | Rate limit exceeded | Address has requested within 24 hours |
| 500 | Insufficient funds in faucet wallet | Faucet wallet needs more ETH |
| 500 | Transaction failed | Blockchain transaction error |

## Security Features

- **Helmet.js** for security headers
- **CORS** configuration
- **Rate limiting** (100 requests per 15 minutes per IP)
- **Input validation** for all endpoints
- **SQL injection protection** with prepared statements
- **Environment variable** configuration
- **Graceful error handling**

## Database Schema

The SQLite database stores request history:

```sql
CREATE TABLE requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  address TEXT NOT NULL,
  tx_hash TEXT,
  amount TEXT NOT NULL,
  status TEXT NOT NULL,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Development

### Project Structure
```
backend/
├── src/
│   ├── server.js          # Main Express server
│   ├── database.js        # SQLite database operations
│   ├── ethereum.js        # Ethereum/ethers.js operations
│   └── recaptcha.js       # Google reCAPTCHA verification
├── package.json
├── .env
└── README.md
```

### Adding New Features

1. **New endpoints**: Add to `server.js`
2. **Database operations**: Extend `database.js`
3. **Blockchain operations**: Extend `ethereum.js`
4. **External API calls**: Create new service modules

## Troubleshooting

### Common Issues

1. **"Insufficient funds"**: Add more ETH to faucet wallet
2. **"reCAPTCHA verification failed"**: Check secret key configuration
3. **"Invalid address"**: Ensure proper Ethereum address format
4. **"Rate limit exceeded"**: Wait 24 hours between requests

### Logs

Check console output for detailed error messages and transaction status.

## License

MIT License 