import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
config();

export const supabase = createClient(
  process.env.SUPABASE_URL,
  // process.env.SUPABASE_SERVICE_ROLE_KEY
  process.env.SUPABASE_ANON_KEY
);
