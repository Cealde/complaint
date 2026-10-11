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

async function handleLogin(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    try {
      const { userid, password } = JSON.parse(body);
      if (!userid || !password) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: "User ID and password are required" }));
      }

      const client = getSupabaseClient();
      if (!client) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: "Supabase connection is not initialized" }));
      }

      const { data, error } = await client
        .from("users")
        .select("user_roll, password, name, email, phone, is_admin")
        .eq("user_roll", userid)
        .eq("password", password)
        .single();

      if (error || !data) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: "Invalid User ID or password" }));
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      const isAdmin = Boolean(data.is_admin);
      return res.end(JSON.stringify({
        success: true,
        user: {
          userid: data.user_roll,
          user_roll: data.user_roll,
          name: data.name,
          email: data.email,
          phone: data.phone,
          is_admin: isAdmin
        }
      }));

    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: "Internal server error" }));
    }
  });
}

module.exports = { handleLogin };
