import Link from "next/link";

export default function Home() {
  return (
    <div className="app-container">
      {/* Navigation */}
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="brand-logo">
            My App
          </Link>
          <div className="nav-links">
            <Link href="/instruments" className="nav-link">
              Instruments
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <h1 className="hero-title">Welcome to My App</h1>

        <p className="hero-subtitle">
          A clean, modern Next.js application built with Vanilla CSS.
        </p>

        <div>
          <Link href="/instruments" className="btn-primary">
            View Instruments
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer">
        © 2026 My App. All rights reserved.
      </footer>
    </div>
  );
}
