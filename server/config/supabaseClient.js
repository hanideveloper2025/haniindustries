// config/supabaseClient.js
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Check required env values
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ SUPABASE_URL or SUPABASE_ANON_KEY missing!");
} else {
  console.log("✅ Supabase client initialized with ANON KEY.");
}

// Create client with anon key
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Optional test function
const testSupabaseConnection = () => {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    console.log("✅ Supabase client ready (anon key)!");
  } else {
    console.error("❌ Supabase env vars missing!");
  }
};

module.exports = { supabase, testSupabaseConnection };
