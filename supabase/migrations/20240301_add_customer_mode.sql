-- Add mode column to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS mode text;
CREATE INDEX IF NOT EXISTS idx_customers_user_id_mode ON customers(user_id, mode);

-- Update existing customers to use test mode by default
UPDATE customers SET mode = 'test' WHERE mode IS NULL;