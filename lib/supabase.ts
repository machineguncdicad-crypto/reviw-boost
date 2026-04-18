import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 👇 TAMBAHIN DUA BARIS INI BUAT CEK
console.log("URL Supabase:", supabaseUrl);
console.log("Key Supabase:", supabaseKey ? "Aman (Ada Isinya)" : "KOSONG!");

export const supabase = createClient(supabaseUrl, supabaseKey)