import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

interface Instrument {
  id: number;
  name: string;
  type?: string;
  created_at?: string;
}

export default async function InstrumentsPage() {
  let instruments: Instrument[] | null = null;
  let error: { message: string } | null = null;

  try {
    const supabase = await createClient();
    const result = await supabase.from("instruments").select("*");
    instruments = result.data;
    error = result.error;
  } catch (err: any) {
    error = { message: err?.message || "Failed to connect to Supabase" };
  }

  return (
    <div className="app-container">
      {/* Navigation */}
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="brand-logo">
            My App
          </Link>
          <div className="nav-links">
            <Link href="/" className="nav-link">
              ← Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content" style={{ alignItems: "flex-start", textAlign: "left" }}>
        <h1 className="hero-title" style={{ fontSize: "2.5rem", marginBottom: "8px" }}>
          Instruments Catalog
        </h1>
        <p className="hero-subtitle" style={{ textAlign: "left", marginBottom: "32px" }}>
          Database instruments list from Supabase.
        </p>

        {error ? (
          <div className="alert-error">
            <div className="alert-title">Database Notice</div>
            <div className="alert-code">{error.message}</div>
            <p style={{ fontSize: "0.85rem", marginTop: "8px" }}>
              Make sure your <code>.env.local</code> file is configured with valid Supabase credentials and the <code>instruments</code> table exists.
            </p>
          </div>
        ) : !instruments || instruments.length === 0 ? (
          <div className="card" style={{ width: "100%", textAlign: "center", padding: "40px 20px" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "6px" }}>No Instruments Found</h3>
            <p className="card-desc">
              Insert records into your Supabase <code>instruments</code> table to see them here.
            </p>
          </div>
        ) : (
          <div className="cards-grid">
            {instruments.map((item: Instrument) => (
              <div key={item.id} className="card">
                <div className="card-title">
                  <span>{item.name}</span>
                  <span className="card-badge">#{item.id}</span>
                </div>
                {item.type && <p className="card-desc">Type: {item.type}</p>}
                {item.created_at && (
                  <div className="card-date">
                    Added: {new Date(item.created_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        © 2026 My App. All rights reserved.
      </footer>
    </div>
  );
}
