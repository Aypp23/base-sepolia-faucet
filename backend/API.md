# Base Sepolia Faucet API Documentation

## Base URL
```
http://localhost:3001
```

## Endpoints

### GET /health
Check server health and get network information.

**Response:**
```json
{
  "success": true,
  "status": "healthy",
  "network": {
    "chainId": 84532,
    "name": "base-sepolia",
    "blockNumber": 29438023,
    "walletBalance": "1.0",
    "walletAddress": "0x2BD5A85BFdBFB9B6CD3FB17F552a39E899BFcd40"
  },
  "stats": {
    "total": 0,
    "success": 0,
    "failed": 0
  },
  "timestamp": "2025-08-08T09:12:16.084Z"
}
```

### GET /stats
Get faucet usage statistics.

**Response:**
```json
{
  "success": true,
  "stats": {
    "total": 0,
    "success": 0,
    "failed": 0
  }
}
```

### POST /request
Request testnet ETH from the faucet.

**Request Body:**
```json
{
  "address": "0x1234567890123456789012345678901234567890",
  "captchaToken": "recaptcha_token_from_frontend"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "txHash": "0xabc123def456789...",
  "amount": 0.001,
  "blockNumber": 29438023,
  "message": "Successfully sent 0.001 ETH to 0x1234..."
}
```

**Error Responses:**

**400 - Bad Request:**
```json
{
  "success": false,
  "error": "Missing required fields: address and captchaToken are required"
}
```

```json
{
  "success": false,
  "error": "Invalid Ethereum address format"
}
```

```json
{
  "success": false,
  "error": "reCAPTCHA verification failed: The response parameter is invalid or malformed"
}
```

**429 - Rate Limit Exceeded:**
```json
{
  "success": false,
  "error": "Rate limit exceeded. You can only request once every 24 hours."
}
```

**500 - Server Error:**
```json
{
  "success": false,
  "error": "Insufficient funds in faucet wallet"
}
```

```json
{
  "success": false,
  "error": "Transaction failed: unable to estimate gas"
}
```

### GET /transaction/:txHash
Check transaction status.

**Parameters:**
- `txHash` (string): Transaction hash (0x-prefixed hex string)

**Success Response:**
```json
{
  "success": true,
  "txHash": "0xabc123def456789...",
  "status": "success",
  "message": "Transaction successful",
  "blockNumber": 29438023,
  "gasUsed": "21000"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Invalid transaction hash format"
}
```

## Error Codes

| Status | Description |
|--------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid input data |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server or blockchain error |

## Rate Limiting

- **Per Address**: 1 request per 24 hours
- **Per IP**: 100 requests per 15 minutes

## Security

- All endpoints use HTTPS in production
- CORS enabled for frontend integration
- Helmet.js security headers
- Input validation and sanitization
- SQL injection protection
- Environment variable configuration

## Testing

Run the test script to verify the API:
```bash
node test-faucet.js
```

## Frontend Integration

The API is designed to work with the frontend in the `base-sepolia-faucet` directory. The frontend should:

1. Implement Google reCAPTCHA v2
2. Send POST requests to `/request` with address and captchaToken
3. Display transaction results and error messages
4. Check transaction status using `/transaction/:txHash` 