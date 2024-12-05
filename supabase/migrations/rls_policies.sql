-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public apps are viewable by everyone" ON apps;
DROP POLICY IF EXISTS "Users can create apps" ON apps;
DROP POLICY IF EXISTS "Users can update their own apps" ON apps;
DROP POLICY IF EXISTS "Users can delete their own apps" ON apps;
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "App owners can manage products" ON products;
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "App owners can view their app subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Users can view their own customer data" ON customers;
DROP POLICY IF EXISTS "App owners can view their customers" ON customers;

-- Enable RLS
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Apps policies
CREATE POLICY "Public apps are viewable by everyone" ON apps
    FOR SELECT USING (true);

CREATE POLICY "Users can create apps" ON apps
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own apps" ON apps
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own apps" ON apps
    FOR DELETE USING (auth.uid() = owner_id);

-- Products policies
CREATE POLICY "Products are viewable by everyone" ON products
    FOR SELECT USING (true);

CREATE POLICY "App owners can manage products" ON products
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM apps
            WHERE apps.id = products.app_id
            AND apps.owner_id = auth.uid()
        )
    );

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "App owners can view their app subscriptions" ON subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM apps
            WHERE apps.id = subscriptions.app_id
            AND apps.owner_id = auth.uid()
        )
    );

-- Customers policies
CREATE POLICY "Users can view their own customer data" ON customers
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "App owners can view their customers" ON customers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM subscriptions
            JOIN apps ON apps.id = subscriptions.app_id
            WHERE subscriptions.customer_id = customers.id
            AND apps.owner_id = auth.uid()
        )
    );

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;