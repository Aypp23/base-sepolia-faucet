const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class FaucetDatabase {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.db = null;
  }

  async initDatabase() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
          return;
        }

        // Create requests table
        const createTable = `
          CREATE TABLE IF NOT EXISTS requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            address TEXT NOT NULL,
            tx_hash TEXT,
            amount TEXT NOT NULL,
            status TEXT NOT NULL,
            error_message TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `;
        
        // Create index for faster lookups
        const createIndex = `
          CREATE INDEX IF NOT EXISTS idx_address_created_at 
          ON requests(address, created_at)
        `;

        this.db.run(createTable, (err) => {
          if (err) {
            reject(err);
            return;
          }

          this.db.run(createIndex, (err) => {
            if (err) {
              reject(err);
              return;
            }
            resolve();
          });
        });
      });
    });
  }

  // Check if address has made a request in the last 24 hours
  hasRecentRequest(address, hours = 24) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT COUNT(*) as count 
        FROM requests 
        WHERE address = ? 
        AND created_at > datetime('now', '-${hours} hours')
      `;
      
      this.db.get(query, [address], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row.count > 0);
      });
    });
  }

  // Get time remaining until next request is allowed
  getTimeUntilNextRequest(address, hours = 24) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT created_at,
               datetime(created_at, '+${hours} hours') as next_allowed,
               strftime('%s', datetime(created_at, '+${hours} hours')) - strftime('%s', 'now') as seconds_remaining
        FROM requests 
        WHERE address = ? 
        AND created_at > datetime('now', '-${hours} hours')
        ORDER BY created_at DESC
        LIMIT 1
      `;
      
      this.db.get(query, [address], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        if (!row) {
          resolve(null); // No recent request found
        } else {
          resolve({
            lastRequest: row.created_at,
            nextAllowed: row.next_allowed,
            secondsRemaining: Math.max(0, row.seconds_remaining)
          });
        }
      });
    });
  }

  // Record a new request
  recordRequest(address, amount, txHash = null, status = 'pending', errorMessage = null) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO requests (address, tx_hash, amount, status, error_message)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      this.db.run(query, [address, txHash, amount, status, errorMessage], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ id: this.lastID });
      });
    });
  }

  // Update request with transaction hash
  updateRequestWithTx(address, txHash) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE requests 
        SET tx_hash = ?, status = 'completed'
        WHERE address = ? 
        AND created_at = (
          SELECT MAX(created_at) 
          FROM requests 
          WHERE address = ?
        )
      `;
      
      this.db.run(query, [txHash, address, address], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ changes: this.changes });
      });
    });
  }

  // Update request with error
  updateRequestWithError(address, errorMessage) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE requests 
        SET status = 'failed', error_message = ?
        WHERE address = ? 
        AND created_at = (
          SELECT MAX(created_at) 
          FROM requests 
          WHERE address = ?
        )
      `;
      
      this.db.run(query, [errorMessage, address, address], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ changes: this.changes });
      });
    });
  }

  // Get request statistics
  getStats() {
    return new Promise((resolve, reject) => {
      const totalQuery = 'SELECT COUNT(*) as total FROM requests';
      const successQuery = "SELECT COUNT(*) as success FROM requests WHERE status = 'completed'";
      const failedQuery = "SELECT COUNT(*) as failed FROM requests WHERE status = 'failed'";
      
      this.db.get(totalQuery, (err, totalRow) => {
        if (err) {
          reject(err);
          return;
        }

        this.db.get(successQuery, (err, successRow) => {
          if (err) {
            reject(err);
            return;
          }

          this.db.get(failedQuery, (err, failedRow) => {
            if (err) {
              reject(err);
              return;
            }

            resolve({
              total: totalRow.total,
              success: successRow.success,
              failed: failedRow.failed
            });
          });
        });
      });
    });
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

module.exports = FaucetDatabase; 