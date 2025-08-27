
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Package, Users, CreditCard, Plus, Edit2, Trash2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';

interface Order {
  id: string;
  user_id: string | null;
  stripe_session_id: string;
  total_amount: number;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

interface OrderItem {
  id: string;
  perfume_id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount?: number;
  max_uses?: number;
  current_uses: number;
  valid_from: string;
  valid_until?: string;
  active: boolean;
  created_at: string;
}

export default function Admin() {
  console.log('ADMIN COMPONENT LOADING - SIMPLIFIED VERSION');
  
  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard - TEST</h1>
      <p>Dies ist ein einfacher Test der Admin-Seite.</p>
      <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded">
        <p>✅ Admin-Seite lädt erfolgreich!</p>
      </div>
    </div>
  );
}
