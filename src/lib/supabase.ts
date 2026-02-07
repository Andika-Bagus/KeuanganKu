import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fcilpcnuapigrivkzhwq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjaWxwY251YXBpZ3Jpdmt6aHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0MDc1NzQsImV4cCI6MjA4NTk4MzU3NH0.QLSmIxpcRSc89xbANX9U5B0T71K8aRWsOvkH7gcoSwA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
