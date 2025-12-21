-- Add Telegram link columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS telegram_username VARCHAR(100) UNIQUE,
ADD COLUMN IF NOT EXISTS telegram_link_code VARCHAR(6),
ADD COLUMN IF NOT EXISTS telegram_link_code_expires_at TIMESTAMPTZ;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_telegram_link_code 
ON users(telegram_link_code) 
WHERE telegram_link_code IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_users_telegram_username 
ON users(telegram_username) 
WHERE telegram_username IS NOT NULL;
