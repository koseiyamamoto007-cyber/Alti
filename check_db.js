const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Read .env.local manually
const envPath = path.resolve(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        env[key.trim()] = value.trim();
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

// 2. Init Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumn() {
    console.log("Checking 'goals' table for 'default_duration' column...");

    // Try to select the specific column. If it doesn't exist, Supabase/Postgres will throw an error.
    const { data, error } = await supabase
        .from('goals')
        .select('default_duration')
        .limit(1);

    if (error) {
        console.error("❌ Error accessing 'default_duration' column:", error.message);
        console.error("Full error details:", error);
        console.log("\nCONCLUSION: The 'default_duration' column likely DOES NOT exist.");
    } else {
        console.log("✅ Success! 'default_duration' column exists.");
        console.log("Sample data:", data);
    }
}

checkColumn();
