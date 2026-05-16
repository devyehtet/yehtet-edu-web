import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Download,
  GraduationCap,
  LayoutDashboard,
  Lock,
  MonitorUp,
  PlayCircle,
  Plus,
  Settings,
  ShieldCheck,
  UploadCloud,
  Users,
  Video,
} from 'lucide-react';

// =====================================================================
// Types & routing
// =====================================================================

type PageName =
  | 'Home'
  | 'Courses'
  | 'Learning Path'
  | 'Course Detail'
  | 'Admin Panel'
  | 'Student Dashboard'
  | 'Lesson Player'
  | 'Quiz'
  | 'Assignments'
  | 'Resources'
  | 'Live Meeting'
  | 'Reports'
  | 'Login';

type IconType = React.ComponentType<{ className?: string }>;
type NavItem = { label: string; target: PageName };

type Student = {
  id: string;
  name: string;
  email: string;
  course: string;
  progress: number;
  status: 'Active' | 'Pending';
  lastActive: string;
  joined: string;
  assignments: string;
  quizScore: string;
};

type Role = 'admin' | 'student' | null;

const pageSlugs: Record<PageName, string> = {
  Home: '',
  Courses: 'courses',
  'Learning Path': 'learning-path',
  'Course Detail': 'course-detail',
  'Admin Panel': 'admin',
  'Student Dashboard': 'dashboard',
  'Lesson Player': 'lessons',
  Quiz: 'quiz',
  Assignments: 'assignments',
  Resources: 'resources',
  'Live Meeting': 'live',
  Reports: 'reports',
  Login: 'login',
};

const slugToPage: Record<string, PageName> = Object.entries(pageSlugs).reduce(
  (acc, [page, slug]) => {
    acc[slug] = page as PageName;
    return acc;
  },
  {} as Record<string, PageName>,
);

const pageToHash = (page: PageName) => {
  const slug = pageSlugs[page];
  return slug ? `#/${slug}` : '#/';
};

const readHashPage = (): PageName => {
  if (typeof window === 'undefined') return 'Home';
  const raw = window.location.hash.replace(/^#\/?/, '').toLowerCase();
  return (slugToPage[raw] as PageName) || 'Home';
};

const publicNavItems: NavItem[] = [
  { label: 'Home', target: 'Home' },
  { label: 'Courses', target: 'Courses' },
  { label: 'Learning Path', target: 'Learning Path' },
];

const studentNavItems: NavItem[] = [
  { label: 'Dashboard', target: 'Student Dashboard' },
  { label: 'Lessons', target: 'Lesson Player' },
  { label: 'Assignments', target: 'Assignments' },
  { label: 'Resources', target: 'Resources' },
  { label: 'Live Class', target: 'Live Meeting' },
];

const adminNavItems: NavItem[] = [
  { label: 'Admin Panel', target: 'Admin Panel' },
  { label: 'Reports', target: 'Reports' },
];

const protectedPages: PageName[] = [
  'Student Dashboard',
  'Lesson Player',
  'Quiz',
  'Assignments',
  'Resources',
  'Live Meeting',
  'Reports',
  'Admin Panel',
];

const adminOnlyPages: PageName[] = ['Admin Panel', 'Reports'];

const demoCredentials = {
  admin: { username: 'admin@dmclass.com', password: 'Admin@2026' },
  student: { username: 'student@dmclass.com', password: 'Student@2026' },
};

// =====================================================================
// Static data
// =====================================================================

const digitalMarketingLessons = [
  'Digital Marketing: Beginner to Professional',
  'Course Overview: What You Will Learn',
  'Why Digital Marketing Matters Today',
  'Traditional Marketing vs Digital Marketing',
  'The Digital Marketing Ecosystem',
  'Marketing Funnel Basics',
  'Key Digital Marketing Metrics',
  'Understanding Customer Psychology',
  'Content Strategy Basics',
  'Mastering Social Media in 2025',
  'Organic Social Media Strategy',
  'How Social Media Algorithms Work',
  'Introduction to Meta Ads',
  'Meta Ads Objectives and Business Goals',
  'Digital Marketing Funnel Study Notes',
  'Meta Ads Campaign Structure',
  'Campaign, Ad Set, and Ad Level Explained',
  'Campaign Budget Optimization Explained',
  'Learning Phase and Campaign Performance',
  'Estimated Ad Recall Lift Explained',
  'Meta Ads Budget and Bidding Strategies',
  'Audience Targeting in Meta Ads',
  'Creative Strategy for Meta Ads',
  'TikTok Ads Overview and Creative Best Practices',
  'TikTok Targeting and Scaling Strategy',
  'The Google Ads Ecosystem',
  'Search Intent and Keyword Strategy',
  'Google Ads Basics: Your Digital Storefront',
  'Performance Max: AI-Powered Campaigns',
  'SEO Fundamentals',
  'SEO vs SEM: Organic and Paid Search',
  'Analytics and Data-Driven Decision Making',
  'GA4 Basics: Your Marketing Command Center',
  'Tracking and Pixel Fundamentals',
  'Full-Funnel Budget Allocation Strategy',
  'Advanced Optimization Beyond A/B Testing',
  'The Optimization Stack That Scales',
  'Cross-Platform Marketing Strategy',
  'Platform Integration and 360 Customer View',
  'Digital Marketing Career Paths',
  'Specialized Digital Marketing Career Trajectories',
  'Capstone Project: Portfolio Masterpiece',
  'Building Your Marketing Portfolio',
  'Your Digital Marketing Future Starts Now',
  'Your Future is Digital, Strategic, and Yours',
];

const courseCards = [
  { title: 'Digital Marketing Beginner to Professional', level: 'Beginner to Professional', lessons: '45 lessons', modules: '8 modules' },
  { title: 'Digital Media Planning & Buying', level: 'Intermediate to Professional', lessons: 'Coming soon', modules: 'Media planning modules' },
  { title: 'Campaign Portfolio & Capstone Support', level: 'Project-based', lessons: 'Portfolio project', modules: 'Capstone module' },
];

const modules = [
  { title: 'Module 01', name: 'Digital Marketing Foundation', status: 'Completed' as const, progress: 100, lessons: digitalMarketingLessons.slice(0, 8) },
  { title: 'Module 02', name: 'Content & Social Media Strategy', status: 'In progress' as const, progress: 65, lessons: digitalMarketingLessons.slice(8, 15) },
  { title: 'Module 03', name: 'Meta Ads Strategy & Campaign Setup', status: 'Locked' as const, progress: 0, lessons: digitalMarketingLessons.slice(15, 24) },
  { title: 'Module 04', name: 'TikTok, Google Ads, SEO & Analytics', status: 'Locked' as const, progress: 0, lessons: digitalMarketingLessons.slice(24, 35) },
  { title: 'Module 05', name: 'Optimization, Career Path & Capstone', status: 'Locked' as const, progress: 0, lessons: digitalMarketingLessons.slice(35, 45) },
];

const adminStats: Array<{ label: string; value: string; icon: IconType }> = [
  { label: 'Total Students', value: '128', icon: Users },
  { label: 'Published Courses', value: '12', icon: BookOpen },
  { label: 'Pending Assignments', value: '34', icon: ClipboardCheck },
  { label: 'Avg Completion', value: '76%', icon: BarChart3 },
];

const homeStats: Array<{ label: string; value: string; icon: IconType }> = [
  { label: 'Lessons', value: '45', icon: PlayCircle },
  { label: 'Modules', value: '8+', icon: BookOpen },
  { label: 'Live Class', value: 'Weekly', icon: CalendarDays },
  { label: 'Next Course', value: 'Media Buying', icon: ArrowRight },
];

const homeBenefits: Array<{ title: string; text: string; icon: IconType }> = [
  { title: '45 structured lessons', text: 'Open your lesson list and continue from the next available video.', icon: BookOpen },
  { title: 'No skipping system', text: 'Watch the required video progress to unlock the next lesson.', icon: Lock },
  { title: 'Assignments & capstone', text: 'Download the task, finish your work, and submit it before the deadline.', icon: ClipboardCheck },
  { title: 'Next course path', text: 'Finish this course first, then continue to Digital Media Planning & Buying.', icon: Video },
];

const demoStudents: Student[] = [
  { id: 'STU-001', name: 'Aung Min Thu', email: 'aungmin@example.com', course: 'Digital Marketing Beginner to Professional', progress: 72, status: 'Active', lastActive: 'Today, 09:30 AM', joined: 'Jan 12, 2026', assignments: '4 / 6 submitted', quizScore: '86% avg' },
  { id: 'STU-002', name: 'May Zin Htet', email: 'mayzin@example.com', course: 'Digital Marketing Beginner to Professional', progress: 38, status: 'Active', lastActive: 'Yesterday, 08:10 PM', joined: 'Jan 15, 2026', assignments: '2 / 6 submitted', quizScore: '78% avg' },
  { id: 'STU-003', name: 'Ko Lin Aung', email: 'kolin@example.com', course: 'Digital Media Planning & Buying', progress: 12, status: 'Pending', lastActive: '2 days ago', joined: 'Jan 21, 2026', assignments: '0 / 3 submitted', quizScore: 'Not started' },
  { id: 'STU-004', name: 'Thiri Mon', email: 'thiri@example.com', course: 'Digital Marketing Beginner to Professional', progress: 94, status: 'Active', lastActive: 'Today, 01:45 PM', joined: 'Dec 28, 2025', assignments: '6 / 6 submitted', quizScore: '92% avg' },
];

// =====================================================================
// Design tokens (minimal & clean)
// =====================================================================
//
// One restrained system used everywhere:
//   - Flat surfaces, subtle borders, no nested gradients
//   - Generous spacing (gap-8 / py-10 / py-12)
//   - Single emerald accent for primary actions/state
//   - Bold serif for headlines only; everything else is sans

const ui = {
  page: 'space-y-12 sm:space-y-16',
  card: 'rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 sm:p-8',
  cardSolid: 'rounded-2xl border border-white/[0.08] bg-[#0f1638] p-6 sm:p-8',
  cardSubtle: 'rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 sm:p-6',
  eyebrow: 'text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300',
  h1: 'font-serif text-4xl font-bold leading-[1.05] text-white sm:text-5xl',
  h2: 'font-serif text-3xl font-bold leading-tight text-white sm:text-4xl',
  h3: 'text-xl font-bold text-white',
  body: 'text-base leading-7 text-slate-300',
  bodySm: 'text-sm leading-6 text-slate-400',
  btnPrimary:
    'inline-flex items-center justify-center gap-2 rounded-full bg-emerald-300 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-200',
  btnGhost:
    'inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-bold text-slate-200 transition hover:bg-white/[0.08]',
  btnSubtle:
    'inline-flex items-center gap-2 rounded-full border border-white/10 bg-transparent px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06]',
  chip: 'inline-flex items-center gap-1.5 rounded-full bg-emerald-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300',
  chipMuted: 'inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-slate-300',
  divider: 'border-t border-white/[0.06]',
} as const;

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function getNextPage(page: PageName, isLoggedIn: boolean, role: Role): PageName {
  if (!isLoggedIn && protectedPages.includes(page)) return 'Login';
  if (isLoggedIn && role === 'student' && adminOnlyPages.includes(page)) return 'Student Dashboard';
  return page;
}

// =====================================================================
// Brand mark
// =====================================================================

function LogoMark({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const boxSize = size === 'lg' ? 'h-14 w-16' : size === 'sm' ? 'h-8 w-9' : 'h-10 w-12';
  const bar = size === 'lg' ? 'h-7 w-2.5' : size === 'sm' ? 'h-4 w-1.5' : 'h-5 w-2';
  const tri = size === 'lg' ? 'h-7 w-7' : size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
  return (
    <div className={cx('relative grid shrink-0 place-items-center overflow-hidden rounded-lg bg-emerald-300/10 ring-1 ring-emerald-300/20', boxSize)}>
      <div className="flex items-center gap-0.5">
        <span className={cx('block bg-emerald-300', tri)} style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }} />
        <span className={cx('block bg-emerald-300', bar)} />
      </div>
    </div>
  );
}

