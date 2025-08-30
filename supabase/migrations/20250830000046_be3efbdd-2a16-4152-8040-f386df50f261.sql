-- Create storage bucket for return images
INSERT INTO storage.buckets (id, name, public) VALUES ('return-images', 'return-images', true);

-- Create RLS policies for return images storage
CREATE POLICY "Return images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'return-images');

CREATE POLICY "Authenticated users can upload return images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'return-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own return images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'return-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own return images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'return-images' AND auth.role() = 'authenticated');