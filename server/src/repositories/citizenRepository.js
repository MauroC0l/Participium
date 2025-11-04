import db from '../config/database.js';
import { generatePasswordData, verifyPassword } from '../utils/password.js';

/**
 * Repository for User data access
 * Handles all database operations for users (citizens and municipality users)
 */
class UserRepository {

  /**
   * Create a new citizen with hashed password
   */
  async createCitizen(username, email, password, firstName, lastName) {
    return new Promise(async (resolve, reject) => {
      try {
        const { hashedPassword, salt } = await generatePasswordData(password);
        
        const sql = `
          INSERT INTO users (username, email, password, salt, first_name, last_name, role)
          VALUES (?, ?, ?, ?, ?, ?, 'citizen')
        `;
        
        db.run(sql, [username, email, hashedPassword, salt, firstName, lastName], function(err) {
          if (err) {
            if (err.message.includes('UNIQUE constraint')) {
              reject(new Error('Username already exists'));
            } else {
              reject(err);
            }
            return;
          }
          
          // Return the created citizen without password and salt
          resolve({
            id: this.lastID,
            username,
            email,
            first_name: firstName,
            last_name: lastName,
            role: 'citizen'
          });
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Check if username already exists
   */
  async existsByUsername(username) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT id FROM users WHERE username = ? AND role = ?';
      
      db.get(sql, [username, 'citizen'], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row !== null && row !== undefined);
      });
    });
  }

  /**
   * Check if email already exists
   */
  async existsByEmail(email) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT id FROM users WHERE email = ? AND role = ?';
      
      db.get(sql, [email, 'citizen'], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row !== null && row !== undefined);
      });
    });
  }

  /**
   * Find a citizen by username (used for authentication)
   */
  async findCitizenByUsername(username) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE username = ? AND role = ?';
      
      db.get(sql, [username, 'citizen'], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row || null);
      });
    });
  }

  /**
   * Find a citizen by ID
   */
  async findById(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT id, username, email, first_name, last_name, role, created_at FROM users WHERE id = ? AND role = ?';
      
      db.get(sql, [id, 'citizen'], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row || null);
      });
    });
  }

  /**
   * Verify credentials for authentication
   */
  async verifyCredentials(username, password) {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await this.findByUsername(username);
        if (!user) {
          resolve(null);
          return;
        }

        const isValid = await verifyPassword(password, user.salt, user.password);
        if (!isValid) {
          resolve(null);
          return;
        }

        // Return user without password and salt
        const { password: _, salt: __, ...userWithoutPassword } = user;
        resolve(userWithoutPassword);
      } catch (error) {
        reject(error);
      }
    });
  }
}

export default new UserRepository();