// =====================================================================
// Shell + Top nav
// =====================================================================

function Shell({
  children,
  active,
  go,
  isLoggedIn,
  role,
  onLogout,
}: {
  children: React.ReactNode;
  active: PageName;
  go: (v: PageName) => void;
  isLoggedIn: boolean;
  role: Role;
  onLogout: () => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const visibleNav: NavItem[] = !isLoggedIn
    ? publicNavItems
    : role === 'admin'
    ? adminNavItems
    : studentNavItems;

  const handleGo = (page: PageName) => {
    go(page);
    setMobileOpen(false);
  };

  const homeTarget: PageName = isLoggedIn ? (role === 'admin' ? 'Admin Panel' : 'Student Dashboard') : 'Home';
  const roleBadge = isLoggedIn ? (role === 'admin' ? 'Admin' : 'Student') : null;

  return (
    <main className="min-h-screen bg-[#070a22] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(94,234,212,0.08),transparent_50%)]" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="sticky top-0 z-30 -mx-4 mb-10 border-b border-white/[0.06] bg-[#070a22]/85 px-4 py-4 backdrop-blur-lg sm:-mx-6 sm:px-6 sm:py-5 lg:-mx-8 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <button onClick={() => handleGo(homeTarget)} className="flex min-w-0 items-center gap-3">
              <LogoMark size="sm" />
              <div className="min-w-0 text-left">
                <p className="font-serif text-base font-bold leading-none text-white sm:text-lg">Ye Htet</p>
                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">Digital Edu</p>
              </div>
            </button>

            <nav className="hidden items-center gap-1 lg:flex">
              {visibleNav.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleGo(item.target)}
                  className={cx(
                    'rounded-full px-4 py-2 text-sm font-medium transition',
                    active === item.target
                      ? 'bg-white/[0.08] text-white'
                      : 'text-slate-400 hover:bg-white/[0.04] hover:text-white',
                  )}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {roleBadge && (
                <span className="hidden rounded-full bg-emerald-300/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300 sm:inline-flex">
                  {roleBadge}
                </span>
              )}
              {isLoggedIn ? (
                <button onClick={onLogout} className="rounded-full px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/[0.06] hover:text-white">
                  Logout
                </button>
              ) : (
                <button onClick={() => handleGo('Login')} className="rounded-full bg-emerald-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-emerald-200">
                  Sign in
                </button>
              )}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-slate-200 lg:hidden"
                aria-label="Toggle menu"
              >
                <span className="text-lg leading-none">{mobileOpen ? '×' : '☰'}</span>
              </button>
            </div>
          </div>

          {mobileOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 grid gap-1 rounded-2xl border border-white/[0.06] bg-[#0c1130] p-2 lg:hidden"
            >
              {visibleNav.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleGo(item.target)}
                  className={cx(
                    'flex items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium transition',
                    active === item.target ? 'bg-white/[0.08] text-white' : 'text-slate-300 hover:bg-white/[0.04]',
                  )}
                >
                  {item.label}
                  <ChevronRight className="h-4 w-4 opacity-60" />
                </button>
              ))}
            </motion.nav>
          )}
        </header>

        <div className="pb-16">{children}</div>
      </div>
    </main>
  );
}

