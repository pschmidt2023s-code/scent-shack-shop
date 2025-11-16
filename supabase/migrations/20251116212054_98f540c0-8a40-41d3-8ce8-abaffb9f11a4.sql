-- Erstelle Storage Bucket für Produktbilder
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true);

-- RLS Policies für product-images bucket
CREATE POLICY "Admins können Produktbilder hochladen"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' 
  AND (auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'))
);

CREATE POLICY "Admins können Produktbilder aktualisieren"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images' 
  AND (auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'))
);

CREATE POLICY "Admins können Produktbilder löschen"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' 
  AND (auth.uid() IN (SELECT user_id FROM user_roles WHERE role = 'admin'))
);

CREATE POLICY "Jeder kann Produktbilder ansehen"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');