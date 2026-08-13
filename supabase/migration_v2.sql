-- Bosstify: INR + manual orders migration
-- Run this entire block in Supabase SQL Editor (New query) and click Run.

ALTER TABLE services_cache ADD COLUMN IF NOT EXISTS price_inr DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS min_qty INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS max_qty INTEGER DEFAULT 10000,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';

ALTER TABLE orders ADD COLUMN IF NOT EXISTS charge_inr DECIMAL(10,2) DEFAULT 0;

CREATE POLICY "Admin can manage services" ON services_cache
FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
