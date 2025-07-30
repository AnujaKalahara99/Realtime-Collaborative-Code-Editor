// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = process.env.supabaseUrl;
// const supabaseAnonKey = process.env.supabaseAnonKey;

// export const supabase = createClient(String(supabaseUrl), String(supabaseAnonKey));

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
