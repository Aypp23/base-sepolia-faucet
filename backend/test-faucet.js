const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testFaucet() {
  console.log('🧪 Testing Base Sepolia Faucet Backend\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed');
    console.log(`   Network: ${healthResponse.data.network.name} (Chain ID: ${healthResponse.data.network.chainId})`);
    console.log(`   Wallet Balance: ${healthResponse.data.network.walletBalance} ETH`);
    console.log(`   Current Block: ${healthResponse.data.network.blockNumber}\n`);

    // Test stats endpoint
    console.log('2. Testing stats endpoint...');
    const statsResponse = await axios.get(`${BASE_URL}/stats`);
    console.log('✅ Stats endpoint working');
    console.log(`   Total Requests: ${statsResponse.data.stats.total}`);
    console.log(`   Successful: ${statsResponse.data.stats.success}`);
    console.log(`   Failed: ${statsResponse.data.stats.failed}\n`);

    // Test faucet request with invalid data (should fail)
    console.log('3. Testing faucet request with invalid data...');
    try {
      await axios.post(`${BASE_URL}/request`, {
        address: 'invalid-address',
        captchaToken: 'invalid-token'
      });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Invalid request properly rejected');
        console.log(`   Error: ${error.response.data.error}\n`);
      } else {
        throw error;
      }
    }

    // Test faucet request with missing fields (should fail)
    console.log('4. Testing faucet request with missing fields...');
    try {
      await axios.post(`${BASE_URL}/request`, {
        address: '0x1234567890123456789012345678901234567890'
        // Missing captchaToken
      });
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Missing fields properly rejected');
        console.log(`   Error: ${error.response.data.error}\n`);
      } else {
        throw error;
      }
    }

    console.log('🎉 All tests passed! The faucet backend is working correctly.');
    console.log('\n📋 Available endpoints:');
    console.log(`   GET  ${BASE_URL}/health     - Server health and network info`);
    console.log(`   GET  ${BASE_URL}/stats      - Faucet usage statistics`);
    console.log(`   POST ${BASE_URL}/request    - Request testnet ETH`);
    console.log(`   GET  ${BASE_URL}/transaction/:txHash - Check transaction status`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run the test
testFaucet(); 