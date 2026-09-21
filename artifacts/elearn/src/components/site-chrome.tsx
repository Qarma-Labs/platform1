import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export function Header() {
  const [location, setLocation] = useLocation();
  const [open, setOpen] = useState(false);
  const { status, user, logout } = useAuth();
  const onLogout = async () => { await logout(); setLocation('/'); };
  const isActive = (path: string) => location === path || (path === '/courses' && location.startsWith('/courses/'));
  return (
    <header className="site-header">
      <div className="container-wide nav-row">
        <Link href="/" className="brand" data-testid="link-brand">
          <span className="brand-mark">e</span><span>Elearn<span style={{ color: 'hsl(14 78% 64%)' }}>.</span></span>
        </Link>
        <nav className="nav-links" aria-label="Primary navigation">
          <Link href="/courses" className={`nav-link ${isActive('/courses') ? 'active' : ''}`} data-testid="link-courses">Explore courses</Link>
          {status === 'authed' ? <Link href="/learning" className={`nav-link ${isActive('/learning') ? 'active' : ''}`} data-testid="link-my-learning">My learning</Link> : null}
          <a href="#how-it-works" className="nav-link" data-testid="link-how-it-works">How it works</a>
          <a href="#about" className="nav-link" data-testid="link-about">About Elearn</a>
        </nav>
        <div className="nav-actions">
          {status === 'authed' && user ? <>
            <span className="nav-user" data-testid="text-nav-user">{user.fullName}</span>
            <button className="button button-ghost button-small" onClick={onLogout} data-testid="button-logout">Log out</button>
          </> : <>
            <Link href="/login" className="button button-ghost button-small" data-testid="link-login">Log in</Link>
            <Link href="/register" className="button button-primary button-small" data-testid="link-register">Join Elearn</Link>
          </>}
        </div>
        <div className="mobile-nav">
          <Link href="/register" className="button button-primary button-small" data-testid="link-mobile-register">Join</Link>
          <button className="button button-ghost button-small" onClick={() => setOpen(!open)} aria-label="Toggle navigation" data-testid="button-toggle-navigation">
            {open ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>
      {open && <div style={{ position: 'absolute', top: '68px', left: 0, right: 0, padding: '18px 16px', background: 'hsl(43 42% 98%)', borderBottom: '1px solid hsl(42 22% 81%)' }}>
        <div style={{ display: 'grid', gap: 15 }}>
          <Link href="/courses" className="nav-link" onClick={() => setOpen(false)} data-testid="link-mobile-courses">Explore courses</Link>
          {status === 'authed' && user ? <button className="nav-link" onClick={async () => { await logout(); setOpen(false); setLocation('/'); }} data-testid="button-mobile-logout">Log out ({user.fullName})</button> : <Link href="/login" className="nav-link" onClick={() => setOpen(false)} data-testid="link-mobile-login">Log in</Link>}
        </div>
      </div>}
    </header>
  );
}

export function Footer() {
  return <footer className="site-footer" id="about">
    <div className="container-wide">
      <div className="footer-grid">
        <div>
          <Link href="/" className="brand" data-testid="link-footer-brand"><span className="brand-mark">e</span><span>Elearn<span style={{ color: 'hsl(44 91% 62%)' }}>.</span></span></Link>
          <p className="footer-brand-copy">Practical learning for the work you want to do next. Built with and for ambitious learners in Tanzania.</p>
        </div>
        <div><p className="footer-title">Learn</p><Link href="/courses" className="footer-link" data-testid="link-footer-courses">All courses</Link><Link href="/courses?type=workshop" className="footer-link" data-testid="link-footer-workshops">Workshops</Link><Link href="/courses?type=ai" className="footer-link" data-testid="link-footer-ai">AI courses</Link></div>
        <div><p className="footer-title">Elearn</p><a href="#how-it-works" className="footer-link" data-testid="link-footer-how">How it works</a><a href="#about" className="footer-link" data-testid="link-footer-story">Our story</a><Link href="/register" className="footer-link" data-testid="link-footer-join">Join the community</Link></div>
        <div><p className="footer-title">Say hello</p><a href="mailto:hello@elearn.academy" className="footer-link" data-testid="link-footer-email">hello@elearn.academy</a><p className="footer-brand-copy" style={{ marginTop: 19 }}>Dar es Salaam, Tanzania<br />Made for useful progress.</p></div>
      </div>
      <div className="footer-bottom"><span>© 2025 Elearn Academy</span><span>Learn something. Make something.</span></div>
    </div>
  </footer>;
}

