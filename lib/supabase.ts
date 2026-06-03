import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Slot = {
  id: string;
  slot_date: string;
  slot_time: string;
  duration_minutes: number;
  is_available: boolean;
  price_egp: number;
  created_at: string;
};

export type Patient = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  notes?: string;
  created_at: string;
};

export type Booking = {
  id: string;
  patient_id: string;
  slot_id: string;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  zoom_link?: string;
  admin_notes?: string;
  created_at: string;
};

export type Payment = {
  id: string;
  booking_id: string;
  method: 'vodafone_cash' | 'instapay';
  amount_egp: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  reference_number?: string;
  screenshot_url?: string;
  created_at: string;
};
