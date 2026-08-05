// Supabase Configuration

const SUPABASE_URL = "https://ilyhduamceswcdgtdhyh.supabase.co";

const SUPABASE_KEY = "sb_publishable_J-8iuu4WI4mBr-9eFPONrw_v8QxzRJM";


// Create Supabase Client

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);