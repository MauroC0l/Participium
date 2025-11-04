import crypto from 'crypto';

/**
 * Generates password data (salt and hashed password) using the scrypt algorithm.
 * @param {string} password The password to hash.
 * @returns {Promise<object>} A promise that resolves to an object containing the salt and hashed password.
 */
export function generatePasswordData(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (err, hashedPassword) => {
      if (err) reject(err);
      else resolve({ salt, hash: hashedPassword.toString('hex') });
    });
  });
}

/**
 * Verifies a password against a stored hash and salt.
 * @param {string} password The password to verify.
 * @param {string} salt The salt used to hash the original password.
 * @param {string} hash The stored hash to compare against.
 * @returns {Promise<boolean>} A promise that resolves to true if the password is correct, false otherwise.
 */
export function verifyPassword(password, salt, hash) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, hashedPassword) => {
      if (err) reject(err);
      else resolve(hash === hashedPassword.toString('hex'));
    });
  });
}
