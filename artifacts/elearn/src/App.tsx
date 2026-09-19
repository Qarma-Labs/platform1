import { type FormEvent, type ReactNode, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  ArrowRight,
  BookOpen,
  Clock3,
  Compass,
  Lightbulb,
  Menu,
  PlayCircle,
  Search,
  Sparkles,
  Star,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { Link, Route, Switch, useLocation, useParams, Router as WouterRouter } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';

type CourseType = 'workshop' | 'ai';
type Lesson = { title: string; duration: string; freePreview: boolean };
type Section = { title: string; lessons: Lesson[] };
type Course = {
  slug: string;
  title: string;
  type: CourseType;
  description: string;
  instructor: string;
  instructorRole: string;
  duration: string;
  level: string;
  price: number;
  rating: number;
  students: number;
  image: string;
  mark: string;
  sections: Section[];
};

const courses: Course[] = [
  {
    slug: 'sell-on-instagram',
    title: 'Sell on Instagram',
    type: 'workshop',
    description: 'Turn your everyday product into a clear, confident Instagram offer people can act on.',
    instructor: 'Neema Mushi',
    instructorRole: 'Digital commerce coach',
    duration: '3h 20m',
    level: 'Starter',
    price: 45000,
    rating: 4.9,
    students: 284,
    image: 'coral',
    mark: '01',
    sections: [
      { title: 'Make your offer clear', lessons: [{ title: 'What are you really selling?', duration: '18 min', freePreview: true }, { title: 'Your simple product promise', duration: '24 min', freePreview: false }] },
      { title: 'Build a page that sells', lessons: [{ title: 'Profile, bio and highlights', duration: '31 min', freePreview: true }, { title: 'A week of posts in one sitting', duration: '42 min', freePreview: false }] },
      { title: 'Turn attention into action', lessons: [{ title: 'DM conversations that convert', duration: '36 min', freePreview: false }, { title: 'Your first 10-day plan', duration: '29 min', freePreview: false }] },
    ],
  },
  {
    slug: 'ai-for-real-work',
    title: 'AI for Real Work',
    type: 'ai',
    description: 'A practical first course in using AI to write, plan and think faster without losing your voice.',
    instructor: 'Baraka Sanga',
    instructorRole: 'Product builder and AI educator',
    duration: '4h 10m',
    level: 'Starter',
    price: 60000,
    rating: 4.8,
    students: 417,
    image: 'teal',
    mark: 'AI',
    sections: [
      { title: 'A useful mental model', lessons: [{ title: 'AI without the hype', duration: '16 min', freePreview: true }, { title: 'The prompt that gets you moving', duration: '28 min', freePreview: true }] },
      { title: 'Build your working toolkit', lessons: [{ title: 'Research and summarise in minutes', duration: '36 min', freePreview: false }, { title: 'Write a better first draft', duration: '31 min', freePreview: false }] },
      { title: 'Make it part of your week', lessons: [{ title: 'A repeatable AI workflow', duration: '41 min', freePreview: false }, { title: 'Your practical next experiment', duration: '25 min', freePreview: false }] },
    ],
  },
  {
    slug: 'phone-photography',
    title: 'Phone Photography',
    type: 'workshop',
    description: 'See better light, frame with intention and make images that give your small brand a point of view.',
    instructor: 'Amani Joseph',
    instructorRole: 'Photographer and visual storyteller',
    duration: '2h 45m',
    level: 'Starter',
    price: 35000,
    rating: 4.7,
    students: 193,
    image: 'gold',
    mark: '02',
    sections: [
      { title: 'See the light', lessons: [{ title: 'The window light test', duration: '22 min', freePreview: true }, { title: 'Colour, shade and mood', duration: '29 min', freePreview: false }] },
      { title: 'Frame the story', lessons: [{ title: 'Three reliable compositions', duration: '34 min', freePreview: false }, { title: 'Photographing people with ease', duration: '38 min', freePreview: false }] },
    ],
  },
  {
    slug: 'design-with-canva',
    title: 'Design with Canva',
    type: 'workshop',
    description: 'Make clean, memorable flyers and social posts from a blank canvas — no design degree required.',
    instructor: 'Rehema Kweka',
    instructorRole: 'Brand designer',
    duration: '3h 05m',
    level: 'Starter',
    price: 40000,
    rating: 4.8,
    students: 328,
    image: 'ink',
    mark: '03',
    sections: [
      { title: 'The visual basics', lessons: [{ title: 'Good design in plain language', duration: '25 min', freePreview: true }, { title: 'Type and colour that work', duration: '32 min', freePreview: false }] },
      { title: 'Your first design system', lessons: [{ title: 'Build a reusable template', duration: '39 min', freePreview: false }, { title: 'Create a campaign set', duration: '45 min', freePreview: false }] },
    ],
  },
  {
    slug: 'no-code-website-weekend',
    title: 'Your First Website',
    type: 'workshop',
    description: 'Go from idea to a polished, shareable website over one focused weekend.',
    instructor: 'Jabali Omari',
    instructorRole: 'No-code maker',
    duration: '5h 15m',
    level: 'Intermediate',
    price: 75000,
    rating: 4.9,
    students: 146,
    image: 'code',
    mark: '04',
    sections: [
      { title: 'Plan before you build', lessons: [{ title: 'A page people understand', duration: '21 min', freePreview: true }, { title: 'Content that does the job', duration: '35 min', freePreview: false }] },
      { title: 'Build and launch', lessons: [{ title: 'Your first responsive page', duration: '62 min', freePreview: false }, { title: 'Polish, test and publish', duration: '48 min', freePreview: false }] },
    ],
  },
  {
    slug: 'ai-for-content-creators',
    title: 'AI for Content Creators',
    type: 'ai',
    description: 'Find your ideas faster, develop a voice and create a month of useful content with a lighter lift.',
    instructor: 'Baraka Sanga',
    instructorRole: 'Product builder and AI educator',
    duration: '3h 50m',
    level: 'Intermediate',
    price: 65000,
    rating: 4.8,
    students: 231,
    image: 'teal',
    mark: 'AI',
    sections: [
      { title: 'Start with your point of view', lessons: [{ title: 'The content compass', duration: '23 min', freePreview: true }, { title: 'Prompting in your own voice', duration: '34 min', freePreview: false }] },
      { title: 'Plan a month in an hour', lessons: [{ title: 'From raw idea to useful post', duration: '39 min', freePreview: false }, { title: 'Edit like a human', duration: '31 min', freePreview: false }] },
    ],
  },
];

const money = (value: number) => `TZS ${value.toLocaleString('en-TZ')}`;

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return <div className="toast" data-testid="status-toast" onClick={onClose}>{message}</div>;
}

