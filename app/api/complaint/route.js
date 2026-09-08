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

async function handleComplaint(req, res) {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    try {
      const { user_roll, room, hostel, priorityNum, info, type, sub } = JSON.parse(body);
      
      if (!user_roll || !room || !hostel || priorityNum === undefined || priorityNum === null) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: "RollNo, Room, Hostel and Priority are required" }));
      }

      const client = getSupabaseClient();
      if (!client) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: "Supabase connection is not initialized" }));
      }

      // Format array fields for PostgreSQL text[] column compatibility
      const typeArr = Array.isArray(type) ? type : (type ? type.split(',').map(s => s.trim()) : []);
      const subArr = Array.isArray(sub) ? sub : (sub ? sub.split(',').map(s => s.trim()) : []);

      const { data, error } = await client
        .from("complaints")
        .insert([{ 
          user_roll, 
          room, 
          hostel, 
          priority: Number(priorityNum), 
          info: info || '', 
          type: typeArr, 
          sub: subArr 
        }])
        .select();

      if (error) {
        console.error("Supabase complaint insert error:", error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: error.message || "Failed to record complaint" }));
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ success: true, data }));

    } catch (err) {
      console.error("Error processing complaint:", err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: "Internal server error" }));
    }
  });
}

module.exports = { handleComplaint };
