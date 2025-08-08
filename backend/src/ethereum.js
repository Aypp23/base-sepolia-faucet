const { ethers } = require('ethers');

class EthereumService {
  constructor(rpcUrl, privateKey) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.chainId = 84532; // Base Sepolia chain ID
  }

  // Validate Ethereum address
  isValidAddress(address) {
    try {
      return ethers.isAddress(address);
    } catch (error) {
      return false;
    }
  }

  // Get wallet balance
  async getBalance() {
    try {
      const balance = await this.provider.getBalance(this.wallet.address);
      return ethers.formatEther(balance);
    } catch (error) {
      throw new Error(`Failed to get wallet balance: ${error.message}`);
    }
  }

  // Send transaction
  async sendTransaction(toAddress, amountInEth) {
    try {
      // Validate recipient address
      if (!this.isValidAddress(toAddress)) {
        throw new Error('Invalid recipient address');
      }

      // Validate and convert amount
      if (amountInEth === undefined || amountInEth === null) {
        throw new Error('Amount is required');
      }
      
      const amount = parseFloat(amountInEth);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Invalid amount');
      }

      // Convert ETH amount to Wei
      const amountInWei = ethers.parseEther(amount.toString());

      // Get current gas price
      const feeData = await this.provider.getFeeData();
      
      // Estimate gas limit
      const gasLimit = await this.provider.estimateGas({
        to: toAddress,
        value: amountInWei
      });

      // Create transaction
      const tx = {
        to: toAddress,
        value: amountInWei,
        gasLimit: gasLimit
      };

      // Add gas price based on network type
      if (feeData.gasPrice) {
        tx.gasPrice = feeData.gasPrice;
      } else if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
        tx.maxFeePerGas = feeData.maxFeePerGas;
        tx.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
      } else {
        // Fallback to a reasonable gas price
        tx.gasPrice = ethers.parseUnits("1.5", "gwei");
      }

      // Send transaction
      const transaction = await this.wallet.sendTransaction(tx);
      
      // Wait for transaction to be mined
      const receipt = await transaction.wait();

      return {
        txHash: transaction.hash,
        blockNumber: Number(receipt.blockNumber),
        gasUsed: receipt.gasUsed ? receipt.gasUsed.toString() : "0",
        effectiveGasPrice: receipt.effectiveGasPrice ? receipt.effectiveGasPrice.toString() : "0"
      };

    } catch (error) {
      if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error('Insufficient funds in faucet wallet');
      } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        throw new Error('Transaction failed: unable to estimate gas');
      } else if (error.code === 'REPLACEMENT_UNDERPRICED') {
        throw new Error('Transaction failed: replacement transaction underpriced');
      } else {
        throw new Error(`Transaction failed: ${error.message}`);
      }
    }
  }

  // Get transaction status
  async getTransactionStatus(txHash) {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return { status: 'pending', message: 'Transaction is pending' };
      }

      if (receipt.status === 1) {
        return { 
          status: 'success', 
          message: 'Transaction successful',
          blockNumber: Number(receipt.blockNumber),
          gasUsed: receipt.gasUsed.toString()
        };
      } else {
        return { 
          status: 'failed', 
          message: 'Transaction failed',
          blockNumber: Number(receipt.blockNumber)
        };
      }
    } catch (error) {
      throw new Error(`Failed to get transaction status: ${error.message}`);
    }
  }

  // Get network information
  async getNetworkInfo() {
    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      const balance = await this.getBalance();
      
      return {
        chainId: Number(network.chainId),
        name: network.name,
        blockNumber: Number(blockNumber),
        walletBalance: balance,
        walletAddress: this.wallet.address
      };
    } catch (error) {
      throw new Error(`Failed to get network info: ${error.message}`);
    }
  }
}

module.exports = EthereumService; 