function Header() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const isActive = (path: string) => location === path || (path === '/courses' && location.startsWith('/courses/'));
  return (
    <header className="site-header">
      <div className="container-wide nav-row">
        <Link href="/" className="brand" data-testid="link-brand">
          <span className="brand-mark">e</span><span>Elearn<span style={{ color: 'hsl(14 78% 64%)' }}>.</span></span>
        </Link>
        <nav className="nav-links" aria-label="Primary navigation">
          <Link href="/courses" className={`nav-link ${isActive('/courses') ? 'active' : ''}`} data-testid="link-courses">Explore courses</Link>
          <a href="#how-it-works" className="nav-link" data-testid="link-how-it-works">How it works</a>
          <a href="#about" className="nav-link" data-testid="link-about">About Elearn</a>
        </nav>
        <div className="nav-actions">
          <Link href="/login" className="button button-ghost button-small" data-testid="link-login">Log in</Link>
          <Link href="/register" className="button button-primary button-small" data-testid="link-register">Join Elearn</Link>
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
          <Link href="/login" className="nav-link" onClick={() => setOpen(false)} data-testid="link-mobile-login">Log in</Link>
        </div>
      </div>}
    </header>
  );
}

function Footer() {
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

function CourseArt({ course, detail = false }: { course: Course; detail?: boolean }) {
  if (detail) return <div className={`detail-art art-${course.image}`}><span className="course-type">{course.type === 'ai' ? 'AI COURSE' : 'WORKSHOP'}</span><span className="art-mark">{course.mark}</span><span className="art-bottom">{course.title}</span></div>;
  return <div className={`course-art art-${course.image}`}><span className="course-type">{course.type === 'ai' ? 'AI COURSE' : 'WORKSHOP'}</span><span className="art-mark">{course.mark}</span><h3>{course.title}</h3></div>;
}

function CourseCard({ course }: { course: Course }) {
  return <Link href={`/courses/${course.slug}`} className="course-card" data-testid={`card-course-${course.slug}`}>
    <CourseArt course={course} />
    <div className="course-body">
      <p className="course-description">{course.description}</p>
      <div className="course-meta"><span><Clock3 size={13} />{course.duration}</span><span><Users size={13} />{course.students} learners</span></div>
      <div className="course-footer"><span className="price">{money(course.price)}</span><span className="rating"><Star size={13} fill="currentColor" style={{ verticalAlign: 'middle', marginRight: 4, color: 'hsl(37 76% 51%)' }} />{course.rating}</span></div>
    </div>
  </Link>;
}

function Home() {
  const [, setLocation] = useLocation();
  const [toast, setToast] = useState('');
  const featured = courses.slice(0, 3);
  const showToast = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 3300); };
  return <div className="app-shell">
    <Header />
    <main>
      <section className="hero">
        <div className="container-wide hero-grid">
          <div className="hero-copy">
            <p className="eyebrow hero-kicker">Practical learning, made here</p>
            <h1>Learn it today.<br /><em>Use it tomorrow.</em></h1>
            <p className="hero-text">Short, hands-on courses for people in Tanzania who are ready to do more with what they know. Pick a skill. Make a start. Keep going.</p>
            <div className="hero-buttons"><Link href="/courses" className="button button-secondary" data-testid="button-hero-explore">Explore courses <ArrowRight size={16} /></Link><Link href="/register" className="button button-light" data-testid="button-hero-join">Join Elearn</Link></div>
            <p className="hero-note"><strong>01 //</strong> Learn at your pace, from anywhere in Tanzania</p>
          </div>
          <div className="hero-visual">
            <div className="orbit-card">
              <div className="orbit-label"><span className="eyebrow" style={{ color: 'hsl(177 63% 31%)' }}>This week on Elearn</span><span className="orbit-number mono">LESSON 04</span></div>
              <h3>Build a skill that pays you back.</h3>
              <p>One useful lesson, one small action, one step closer to the work you want.</p>
              <div className="orbit-progress"><span /></div>
            </div>
            <div className="floating-stamp">NEW<br />SKILLS<br />IN MOTION</div>
          </div>
        </div>
        <div className="hero-ticker"><span>FOR CREATORS</span><span>FOR BUILDERS</span><span>FOR THE CURIOUS</span><span>FOR CREATORS</span><span>FOR BUILDERS</span><span>FOR THE CURIOUS</span></div>
      </section>

      <section className="category-band" id="categories">
        <div className="container-wide category-grid">
          <Link href="/courses?type=workshop" className="category-item" data-testid="link-category-workshops"><span className="category-icon"><Zap size={22} /></span><div><h3>Practical workshops</h3><span>Make it real, quickly</span></div></Link>
          <Link href="/courses?type=ai" className="category-item" data-testid="link-category-ai"><span className="category-icon"><Sparkles size={22} /></span><div><h3>AI for real life</h3><span>Work smarter, your way</span></div></Link>
          <Link href="/courses" className="category-item" data-testid="link-category-business"><span className="category-icon"><Compass size={22} /></span><div><h3>Business essentials</h3><span>Turn ideas into income</span></div></Link>
          <Link href="/courses" className="category-item" data-testid="link-category-creative"><span className="category-icon"><Lightbulb size={22} /></span><div><h3>Creative confidence</h3><span>Find your point of view</span></div></Link>
        </div>
      </section>

      <section className="section">
        <div className="container-wide">
          <div className="section-head"><div><p className="eyebrow">Start somewhere useful</p><h2 className="display section-title">Your next good<br />idea is here.</h2></div><p className="section-copy">No long lectures. No mysterious jargon. Just focused courses taught by people who have done the work themselves.</p></div>
          <div className="course-grid">{featured.map(course => <CourseCard key={course.slug} course={course} />)}</div>
          <div style={{ textAlign: 'center', marginTop: 39 }}><Link href="/courses" className="button button-ghost" data-testid="button-view-all-courses">View all courses <ArrowRight size={16} /></Link></div>
        </div>
      </section>

      <div className="marquee-section"><div className="marquee-line"><span>DO THE NEXT THING <i>—</i> KEEP IT USEFUL <i>—</i> BUILD YOUR WAY <i>—</i></span><span>DO THE NEXT THING <i>—</i> KEEP IT USEFUL <i>—</i> BUILD YOUR WAY <i>—</i></span></div></div>

      <section className="section" id="how-it-works">
        <div className="container-wide"><div className="section-head"><div><p className="eyebrow">The Elearn rhythm</p><h2 className="display section-title">Small steps.<br />Real momentum.</h2></div><p className="section-copy">Learning works better when it fits into your actual life. That is why every Elearn course is designed to move from screen to real world.</p></div>
          <div className="steps"><div className="step"><span className="step-number">01</span><h3>Choose your thing</h3><p>Browse practical courses made around the skills people are using right now.</p></div><div className="step"><span className="step-number">02</span><h3>Learn in a sitting</h3><p>Watch focused lessons and follow along with simple, useful exercises.</p></div><div className="step"><span className="step-number">03</span><h3>Put it to work</h3><p>Leave with something made, tested or ready to share. Progress you can see.</p></div></div>
        </div>
      </section>

      <section className="section-tight"><div className="container-wide"><div className="testimonial"><div><span className="quote-mark">“</span><p className="eyebrow" style={{ color: 'hsl(44 91% 62%)' }}>From the Elearn community</p></div><div><p className="quote">I stopped waiting to feel ready. The course gave me one clear thing to try, and that first try changed everything.</p><p className="quote-by">— ZAWADI M. / SMALL BUSINESS OWNER, ARUSHA</p></div></div></div></section>

      <section className="section"><div className="container-wide"><div className="cta-panel"><div><p className="eyebrow">Your turn</p><h2 className="display">Make your next move a useful one.</h2></div><button className="button button-primary" onClick={() => { setLocation('/register'); showToast('You are one step away from your first lesson.'); }} data-testid="button-final-cta">Start learning <ArrowRight size={16} /></button></div></div></section>
    </main>
    <Footer />
    {toast && <Toast message={toast} onClose={() => setToast('')} />}
  </div>;
}

