const axios = require('axios');

class RecaptchaVerifier {
  constructor(secretKey) {
    this.secretKey = secretKey;
    this.verificationUrl = 'https://www.google.com/recaptcha/api/siteverify';
  }

  async verifyToken(token, remoteIp = null) {
    try {
      const params = new URLSearchParams({
        secret: this.secretKey,
        response: token
      });

      if (remoteIp) {
        params.append('remoteip', remoteIp);
      }

      const response = await axios.post(this.verificationUrl, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: 10000 // 10 second timeout
      });

      const data = response.data;

      if (!data.success) {
        const errorCodes = data['error-codes'] || [];
        const errorMessage = this.getErrorMessage(errorCodes);
        throw new Error(`reCAPTCHA verification failed: ${errorMessage}`);
      }

      return {
        success: true,
        score: data.score || null,
        action: data.action || null
      };

    } catch (error) {
      if (error.response) {
        // Google API error
        throw new Error(`reCAPTCHA API error: ${error.response.status} ${error.response.statusText}`);
      } else if (error.code === 'ECONNABORTED') {
        // Timeout error
        throw new Error('reCAPTCHA verification timeout');
      } else {
        // Network or other error
        throw new Error(`reCAPTCHA verification error: ${error.message}`);
      }
    }
  }

  getErrorMessage(errorCodes) {
    const errorMessages = {
      'missing-input-secret': 'The secret parameter is missing',
      'invalid-input-secret': 'The secret parameter is invalid or malformed',
      'missing-input-response': 'The response parameter is missing',
      'invalid-input-response': 'The response parameter is invalid or malformed',
      'bad-request': 'The request is invalid or malformed',
      'timeout-or-duplicate': 'The response is no longer valid: either is too old or has been used previously'
    };

    if (errorCodes.length === 0) {
      return 'Unknown error';
    }

    return errorCodes.map(code => errorMessages[code] || code).join(', ');
  }
}

module.exports = RecaptchaVerifier; 