// =====================================================================
// Shared building blocks
// =====================================================================

function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="grid gap-6 sm:flex sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        {eyebrow && <p className={ui.eyebrow}>{eyebrow}</p>}
        <h1 className={cx(ui.h1, eyebrow && 'mt-3')}>{title}</h1>
        {description && <p className={cx(ui.body, 'mt-4')}>{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}

function StatRow({ stats }: { stats: Array<{ label: string; value: string; icon: IconType }> }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-300/10 text-emerald-300">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-bold leading-tight text-white">{stat.value}</p>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ProgressBar({ value, height = 'sm' }: { value: number; height?: 'sm' | 'md' }) {
  const h = height === 'md' ? 'h-2' : 'h-1.5';
  return (
    <div className={cx('w-full overflow-hidden rounded-full bg-white/[0.06]', h)}>
      <div className="h-full rounded-full bg-emerald-300 transition-[width]" style={{ width: `${value}%` }} />
    </div>
  );
}

function BackLink({ go, to, label }: { go: (v: PageName) => void; to: PageName; label: string }) {
  return (
    <button onClick={() => go(to)} className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white">
      <ArrowLeft className="h-4 w-4" /> {label}
    </button>
  );
}

// =====================================================================
// Home page
// =====================================================================

function HomePage({ go }: { go: (v: PageName) => void }) {
  return (
    <div className={ui.page}>
      {/* Hero — one focused message */}
      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className={ui.chip}>
            <LogoMark size="sm" /> Ye Htet · Digital Edu
          </span>
          <h1 className={cx(ui.h1, 'mt-6 sm:text-6xl')}>
            Become a practical <span className="text-emerald-300">Digital Marketer</span>.
          </h1>
          <p className={cx(ui.body, 'mt-5 max-w-xl')}>
            Start your assigned course, watch each lesson in order, complete quizzes and assignments, and join the weekly live class.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={() => go('Courses')} className={ui.btnPrimary}>
              Explore courses <ArrowRight className="h-4 w-4" />
            </button>
            <button onClick={() => go('Learning Path')} className={ui.btnGhost}>
              View roadmap
            </button>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className={cx(ui.cardSolid, 'space-y-5')}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className={ui.eyebrow}>Featured course</p>
              <h2 className="mt-2 text-xl font-bold text-white">Digital Marketing — Beginner to Professional</h2>
              <p className="mt-2 text-sm text-slate-400">45 lessons · 8 modules · Capstone project</p>
            </div>
            <LogoMark size="md" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">Course progress</p>
              <p className="text-sm font-semibold text-white">Start</p>
            </div>
            <ProgressBar value={0} height="md" />
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <button onClick={() => go('Login')} className={ui.btnPrimary}>
              Student login
            </button>
            <button onClick={() => go('Course Detail')} className={ui.btnGhost}>
              Course detail
            </button>
          </div>
        </motion.div>
      </section>

      {/* Stats — clean horizontal row, no decoration */}
      <section>
        <StatRow stats={homeStats} />
      </section>

      {/* Courses */}
      <section>
        <PageHeader eyebrow="Courses" title="Three programs to build your career." description="Pick the right starting point — from foundation to capstone — and follow the lessons assigned to your account." />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {courseCards.map((course) => (
            <CourseCard key={course.title} course={course} go={go} />
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section>
        <PageHeader eyebrow="Why this platform" title="Everything you need to learn end-to-end." />
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {homeBenefits.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className={ui.card}>
                <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-emerald-300/10 text-emerald-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className={ui.h3}>{item.title}</h3>
                <p className={cx(ui.bodySm, 'mt-2')}>{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Study steps */}
      <section>
        <PageHeader eyebrow="How to study" title="Four steps, in order." />
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { n: '01', t: 'Log in', d: 'Use the account provided by the admin.' },
            { n: '02', t: 'Watch the lesson', d: 'Reach the required progress before moving on.' },
            { n: '03', t: 'Complete the task', d: 'Pass the quiz or submit the assignment.' },
            { n: '04', t: 'Join live class', d: 'Ask questions and review the recording later.' },
          ].map((step) => (
            <div key={step.n} className={ui.card}>
              <p className="text-3xl font-bold text-emerald-300">{step.n}</p>
              <h3 className={cx(ui.h3, 'mt-3')}>{step.t}</h3>
              <p className={cx(ui.bodySm, 'mt-2')}>{step.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Closing CTA — restrained, single message */}
      <section className="rounded-2xl border border-emerald-300/30 bg-emerald-300/5 p-8 sm:p-10">
        <div className="grid gap-6 lg:flex lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <h2 className={ui.h2}>Ready to start?</h2>
            <p className={cx(ui.body, 'mt-3')}>Open your course, continue the next lesson, and complete today's task.</p>
          </div>
          <button onClick={() => go('Courses')} className={ui.btnPrimary}>
            Go to courses <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
}

function CourseCard({ course, go }: { course: (typeof courseCards)[number]; go: (v: PageName) => void }) {
  return (
    <div className={cx(ui.card, 'flex h-full flex-col')}>
      <div className="flex items-center justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-300/10 text-emerald-300">
          <BookOpen className="h-5 w-5" />
        </div>
        <span className="text-xs font-medium text-slate-500">{course.lessons}</span>
      </div>
      <h3 className={cx(ui.h3, 'mt-5')}>{course.title}</h3>
      <p className={cx(ui.bodySm, 'mt-2')}>{course.level}</p>
      <p className="mt-4 text-xs font-medium uppercase tracking-[0.14em] text-emerald-300">{course.modules}</p>
      <button onClick={() => go('Course Detail')} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-emerald-300 transition hover:text-emerald-200">
        View detail <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

// =====================================================================
// Learning Path
// =====================================================================

function LearningPathPage({ go }: { go: (v: PageName) => void }) {
  const items = [
    'Digital Marketing Beginner to Professional',
    'Digital Marketing Foundation & Ecosystem',
    'Marketing Funnel, Metrics & Customer Psychology',
    'Content Strategy and Social Media in 2025',
    'Meta Ads Campaign Structure, Budget, Bidding & Targeting',
    'TikTok Ads, Google Ads, SEO, GA4 & Tracking',
    'Full-Funnel Budget Allocation and Advanced Optimization',
    'Career Path, Portfolio Building and Capstone Project',
    'Next Class: Digital Media Planning & Buying',
  ];
  return (
    <div className={ui.page}>
      <PageHeader
        eyebrow="Learning path"
        title="A step-by-step roadmap."
        description="Review the course order, start with Module 1, and follow each module step by step."
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:gap-10">
        <ol className="space-y-3">
          {items.map((item, index) => (
            <li key={item} className={cx(ui.card, 'flex items-center gap-5')}>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-300/10 font-bold text-emerald-300">
                {index + 1}
              </span>
              <p className="text-base font-medium text-slate-200">{item}</p>
            </li>
          ))}
        </ol>

        <aside className="space-y-4">
          <RuleCard title="1. Watch" items={['Open the video lesson', 'Watch progress is saved', 'Do not skip ahead']} />
          <RuleCard title="2. Complete" items={['Watch the required percentage', 'Take the quiz if shown', 'Submit the assignment if shown']} />
          <RuleCard title="3. Unlock" items={['Next lesson becomes available', 'Progress updates automatically', 'Your coach can review your progress']} />
          <button onClick={() => go('Courses')} className={cx(ui.btnPrimary, 'w-full')}>
            View courses <ArrowRight className="h-4 w-4" />
          </button>
        </aside>
      </div>
    </div>
  );
}

function RuleCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className={ui.cardSubtle}>
      <h3 className="text-base font-bold text-white">{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-slate-400">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// =====================================================================
// Courses listing
// =====================================================================

function CoursesPage({ go }: { go: (v: PageName) => void }) {
  return (
    <div className={ui.page}>
      <PageHeader
        eyebrow="Courses"
        title="Available digital marketing courses."
        description="Choose a course, review the details, then log in to access the lessons assigned to your account."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courseCards.map((course) => (
          <CourseCard key={course.title} course={course} go={go} />
        ))}
      </div>
    </div>
  );
}

// =====================================================================
// Course detail
// =====================================================================

function CourseDetailPage({ go }: { go: (v: PageName) => void }) {
  return (
    <div className={ui.page}>
      <PageHeader
        eyebrow="Course detail"
        title="Digital Marketing — Beginner to Professional."
        description="Start with foundation, continue through paid ads, SEO, analytics, optimization, and finish with your portfolio project."
        actions={
          <button onClick={() => go('Login')} className={ui.btnPrimary}>
            Login to continue <ArrowRight className="h-4 w-4" />
          </button>
        }
      />

      <section className="grid gap-3 sm:grid-cols-3">
        <Metric icon={BookOpen} label="Modules" value="8+" detail="Structured roadmap" />
        <Metric icon={PlayCircle} label="Video lessons" value="45" detail="Vimeo + progress tracking" />
        <Metric icon={CalendarDays} label="Next course" value="Media Buying" detail="Continue the path" />
      </section>

      <section>
        <PageHeader eyebrow="Curriculum" title="Course modules and lessons." description="Complete each module to unlock the next. Click a module to expand its lesson list." />
        <div className="mt-8 space-y-3">
          {modules.map((module, index) => (
            <ModuleAccordion key={module.title} module={module} index={index} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <RuleCard title="Access rule" items={['Log in with your student account', 'Use an enrolled course account', 'Make sure your access is still active']} />
        <RuleCard title="Learning rule" items={['Watch the video first', 'Pass the quiz if required', 'Submit the assignment if required']} />
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value, detail }: { icon: IconType; label: string; value: string; detail: string }) {
  return (
    <div className={ui.card}>
      <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-emerald-300/10 text-emerald-300">
        <Icon className="h-5 w-5" />
      </div>
      <p className="font-serif text-3xl font-bold text-white">{value}</p>
      <p className="mt-1 text-sm font-bold text-white">{label}</p>
      <p className="mt-1 text-sm text-slate-500">{detail}</p>
    </div>
  );
}

function ModuleAccordion({ module, index }: { module: (typeof modules)[number]; index: number }) {
  const [open, setOpen] = useState(index === 1); // open the in-progress module
  const isLocked = module.status === 'Locked';
  const statusTone =
    module.status === 'Completed' ? 'bg-emerald-300/15 text-emerald-300' : module.status === 'In progress' ? 'bg-emerald-300 text-slate-950' : 'bg-white/[0.06] text-slate-400';

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02]">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition hover:bg-white/[0.03] sm:px-6">
        <div className="flex min-w-0 items-center gap-4">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{module.title}</span>
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-white sm:text-lg">{module.name}</h3>
            <p className="mt-1 text-xs text-slate-500">{module.progress}% · {module.lessons.length} lessons</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={cx('hidden rounded-full px-3 py-1 text-[11px] font-semibold sm:inline-flex', statusTone)}>{module.status}</span>
          <ChevronDown className={cx('h-5 w-5 text-slate-500 transition', open && 'rotate-180')} />
        </div>
      </button>

      <div className="px-5 pb-2 sm:px-6">
        <ProgressBar value={module.progress} />
      </div>

      {open && (
        <div className="space-y-1 px-3 pb-4 pt-3 sm:px-4">
          {module.lessons.map((lesson, i) => (
            <div key={lesson} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-300 transition hover:bg-white/[0.03]">
              {isLocked ? <Lock className="h-4 w-4 shrink-0 text-slate-600" /> : <PlayCircle className="h-4 w-4 shrink-0 text-emerald-300" />}
              <span className="text-xs font-semibold text-slate-500">{String(i + 1).padStart(2, '0')}</span>
              <span className="truncate">{lesson}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// =====================================================================
// Student Dashboard
// =====================================================================

function StudentDashboardPage({ go }: { go: (v: PageName) => void }) {
  const currentCourse = courseCards[0];
  const currentModule = modules[1];
  const nextLesson = currentModule.lessons[2] || currentModule.lessons[0];
  const overallProgress = 38;

  const quickActions: Array<{ icon: IconType; label: string; target: PageName }> = [
    { icon: ClipboardCheck, label: 'Assignments', target: 'Assignments' },
    { icon: Download, label: 'Resources', target: 'Resources' },
    { icon: Video, label: 'Live class', target: 'Live Meeting' },
    { icon: BookOpen, label: 'Course detail', target: 'Course Detail' },
  ];

  return (
    <div className={ui.page}>
      <PageHeader
        eyebrow="Welcome back"
        title="Pick up where you left off."
        description={`You're on ${currentModule.title} — ${currentModule.name}. Keep watching to unlock the next lesson.`}
        actions={
          <button onClick={() => go('Lesson Player')} className={ui.btnPrimary}>
            Continue lesson <ArrowRight className="h-4 w-4" />
          </button>
        }
      />

      {/* Hero progress + next lesson */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className={cx(ui.card, 'md:col-span-2')}>
          <p className={ui.eyebrow}>Up next</p>
          <h2 className={cx(ui.h2, 'mt-3 text-2xl sm:text-3xl')}>{nextLesson}</h2>
          <p className={cx(ui.bodySm, 'mt-3')}>From {currentCourse.title}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => go('Lesson Player')} className={ui.btnPrimary}>
              <PlayCircle className="h-4 w-4" /> Resume
            </button>
            <button onClick={() => go('Quiz')} className={ui.btnGhost}>
              Take quiz
            </button>
          </div>
        </div>
        <div className={ui.card}>
          <p className={ui.eyebrow}>Course progress</p>
          <p className="mt-3 font-serif text-5xl font-bold text-white">{overallProgress}%</p>
          <div className="mt-4">
            <ProgressBar value={overallProgress} height="md" />
          </div>
          <p className={cx(ui.bodySm, 'mt-3')}>{currentModule.title} · {currentModule.name}</p>
        </div>
      </section>

      {/* Quick actions — single clean row */}
      <section>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => go(action.target)}
                className={cx(ui.card, 'group flex items-center gap-4 text-left transition hover:border-emerald-300/30 hover:bg-white/[0.05]')}
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-300/10 text-emerald-300">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="flex-1 text-base font-bold text-white">{action.label}</span>
                <ChevronRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-emerald-300" />
              </button>
            );
          })}
        </div>
      </section>

      {/* Modules — restful list */}
      <section>
        <PageHeader eyebrow="Your course" title={currentCourse.title} description={`${currentCourse.modules} · ${currentCourse.lessons}`} actions={
          <button onClick={() => go('Course Detail')} className={ui.btnSubtle}>
            View detail
          </button>
        } />
        <div className="mt-8 space-y-3">
          {modules.map((module) => (
            <ModuleListRow key={module.title} module={module} onOpen={() => go('Lesson Player')} />
          ))}
        </div>
      </section>

      {/* Info row */}
      <section className="grid gap-3 md:grid-cols-2">
        <InfoCard icon={CalendarDays} title="Upcoming live class" text="Saturday · 7:00 PM – 8:30 PM" />
        <InfoCard icon={ClipboardCheck} title="Pending assignment" text="Marketing funnel worksheet — due before the next module." />
      </section>
    </div>
  );
}

function ModuleListRow({ module, onOpen }: { module: (typeof modules)[number]; onOpen: () => void }) {
  const isLocked = module.status === 'Locked';
  const isCurrent = module.status === 'In progress';
  const isDone = module.status === 'Completed';
  const Icon = isDone ? CheckCircle2 : isLocked ? Lock : PlayCircle;
  const iconTone = isDone ? 'text-emerald-300' : isLocked ? 'text-slate-600' : 'text-emerald-300';

  return (
    <div className={cx('flex flex-wrap items-center gap-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-5 sm:px-6', isCurrent && 'border-emerald-300/30 bg-emerald-300/[0.04]')}>
      <div className={cx('grid h-10 w-10 shrink-0 place-items-center rounded-xl', isCurrent ? 'bg-emerald-300/15' : 'bg-white/[0.04]')}>
        <Icon className={cx('h-5 w-5', iconTone)} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{module.title}</p>
        <h3 className="mt-1 text-base font-bold text-white sm:text-lg">{module.name}</h3>
        <div className="mt-3 max-w-md">
          <ProgressBar value={module.progress} />
          <p className="mt-2 text-xs text-slate-500">{module.progress}% · {module.lessons.length} lessons</p>
        </div>
      </div>
      <button
        onClick={onOpen}
        disabled={isLocked}
        className={cx(
          isLocked ? 'cursor-not-allowed opacity-50' : '',
          isCurrent ? ui.btnPrimary : ui.btnSubtle,
        )}
      >
        {isLocked ? 'Locked' : isDone ? 'Review' : 'Continue'}
      </button>
    </div>
  );
}

function InfoCard({ icon: Icon, title, text }: { icon: IconType; title: string; text: string }) {
  return (
    <div className={ui.card}>
      <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl bg-emerald-300/10 text-emerald-300">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className={ui.h3}>{title}</h3>
      <p className={cx(ui.bodySm, 'mt-2')}>{text}</p>
    </div>
  );
}

// =====================================================================
// Lesson Player
// =====================================================================

function LessonPreview({ lessonTitle, progress }: { lessonTitle: string; progress: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-950">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-3 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-300 text-slate-950">
            <PlayCircle className="h-3.5 w-3.5" />
          </span>
          <span className="truncate font-semibold text-slate-200">Now watching · {lessonTitle}</span>
        </div>
        <span className="shrink-0 rounded-full bg-emerald-300/10 px-3 py-1 font-semibold text-emerald-300">{progress}% watched</span>
      </div>
      <div className="grid min-h-[320px] place-items-center bg-[radial-gradient(circle_at_50%_40%,rgba(94,234,212,0.08),transparent_60%)] p-8 sm:min-h-[420px]">
        <div className="text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-300/10 text-emerald-300">
            <PlayCircle className="h-10 w-10" />
          </div>
          <h3 className="mt-5 text-xl font-bold text-white">{lessonTitle}</h3>
          <p className="mt-2 max-w-sm text-sm text-slate-400">Watch the lesson, then complete the tasks to unlock the next step.</p>
        </div>
      </div>
    </div>
  );
}

function LessonPlayerPage({ go }: { go: (v: PageName) => void }) {
  const [activeModuleIndex, setActiveModuleIndex] = useState(1);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const activeModule = modules[activeModuleIndex];
  const activeLesson = activeModule.lessons[activeLessonIndex];
  const watchedProgress = Math.round(((activeLessonIndex + 1) / activeModule.lessons.length) * 100);

  return (
    <div className={ui.page}>
      <div className="flex items-center justify-between gap-4">
        <BackLink go={go} to="Student Dashboard" label="Back to dashboard" />
        <span className={ui.chipMuted}>
          Step {activeLessonIndex + 1} / {activeModule.lessons.length}
        </span>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:gap-10">
        {/* Main */}
        <div className="space-y-8">
          <div>
            <p className={ui.eyebrow}>{activeModule.title} · {activeModule.name}</p>
            <h1 className={cx(ui.h2, 'mt-3')}>{activeLesson}</h1>
          </div>

          <LessonPreview lessonTitle={activeLesson} progress={watchedProgress} />

          <div className="flex flex-wrap gap-3">
            <button onClick={() => go('Quiz')} className={ui.btnPrimary}>
              Take quiz
            </button>
            <button onClick={() => go('Assignments')} className={ui.btnGhost}>
              Submit assignment
            </button>
            <button onClick={() => go('Resources')} className={ui.btnGhost}>
              Download resources
            </button>
          </div>

          {/* Lessons in this module */}
          <div>
            <h2 className="text-base font-bold uppercase tracking-[0.18em] text-slate-500">Lessons in this module</h2>
            <div className="mt-4 space-y-2">
              {activeModule.lessons.map((lesson, index) => {
                const isActive = activeLessonIndex === index;
                return (
                  <button
                    key={lesson}
                    onClick={() => setActiveLessonIndex(index)}
                    className={cx(
                      'flex w-full items-center gap-4 rounded-xl border px-4 py-3 text-left text-sm transition',
                      isActive
                        ? 'border-emerald-300/30 bg-emerald-300/[0.06] text-white'
                        : 'border-white/[0.06] bg-white/[0.02] text-slate-300 hover:border-emerald-300/20 hover:bg-white/[0.04]',
                    )}
                  >
                    <span className={cx('grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold', isActive ? 'bg-emerald-300 text-slate-950' : 'bg-white/[0.06] text-slate-400')}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="truncate font-medium">{lesson}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar — module picker only */}
        <aside className="space-y-2">
          <p className={cx(ui.eyebrow, 'mb-3 px-1')}>All modules</p>
          {modules.map((module, index) => {
            const isCurrent = index === activeModuleIndex;
            const isLocked = module.status === 'Locked';
            return (
              <button
                key={module.title}
                onClick={() => {
                  if (!isLocked) {
                    setActiveModuleIndex(index);
                    setActiveLessonIndex(0);
                  }
                }}
                disabled={isLocked}
                className={cx(
                  'w-full rounded-xl border px-4 py-4 text-left transition',
                  isCurrent
                    ? 'border-emerald-300/30 bg-emerald-300/[0.06]'
                    : isLocked
                    ? 'border-white/[0.06] bg-white/[0.02] opacity-60'
                    : 'border-white/[0.06] bg-white/[0.02] hover:border-emerald-300/20 hover:bg-white/[0.04]',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">{module.title}</p>
                  {isLocked && <Lock className="h-3.5 w-3.5 text-slate-600" />}
                </div>
                <h3 className="mt-1.5 text-sm font-bold text-white">{module.name}</h3>
                <div className="mt-3">
                  <ProgressBar value={module.progress} />
                </div>
                <p className="mt-2 text-xs text-slate-500">{module.progress}% · {module.lessons.length} lessons</p>
              </button>
            );
          })}
        </aside>
      </div>
    </div>
  );
}

// =====================================================================
// Simple inner pages (Quiz / Assignments / Resources / Reports)
// =====================================================================

function SimplePage({
  icon: Icon,
  title,
  eyebrow,
  text,
  backTarget,
  go,
}: {
  icon: IconType;
  title: string;
  eyebrow: string;
  text: string;
  backTarget: PageName;
  go: (v: PageName) => void;
}) {
  return (
    <div className={ui.page}>
      <BackLink go={go} to={backTarget} label={`Back to ${backTarget}`} />
      <PageHeader eyebrow={eyebrow} title={title} description={text} />
      <section className="grid gap-3 md:grid-cols-3">
        <InfoCard icon={Icon} title="Open" text="Start the selected item and follow the instructions." />
        <InfoCard icon={CheckCircle2} title="Complete" text="Finish the required step before continuing." />
        <InfoCard icon={ArrowRight} title="Continue" text="Move to the next available lesson or task." />
      </section>
    </div>
  );
}

function QuizPage({ go }: { go: (v: PageName) => void }) {
  return <SimplePage icon={ClipboardCheck} title="Lesson quiz." eyebrow="Quiz" text="Answer each question, submit the quiz, and reach the passing score to unlock the next lesson." backTarget="Lesson Player" go={go} />;
}
function AssignmentsPage({ go }: { go: (v: PageName) => void }) {
  return <SimplePage icon={UploadCloud} title="Submit your assignment." eyebrow="Assignments" text="Upload your file, paste your link, or write your answer, then submit it for review." backTarget="Student Dashboard" go={go} />;
}
function ResourcesPage({ go }: { go: (v: PageName) => void }) {
  return <SimplePage icon={Download} title="Lesson resource files." eyebrow="Resources" text="Download the files you need for the current lesson or assignment." backTarget="Student Dashboard" go={go} />;
}
function ReportsPage({ go }: { go: (v: PageName) => void }) {
  return <SimplePage icon={BarChart3} title="Progress, quiz & assignment reports." eyebrow="Reports" text="Select a report type, review student activity, then export the result if needed." backTarget="Admin Panel" go={go} />;
}

// =====================================================================
// Live Meeting
// =====================================================================

function LiveMeetingPage({ go }: { go: (v: PageName) => void }) {
  const roomName = `YeHtetEdu-SaturdayLiveClass-${new Date().getDate()}`;
  const jitsiURL = `https://meet.jit.si/${roomName}#config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false`;

  return (
    <div className={ui.page}>
      <BackLink go={go} to="Student Dashboard" label="Back to dashboard" />
      <PageHeader
        eyebrow="Saturday live class"
        title="7:00 PM – 8:30 PM."
        description="Join the live session from any device. Use Chrome or Firefox for best results."
        actions={
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" /> Live now
          </span>
        }
      />

      <section className={ui.card}>
        <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px' }}>
          <iframe
            src={jitsiURL}
            allow="camera; microphone; display-capture; fullscreen; autoplay; clipboard-read; clipboard-write"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: '12px' }}
            title="Ye Htet Digital Edu — Live Class"
          />
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <InfoCard icon={Video} title="Camera & mic" text="Use the toolbar in the video to toggle your camera and microphone." />
        <InfoCard icon={MonitorUp} title="Screen sharing" text="Share your screen with the class from the toolbar buttons." />
        <InfoCard icon={Users} title="Multiple users" text="All participants can join from any device with browser support." />
      </section>
    </div>
  );
}

// =====================================================================
// Admin Panel (kept compact, refreshed styling)
// =====================================================================

const adminContent: Record<string, { title: string; description: string; primaryAction: string; cards: Array<{ title: string; items: string[] }> }> = {
  Dashboard: { title: 'Admin Control Center', description: 'Choose a menu item on the left, then create, edit, review, or export the selected section.', primaryAction: 'Create Student', cards: [{ title: 'Student Management', items: ['Create student account', 'Assign one or multiple courses', 'Set start date and expiry date', 'Activate or suspend account'] }, { title: 'Course Builder', items: ['Create course and modules', 'Add Vimeo video lessons', 'Attach quiz, resource, and assignment', 'Set lesson unlock rules'] }, { title: 'Reports', items: ['Student progress percentage', 'Video watch history', 'Quiz score report', 'Assignment review status'] }, { title: 'Meeting Control', items: ['Create live class', 'Control screen sharing', 'Start or stop recording', 'Check attendance history'] }] },
  Students: { title: 'Student Management', description: 'Create student accounts, assign courses, control access dates, and manage student status.', primaryAction: 'Add Student', cards: [] },
  Courses: { title: 'Course Management', description: 'Create and organize courses.', primaryAction: 'Create Course', cards: [{ title: 'Main Course', items: ['Digital Marketing Beginner to Professional', '45 lessons', '8+ modules', 'Capstone project'] }, { title: 'Next Course', items: ['Digital Media Planning & Buying', 'Planning framework', 'Buying strategy', 'Campaign workflow'] }] },
  Modules: { title: 'Module Builder', description: 'Organize course lessons into modules.', primaryAction: 'Add Module', cards: [{ title: 'Module Structure', items: ['Module title', 'Lesson order', 'Progress percentage', 'Locked or unlocked'] }, { title: 'Unlock Rules', items: ['Previous lesson required', 'Quiz pass required', 'Assignment required', 'Admin override'] }] },
  Lessons: { title: 'Lesson Manager', description: 'Add Vimeo video lessons and control unlock behavior.', primaryAction: 'Add Lesson', cards: [{ title: 'Video Lesson', items: ['Vimeo embed URL', 'Watch progress rule', 'No skipping', 'Resume playback'] }, { title: 'Tracking', items: ['Watch time', 'Last position', 'Completed date', 'Device history'] }] },
  Quizzes: { title: 'Quiz Builder', description: 'Create lesson quizzes.', primaryAction: 'Create Quiz', cards: [{ title: 'Quiz Settings', items: ['Passing score', 'Max attempts', 'Show answers', 'Randomize questions'] }] },
  Assignments: { title: 'Assignment Review', description: 'Create assignments and review submissions.', primaryAction: 'Create Assignment', cards: [{ title: 'Submission Types', items: ['Text answer', 'File upload', 'External link', 'Google Sheet link'] }] },
  Meetings: { title: 'Live Class Meetings', description: 'Schedule live classes and track attendance.', primaryAction: 'Schedule Meeting', cards: [{ title: 'Meeting Setup', items: ['Title', 'Date and time', 'Meeting room', 'Student access'] }] },
  Reports: { title: 'Reports & Analytics', description: 'Review progress and export reports.', primaryAction: 'Export Report', cards: [{ title: 'Progress Report', items: ['Course completion', 'Lesson completion', 'Watch percentage', 'Last activity'] }] },
  Settings: { title: 'Platform Settings', description: 'Configure branding, roles, permissions, and notifications.', primaryAction: 'Save Settings', cards: [{ title: 'Branding', items: ['Ye Htet - Digital Edu', 'Logo', 'Theme color', 'Course display'] }] },
};

function AdminPanelPage() {
  const adminMenu = ['Dashboard', 'Students', 'Courses', 'Modules', 'Lessons', 'Quizzes', 'Assignments', 'Meetings', 'Reports', 'Settings'];
  const [adminActive, setAdminActive] = useState('Dashboard');
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(demoStudents[0].id);
  const current = adminContent[adminActive] || adminContent.Dashboard;
  const selectedStudent = demoStudents.find((s) => s.id === selectedStudentId) || demoStudents[0];
  const openAction = (name: string) => { setActiveAction(name); setSavedMessage(''); };

  return (
    <div className={ui.page}>
      <div className="grid gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="space-y-1">
          <p className={cx(ui.eyebrow, 'px-3 pb-2')}>Admin panel</p>
          {adminMenu.map((item) => (
            <button
              key={item}
              onClick={() => { setAdminActive(item); setActiveAction(null); setSavedMessage(''); if (item === 'Students') setSelectedStudentId(demoStudents[0].id); }}
              className={cx(
                'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition',
                adminActive === item ? 'bg-white/[0.08] text-white' : 'text-slate-400 hover:bg-white/[0.04] hover:text-white',
              )}
            >
              {item === 'Dashboard' ? (
                <LayoutDashboard className="h-4 w-4" />
              ) : item === 'Settings' ? (
                <Settings className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4 opacity-60" />
              )}
              {item}
            </button>
          ))}
        </aside>

        <div className={ui.page}>
          <PageHeader
            eyebrow={`${adminActive}`}
            title={current.title}
            description={current.description}
            actions={
              <button onClick={() => openAction(current.primaryAction)} className={ui.btnPrimary}>
                <Plus className="h-4 w-4" /> {current.primaryAction}
              </button>
            }
          />

          {savedMessage && (
            <div className="rounded-xl border border-emerald-300/30 bg-emerald-300/5 px-4 py-3 text-sm font-medium text-emerald-200">
              {savedMessage}
            </div>
          )}

          {activeAction && (
            <AdminActionPanel
              // Remount the form whenever the section/action/student changes so
              // defaultValue inputs reflect the freshly selected record.
              key={`${adminActive}:${activeAction}:${selectedStudent.id}`}
              section={adminActive}
              actionName={activeAction}
              initialValues={
                adminActive === 'Students' && activeAction.toLowerCase().startsWith('edit')
                  ? {
                      'Student name': selectedStudent.name,
                      'Email address': selectedStudent.email,
                      'Temporary password': '',
                      'Assigned course': selectedStudent.course,
                    }
                  : undefined
              }
              onCancel={() => setActiveAction(null)}
              onSave={() => { setSavedMessage(`${activeAction} saved successfully.`); setActiveAction(null); }}
            />
          )}

          {adminActive === 'Students' ? (
            <StudentDirectory
              students={demoStudents}
              selectedStudent={selectedStudent}
              onSelectStudent={(id) => { setSelectedStudentId(id); setActiveAction(null); }}
              onCreateStudent={() => openAction('Add Student')}
              onEditStudent={() => openAction(`Edit ${selectedStudent.name}`)}
            />
          ) : (
            <>
              <StatRow stats={adminStats} />
              <div className="grid gap-4 lg:grid-cols-2">
                {current.cards.map((card) => (
                  <Panel key={card.title} title={card.title} items={card.items} onAction={() => openAction(card.title)} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StudentDirectory({
  students,
  selectedStudent,
  onSelectStudent,
  onCreateStudent,
  onEditStudent,
}: {
  students: Student[];
  selectedStudent: Student;
  onSelectStudent: (id: string) => void;
  onCreateStudent: () => void;
  onEditStudent: () => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_400px]">
      <div className={ui.card}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className={ui.eyebrow}>All students</p>
            <h2 className={cx(ui.h3, 'mt-2')}>{students.length} students</h2>
          </div>
          <button onClick={onCreateStudent} className={ui.btnPrimary}>
            <Plus className="h-4 w-4" /> Add student
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[640px] w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] uppercase tracking-[0.14em] text-slate-500">
                <th className="py-3 pr-4 font-medium">Student</th>
                <th className="py-3 pr-4 font-medium">Progress</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4 font-medium">Last active</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const isSelected = student.id === selectedStudent.id;
                return (
                  <tr
                    key={student.id}
                    onClick={() => onSelectStudent(student.id)}
                    className={cx('cursor-pointer border-b border-white/[0.04] transition hover:bg-white/[0.03]', isSelected && 'bg-emerald-300/[0.04]')}
                  >
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-emerald-300/10 text-sm font-bold text-emerald-300">{student.name.slice(0, 1)}</div>
                        <div>
                          <p className="font-medium text-white">{student.name}</p>
                          <p className="text-xs text-slate-500">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20"><ProgressBar value={student.progress} /></div>
                        <span className="text-xs font-medium text-slate-400">{student.progress}%</span>
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <span className={cx('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', student.status === 'Active' ? 'bg-emerald-300/15 text-emerald-300' : 'bg-amber-300/15 text-amber-300')}>
                        {student.status}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-slate-400">{student.lastActive}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <aside className={ui.card}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className={ui.eyebrow}>Profile</p>
            <h2 className={cx(ui.h2, 'mt-2 text-2xl sm:text-2xl')}>{selectedStudent.name}</h2>
            <p className={cx(ui.bodySm, 'mt-1')}>{selectedStudent.email}</p>
          </div>
          <button onClick={onEditStudent} className={ui.btnSubtle}>Edit</button>
        </div>

        <div className="mt-6 space-y-2">
          <ProfileField label="Student ID" value={selectedStudent.id} />
          <ProfileField label="Joined" value={selectedStudent.joined} />
          <ProfileField label="Assigned course" value={selectedStudent.course} />
          <ProfileField label="Status" value={selectedStudent.status} />
          <ProfileField label="Assignments" value={selectedStudent.assignments} />
          <ProfileField label="Quiz score" value={selectedStudent.quizScore} />
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-400">Course progress</p>
            <p className="text-sm font-bold text-white">{selectedStudent.progress}%</p>
          </div>
          <div className="mt-2">
            <ProgressBar value={selectedStudent.progress} height="md" />
          </div>
          <p className="mt-3 text-xs text-slate-500">Last active: {selectedStudent.lastActive}</p>
        </div>
      </aside>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.04] py-2.5 last:border-b-0">
      <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">{label}</span>
      <span className="text-right text-sm font-medium text-slate-200">{value}</span>
    </div>
  );
}

function AdminActionPanel({
  section,
  actionName,
  initialValues,
  onCancel,
  onSave,
}: {
  section: string;
  actionName: string;
  initialValues?: Record<string, string>;
  onCancel: () => void;
  onSave: () => void;
}) {
  const fields =
    ({
      Students: ['Student name', 'Email address', 'Temporary password', 'Assigned course'],
      Courses: ['Course title', 'Level', 'Short description', 'Publish status'],
      Modules: ['Module title', 'Course', 'Sort order', 'Unlock rule'],
      Lessons: ['Lesson title', 'Vimeo embed URL', 'Required watch percentage', 'Attached resource'],
      Quizzes: ['Quiz title', 'Passing score', 'Max attempts', 'Question type'],
      Assignments: ['Assignment title', 'Due date', 'Submission type', 'Unlock behavior'],
      Meetings: ['Meeting title', 'Date and time', 'Host', 'Recording access'],
      Reports: ['Report type', 'Date range', 'Student group', 'Export format'],
      Settings: ['Platform name', 'Theme color', 'Default pass score', 'Default watch percentage'],
      Dashboard: ['Student name', 'Email address', 'Assigned course', 'Access expiry date'],
    } as Record<string, string[]>)[section] || ['Title', 'Description', 'Status', 'Owner'];

  const isEditing = actionName.toLowerCase().startsWith('edit');

  return (
    <div className={cx(ui.card, 'border-emerald-300/20')}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={ui.eyebrow}>{isEditing ? 'Edit' : 'Create'}</p>
          <h2 className={cx(ui.h3, 'mt-2')}>{actionName}</h2>
        </div>
        <button onClick={onCancel} className={ui.btnSubtle}>Close</button>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {fields.map((field) => {
          const isPassword = field.toLowerCase().includes('password');
          const preset = initialValues?.[field] ?? '';
          return (
            <label key={field} className="block">
              <span className="text-xs font-semibold text-slate-400">{field}</span>
              <input
                type={isPassword ? 'password' : 'text'}
                defaultValue={preset}
                className="mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-300/40"
                placeholder={
                  isEditing && isPassword
                    ? 'Leave blank to keep current'
                    : `Enter ${field.toLowerCase()}`
                }
              />
            </label>
          );
        })}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button onClick={onSave} className={ui.btnPrimary}>
          {isEditing ? 'Save changes' : 'Save preview'}
        </button>
        <button onClick={onCancel} className={ui.btnGhost}>Cancel</button>
      </div>
    </div>
  );
}

function Panel({ title, items, onAction }: { title: string; items: string[]; onAction?: () => void }) {
  return (
    <div className={ui.card}>
      <div className="flex items-start justify-between gap-3">
        <h3 className={ui.h3}>{title}</h3>
        {onAction && (
          <button onClick={onAction} className={ui.btnSubtle}>Open</button>
        )}
      </div>
      <ul className="mt-4 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// =====================================================================
// Login
// =====================================================================

function LoginPage({ login }: { login: (role: 'admin' | 'student') => void }) {
  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand + headline */}
        <div className="mb-10 text-center">
          <div className="mb-6 flex justify-center">
            <LogoMark size="md" />
          </div>
          <h1 className="font-serif text-3xl font-bold leading-tight text-white sm:text-4xl">
            Sign in to your learning space
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            Choose a role to continue to your dashboard.
          </p>
        </div>

        {/* Role buttons with inline demo credentials */}
        <div className="space-y-3">
          <RoleSignInCard
            role="Student"
            tagline="Continue learning"
            icon={GraduationCap}
            primary
            username={demoCredentials.student.username}
            password={demoCredentials.student.password}
            onClick={() => login('student')}
          />
          <RoleSignInCard
            role="Admin"
            tagline="Manage platform"
            icon={ShieldCheck}
            username={demoCredentials.admin.username}
            password={demoCredentials.admin.password}
            onClick={() => login('admin')}
          />
        </div>

        <p className="mt-8 text-center text-xs text-slate-500">
          Demo accounts — click any role to sign in instantly.
        </p>
      </div>
    </div>
  );
}

function RoleSignInCard({
  role,
  tagline,
  icon: Icon,
  primary,
  username,
  password,
  onClick,
}: {
  role: string;
  tagline: string;
  icon: IconType;
  primary?: boolean;
  username: string;
  password: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cx(
        'group block w-full rounded-2xl border p-5 text-left transition',
        primary
          ? 'border-emerald-300/40 bg-emerald-300/[0.06] hover:border-emerald-300/60 hover:bg-emerald-300/[0.1]'
          : 'border-white/[0.08] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.05]',
      )}
    >
      {/* Header row */}
      <div className="flex items-center gap-4">
        <div
          className={cx(
            'grid h-11 w-11 shrink-0 place-items-center rounded-xl',
            primary ? 'bg-emerald-300 text-slate-950' : 'bg-white/[0.06] text-emerald-300',
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-white">{role}</p>
          <p className="text-sm text-slate-400">{tagline}</p>
        </div>
        <ArrowRight
          className={cx(
            'h-4 w-4 shrink-0 text-slate-500 transition group-hover:translate-x-0.5',
            primary && 'text-emerald-300',
          )}
        />
      </div>

      {/* Inline demo credentials */}
      <div className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 rounded-lg bg-black/20 px-3 py-2.5 font-mono text-[11px]">
        <span className="text-slate-500">user</span>
        <span className="truncate text-slate-200">{username}</span>
        <span className="text-slate-500">pass</span>
        <span className="text-emerald-300">{password}</span>
      </div>
    </button>
  );
}

// =====================================================================
// Root App
// =====================================================================

export default function App() {
  const [active, setActive] = useState<PageName>(() => readHashPage());
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<Role>(null);

  useEffect(() => {
    const desired = pageToHash(active);
    if (window.location.hash !== desired) {
      window.history.pushState(null, '', desired);
    }
    // Scroll to top on page change so users don't land mid-page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [active]);

  useEffect(() => {
    const sync = () => {
      const next = readHashPage();
      const resolved = getNextPage(next, isLoggedIn, role);
      setActive(resolved);
    };
    window.addEventListener('hashchange', sync);
    window.addEventListener('popstate', sync);
    return () => {
      window.removeEventListener('hashchange', sync);
      window.removeEventListener('popstate', sync);
    };
  }, [isLoggedIn, role]);

  const go = (page: PageName) => {
    const next = getNextPage(page, isLoggedIn, role);
    setActive(next);
  };

  const login = (loginRole: 'admin' | 'student') => {
    setIsLoggedIn(true);
    setRole(loginRole);
    setActive(loginRole === 'admin' ? 'Admin Panel' : 'Student Dashboard');
  };

  const logout = () => {
    setIsLoggedIn(false);
    setRole(null);
    setActive('Home');
  };

  return (
    <Shell active={active} go={go} isLoggedIn={isLoggedIn} role={role} onLogout={logout}>
      {active === 'Home' && <HomePage go={go} />}
      {active === 'Courses' && <CoursesPage go={go} />}
      {active === 'Learning Path' && <LearningPathPage go={go} />}
      {active === 'Course Detail' && <CourseDetailPage go={go} />}
      {active === 'Admin Panel' && <AdminPanelPage />}
      {active === 'Student Dashboard' && <StudentDashboardPage go={go} />}
      {active === 'Lesson Player' && <LessonPlayerPage go={go} />}
      {active === 'Quiz' && <QuizPage go={go} />}
      {active === 'Assignments' && <AssignmentsPage go={go} />}
      {active === 'Resources' && <ResourcesPage go={go} />}
      {active === 'Reports' && <ReportsPage go={go} />}
      {active === 'Live Meeting' && <LiveMeetingPage go={go} />}
      {active === 'Login' && <LoginPage login={login} />}
    </Shell>
  );
}