function Courses() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | CourseType>('all');
  const [location] = useLocation();
  const queryType = new URLSearchParams(location.split('?')[1] || '').get('type') as CourseType | null;
  const effectiveFilter = filter === 'all' && (queryType === 'workshop' || queryType === 'ai') ? queryType : filter;
  const shownCourses = useMemo(() => courses.filter(course => {
    const matchesType = effectiveFilter === 'all' || course.type === effectiveFilter;
    const needle = search.toLowerCase();
    return matchesType && (!needle || `${course.title} ${course.description} ${course.instructor}`.toLowerCase().includes(needle));
  }), [effectiveFilter, search]);
  return <div className="app-shell"><Header /><main><section className="page-hero"><div className="container-wide"><p className="eyebrow" style={{ color: 'hsl(44 91% 62%)' }}>The course shelf</p><h1 className="display">Find your useful<br />next thing.</h1><p>Learn from people who make, build and teach in the real world. Start with one course and see what changes.</p></div></section><section className="container-wide"><div className="catalog-controls"><div className="search-box"><Search size={17} /><input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search courses, skills or teachers" data-testid="input-course-search" /></div><div className="filter-row"><button className={`filter-button ${effectiveFilter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')} data-testid="button-filter-all">All courses</button><button className={`filter-button ${effectiveFilter === 'workshop' ? 'active' : ''}`} onClick={() => setFilter('workshop')} data-testid="button-filter-workshops">Workshops</button><button className={`filter-button ${effectiveFilter === 'ai' ? 'active' : ''}`} onClick={() => setFilter('ai')} data-testid="button-filter-ai">AI courses</button></div></div><div className="catalog-grid"><p className="results-note" data-testid="text-course-count">{shownCourses.length} courses to get you moving</p>{shownCourses.length > 0 ? <div className="course-grid">{shownCourses.map(course => <CourseCard key={course.slug} course={course} />)}</div> : <div className="empty-state"><Search size={26} color="hsl(177 63% 31%)" /><h3>Nothing by that name yet.</h3><p>Try a broader search or look through all of our courses.</p><button className="button button-ghost" onClick={() => { setSearch(''); setFilter('all'); }} data-testid="button-clear-search">Clear search</button></div>}</div></section></main><Footer /></div>;
}

function CourseDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const [toast, setToast] = useState('');
  const course = courses.find(item => item.slug === slug);
  if (!course) return <NotFound />;
  const totalLessons = course.sections.reduce((total, section) => total + section.lessons.length, 0);
  const enroll = () => setToast('Course saved. Create your free account to begin learning.');
  return <div className="app-shell"><Header /><main><section className="detail-hero"><div className="container-wide"><Link href="/courses" className="back-link" data-testid="link-back-courses"><ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} /> All courses</Link><div className="detail-layout"><div><span className="course-type">{course.type === 'ai' ? 'AI COURSE' : 'WORKSHOP'}</span><h1 className="display">{course.title}</h1><p className="detail-description">{course.description}</p></div><CourseArt course={course} detail /></div></div></section><section className="container-wide detail-main"><div><h2 className="display detail-section-title">Inside the course</h2>{course.sections.map((section, index) => <div className="outline-section" key={section.title}><div className="outline-heading"><span style={{ color: 'hsl(191 34% 17%)', fontFamily: 'var(--app-font-sans)', fontSize: 14, fontWeight: 700 }}>{String(index + 1).padStart(2, '0')} &nbsp; {section.title}</span><span>{section.lessons.length} lessons</span></div>{section.lessons.map(lesson => <div className="lesson-row" key={lesson.title}>{lesson.freePreview ? <PlayCircle size={16} /> : <BookOpen size={16} />}<span>{lesson.title}</span>{lesson.freePreview && <span className="preview-tag">Preview</span>}<span className="lesson-duration">{lesson.duration}</span></div>)}</div>)}</div><aside><div className="enroll-card"><p className="eyebrow">Start learning today</p><p className="enroll-price">{money(course.price)}</p><button className="button button-primary" onClick={enroll} data-testid="button-enroll-course">Enroll in this course <ArrowRight size={16} /></button><div className="meta-list"><div className="meta-row"><span>Course level</span><span>{course.level}</span></div><div className="meta-row"><span>Total time</span><span>{course.duration}</span></div><div className="meta-row"><span>Lessons</span><span>{totalLessons}</span></div><div className="meta-row"><span>Learners</span><span>{course.students}</span></div><div className="meta-row"><span>Rating</span><span><Star size={12} fill="currentColor" style={{ verticalAlign: 'middle', color: 'hsl(37 76% 51%)' }} /> {course.rating}</span></div></div><div className="instructor-card"><div className="avatar">{course.instructor.split(' ').map(name => name[0]).join('')}</div><div><div className="instructor-name">{course.instructor}</div><div className="instructor-role">{course.instructorRole}</div></div></div><p className="notice">You will get lifetime access to the course lessons and practical exercises.</p></div></aside></section></main><Footer />{toast && <Toast message={toast} onClose={() => { setToast(''); setLocation('/register'); }} />}</div>;
}

