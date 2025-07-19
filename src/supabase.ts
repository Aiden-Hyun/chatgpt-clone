// src/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://twzumsgzuwguketxbdet.supabase.co'; // 🔁 Replace this
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3enVtc2d6dXdndWtldHhiZGV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxMDQ2NjIsImV4cCI6MjA2NzY4MDY2Mn0.FcarjbXuL58nFThYd2JNfjHYRCNGqZjtUY-MY1Fj8uQ'; // 🔁 Replace this

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
