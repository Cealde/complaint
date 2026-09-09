const { createClient } = require('@supabase/supabase-js');

let supabase = null;

function getSupabaseClient() {
    if (!supabase) {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
        if (supabaseUrl && supabaseKey) {
            supabase = createClient(supabaseUrl, supabaseKey);
        }
    }
    return supabase;
}

async function handleRequest(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    try {
      const { user_roll } = JSON.parse(body || '{}');
      
      if (!user_roll) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: "Roll number is required" }));
      }

      const client = getSupabaseClient();
      if (!client) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: "Supabase connection is not initialized" }));
      }

      const { data, error } = await client
        .from("complaints")
        .select("id, room, hostel, type, sub, priority, info, created")
        .eq("user_roll", user_roll)
        .order("created", { ascending: false });

      if (error) {
        console.error("Supabase complaint fetch error:", error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: error.message || "Failed to retrieve complaints" }));
      }


      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, complaints: data || [] }));

    } catch (err) {
      console.error("Error processing get request:", err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: "Internal server error" }));
    }
  });
}

module.exports = { handleRequest };
