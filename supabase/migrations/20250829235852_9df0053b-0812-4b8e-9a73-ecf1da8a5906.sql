-- Add image support to returns table
ALTER TABLE public.returns ADD COLUMN images TEXT[] DEFAULT '{}';

-- Add customer data columns to orders table for better admin overview
ALTER TABLE public.orders 
ADD COLUMN customer_name TEXT,
ADD COLUMN customer_email TEXT,
ADD COLUMN customer_phone TEXT,
ADD COLUMN shipping_address_data JSONB,
ADD COLUMN billing_address_data JSONB;