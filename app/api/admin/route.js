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

async function fetchAllComplaints(client, res) {
  try {
    const [complaintsRes, usersRes] = await Promise.all([
      client.from("complaints").select("*"),
      client.from("users").select("user_roll, name, email, phone")
    ]);

    if (complaintsRes.error) {
      console.error("Fetch complaints error:", complaintsRes.error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: complaintsRes.error.message }));
    }

    const userMap = {};
    if (usersRes.data) {
      usersRes.data.forEach(u => {
        userMap[u.user_roll] = u;
      });
    }

    const complaints = (complaintsRes.data || []).map(item => {
      const u = userMap[item.user_roll] || {};
      return {
        ...item,
        name: u.name || 'Unknown',
        email: u.email || '-',
        phone: u.phone || '-'
      };
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, complaints }));
  } catch (err) {
    console.error("Error in fetchAllComplaints:", err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: "Failed to fetch complaints" }));
  }
}

async function handleAdmin(req, res) {
  const client = getSupabaseClient();
  if (!client) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ error: "Supabase connection is not initialized" }));
  }

  if (req.method === 'GET') {
    return fetchAllComplaints(client, res);
  }

  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    try {
      const payload = body ? JSON.parse(body) : {};
      const action = payload.action;

      if (action === 'resolve') {
        const { id, resolved } = payload;
        if (!id) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: "Complaint ID is required" }));
        }

        const resolveStatus = resolved !== undefined ? Boolean(resolved) : true;
        const { data, error } = await client
          .from("complaints")
          .update({ resolved: resolveStatus })
          .eq("id", id)
          .select();

        if (error) {
          console.error("Supabase resolve error:", error);
          res.writeHead(500, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: error.message || "Failed to update complaint" }));
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, complaint: data ? data[0] : null }));
      }

      return fetchAllComplaints(client, res);
    } catch (err) {
      console.error("Admin route error:", err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: "Internal server error" }));
    }
  });
}

module.exports = { handleAdmin };
