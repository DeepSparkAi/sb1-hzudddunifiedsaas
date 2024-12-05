-- Add metadata column to customers table if it doesn't exist
ALTER TABLE customers ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Create index on metadata for better query performance
CREATE INDEX IF NOT EXISTS idx_customers_metadata ON customers USING gin(metadata);

-- Update existing customers to have empty metadata if null
UPDATE customers SET metadata = '{}'::jsonb WHERE metadata IS NULL;

-- Add mode column if it doesn't exist
ALTER TABLE customers ADD COLUMN IF NOT EXISTS mode text;
CREATE INDEX IF NOT EXISTS idx_customers_user_id_mode ON customers(user_id, mode);

-- Update existing customers to use test mode by default
UPDATE customers SET mode = 'test' WHERE mode IS NULL;