function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const [, setLocation] = useLocation();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const isRegister = mode === 'register';
  const submit = (event: FormEvent) => { event.preventDefault(); setSubmitted(true); };
  return <div className="auth-page"><aside className="auth-aside"><Link href="/" className="brand auth-mark" data-testid="link-auth-brand"><span className="brand-mark">e</span><span>Elearn<span style={{ color: 'hsl(44 91% 62%)' }}>.</span></span></Link><div className="auth-aside-content"><p className="eyebrow" style={{ color: 'hsl(44 91% 62%)' }}>A little progress, often</p><h1 className="display">{isRegister ? 'Your next chapter starts here.' : 'Good to see you again.'}</h1><p>{isRegister ? 'Join a growing community of Tanzanian learners making useful things happen, one skill at a time.' : 'Pick up where you left off. Your next useful lesson is waiting.'}</p></div></aside><section className="auth-form-side"><div className="auth-form"><p className="eyebrow">{isRegister ? 'Create your account' : 'Welcome back'}</p><h2 className="display">{isRegister ? 'Start with one skill.' : 'Log in to Elearn.'}</h2><p className="auth-subtitle">{isRegister ? 'No pressure to know everything. Just bring your curiosity.' : 'Keep your learning moving at your own pace.'}</p>{submitted && <div className="form-message" data-testid="status-auth-success">{isRegister ? 'Account created in our demo. Your first lesson is ready when you are.' : 'You are logged in for this demo. Welcome back.'}</div>}<form onSubmit={submit}>{isRegister && <div className="field"><label htmlFor="name">Your name</label><input id="name" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="e.g. Asha M." required data-testid="input-name" /></div>}<div className="field"><label htmlFor="email">Email address</label><input id="email" type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" required data-testid="input-email" /></div><div className="field"><label htmlFor="password">Password</label><input id="password" type="password" value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} placeholder="At least 8 characters" minLength={8} required data-testid="input-password" /></div>{isRegister && <label className="checkbox-row"><input type="checkbox" required data-testid="input-terms" /> <span>I agree to learn at my own pace and make something useful with it.</span></label>}<button className="button button-primary auth-submit" type="submit" data-testid={`button-submit-${mode}`}>{isRegister ? 'Create my account' : 'Log in'} <ArrowRight size={16} /></button></form><p className="auth-switch">{isRegister ? 'Already have an account?' : 'New to Elearn?'} <Link href={isRegister ? '/login' : '/register'} data-testid={`link-switch-${mode}`}>{isRegister ? 'Log in' : 'Create an account'}</Link></p><button className="button button-ghost button-small" style={{ marginTop: 16, width: '100%' }} onClick={() => setLocation('/courses')} data-testid="button-browse-without-account">Browse courses first</button></div></section></div>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

const queryClient = new QueryClient();

function Router() {
  return <RoutedErrorBoundary><Switch><Route path="/" component={Home} /><Route path="/courses" component={Courses} /><Route path="/courses/:slug" component={CourseDetail} /><Route path="/login" component={() => <AuthPage mode="login" />} /><Route path="/register" component={() => <AuthPage mode="register" />} /><Route component={NotFound} /></Switch></RoutedErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;