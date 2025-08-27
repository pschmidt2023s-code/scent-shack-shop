-- Add order_number column to orders table
ALTER TABLE public.orders 
ADD COLUMN order_number TEXT UNIQUE;

-- Create sequence for order numbers starting from 1000
CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1000;

-- Create function to generate order number with ADN prefix
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  next_number INTEGER;
  order_number TEXT;
BEGIN
  next_number := nextval('order_number_seq');
  order_number := 'ADN' || next_number;
  RETURN order_number;
END;
$$;

-- Create trigger to automatically assign order number on insert
CREATE OR REPLACE FUNCTION assign_order_number()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for orders table
DROP TRIGGER IF EXISTS set_order_number ON public.orders;
CREATE TRIGGER set_order_number
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION assign_order_number();