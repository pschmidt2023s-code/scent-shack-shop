// Supabase optimization utilities for performance and cost reduction
import { supabase } from '@/integrations/supabase/client';

// Cache store for database queries to reduce repeated requests
const queryCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

/**
 * Cached query wrapper to reduce database calls
 * @param key Unique cache key for the query
 * @param queryFn Function that returns the supabase query
 * @param ttlMinutes Time to live in minutes (default: 5 minutes)
 */
export async function cachedQuery<T>(
  key: string, 
  queryFn: () => Promise<{ data: T | null; error: any }>,
  ttlMinutes: number = 5
): Promise<{ data: T | null; error: any }> {
  const now = Date.now();
  const cached = queryCache.get(key);
  
  // Return cached data if still valid
  if (cached && (now - cached.timestamp) < cached.ttl) {
    return { data: cached.data, error: null };
  }
  
  // Execute query and cache result
  const result = await queryFn();
  if (!result.error && result.data) {
    queryCache.set(key, {
      data: result.data,
      timestamp: now,
      ttl: ttlMinutes * 60 * 1000 // Convert to milliseconds
    });
  }
  
  return result;
}

/**
 * Clear specific cache entries or all cache
 * @param key Optional specific key to clear, if not provided clears all
 */
export function clearCache(key?: string) {
  if (key) {
    queryCache.delete(key);
  } else {
    queryCache.clear();
  }
}

/**
 * Optimized perfume queries - only fetch required fields to reduce data transfer
 */
export const optimizedPerfumeQueries = {
  // Get perfume list with minimal data for grid display
  getPerfumeList: () => 
    supabase
      .from('perfumes')
      .select('id, name, brand, category, image, variants(id, name, price, inStock)')
      .limit(50), // Limit to reduce data transfer
      
  // Get single perfume with all details only when needed
  getPerfumeDetails: (id: string) =>
    supabase
      .from('perfumes')
      .select('*')
      .eq('id', id)
      .single(),
      
  // Get reviews with essential data only
  getReviewsSummary: (perfumeId: string, variantId: string) =>
    supabase
      .from('reviews')
      .select('id, rating, created_at, is_verified')
      .eq('perfume_id', perfumeId)
      .eq('variant_id', variantId)
      .order('created_at', { ascending: false })
      .limit(20) // Limit to most recent reviews
};

/**
 * Optimized order queries - fetch only necessary data
 */
export const optimizedOrderQueries = {
  // Get order list for user dashboard
  getUserOrders: (userId: string) =>
    supabase
      .from('orders')
      .select(`
        id, 
        order_number, 
        status, 
        total_amount, 
        created_at,
        order_items(quantity, unit_price, perfume_id, variant_id)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10), // Limit to recent orders
      
  // Get single order with full details only when viewing specific order
  getOrderDetails: (orderId: string) =>
    supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()
};

/**
 * Storage upload with size limits and optimization
 * @param bucket Storage bucket name
 * @param file File to upload
 * @param path Storage path
 * @param maxSizeMB Maximum file size in MB (default: 5MB)
 */
export async function optimizedUpload(
  bucket: string,
  file: File,
  path: string,
  maxSizeMB: number = 5
) {
  // Check file size to prevent large uploads
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    throw new Error(`File size must be less than ${maxSizeMB}MB`);
  }
  
  // Set cache control headers for better CDN performance
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '31536000', // 1 year cache for static assets
      upsert: false
    });
    
  return { data, error };
}

/**
 * Get optimized image URLs with transformations
 * @param bucket Storage bucket name
 * @param path File path in storage
 * @param width Optional width for resizing
 * @param height Optional height for resizing
 * @param quality Optional quality (1-100)
 */
export function getOptimizedImageUrl(
  bucket: string,
  path: string,
  width?: number,
  height?: number,
  quality: number = 85
): string {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path, {
      transform: {
        width,
        height,
        quality,
        format: 'webp' // Use WebP for better compression
      }
    });
    
  return data.publicUrl;
}

/**
 * Batch operations to reduce database round trips
 */
export const batchOperations = {
  // Insert multiple records in one operation
  insertMultiple: async <T>(table: string, records: T[]) => {
    return await supabase
      .from(table)
      .insert(records);
  },
  
  // Update multiple records with different conditions
  updateMultiple: async (table: string, updates: Array<{ id: string; data: any }>) => {
    const promises = updates.map(({ id, data }) =>
      supabase.from(table).update(data).eq('id', id)
    );
    return await Promise.all(promises);
  }
};

/**
 * Cleanup old cache entries periodically
 */
export function startCacheCleanup() {
  setInterval(() => {
    const now = Date.now();
    for (const [key, cached] of queryCache.entries()) {
      if ((now - cached.timestamp) > cached.ttl) {
        queryCache.delete(key);
      }
    }
  }, 5 * 60 * 1000); // Run cleanup every 5 minutes
}