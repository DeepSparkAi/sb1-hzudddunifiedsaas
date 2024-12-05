-- First, let's make sure templates are publicly readable
DROP POLICY IF EXISTS "Templates are viewable by everyone" ON templates;
CREATE POLICY "Templates are viewable by everyone" ON templates
    FOR SELECT USING (true);

-- Ensure RLS is enabled but allows public reads
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Re-insert the default template with correct pricing in cents
DELETE FROM templates WHERE name = 'Basic SaaS Template';
INSERT INTO templates (name, description, config_schema, default_products)
VALUES (
    'Basic SaaS Template',
    'A standard template for SaaS applications with tiered pricing',
    '[
        {
            "name": "App Name",
            "key": "app_name",
            "type": "text",
            "description": "The name of your application",
            "required": true
        },
        {
            "name": "Primary Color",
            "key": "primary_color",
            "type": "color",
            "description": "Main color theme for your app",
            "required": true,
            "default_value": "#4F46E5"
        }
    ]'::jsonb,
    '[
        {
            "name": "Trial",
            "description": "Try it out for just $1",
            "amount": 100,
            "interval": "month",
            "features": [
                "Up to 100 subscribers",
                "Basic analytics",
                "Email support"
            ]
        },
        {
            "name": "Starter",
            "description": "Perfect for small businesses",
            "amount": 2900,
            "interval": "month",
            "features": [
                "Up to 1,000 subscribers",
                "Basic analytics",
                "Email support",
                "API access"
            ]
        },
        {
            "name": "Professional",
            "description": "For growing businesses",
            "amount": 9900,
            "interval": "month",
            "features": [
                "Up to 10,000 subscribers",
                "Advanced analytics",
                "Priority support",
                "API access",
                "Custom integrations"
            ]
        }
    ]'::jsonb
);