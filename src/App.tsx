import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Download,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Lock,
  LogIn,
  Mic,
  MonitorUp,
  PlayCircle,
  Plus,
  Radio,
  Search,
  Settings,
  ShieldCheck,
  UploadCloud,
  Users,
  Video,
} from 'lucide-react';

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

const publicNavItems: NavItem[] = [
  { label: 'Home', target: 'Home' },
  { label: 'Courses', target: 'Courses' },
  { label: 'Learning Path', target: 'Learning Path' },
];

const studentNavItems: NavItem[] = [
  { label: 'Dashboard', target: 'Student Dashboard' },
  { label: 'Resources', target: 'Resources' },
  { label: 'Assignments', target: 'Assignments' },
  { label: 'Live Class', target: 'Live Meeting' },
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

const demoCredentials = {
  admin: { username: 'admin@dmclass.com', password: 'Admin@2026' },
  student: { username: 'student@dmclass.com', password: 'Student@2026' },
};

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
  { title: 'Module 01', name: 'Digital Marketing Foundation', status: 'Completed', progress: 100, lessons: digitalMarketingLessons.slice(0, 8) },
  { title: 'Module 02', name: 'Content & Social Media Strategy', status: 'In progress', progress: 65, lessons: digitalMarketingLessons.slice(8, 15) },
  { title: 'Module 03', name: 'Meta Ads Strategy & Campaign Setup', status: 'Locked', progress: 0, lessons: digitalMarketingLessons.slice(15, 24) },
  { title: 'Module 04', name: 'TikTok, Google Ads, SEO & Analytics', status: 'Locked', progress: 0, lessons: digitalMarketingLessons.slice(24, 35) },
  { title: 'Module 05', name: 'Optimization, Career Path & Capstone', status: 'Locked', progress: 0, lessons: digitalMarketingLessons.slice(35, 45) },
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

const ui = {
  section: 'rounded-[1.5rem] border border-white/10 bg-[#11183d]/90 p-5 shadow-2xl shadow-black/25 sm:rounded-[1.75rem] sm:p-7 lg:p-8',
  sectionSoft: 'rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-black/10 sm:p-6',
  eyebrow: 'text-[10px] font-black uppercase tracking-[0.32em] text-emerald-300 sm:text-xs',
  h2: 'font-serif text-3xl font-black leading-tight text-white sm:text-4xl',
  button: 'inline-flex items-center justify-center gap-2.5 rounded-full px-5 py-3 text-sm font-black transition sm:px-6 sm:py-3.5',
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

function getNextPage(page: PageName, isLoggedIn: boolean): PageName {
  return !isLoggedIn && protectedPages.includes(page) ? 'Login' : page;
}

function LogoMark({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const boxSize = size === 'lg' ? 'h-16 w-20' : size === 'sm' ? 'h-9 w-11' : 'h-11 w-14';
  const playSize = size === 'lg' ? 'h-9 w-9' : size === 'sm' ? 'h-5 w-5' : 'h-7 w-7';
  const middleSize = playSize;
  const barSize = size === 'lg' ? 'h-9 w-3' : size === 'sm' ? 'h-5 w-2' : 'h-7 w-2.5';
  return (
    <div className={cx('relative shrink-0 overflow-hidden rounded-xl border border-emerald-300/25 bg-gradient-to-b from-[#302783] via-[#2f3487] to-[#3b7890] shadow-lg shadow-emerald-950/20', boxSize)}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-18%,#302783_0%,#302783_46%,transparent_47%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#3d7c91] to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center gap-0.5 px-2">
        <span className={cx('block bg-emerald-300', playSize)} style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }} />
        <span className={cx('block bg-emerald-300', middleSize)} style={{ clipPath: 'polygon(0 0, 70% 0, 100% 50%, 70% 100%, 0 100%, 30% 50%)' }} />
        <span className={cx('block bg-emerald-300', barSize)} />
      </div>
    </div>
  );
}

function Shell({ children, active, setActive, isLoggedIn, setIsLoggedIn }: { children: React.ReactNode; active: PageName; setActive: (v: PageName) => void; isLoggedIn: boolean; setIsLoggedIn: (v: boolean) => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const visibleNav = isLoggedIn ? [...publicNavItems, ...studentNavItems] : publicNavItems;
  const go = (page: PageName) => {
    setActive(page);
    setMobileOpen(false);
  };
  return (
    <main className="min-h-screen overflow-hidden bg-[#070a2a] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(78,116,204,0.45),transparent_35%),radial-gradient(circle_at_18%_78%,rgba(22,163,158,0.22),transparent_32%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 xl:px-10">
        <header className="mb-6 rounded-[1.25rem] border border-white/10 bg-white/[0.06] p-3 backdrop-blur sm:mb-8 sm:rounded-2xl sm:px-4 sm:py-3.5">
          <div className="flex items-center justify-between gap-3">
            <button onClick={() => go('Home')} className="flex min-w-0 items-center gap-3">
              <LogoMark size="sm" />
              <div className="min-w-0 text-left">
                <p className="font-serif text-lg font-black leading-none text-emerald-300 sm:text-[1.35rem]">Ye Htet</p>
                <p className="truncate text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 sm:text-xs sm:tracking-[0.2em]">Digital Edu</p>
              </div>
            </button>
            <nav className="hidden flex-wrap items-center gap-2 rounded-full border border-white/10 bg-slate-950/20 p-1 lg:flex">
              {visibleNav.map((item) => (
                <button key={item.label} onClick={() => go(getNextPage(item.target, isLoggedIn))} className={cx('rounded-full px-4 py-2 text-[13px] font-bold transition', active === item.target ? 'bg-emerald-300 text-slate-950' : 'border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10')}>
                  {item.label}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              {isLoggedIn ? (
                <button onClick={() => { setIsLoggedIn(false); go('Home'); }} className="rounded-full border border-white/10 bg-slate-950/40 px-4 py-2 text-sm font-black text-slate-200">Logout</button>
              ) : (
                <button onClick={() => go('Login')} className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-sm font-black text-emerald-300">Login</button>
              )}
              <button onClick={() => setMobileOpen(!mobileOpen)} className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-200 lg:hidden" aria-label="Toggle menu">
                <span className="text-xl leading-none">{mobileOpen ? '×' : '☰'}</span>
              </button>
            </div>
          </div>
          {mobileOpen && (
            <motion.nav initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 grid gap-2 rounded-[1.25rem] border border-white/10 bg-slate-950/50 p-3 lg:hidden">
              {visibleNav.map((item) => (
                <button key={item.label} onClick={() => go(getNextPage(item.target, isLoggedIn))} className={cx('flex items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-bold', active === item.target ? 'bg-emerald-300 text-slate-950' : 'bg-white/5 text-slate-300')}>
                  {item.label}<ChevronRight className="h-4 w-4" />
                </button>
              ))}
            </motion.nav>
          )}
        </header>
        {children}
      </div>
    </main>
  );
}

function HomeStatCard({ stat }: { stat: (typeof homeStats)[number] }) {
  const Icon = stat.icon;
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/25 p-3.5 backdrop-blur transition hover:-translate-y-0.5 hover:border-emerald-300/25 hover:bg-slate-950/35">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-xl border border-emerald-300/25 bg-emerald-300/10 text-emerald-300"><Icon className="h-4 w-4" /></div>
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-300/70" />
      </div>
      <p className="min-h-[28px] text-[1.15rem] font-black leading-tight text-white sm:text-[1.25rem] lg:text-[1.35rem]">{stat.value}</p>
      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{stat.label}</p>
    </div>
  );
}

function HomePage({ setActive }: { setActive: (v: PageName) => void }) {
  const heroLessons = digitalMarketingLessons.slice(0, 5);
  return (
    <div className="space-y-8 sm:space-y-10">
      <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-[#121a3f] via-[#18265b] to-[#0b102f] p-5 shadow-2xl shadow-black/30 sm:rounded-[1.75rem] sm:p-7 lg:p-8 xl:p-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_18%,rgba(94,234,212,0.2),transparent_26%),radial-gradient(circle_at_18%_82%,rgba(59,130,246,0.2),transparent_30%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center xl:gap-10">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3.5 py-2 text-[10px] font-black uppercase tracking-[0.28em] text-emerald-300 sm:text-xs"><LogoMark size="sm" /> Ye Htet - Digital Edu</span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-[11px] font-bold text-slate-300 sm:text-xs">45 lessons · weekly live class</span>
            </div>
            <h1 className="mt-6 font-serif text-[2.65rem] font-black leading-[0.98] tracking-tight text-white sm:text-6xl lg:text-[4.6rem]">Become a practical <span className="text-emerald-300">Digital Marketer</span></h1>
            <p className="mt-5 max-w-2xl text-[15px] leading-7 text-slate-300 sm:text-[17px] sm:leading-8">Start your assigned course, watch each lesson in order, complete quizzes, submit assignments, and join the weekly live class.</p>
            <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
              <button onClick={() => setActive('Courses')} className={cx(ui.button, 'bg-emerald-300 text-slate-950 hover:-translate-y-1 hover:bg-emerald-200')}>Explore Course <ArrowRight className="h-5 w-5" /></button>
              <button onClick={() => setActive('Learning Path')} className={cx(ui.button, 'border border-white/15 bg-white/5 text-white hover:-translate-y-1 hover:bg-white/10')}>View Roadmap <BookOpen className="h-5 w-5" /></button>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4">{homeStats.map((stat) => <HomeStatCard key={stat.label} stat={stat} />)}</div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-emerald-300/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/55 p-4 shadow-2xl shadow-black/30 backdrop-blur sm:p-5 lg:p-6">
              <div className="flex items-start justify-between gap-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4">
                <div><p className="text-[10px] font-black uppercase tracking-[0.28em] text-emerald-300 sm:text-xs">Start learning</p><h2 className="mt-2 text-xl font-black leading-tight text-white sm:text-2xl">Digital Marketing Beginner to Professional</h2></div>
                <LogoMark size="md" />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">{[['45','Lessons'],['8+','Modules'],['95%','Unlock rule']].map(([value,label]) => <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"><p className="font-serif text-3xl font-black leading-none text-white">{value}</p><p className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p></div>)}</div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-[#0b102f]/80 p-4">
                <div className="mb-3 flex items-center justify-between gap-3"><p className="text-base font-black text-white">Continue from here</p><span className="rounded-full bg-emerald-300 px-3 py-1 text-[11px] font-black text-slate-950">Start</span></div>
                <div className="space-y-2">{heroLessons.map((lesson, index) => <div key={lesson} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[13px] leading-5 text-slate-300"><span className={cx('grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-black', index < 2 ? 'bg-emerald-300 text-slate-950' : 'bg-slate-700 text-slate-300')}>{index < 2 ? <CheckCircle2 className="h-4 w-4" /> : index + 1}</span><span className="line-clamp-1">{lesson}</span></div>)}</div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2"><button onClick={() => setActive('Login')} className={cx(ui.button, 'bg-emerald-300 text-slate-950 hover:bg-emerald-200')}>Student Login</button><button onClick={() => setActive('Course Detail')} className={cx(ui.button, 'border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10')}>Course Detail</button></div>
            </div>
          </div>
        </div>
      </motion.section>
      <section className="grid gap-4 md:grid-cols-3">{courseCards.map((course) => <CourseCard key={course.title} course={course} setActive={setActive} />)}</section>
      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]"><Benefits /><StudySteps /></section>
      <section className="rounded-[1.5rem] border border-emerald-300/20 bg-emerald-300 p-5 text-slate-950 shadow-2xl shadow-black/20 sm:p-7"><div className="grid gap-5 lg:flex lg:items-center lg:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.28em] text-slate-700">Ready to start</p><h2 className="mt-2 font-serif text-2xl font-black leading-tight sm:text-4xl">Open your course, continue the next lesson, and complete today's task.</h2></div><button onClick={() => setActive('Courses')} className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-black text-white transition hover:-translate-y-1 sm:w-auto">Go to Courses <ArrowRight className="h-5 w-5" /></button></div></section>
    </div>
  );
}

function CourseCard({ course, setActive }: { course: (typeof courseCards)[number]; setActive: (v: PageName) => void }) {
  return (
    <div className={ui.sectionSoft}>
      <div className="mb-5 flex items-center justify-between"><div className="grid h-12 w-12 place-items-center rounded-2xl border border-emerald-300/30 bg-emerald-300/10 text-emerald-300"><BookOpen className="h-6 w-6" /></div><span className="rounded-full border border-white/10 bg-slate-950/35 px-3 py-1 text-xs font-bold text-slate-300">{course.lessons}</span></div>
      <h3 className="text-lg font-black leading-snug text-white sm:text-xl">{course.title}</h3><p className="mt-2 text-sm leading-6 text-slate-300">{course.level}</p><p className="mt-4 text-xs font-bold uppercase tracking-[0.16em] text-emerald-300">{course.modules}</p>
      <button onClick={() => setActive('Course Detail')} className="mt-5 rounded-full bg-emerald-300 px-4 py-2 text-sm font-black text-slate-950">View Detail</button>
    </div>
  );
}

function Benefits() {
  return <div className={ui.section}><p className={ui.eyebrow}>Your learning tools</p><h2 className={cx(ui.h2, 'mt-3')}>Complete each step to unlock the next lesson</h2><div className="mt-6 grid gap-3 sm:grid-cols-2">{homeBenefits.map((item) => { const Icon = item.icon; return <div key={item.title} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4"><Icon className="mb-3 h-6 w-6 text-emerald-300" /><h3 className="text-base font-black text-white">{item.title}</h3><p className="mt-2 text-sm leading-6 text-slate-300">{item.text}</p></div>; })}</div></div>;
}

function StudySteps() {
  const steps = [['1','Log in to your account','Use the account provided by the admin'],['2','Watch the current lesson','Watch until the required progress is reached'],['3','Complete the required task','Pass the quiz or submit the assignment'],['4','Join the live class','Ask questions and review the recording later']];
  return <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-[#1d2d63]/95 to-[#101538]/95 p-5 shadow-2xl shadow-black/25 sm:rounded-[1.75rem] sm:p-7 lg:p-8"><p className={ui.eyebrow}>How to study</p><h2 className={cx(ui.h2, 'mt-3')}>Follow these steps in order</h2><div className="mt-6 space-y-3">{steps.map(([n,t,d]) => <div key={t} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.05] p-4"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-300 text-sm font-black text-slate-950">{n}</div><div><h3 className="text-base font-black text-white">{t}</h3><p className="mt-1 text-sm leading-6 text-slate-300">{d}</p></div></div>)}</div></div>;
}

function LearningPathPage({ setActive }: { setActive: (v: PageName) => void }) {
  return <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]"><div className={ui.section}><p className={ui.eyebrow}>Learning Path</p><h1 className="mt-3 font-serif text-4xl font-black sm:text-5xl">Step-by-step Digital Marketing Roadmap</h1><p className="mt-4 leading-7 text-slate-300">Review the course order, start with Module 1, and follow each module step by step.</p><div className="mt-7 space-y-3">{['Digital Marketing Beginner to Professional','Digital Marketing Foundation & Ecosystem','Marketing Funnel, Metrics & Customer Psychology','Content Strategy and Social Media in 2025','Meta Ads Campaign Structure, Budget, Bidding & Targeting','TikTok Ads, Google Ads, SEO, GA4 & Tracking','Full-Funnel Budget Allocation and Advanced Optimization','Career Path, Portfolio Building and Capstone Project','Next Class: Digital Media Planning & Buying'].map((item,index) => <div key={item} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-950/35 p-4"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-300 font-black text-slate-950">{index+1}</div><p className="font-bold text-slate-200">{item}</p></div>)}</div></div><aside className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-[#1d2d63]/95 to-[#101538]/95 p-5 shadow-2xl shadow-black/30 sm:rounded-[1.75rem] sm:p-7"><p className={ui.eyebrow}>Study Rules</p><h2 className="mt-4 font-serif text-3xl font-black sm:text-4xl">How to unlock lessons</h2><div className="mt-6 space-y-4"><Panel title="1. Watch" items={['Open the video lesson','Watch progress is saved','Do not skip ahead']} /><Panel title="2. Complete" items={['Watch the required percentage','Take the quiz if shown','Submit the assignment if shown']} /><Panel title="3. Unlock" items={['Next lesson becomes available','Your progress updates automatically','Your coach can review your progress']} /></div><button onClick={() => setActive('Courses')} className="mt-6 w-full rounded-full bg-emerald-300 px-5 py-4 font-black text-slate-950">View Courses</button></aside></section>;
}

function CoursesPage({ setActive }: { setActive: (v: PageName) => void }) {
  return <section className="space-y-6"><div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-slate-800/90 via-[#16234c]/90 to-[#263b78]/80 p-5 shadow-2xl shadow-black/30 sm:rounded-[1.75rem] sm:p-8"><p className={ui.eyebrow}>Public Courses Page</p><h1 className="mt-3 font-serif text-4xl font-black text-white sm:text-5xl">Available Digital Marketing Courses</h1><p className="mt-3 max-w-3xl leading-7 text-slate-300">Choose a course, review the details, then log in to access the lessons assigned to your account.</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{courseCards.map((course) => <CourseCard key={course.title} course={course} setActive={setActive} />)}</div></section>;
}

function CourseDetailPage({ setActive }: { setActive: (v: PageName) => void }) {
  return <section className="space-y-6"><div className="grid gap-6 lg:grid-cols-[1fr_360px]"><div className={ui.section}><p className={ui.eyebrow}>Course Detail Page</p><h1 className="mt-3 max-w-4xl font-serif text-4xl font-black leading-[1.02] sm:text-5xl lg:text-6xl">Digital Marketing Beginner to Professional</h1><p className="mt-4 max-w-3xl leading-7 text-slate-300">Start with the foundation modules, continue through paid ads, SEO, analytics, optimization, and finish with your portfolio project.</p><div className="mt-6 grid gap-3 sm:grid-cols-3"><Metric icon={BookOpen} label="Modules" value="8+" detail="Structured roadmap" /><Metric icon={PlayCircle} label="Video Lessons" value="45" detail="Vimeo + progress" /><Metric icon={CalendarDays} label="Next Course" value="Media Buying" detail="Planning path" /></div></div><aside className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-[#1d2d63]/95 to-[#101538]/95 p-5 shadow-2xl shadow-black/30 sm:rounded-[1.75rem] sm:p-6"><p className={ui.eyebrow}>Course Access</p><h2 className="mt-3 font-serif text-3xl font-black leading-tight sm:text-4xl">Login required to start</h2><div className="mt-5 space-y-3"><AccessRuleCard title="Access Rule" items={['Log in with your student account','Use an enrolled course account','Make sure your access is still active']} /><AccessRuleCard title="Learning Rule" items={['Watch the video first','Pass the quiz if required','Submit the assignment if required']} /></div><button onClick={() => setActive('Login')} className="mt-5 w-full rounded-full bg-emerald-300 px-5 py-4 font-black text-slate-950">Login to Continue</button></aside></div><div className={ui.section}><div className="grid gap-4 border-b border-white/10 pb-5 lg:flex lg:items-end lg:justify-between"><div><p className={ui.eyebrow}>Curriculum</p><h2 className="mt-3 font-serif text-3xl font-black sm:text-4xl">Course modules and lessons</h2><p className="mt-2 max-w-3xl text-slate-300">Choose the current module, complete the visible lessons, and unlock the next section.</p></div><div className="flex flex-wrap gap-2"><span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-sm font-bold text-emerald-300">45 lessons</span><span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-300">Quiz + Assignment</span></div></div><div className="mt-5 space-y-4">{modules.map((module,index) => <CourseModuleRow key={module.title} module={module} index={index} />)}</div></div></section>;
}

function Metric({ icon: Icon, label, value, detail }: { icon: IconType; label: string; value: string; detail: string }) { return <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><div className="mb-4 grid h-11 w-11 place-items-center rounded-2xl border border-emerald-300/30 bg-emerald-300/10 text-emerald-300"><Icon className="h-5 w-5" /></div><p className="font-serif text-3xl font-black text-white">{value}</p><p className="mt-1 text-sm font-black text-white">{label}</p><p className="mt-1 text-sm text-slate-400">{detail}</p></div>; }
function AccessRuleCard({ title, items }: { title: string; items: string[] }) { return <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><h3 className="text-lg font-black text-white">{title}</h3><div className="mt-3 space-y-2.5">{items.map((item) => <div key={item} className="flex items-start gap-2 text-sm text-slate-300"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" /><span>{item}</span></div>)}</div></div>; }

function CourseModuleRow({ module, index }: { module: (typeof modules)[number]; index: number }) {
  const isLocked = module.status === 'Locked';
  const visible = module.lessons.slice(0, 4);
  return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4 transition hover:border-emerald-300/30 hover:bg-slate-950/45"><div className="grid gap-4 lg:grid-cols-[230px_1fr_140px] lg:items-start"><div><div className="flex items-center gap-2"><span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-300">{module.title}</span><span className={cx('rounded-full px-3 py-1 text-[11px] font-black', isLocked ? 'bg-slate-700 text-slate-300' : 'bg-emerald-300 text-slate-950')}>{module.status}</span></div><h3 className="mt-3 text-xl font-black leading-tight text-white">{module.name}</h3><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-700"><div className="h-full rounded-full bg-emerald-300" style={{ width: `${module.progress}%` }} /></div><p className="mt-2 text-sm text-slate-400">{module.progress}% completed · {module.lessons.length} lessons</p></div><div className="grid gap-2 sm:grid-cols-2">{visible.map((lesson, i) => <div key={lesson} className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-sm text-slate-300">{isLocked ? <Lock className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" /> : <PlayCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />}<span><span className="text-slate-500">{String(i + 1).padStart(2, '0')}.</span> {lesson}</span></div>)}{module.lessons.length > 4 && <div className="flex items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-3 py-2.5 text-sm font-bold text-emerald-300">+{module.lessons.length - 4} more lessons</div>}</div><div className="flex lg:justify-end"><button className={cx('w-full rounded-full px-4 py-3 text-sm font-black lg:w-auto', isLocked ? 'bg-slate-700 text-slate-300' : 'bg-emerald-300 text-slate-950')}>{isLocked ? 'Locked' : module.status === 'Completed' ? 'Review' : 'Continue'}</button></div></div></motion.div>;
}

function StatCard({ item }: { item: (typeof adminStats)[number] }) { const Icon = item.icon; return <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 shadow-xl shadow-black/10"><div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-300/30 bg-emerald-300/10 text-emerald-300"><Icon className="h-5 w-5" /></div><p className="font-serif text-3xl font-black text-white sm:text-4xl">{item.value}</p><p className="mt-1 text-sm font-semibold text-slate-300">{item.label}</p></div>; }

function AdminPanelPage() {
  const adminMenu = ['Dashboard','Students','Courses','Modules','Lessons','Quizzes','Assignments','Meetings','Reports','Settings'];
  const [adminActive, setAdminActive] = useState('Dashboard');
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(demoStudents[0].id);
  const current = adminContent[adminActive] || adminContent.Dashboard;
  const selectedStudent = demoStudents.find((s) => s.id === selectedStudentId) || demoStudents[0];
  const openAction = (name: string) => { setActiveAction(name); setSavedMessage(''); };
  return <section className="grid gap-6 lg:grid-cols-[270px_1fr]"><aside className="rounded-[1.5rem] border border-white/10 bg-slate-950/35 p-5 shadow-2xl shadow-black/20 sm:rounded-[1.75rem]"><p className="px-3 text-xs font-black uppercase tracking-[0.35em] text-emerald-300">Admin Panel</p><div className="mt-5 grid grid-cols-2 gap-2 lg:block lg:space-y-2">{adminMenu.map((item) => <button key={item} onClick={() => { setAdminActive(item); setActiveAction(null); setSavedMessage(''); if (item === 'Students') setSelectedStudentId(demoStudents[0].id); }} className={cx('flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition sm:text-base', adminActive === item ? 'bg-emerald-300 text-slate-950' : 'text-slate-300 hover:bg-white/10')}>{item === 'Dashboard' ? <LayoutDashboard className="h-5 w-5" /> : item === 'Settings' ? <Settings className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}{item}</button>)}</div></aside><div className="space-y-6"><div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-[#1d2d63]/95 to-[#101538]/95 p-5 shadow-2xl shadow-black/30 sm:rounded-[1.75rem] sm:p-7"><div className="grid gap-4 lg:flex lg:items-center lg:justify-between"><div><p className={ui.eyebrow}>{adminActive} Overview</p><h1 className="mt-3 font-serif text-4xl font-black sm:text-5xl">{current.title}</h1><p className="mt-3 text-slate-300">{current.description}</p></div><button onClick={() => openAction(current.primaryAction)} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-300 px-5 py-3 font-black text-slate-950 sm:w-auto"><Plus className="h-5 w-5" /> {current.primaryAction}</button></div></div>{savedMessage && <div className="rounded-2xl border border-emerald-300/30 bg-emerald-300/10 px-5 py-4 font-bold text-emerald-200">{savedMessage}</div>}{activeAction && <AdminActionPanel section={adminActive} actionName={activeAction} onCancel={() => setActiveAction(null)} onSave={() => { setSavedMessage(`${activeAction} saved successfully.`); setActiveAction(null); }} />}{adminActive === 'Students' ? <StudentDirectory students={demoStudents} selectedStudent={selectedStudent} onSelectStudent={(id) => { setSelectedStudentId(id); setActiveAction(null); }} onCreateStudent={() => openAction('Add Student')} onEditStudent={() => openAction(`Edit ${selectedStudent.name}`)} /> : <><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{adminStats.map((item) => <StatCard key={item.label} item={item} />)}</div><div className="grid gap-4 lg:grid-cols-2">{current.cards.map((card) => <Panel key={card.title} title={card.title} items={card.items} onAction={() => openAction(card.title)} />)}</div></>}</div></section>;
}

const adminContent: Record<string, { title: string; description: string; primaryAction: string; cards: Array<{ title: string; items: string[] }> }> = {
  Dashboard: { title: 'Admin Control Center', description: 'Choose a menu item on the left, then create, edit, review, or export the selected section.', primaryAction: 'Create Student', cards: [{ title: 'Student Management', items: ['Create student account','Assign one or multiple courses','Set start date and expiry date','Activate or suspend account'] }, { title: 'Course Builder', items: ['Create course and modules','Add Vimeo video lessons','Attach quiz, resource, and assignment','Set lesson unlock rules'] }, { title: 'Reports', items: ['Student progress percentage','Video watch history','Quiz score report','Assignment review status'] }, { title: 'Meeting Control', items: ['Create live class','Control screen sharing','Start or stop recording','Check attendance history'] }] },
  Students: { title: 'Student Management', description: 'Create student accounts, assign courses, control access dates, and manage student status.', primaryAction: 'Add Student', cards: [] },
  Courses: { title: 'Course Management', description: 'Create and organize courses.', primaryAction: 'Create Course', cards: [{ title: 'Main Course', items: ['Digital Marketing Beginner to Professional','45 lessons','8+ modules','Capstone project'] }, { title: 'Next Course', items: ['Digital Media Planning & Buying','Planning framework','Buying strategy','Campaign workflow'] }] },
  Modules: { title: 'Module Builder', description: 'Organize course lessons into modules.', primaryAction: 'Add Module', cards: [{ title: 'Module Structure', items: ['Module title','Lesson order','Progress percentage','Locked or unlocked'] }, { title: 'Unlock Rules', items: ['Previous lesson required','Quiz pass required','Assignment required','Admin override'] }] },
  Lessons: { title: 'Lesson Manager', description: 'Add Vimeo video lessons and control unlock behavior.', primaryAction: 'Add Lesson', cards: [{ title: 'Video Lesson', items: ['Vimeo embed URL','Watch progress rule','No skipping','Resume playback'] }, { title: 'Tracking', items: ['Watch time','Last position','Completed date','Device history'] }] },
  Quizzes: { title: 'Quiz Builder', description: 'Create lesson quizzes.', primaryAction: 'Create Quiz', cards: [{ title: 'Quiz Settings', items: ['Passing score','Max attempts','Show answers','Randomize questions'] }] },
  Assignments: { title: 'Assignment Review', description: 'Create assignments and review submissions.', primaryAction: 'Create Assignment', cards: [{ title: 'Submission Types', items: ['Text answer','File upload','External link','Google Sheet link'] }] },
  Meetings: { title: 'Live Class Meetings', description: 'Schedule live classes and track attendance.', primaryAction: 'Schedule Meeting', cards: [{ title: 'Meeting Setup', items: ['Title','Date and time','Meeting room','Student access'] }] },
  Reports: { title: 'Reports & Analytics', description: 'Review progress and export reports.', primaryAction: 'Export Report', cards: [{ title: 'Progress Report', items: ['Course completion','Lesson completion','Watch percentage','Last activity'] }] },
  Settings: { title: 'Platform Settings', description: 'Configure branding, roles, permissions, and notifications.', primaryAction: 'Save Settings', cards: [{ title: 'Branding', items: ['Ye Htet - Digital Edu','Logo','Theme color','Course display'] }] },
};

function StudentDirectory({ students, selectedStudent, onSelectStudent, onCreateStudent, onEditStudent }: { students: Student[]; selectedStudent: Student; onSelectStudent: (id: string) => void; onCreateStudent: () => void; onEditStudent: () => void }) {
  const [showProgress, setShowProgress] = useState(false);
  const progressRows = [
    { label: 'Completed lessons', value: `${Math.round((selectedStudent.progress / 100) * 45)} / 45` },
    { label: 'Average quiz score', value: selectedStudent.quizScore },
    { label: 'Assignments', value: selectedStudent.assignments },
    { label: 'Watch progress', value: `${selectedStudent.progress}%` },
    { label: 'Last activity', value: selectedStudent.lastActive },
  ];
  return <div className="grid gap-5 xl:grid-cols-[1fr_420px]"><div className={ui.sectionSoft}><div className="grid gap-4 border-b border-white/10 pb-5 sm:flex sm:items-center sm:justify-between"><div><p className={ui.eyebrow}>Student List</p><h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">All Students</h2><p className="mt-2 text-sm leading-6 text-slate-300">Select a student to open their profile, progress, assignments, and quiz summary.</p></div><button onClick={onCreateStudent} className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-300 px-5 py-3 text-sm font-black text-slate-950"><Plus className="h-4 w-4" /> Add Student</button></div><div className="mt-5 overflow-x-auto rounded-2xl border border-white/10"><table className="min-w-[780px] w-full border-collapse text-left text-sm"><thead className="bg-slate-950/45 text-xs uppercase tracking-[0.16em] text-slate-400"><tr><th className="px-4 py-3">Student</th><th className="px-4 py-3">Course</th><th className="px-4 py-3">Progress</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Last Active</th><th className="px-4 py-3">Action</th></tr></thead><tbody>{students.map((student) => <tr key={student.id} onClick={() => { onSelectStudent(student.id); setShowProgress(false); }} className={cx('cursor-pointer border-t border-white/10 transition hover:bg-white/[0.05]', student.id === selectedStudent.id ? 'bg-emerald-300/10' : 'bg-transparent')}><td className="px-4 py-4"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-300 font-black text-slate-950">{student.name.slice(0,1)}</div><div><p className="font-black text-white">{student.name}</p><p className="text-xs text-slate-400">{student.email}</p></div></div></td><td className="px-4 py-4 text-slate-300">{student.course}</td><td className="px-4 py-4"><div className="flex items-center gap-3"><div className="h-2 w-24 overflow-hidden rounded-full bg-slate-700"><div className="h-full rounded-full bg-emerald-300" style={{ width: `${student.progress}%` }} /></div><span className="font-bold text-slate-300">{student.progress}%</span></div></td><td className="px-4 py-4"><span className={cx('rounded-full px-3 py-1 text-xs font-black', student.status === 'Active' ? 'bg-emerald-300 text-slate-950' : 'bg-amber-300/20 text-amber-200')}>{student.status}</span></td><td className="px-4 py-4 text-slate-300">{student.lastActive}</td><td className="px-4 py-4"><button className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1.5 text-xs font-black text-emerald-300 hover:bg-emerald-300 hover:text-slate-950">View</button></td></tr>)}</tbody></table></div></div><aside className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-[#1d2d63]/95 to-[#101538]/95 p-5 shadow-2xl shadow-black/25 sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className={ui.eyebrow}>Student Profile</p><h2 className="mt-2 text-3xl font-black text-white">{selectedStudent.name}</h2><p className="mt-1 text-sm text-slate-400">{selectedStudent.email}</p></div><button onClick={onEditStudent} className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-xs font-black text-emerald-300">Edit</button></div><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1"><ProfileField label="Student ID" value={selectedStudent.id} /><ProfileField label="Joined" value={selectedStudent.joined} /><ProfileField label="Assigned Course" value={selectedStudent.course} /><ProfileField label="Status" value={selectedStudent.status} /><ProfileField label="Assignments" value={selectedStudent.assignments} /><ProfileField label="Quiz Score" value={selectedStudent.quizScore} /></div><div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/35 p-4"><div className="flex items-center justify-between gap-4"><p className="font-black text-white">Course Progress</p><p className="font-black text-emerald-300">{selectedStudent.progress}%</p></div><div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-700"><div className="h-full rounded-full bg-emerald-300" style={{ width: `${selectedStudent.progress}%` }} /></div><p className="mt-3 text-sm text-slate-400">Last active: {selectedStudent.lastActive}</p></div><div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1"><button onClick={() => setShowProgress(!showProgress)} className="rounded-full bg-emerald-300 px-5 py-3 text-sm font-black text-slate-950">{showProgress ? 'Hide Full Progress' : 'View Full Progress'}</button><button className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-slate-300">Reset Password</button></div>{showProgress && <div className="mt-5 rounded-2xl border border-emerald-300/25 bg-emerald-300/10 p-4"><div className="mb-4 flex items-center justify-between gap-3"><div><p className={ui.eyebrow}>Full Progress</p><h3 className="mt-1 text-xl font-black text-white">{selectedStudent.name}</h3></div><span className="rounded-full bg-emerald-300 px-3 py-1 text-xs font-black text-slate-950">{selectedStudent.progress}%</span></div><div className="grid gap-3">{progressRows.map((row) => <div key={row.label} className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-slate-950/30 px-3 py-3"><span className="text-sm font-bold text-slate-400">{row.label}</span><span className="text-right text-sm font-black text-white">{row.value}</span></div>)}</div></div>}</aside></div>;
}

function ProfileField({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p><p className="mt-1 text-sm font-bold text-slate-200">{value}</p></div>; }
function AdminActionPanel({ section, actionName, onCancel, onSave }: { section: string; actionName: string; onCancel: () => void; onSave: () => void }) { const fields = { Students: ['Student name','Email address','Temporary password','Assigned course'], Courses: ['Course title','Level','Short description','Publish status'], Modules: ['Module title','Course','Sort order','Unlock rule'], Lessons: ['Lesson title','Vimeo embed URL','Required watch percentage','Attached resource'], Quizzes: ['Quiz title','Passing score','Max attempts','Question type'], Assignments: ['Assignment title','Due date','Submission type','Unlock behavior'], Meetings: ['Meeting title','Date and time','Host','Recording access'], Reports: ['Report type','Date range','Student group','Export format'], Settings: ['Platform name','Theme color','Default pass score','Default watch percentage'], Dashboard: ['Student name','Email address','Assigned course','Access expiry date'] }[section] || ['Title','Description','Status','Owner']; return <div className="rounded-[1.5rem] border border-emerald-300/25 bg-slate-950/45 p-5 shadow-2xl shadow-black/25 sm:rounded-[1.75rem] sm:p-6"><div className="grid gap-4 lg:flex lg:items-start lg:justify-between"><div><p className={ui.eyebrow}>Action Panel</p><h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">{actionName}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Fill in the fields, then save the preview action.</p></div><button onClick={onCancel} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-slate-300">Close</button></div><div className="mt-5 grid gap-4 sm:grid-cols-2">{fields.map((field) => <label key={field} className="block"><span className="text-sm font-bold text-slate-300">{field}</span><input className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-300/60" placeholder={`Enter ${field.toLowerCase()}`} /></label>)}</div><div className="mt-5 flex flex-wrap gap-3"><button onClick={onSave} className="rounded-full bg-emerald-300 px-6 py-3 text-sm font-black text-slate-950">Save Preview</button><button onClick={onCancel} className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-bold text-slate-300">Cancel</button></div></div>; }
function Panel({ title, items, onAction }: { title: string; items: string[]; onAction?: () => void }) { return <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.06] p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><h3 className="text-xl font-black text-white sm:text-2xl">{title}</h3>{onAction && <button onClick={onAction} className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1.5 text-xs font-black text-emerald-300">Open</button>}</div><div className="mt-5 space-y-3">{items.map((item) => <button key={item} onClick={onAction} className="flex w-full items-center gap-3 rounded-xl px-1 py-1 text-left text-slate-300 hover:bg-white/5"><CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-300" /><span>{item}</span></button>)}</div></div>; }

function StudentDashboardPage({ setActive }: { setActive: (v: PageName) => void }) { return <section className="space-y-6"><div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-slate-800/90 via-[#16234c]/90 to-[#263b78]/80 p-5 shadow-2xl shadow-black/30 sm:rounded-[1.75rem] sm:p-8"><p className={ui.eyebrow}>Student Dashboard</p><h1 className="mt-3 font-serif text-4xl font-black text-white sm:text-5xl">My Courses & Progress</h1><p className="mt-3 max-w-3xl leading-7 text-slate-300">Open your assigned course, continue the next available lesson, and complete the pending task.</p></div><div className="grid gap-6 lg:grid-cols-[1fr_360px]"><div className={ui.section}><div className="mb-5 grid gap-4 sm:flex sm:items-center sm:justify-between"><h2 className="font-serif text-3xl font-black sm:text-4xl">Assigned Courses</h2><button className="rounded-full border border-white/10 bg-white/5 px-4 py-2 font-bold text-slate-300"><Search className="mr-2 inline h-4 w-4" />Search</button></div><div className="mb-5 flex flex-wrap gap-3"><button onClick={() => setActive('Lesson Player')} className="rounded-full bg-emerald-300 px-4 py-2 font-black text-slate-950">Continue Lesson</button><button onClick={() => setActive('Assignments')} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 font-bold text-slate-300">Assignments</button><button onClick={() => setActive('Resources')} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 font-bold text-slate-300">Resources</button><button onClick={() => setActive('Quiz')} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 font-bold text-slate-300">Quiz</button></div><div className="space-y-4">{courseCards.map((course, idx) => <div key={course.title} className="rounded-2xl border border-white/10 bg-slate-950/35 p-5"><div className="flex flex-wrap items-center justify-between gap-4"><div><h3 className="text-xl font-black text-white">{course.title}</h3><p className="mt-1 text-sm text-slate-400">Course progress: {idx === 0 ? 38 : 0}%</p></div><span className={cx('rounded-full px-4 py-2 text-sm font-black', idx === 0 ? 'bg-emerald-300 text-slate-950' : 'bg-slate-700 text-slate-300')}>{idx === 0 ? 'Continue' : 'Locked'}</span></div><div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-700"><div className="h-full rounded-full bg-emerald-300" style={{ width: `${idx === 0 ? 38 : 0}%` }} /></div></div>)}</div></div><aside className="space-y-4"><InfoCard icon={CalendarDays} title="Upcoming Meeting" text="Digital Marketing Live Class - 7:00 PM - 8:30 PM" /><InfoCard icon={ClipboardCheck} title="Pending Assignment" text="Marketing funnel worksheet must be submitted before the next module." /></aside></div></section>; }
function InfoCard({ icon: Icon, title, text }: { icon: IconType; title: string; text: string }) { return <div className={ui.sectionSoft}><div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-emerald-300/30 bg-emerald-300/10 text-emerald-300"><Icon className="h-7 w-7" /></div><h3 className="text-xl font-black text-white sm:text-2xl">{title}</h3><p className="mt-3 leading-7 text-slate-300">{text}</p></div>; }
function LessonPreview({ lessonTitle, progress }: { lessonTitle: string; progress: number }) { return <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-slate-100 shadow-2xl"><div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-3 text-[11px] text-slate-600"><div className="flex items-center gap-2"><span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500 text-white"><PlayCircle className="h-4 w-4" /></span><span className="font-bold text-slate-800">Now watching - {lessonTitle}</span></div><span className="rounded-full bg-emerald-100 px-3 py-1 font-bold text-emerald-700">{progress}% watched</span></div><div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-4 sm:p-5"><div className="grid min-h-[220px] place-items-center rounded-xl border border-white/10 bg-[radial-gradient(circle_at_50%_30%,rgba(110,231,183,0.22),transparent_34%),linear-gradient(135deg,rgba(15,23,42,0.95),rgba(30,41,59,0.8))] sm:min-h-[300px]"><div className="text-center"><div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full border border-emerald-300/40 bg-emerald-300/10 text-emerald-300 shadow-2xl shadow-emerald-950/60 sm:h-24 sm:w-24"><PlayCircle className="h-10 w-10 sm:h-12 sm:w-12" /></div><h3 className="text-xl font-black text-white sm:text-2xl">{lessonTitle}</h3><p className="mt-2 text-slate-300">Watch the lesson, then complete the tasks to unlock the next step.</p></div></div></div></div>; }
function ModuleCard({ module, active }: { module: (typeof modules)[number]; active: boolean }) { return <div className={cx('rounded-2xl border p-5 shadow-lg shadow-black/10 transition', active ? 'border-emerald-300/60 bg-emerald-300/10' : 'border-white/10 bg-slate-950/35')}><p className={ui.eyebrow}>{module.title}</p><h3 className="mt-2 text-xl font-black text-white">{module.name}</h3><div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-700"><div className="h-full rounded-full bg-emerald-300" style={{ width: `${module.progress}%` }} /></div><p className="mt-2 text-sm text-slate-400">{module.progress}% completed</p></div>; }
function LessonPlayerPage() { const [activeModuleIndex, setActiveModuleIndex] = useState(0); const [activeLessonIndex, setActiveLessonIndex] = useState(0); const activeModule = modules[activeModuleIndex]; const activeLesson = activeModule.lessons[activeLessonIndex]; const watchedProgress = Math.round(((activeLessonIndex + 1) / activeModule.lessons.length) * 100); return <section className="grid gap-6 lg:grid-cols-[1fr_410px]"><div className={ui.section}><div className="mb-5 flex flex-wrap items-start justify-between gap-4"><div><span className="inline-flex rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.32em] text-emerald-300">Student Lesson Player</span><h2 className="mt-2 font-serif text-4xl font-black leading-none sm:text-5xl md:text-6xl">Digital Marketing Beginner to Professional</h2></div><div className="flex items-center gap-2 pt-2 text-lg font-black text-white"><Users className="h-5 w-5 text-emerald-300" /> 5 joined live</div></div><LessonPreview lessonTitle={activeLesson} progress={watchedProgress} /><div className="mt-5 rounded-3xl border border-white/10 bg-slate-950/30 p-5"><div className="flex items-center justify-between gap-4"><div><p className={ui.eyebrow}>Current lesson</p><h3 className="mt-2 text-2xl font-black text-white">{activeLesson}</h3></div><span className="rounded-full bg-emerald-300 px-3 py-1.5 text-sm font-black text-slate-950">Step {activeLessonIndex + 1} / {activeModule.lessons.length}</span></div><div className="mt-5 grid gap-2">{activeModule.lessons.slice(0, 6).map((lesson,index) => <button key={lesson} onClick={() => setActiveLessonIndex(index)} className={cx('flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition', activeLessonIndex === index ? 'border-emerald-300 bg-emerald-300/10 text-white shadow-[0_0_0_1px_rgba(52,211,153,0.35)]' : 'border-white/10 bg-white/5 text-slate-300 hover:border-emerald-300/30 hover:bg-white/10')}><span className={cx('grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-black', activeLessonIndex === index ? 'bg-emerald-300 text-slate-950' : 'bg-slate-700 text-slate-300')}>{String(index + 1).padStart(2,'0')}</span><div><p className="font-black">{lesson}</p><p className="mt-1 text-xs text-slate-400">Watch this lesson to move to the next step.</p></div></button>)}</div></div><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{modules.map((module,index) => <button key={module.title} onClick={() => { setActiveModuleIndex(index); setActiveLessonIndex(0); }} className="text-left"><ModuleCard module={module} active={index === activeModuleIndex} /></button>)}</div></div><aside className="space-y-6"><div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-[#1d2d63]/95 to-[#101538]/95 p-5 shadow-2xl shadow-black/30 sm:rounded-[1.75rem] sm:p-7"><p className={ui.eyebrow}>Selected Module</p><h2 className="mt-4 font-serif text-3xl font-black leading-[1.05] text-white sm:text-4xl">{activeModule.name}</h2><p className="mt-3 text-sm leading-6 text-slate-300">Open each lesson, watch the required progress, then complete the required task.</p><div className="mt-5 space-y-2">{activeModule.lessons.slice(0,6).map((lesson,index) => <button key={lesson} onClick={() => setActiveLessonIndex(index)} className={cx('flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm transition', activeLessonIndex === index ? 'border-emerald-300 bg-emerald-300/10 text-white' : 'border-white/10 bg-white/[0.05] text-slate-300 hover:border-emerald-300/30 hover:bg-white/10')}><PlayCircle className="h-4 w-4 shrink-0 text-emerald-300" /><span>{String(index + 1).padStart(2,'0')}. {lesson}</span></button>)}</div></div></aside></section>; }

function QuizPage() { return <SimplePage icon={ClipboardCheck} title="Lesson Quiz" label="Quiz Page" text="Answer each question, submit the quiz, and reach the passing score to unlock the next lesson." />; }
function AssignmentsPage() { return <SimplePage icon={UploadCloud} title="Submit Campaign Homework" label="Assignments Page" text="Upload your file, paste your link, or write your answer, then submit it for review." />; }
function ResourcesPage() { return <SimplePage icon={Download} title="Lesson Resource Files" label="Resource Library" text="Download the files you need for the current lesson or assignment." />; }
function ReportsPage() { return <SimplePage icon={BarChart3} title="Progress, Quiz & Assignment Reports" label="Admin Reports" text="Select a report type, review student activity, then export the result if needed." />; }
function LiveMeetingPage() { return <section className="grid gap-6 lg:grid-cols-[1fr_380px]"><div className={ui.section}><div className="mb-5 flex flex-wrap items-start justify-between gap-4"><div><span className="inline-flex rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.32em] text-emerald-300">Saturday Live Class</span><h2 className="mt-2 font-serif text-4xl font-black leading-none sm:text-5xl md:text-6xl">7:00 PM - 8:30 PM</h2></div><div className="flex items-center gap-2 pt-2 text-lg font-black text-white"><Users className="h-5 w-5 text-emerald-300" /> 5 joined</div></div><div className="grid min-h-[260px] place-items-center rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_50%_20%,rgba(110,231,183,0.18),transparent_35%),linear-gradient(135deg,rgba(15,23,42,0.95),rgba(30,41,59,0.85))] p-6 sm:min-h-[420px]"><div className="text-center"><div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full border border-emerald-300/40 bg-emerald-300/10 text-emerald-300 sm:h-24 sm:w-24"><Video className="h-10 w-10 sm:h-12 sm:w-12" /></div><h3 className="font-serif text-4xl font-black sm:text-5xl">Digital Marketing Live Class</h3><p className="mt-3 text-slate-300">Jitsi / LiveKit / Daily.co / Zoom SDK meeting embed area</p></div></div><div className="mt-5 grid grid-cols-2 gap-3 rounded-2xl border border-white/10 bg-slate-950/35 p-4 sm:grid-cols-4"><button className="flex items-center justify-center gap-2 rounded-xl bg-emerald-300 px-4 py-3 font-black text-slate-950"><Mic className="h-5 w-5" /> Mic</button><button className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-bold text-slate-200"><Video className="h-5 w-5" /> Camera</button><button className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-bold text-slate-200"><MonitorUp className="h-5 w-5" /> Share</button><button className="flex items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 font-bold text-red-200"><Radio className="h-5 w-5" /> Record</button></div></div><aside className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-[#1d2d63]/95 to-[#101538]/95 p-5 shadow-2xl shadow-black/30 sm:rounded-[1.75rem] sm:p-7"><p className={ui.eyebrow}>Meeting Admin Controls</p><h2 className="mt-4 font-serif text-4xl font-black leading-[1.02] sm:text-5xl">Live Class Control</h2><div className="mt-7 space-y-4"><Panel title="Host" items={['Start / end meeting','Mute student','Remove participant']} /><Panel title="Screen & Record" items={['Allow screen sharing','Start / stop recording','Save recording URL']} /><Panel title="Attendance" items={['Track join time','Track leave time','Export attendance report']} /></div></aside></section>; }
function SimplePage({ icon: Icon, title, label, text }: { icon: IconType; title: string; label: string; text: string }) { return <section className="space-y-6"><div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-slate-800/90 via-[#16234c]/90 to-[#263b78]/80 p-5 shadow-2xl shadow-black/30 sm:rounded-[1.75rem] sm:p-8"><p className={ui.eyebrow}>{label}</p><h1 className="mt-3 font-serif text-4xl font-black sm:text-5xl">{title}</h1><p className="mt-3 max-w-3xl leading-7 text-slate-300">{text}</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><InfoCard icon={Icon} title="Open" text="Start the selected item and follow the instructions." /><InfoCard icon={CheckCircle2} title="Complete" text="Finish the required step before continuing." /><InfoCard icon={ArrowRight} title="Continue" text="Move to the next available lesson or task." /></div></section>; }

function LoginPage({ setActive, setIsLoggedIn }: { setActive: (v: PageName) => void; setIsLoggedIn: (v: boolean) => void }) { const login = (target: PageName) => { setIsLoggedIn(true); setActive(target); }; return <section className="relative mx-auto max-w-6xl overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-slate-800/90 via-[#16234c]/90 to-[#263b78]/80 p-4 shadow-2xl shadow-black/30 sm:rounded-[2rem] sm:p-6 md:p-8"><div className="relative grid gap-6 lg:grid-cols-[1fr_460px] lg:items-stretch"><div className="flex flex-col justify-between rounded-[1.5rem] border border-white/10 bg-slate-950/25 p-5 sm:rounded-[1.75rem] sm:p-7"><div><p className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-300 sm:text-xs"><LogoMark size="sm" /> Ye Htet - Digital Edu Login</p><h1 className="mt-5 max-w-xl font-serif text-4xl font-black leading-[0.96] text-white sm:text-5xl md:text-7xl">Sign in to your learning space</h1><p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">Choose your role, sign in, and continue to your dashboard.</p></div><div className="mt-8 grid gap-4 sm:grid-cols-3"><InfoMini icon={BookOpen} title="Assigned Courses" text="Only enrolled classes" /><InfoMini icon={PlayCircle} title="Progress Tracking" text="Watch & unlock" /><InfoMini icon={Video} title="Live Class" text="Meetings & records" /></div></div><div className="rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-5 shadow-2xl shadow-black/30 backdrop-blur sm:rounded-[1.75rem] sm:p-6"><div className="mb-6 text-center"><div className="mx-auto mb-4 flex justify-center"><LogoMark size="lg" /></div><h2 className="font-serif text-3xl font-black text-white sm:text-4xl">Welcome back</h2><p className="mt-2 text-slate-400">Choose a role to continue.</p></div><div className="grid gap-3"><RoleButton role="Student" title="Continue learning" text="Open your dashboard and continue today's lesson." icon={GraduationCap} primary onClick={() => login('Student Dashboard')} /><RoleButton role="Admin" title="Manage platform" text="Open the admin dashboard to manage classes and students." icon={ShieldCheck} onClick={() => login('Admin Panel')} /></div><div className="my-6 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.25em] text-slate-500"><span className="h-px flex-1 bg-white/10" />Demo credentials<span className="h-px flex-1 bg-white/10" /></div><div className="grid gap-3 sm:grid-cols-2"><CredentialCard title="Admin Account" username={demoCredentials.admin.username} password={demoCredentials.admin.password} /><CredentialCard title="Student Account" username={demoCredentials.student.username} password={demoCredentials.student.password} /></div><button onClick={() => setActive('Courses')} className="mt-5 w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 font-bold text-slate-300">Browse public courses</button></div></div></section>; }
function InfoMini({ icon: Icon, title, text }: { icon: IconType; title: string; text: string }) { return <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><Icon className="mb-3 h-7 w-7 text-emerald-300" /><p className="font-black text-white">{title}</p><p className="mt-1 text-sm text-slate-400">{text}</p></div>; }
function RoleButton({ role, title, text, icon: Icon, primary, onClick }: { role: string; title: string; text: string; icon: IconType; primary?: boolean; onClick: () => void }) { return <button onClick={onClick} className={cx('group flex items-center gap-4 rounded-2xl border p-4 text-left transition', primary ? 'border-emerald-300/40 bg-emerald-300 text-slate-950' : 'border-white/10 bg-white/[0.06] text-white hover:border-emerald-300/40')}><div className={cx('grid h-12 w-12 shrink-0 place-items-center rounded-2xl', primary ? 'bg-slate-950 text-emerald-300' : 'bg-emerald-300/10 text-emerald-300')}><Icon className="h-6 w-6" /></div><div className="min-w-0 flex-1"><p className="text-lg font-black">{role}</p><p className={cx('text-sm font-bold', primary ? 'text-slate-800' : 'text-slate-300')}>{title}</p><p className={cx('mt-1 text-xs leading-5', primary ? 'text-slate-700' : 'text-slate-400')}>{text}</p></div><ArrowRight className={cx('h-5 w-5 shrink-0 transition group-hover:translate-x-1', primary ? 'text-slate-950' : 'text-emerald-300')} /></button>; }
function CredentialCard({ title, username, password }: { title: string; username: string; password: string }) { return <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-4"><p className="mb-3 font-black text-white">{title}</p><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Username</p><p className="mt-1 break-all font-mono text-sm font-bold text-white">{username}</p><p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Password</p><p className="mt-1 font-mono text-sm font-bold text-emerald-300">{password}</p></div>; }

export default function App() {
  const [active, setActive] = useState<PageName>('Home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const goToPage = (page: PageName) => setActive(getNextPage(page, isLoggedIn));
  return <Shell active={active} setActive={goToPage} isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}>{active === 'Home' && <HomePage setActive={goToPage} />}{active === 'Courses' && <CoursesPage setActive={goToPage} />}{active === 'Learning Path' && <LearningPathPage setActive={goToPage} />}{active === 'Course Detail' && <CourseDetailPage setActive={goToPage} />}{active === 'Admin Panel' && <AdminPanelPage />}{active === 'Student Dashboard' && <StudentDashboardPage setActive={goToPage} />}{active === 'Lesson Player' && <LessonPlayerPage />}{active === 'Quiz' && <QuizPage />}{active === 'Assignments' && <AssignmentsPage />}{active === 'Resources' && <ResourcesPage />}{active === 'Reports' && <ReportsPage />}{active === 'Live Meeting' && <LiveMeetingPage />}{active === 'Login' && <LoginPage setActive={setActive} setIsLoggedIn={setIsLoggedIn} />}</Shell>;
}
