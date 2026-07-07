import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  BarChart3,
  BookOpen,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Download,
  ExternalLink,
  GraduationCap,
  LayoutDashboard,
  Lock,
  MessageCircle,
  Mic,
  Pencil,
  PlayCircle,
  Plus,
  Radio,
  ScreenShare,
  Send,
  Settings,
  ShieldCheck,
  Trash2,
  UploadCloud,
  Users,
  Video,
  X,
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
  password?: string;
  course: string;
  progress: number;
  status: 'Active' | 'Pending';
  lastActive: string;
  joined: string;
  assignments: string;
  quizScore: string;
};

type Role = 'admin' | 'student' | null;
type LoginRequest = { role: 'admin' | 'student'; username: string; password: string };
type LoginResult = { ok: boolean; message?: string };
type MeetingDay = 'Saturday' | 'Sunday';
type MeetingScheduleDay = MeetingDay | 'Instant';
type RecordingAccess = 'Admin only' | 'Students after class' | 'Private';
type LiveClassMeeting = {
  id: string;
  title: string;
  day: MeetingScheduleDay;
  startTime: string;
  endTime: string;
  host: string;
  recordingAccess: RecordingAccess;
  isInstant?: boolean;
};
type LearningProgress = {
  completedLessonIds: string[];
  currentLessonId: string;
  watchProgressByLessonId: Record<string, number>;
};
type StudentProgressById = Record<string, LearningProgress>;
type LessonRecord = {
  id: string;
  title: string;
  moduleTitle: string;
  moduleName: string;
  moduleIndex: number;
  lessonIndex: number;
  globalIndex: number;
  duration: string;
  outcome: string;
  practice: string;
  resource: string;
  resourceUrl?: string;
  videoUrl: string;
  requiredWatchPercentage: number;
};
type LessonComment = {
  id: string;
  lessonId: string;
  studentId: string;
  studentName: string;
  text: string;
  createdAt: number;
};
type CommentMutationHandlers = {
  onUpdateComment: (commentId: string, text: string) => void;
  onDeleteComment: (commentId: string) => void;
};

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

const serverAuthCredentials = {
  admin: { username: 'info@yehtet.com', password: '1234567890' },
};

const meetingStorageKey = 'ye-htet-live-class-meetings';
const learningStorageKey = 'ye-htet-digital-marketing-progress';
const studentProgressStorageKey = 'ye-htet-digital-marketing-progress-by-student';
const lessonStorageKey = 'ye-htet-digital-marketing-lessons';
const studentStorageKey = 'ye-htet-digital-marketing-students';
const lessonCommentStorageKey = 'ye-htet-digital-marketing-lesson-comments';
const deletedLessonCommentStorageKey = 'ye-htet-digital-marketing-deleted-lesson-comments';
const firstLessonVideoUrl = 'https://vimeo.com/1195114426?fl=pl&fe=sh';
const firstLessonDuration = '2.11 min';
const secondLessonVideoUrl = 'https://vimeo.com/1195115453?share=copy&fl=sv&fe=ci';
const whyDigitalMarketingVideoUrl = 'https://vimeo.com/1200543349?fl=ip&fe=ec';
const traditionalVsDigitalVideoUrl = 'https://vimeo.com/1200545080?fl=ip&fe=ec';
const digitalMarketingEcosystemVideoUrl = 'https://vimeo.com/1200546085?fl=ip&fe=ec';
const marketingFunnelBasicsVideoUrl = 'https://vimeo.com/1201042718?share=copy&fl=sv&fe=ci';
const keyDigitalMarketingMetricsVideoUrl = 'https://vimeo.com/1201047277?share=copy&fl=sv&fe=ci';
const ecosystemMapTemplateTitle = 'Digital Marketing Ecosystem Map Template';
const ecosystemMapTemplateVideoUrl = 'https://vimeo.com/1201236025?share=copy&fl=sv&fe=ci';
const ecosystemMapTemplatePartTwoTitle = 'Digital Marketing Ecosystem Map Template (Part - 2)';
const ecosystemMapTemplatePartTwoVideoUrl = 'https://vimeo.com/1201511142?share=copy&fl=sv&fe=ci';
const ecosystemMapTemplateResourceUrl = 'https://docs.google.com/spreadsheets/d/15xlkz9C2_WcPAtvmewHaaZkxeHNXjCb636ywovCOP08/edit?gid=597559664#gid=597559664';
const marketingFunnelFrameworkPartOneTitle = 'Marketing Funnel Framework l Template (Part-1)';
const marketingFunnelFrameworkPartOneVideoUrl = 'https://vimeo.com/1201560354?share=copy&fl=sv&fe=ci';
const marketingFunnelFrameworkPartOneResourceUrl = 'https://docs.google.com/spreadsheets/d/15b7jVEagkjRTopsz5BU0LBIMV5px-EBJBbejlB2ho78/edit?gid=478517468#gid=478517468';
const marketingFunnelFrameworkPartTwoTitle = 'Marketing Funnel Framework l Template (Part-2)';
const marketingFunnelFrameworkPartTwoVideoUrl = 'https://vimeo.com/1201900568?share=copy&fl=sv&fe=ci';
const understandingCustomerPsychologyVideoUrl = 'https://vimeo.com/1202908271?share=copy&fl=sv&fe=ci';
const contentSocialMediaStrategyVideoUrl = 'https://vimeo.com/1203916268?share=copy&fl=sv&fe=ci';
const organicSocialMediaStrategyVideoUrl = 'https://vimeo.com/1204279505?share=copy&fl=sv&fe=ci';
const socialMediaAlgorithmsVideoUrl = 'https://vimeo.com/1204621767?share=copy&fl=sv&fe=ci';
const introductionToMetaAdsVideoUrl = 'https://vimeo.com/1204870302?share=copy&fl=sv&fe=ci';
const metaAdsObjectivesVideoUrl = 'https://vimeo.com/1206212829?share=copy&fl=sv&fe=ci';
const digitalMarketingFunnelStudyNotesVideoUrl = 'https://vimeo.com/1206540165?share=copy&fl=sv&fe=ci';
const metaAdsCampaignStructureVideoUrl = 'https://vimeo.com/1207845244?share=copy&fl=sv&fe=ci';
const sampleLessonVideoUrl = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
const defaultLessonVideoUrls = [
  firstLessonVideoUrl,
  secondLessonVideoUrl,
  whyDigitalMarketingVideoUrl,
  traditionalVsDigitalVideoUrl,
  digitalMarketingEcosystemVideoUrl,
  marketingFunnelBasicsVideoUrl,
  keyDigitalMarketingMetricsVideoUrl,
  ecosystemMapTemplateVideoUrl,
  ecosystemMapTemplatePartTwoVideoUrl,
  marketingFunnelFrameworkPartOneVideoUrl,
  marketingFunnelFrameworkPartTwoVideoUrl,
  understandingCustomerPsychologyVideoUrl,
  contentSocialMediaStrategyVideoUrl,
  organicSocialMediaStrategyVideoUrl,
  socialMediaAlgorithmsVideoUrl,
  introductionToMetaAdsVideoUrl,
  metaAdsObjectivesVideoUrl,
  digitalMarketingFunnelStudyNotesVideoUrl,
  metaAdsCampaignStructureVideoUrl,
];
const weeklyMeetingDays: MeetingDay[] = ['Saturday', 'Sunday'];
const meetingScheduleDays: MeetingScheduleDay[] = ['Saturday', 'Sunday', 'Instant'];
const recordingAccessOptions: RecordingAccess[] = ['Students after class', 'Admin only', 'Private'];

const defaultLiveMeetings: LiveClassMeeting[] = [
  {
    id: 'weekly-saturday',
    title: 'Digital Marketing Live Class',
    day: 'Saturday',
    startTime: '19:00',
    endTime: '20:30',
    host: 'Ye Htet',
    recordingAccess: 'Students after class',
  },
  {
    id: 'weekly-sunday',
    title: 'Campaign Practice Live Class',
    day: 'Sunday',
    startTime: '19:00',
    endTime: '20:30',
    host: 'Ye Htet',
    recordingAccess: 'Students after class',
  },
];

function readStoredMeetings(): LiveClassMeeting[] {
  if (typeof window === 'undefined') return defaultLiveMeetings;
  try {
    const stored = window.localStorage.getItem(meetingStorageKey);
    if (!stored) return defaultLiveMeetings;
    const parsed = JSON.parse(stored) as LiveClassMeeting[];
    return Array.isArray(parsed) && parsed.length > 0 && parsed.every(isLiveClassMeeting) ? parsed : defaultLiveMeetings;
  } catch {
    return defaultLiveMeetings;
  }
}

function isLiveClassMeeting(value: unknown): value is LiveClassMeeting {
  const meeting = value as LiveClassMeeting;
  return (
    typeof meeting?.id === 'string'
    && typeof meeting.title === 'string'
    && meetingScheduleDays.includes(meeting.day)
    && typeof meeting.startTime === 'string'
    && typeof meeting.endTime === 'string'
    && typeof meeting.host === 'string'
    && recordingAccessOptions.includes(meeting.recordingAccess)
  );
}

function formatMeetingWindow(meeting: LiveClassMeeting) {
  if (meeting.isInstant) return 'Open now';
  return `Every ${meeting.day} · ${meeting.startTime} – ${meeting.endTime}`;
}

function formatLocalTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function slugifyRoomPart(value: string) {
  return value
    .trim()
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72) || 'LiveClass';
}

function getJitsiRoomName(meeting: LiveClassMeeting) {
  return `YeHtetDigitalEdu-${slugifyRoomPart(meeting.id)}`;
}

function getJitsiMeetingUrl(meeting: LiveClassMeeting) {
  const params = new URLSearchParams({
    'config.prejoinConfig.enabled': 'true',
    'config.startWithAudioMuted': 'false',
    'config.startWithVideoMuted': 'false',
    'config.disableDeepLinking': 'true',
  });
  return `https://meet.jit.si/${encodeURIComponent(getJitsiRoomName(meeting))}#${params.toString()}`;
}

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
  ecosystemMapTemplateTitle,
  ecosystemMapTemplatePartTwoTitle,
  marketingFunnelFrameworkPartOneTitle,
  marketingFunnelFrameworkPartTwoTitle,
  'Understanding Customer Psychology',
  'Content Strategy Basics',
  'Organic Social Media Strategy',
  'How Social Media Algorithms Work',
  'Introduction to Meta Ads',
  'Meta Ads Objectives and Business Goals',
  'Digital Marketing Funnel Study Notes',
  'Meta Ads Campaign Structure',
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
  { title: 'Digital Marketing Beginner to Professional', level: 'Beginner to Professional', lessons: '47 lessons', modules: '8 modules' },
  { title: 'Digital Media Planning & Buying', level: 'Intermediate to Professional', lessons: 'Coming soon', modules: 'Media planning modules' },
  { title: 'Campaign Portfolio & Capstone Support', level: 'Project-based', lessons: 'Portfolio project', modules: 'Capstone module' },
];

const modules = [
  { title: 'Module 01', name: 'Digital Marketing Foundation', status: 'Completed' as const, progress: 100, lessons: digitalMarketingLessons.slice(0, 12) },
  { title: 'Module 02', name: 'Content & Social Media Strategy', status: 'In progress' as const, progress: 65, lessons: digitalMarketingLessons.slice(12, 18) },
  { title: 'Module 03', name: 'Meta Ads Strategy & Campaign Setup', status: 'Locked' as const, progress: 0, lessons: digitalMarketingLessons.slice(18, 26) },
  { title: 'Module 04', name: 'TikTok, Google Ads, SEO & Analytics', status: 'Locked' as const, progress: 0, lessons: digitalMarketingLessons.slice(26, 37) },
  { title: 'Module 05', name: 'Optimization, Career Path & Capstone', status: 'Locked' as const, progress: 0, lessons: digitalMarketingLessons.slice(37, 47) },
];

const stableLessonIdsByTitle: Record<string, string> = {
  [ecosystemMapTemplateTitle]: 'm1-l8-ecosystem-map-template',
  [ecosystemMapTemplatePartTwoTitle]: 'm1-l8-ecosystem-map-template-part-2',
  [marketingFunnelFrameworkPartOneTitle]: 'm1-l8-marketing-funnel-framework-template-part-1',
  [marketingFunnelFrameworkPartTwoTitle]: 'm1-l8-marketing-funnel-framework-template-part-2',
  'Understanding Customer Psychology': 'm1-l8',
  'Organic Social Media Strategy': 'm2-l3',
  'How Social Media Algorithms Work': 'm2-l4',
  'Introduction to Meta Ads': 'm2-l5',
  'Meta Ads Objectives and Business Goals': 'm2-l6',
  'Digital Marketing Funnel Study Notes': 'm2-l7',
  'Meta Ads Campaign Structure': 'm3-l1',
  'Campaign Budget Optimization Explained': 'm3-l3',
  'Learning Phase and Campaign Performance': 'm3-l4',
  'Estimated Ad Recall Lift Explained': 'm3-l5',
  'Meta Ads Budget and Bidding Strategies': 'm3-l6',
  'Audience Targeting in Meta Ads': 'm3-l7',
  'Creative Strategy for Meta Ads': 'm3-l8',
  'TikTok Ads Overview and Creative Best Practices': 'm3-l9',
  'TikTok Targeting and Scaling Strategy': 'm4-l1',
  'The Google Ads Ecosystem': 'm4-l2',
  'Search Intent and Keyword Strategy': 'm4-l3',
  'Google Ads Basics: Your Digital Storefront': 'm4-l4',
  'Performance Max: AI-Powered Campaigns': 'm4-l5',
  'SEO Fundamentals': 'm4-l6',
  'SEO vs SEM: Organic and Paid Search': 'm4-l7',
  'Analytics and Data-Driven Decision Making': 'm4-l8',
  'GA4 Basics: Your Marketing Command Center': 'm4-l9',
  'Tracking and Pixel Fundamentals': 'm4-l10',
  'Full-Funnel Budget Allocation Strategy': 'm4-l11',
  'Advanced Optimization Beyond A/B Testing': 'm5-l1',
  'The Optimization Stack That Scales': 'm5-l2',
  'Cross-Platform Marketing Strategy': 'm5-l3',
  'Platform Integration and 360 Customer View': 'm5-l4',
  'Digital Marketing Career Paths': 'm5-l5',
  'Specialized Digital Marketing Career Trajectories': 'm5-l6',
  'Capstone Project: Portfolio Masterpiece': 'm5-l7',
  'Building Your Marketing Portfolio': 'm5-l8',
  'Your Digital Marketing Future Starts Now': 'm5-l9',
  'Your Future is Digital, Strategic, and Yours': 'm5-l10',
};

const retiredLessonIds = new Set(['m2-l2', 'm3-l2']);
const retiredLessonTitles = new Set(['Mastering Social Media in 2025', 'Mastering Social Media in 2026', 'Campaign, Ad Set, and Ad Level Explained']);

const lessonResourceUrlsByTitle: Record<string, string> = {
  [ecosystemMapTemplateTitle]: ecosystemMapTemplateResourceUrl,
  [ecosystemMapTemplatePartTwoTitle]: ecosystemMapTemplateResourceUrl,
  [marketingFunnelFrameworkPartOneTitle]: marketingFunnelFrameworkPartOneResourceUrl,
  [marketingFunnelFrameworkPartTwoTitle]: marketingFunnelFrameworkPartOneResourceUrl,
};

const lessonDurationsByTitle: Record<string, string> = {
  'Meta Ads Campaign Structure': '45 min',
};

const lessonCatalog: LessonRecord[] = modules.flatMap((module, moduleIndex) =>
  module.lessons.map((title, lessonIndex) => {
    const globalIndex = modules.slice(0, moduleIndex).reduce((total, item) => total + item.lessons.length, 0) + lessonIndex;
    const resourceUrl = lessonResourceUrlsByTitle[title];
    return {
      id: stableLessonIdsByTitle[title] || `m${moduleIndex + 1}-l${lessonIndex + 1}`,
      title,
      moduleTitle: module.title,
      moduleName: module.name,
      moduleIndex,
      lessonIndex,
      globalIndex,
      duration: lessonDurationsByTitle[title] || (globalIndex === 0 ? firstLessonDuration : `${10 + ((globalIndex * 3) % 13)} min`),
      outcome: getLessonOutcome(title),
      practice: getLessonPractice(title),
      resource: resourceUrl ? title : `${module.name} checklist`,
      resourceUrl,
      videoUrl: defaultLessonVideoUrls[globalIndex] || sampleLessonVideoUrl,
      requiredWatchPercentage: 80,
    };
  }),
);

function normalizeRequiredWatchPercentage(value: string | number | undefined) {
  const parsed = typeof value === 'number' ? value : Number(value || 80);
  if (!Number.isFinite(parsed)) return 80;
  return Math.min(100, Math.max(1, Math.round(parsed)));
}

function normalizeLessonVideoUrl(value: string | undefined) {
  return value?.trim() || sampleLessonVideoUrl;
}

function reindexLessons(lessons: LessonRecord[]) {
  const lessonCountsByModule = new Map<number, number>();
  return lessons.map((lesson, globalIndex) => {
    const lessonIndex = lessonCountsByModule.get(lesson.moduleIndex) || 0;
    lessonCountsByModule.set(lesson.moduleIndex, lessonIndex + 1);
    return { ...lesson, globalIndex, lessonIndex };
  });
}

function readStoredLessons(): LessonRecord[] {
  if (typeof window === 'undefined') return lessonCatalog;
  try {
    const stored = window.localStorage.getItem(lessonStorageKey);
    if (!stored) return lessonCatalog;
    const parsed = JSON.parse(stored) as Partial<LessonRecord>[];
    if (!Array.isArray(parsed)) return lessonCatalog;

    const defaultsById = new Map(lessonCatalog.map((lesson) => [lesson.id, lesson]));
    const mergedDefaults = lessonCatalog.map((lesson) => {
      const storedLesson = parsed.find((item) => item?.id === lesson.id);
      const shouldUseNewFirstLessonVideo =
        lesson.globalIndex === 0
        && storedLesson?.videoUrl
        && normalizeLessonVideoUrl(storedLesson.videoUrl) === sampleLessonVideoUrl;
      const shouldUseNewFirstLessonDuration =
        lesson.globalIndex === 0
        && storedLesson?.duration === '10 min';
      const shouldUseNewSecondLessonVideo =
        lesson.globalIndex === 1
        && storedLesson?.videoUrl
        && normalizeLessonVideoUrl(storedLesson.videoUrl) === sampleLessonVideoUrl;
      const defaultLessonVideoUrl = defaultLessonVideoUrls[lesson.globalIndex];
      const shouldUseNewDefaultLessonVideo =
        lesson.globalIndex > 1
        && Boolean(defaultLessonVideoUrl)
        && storedLesson?.videoUrl
        && normalizeLessonVideoUrl(storedLesson.videoUrl) === sampleLessonVideoUrl;
      const enforcedLessonDuration = lessonDurationsByTitle[lesson.title];
      return normalizeLessonRecord({
        ...lesson,
        ...storedLesson,
        ...(shouldUseNewFirstLessonVideo ? { videoUrl: firstLessonVideoUrl } : {}),
        ...(shouldUseNewFirstLessonDuration ? { duration: firstLessonDuration } : {}),
        ...(shouldUseNewSecondLessonVideo ? { videoUrl: secondLessonVideoUrl } : {}),
        ...(shouldUseNewDefaultLessonVideo ? { videoUrl: defaultLessonVideoUrl } : {}),
        ...(enforcedLessonDuration ? { duration: enforcedLessonDuration } : {}),
      }, lesson);
    });
    const customLessons = parsed
      .filter((item) => (
        typeof item?.id === 'string'
        && !defaultsById.has(item.id)
        && !retiredLessonIds.has(item.id)
        && !(typeof item.title === 'string' && retiredLessonTitles.has(item.title))
      ))
      .map((item) => normalizeLessonRecord(item, lessonCatalog[lessonCatalog.length - 1]))
      .filter(Boolean) as LessonRecord[];

    return reindexLessons([...mergedDefaults, ...customLessons]);
  } catch {
    return lessonCatalog;
  }
}

function normalizeLessonRecord(value: Partial<LessonRecord>, fallback: LessonRecord): LessonRecord {
  const moduleIndex = Number.isInteger(value.moduleIndex) ? value.moduleIndex as number : fallback.moduleIndex;
  const module = modules[moduleIndex] || modules[fallback.moduleIndex] || modules[0];
  const title = typeof value.title === 'string' && value.title.trim() ? value.title.trim() : fallback.title;
  return {
    id: typeof value.id === 'string' && value.id.trim() ? value.id : fallback.id,
    title,
    moduleTitle: module.title,
    moduleName: module.name,
    moduleIndex: moduleIndex >= 0 && moduleIndex < modules.length ? moduleIndex : fallback.moduleIndex,
    lessonIndex: Number.isInteger(value.lessonIndex) ? value.lessonIndex as number : fallback.lessonIndex,
    globalIndex: Number.isInteger(value.globalIndex) ? value.globalIndex as number : fallback.globalIndex,
    duration: typeof value.duration === 'string' && value.duration.trim() ? value.duration : fallback.duration,
    outcome: typeof value.outcome === 'string' && value.outcome.trim() ? value.outcome : getLessonOutcome(title),
    practice: typeof value.practice === 'string' && value.practice.trim() ? value.practice : getLessonPractice(title),
    resource: typeof value.resource === 'string' && value.resource.trim() ? value.resource.trim() : fallback.resource,
    resourceUrl: typeof value.resourceUrl === 'string' && value.resourceUrl.trim() ? value.resourceUrl.trim() : fallback.resourceUrl,
    videoUrl: normalizeLessonVideoUrl(value.videoUrl),
    requiredWatchPercentage: normalizeRequiredWatchPercentage(value.requiredWatchPercentage),
  };
}

function getLessonVideoUrl(lesson: LessonRecord) {
  return normalizeLessonVideoUrl(lesson.videoUrl);
}

function getVimeoVideoId(rawUrl: string) {
  try {
    const url = new URL(rawUrl);
    if (!url.hostname.includes('vimeo.com')) return null;
    const parts = url.pathname.split('/').filter(Boolean);
    if (url.hostname === 'player.vimeo.com' && parts[0] === 'video') return parts[1] || null;
    return parts.find((part) => /^\d+$/.test(part)) || null;
  } catch {
    return null;
  }
}

function getVimeoPrivateHash(rawUrl: string, videoId: string) {
  try {
    const url = new URL(rawUrl);
    const explicitHash = url.searchParams.get('h');
    if (explicitHash) return explicitHash;
    const parts = url.pathname.split('/').filter(Boolean);
    const idIndex = parts.findIndex((part) => part === videoId);
    return idIndex >= 0 ? parts[idIndex + 1] || null : null;
  } catch {
    return null;
  }
}

function getEmbeddableLessonUrl(rawUrl: string, playerId?: string) {
  const videoUrl = normalizeLessonVideoUrl(rawUrl);
  const vimeoId = getVimeoVideoId(videoUrl);
  if (!vimeoId) return videoUrl;
  const url = new URL(`https://player.vimeo.com/video/${vimeoId}`);
  const privateHash = getVimeoPrivateHash(videoUrl, vimeoId);
  if (privateHash) url.searchParams.set('h', privateHash);
  url.searchParams.set('api', '1');
  url.searchParams.set('title', '0');
  url.searchParams.set('byline', '0');
  url.searchParams.set('portrait', '0');
  url.searchParams.set('badge', '0');
  url.searchParams.set('dnt', '1');
  if (playerId) url.searchParams.set('player_id', playerId);
  return url.toString();
}

function isVimeoLessonUrl(rawUrl: string) {
  return Boolean(getVimeoVideoId(rawUrl));
}

const defaultLearningProgress: LearningProgress = {
  completedLessonIds: [],
  currentLessonId: lessonCatalog[0]?.id || '',
  watchProgressByLessonId: {},
};

function normalizeLearningProgress(value: Partial<LearningProgress> | undefined, lessons: LessonRecord[] = lessonCatalog): LearningProgress {
  const validIds = new Set(lessons.map((lesson) => lesson.id));
  const completedLessonIds = Array.isArray(value?.completedLessonIds)
    ? value.completedLessonIds.filter((id) => validIds.has(id))
    : [];
  const currentLessonId = typeof value?.currentLessonId === 'string' && validIds.has(value.currentLessonId)
    ? value.currentLessonId
    : getNextLessonId(completedLessonIds, lessons);
  const watchProgressByLessonId = Object.fromEntries(
    Object.entries(value?.watchProgressByLessonId || {})
      .filter(([id, progress]) => validIds.has(id) && typeof progress === 'number' && Number.isFinite(progress))
      .map(([id, progress]) => [id, Math.min(100, Math.max(0, Math.round(progress as number)))]),
  );
  return { completedLessonIds, currentLessonId, watchProgressByLessonId };
}

function getLessonOutcome(title: string) {
  if (title.toLowerCase().includes('ads')) return 'Understand the campaign decision, setup step, and optimization habit behind this advertising lesson.';
  if (title.toLowerCase().includes('seo')) return 'Learn how search visibility works and how to plan actions that improve organic discovery.';
  if (title.toLowerCase().includes('analytics') || title.toLowerCase().includes('metrics')) return 'Read key performance signals and connect numbers to better marketing decisions.';
  if (title.toLowerCase().includes('portfolio') || title.toLowerCase().includes('capstone')) return 'Turn the lesson into a portfolio-ready proof of work.';
  return 'Build a practical digital marketing foundation you can apply in real campaigns.';
}

function getLessonPractice(title: string) {
  if (title.toLowerCase().includes('funnel')) return 'Sketch a simple funnel for one product and write the goal for each stage.';
  if (title.toLowerCase().includes('creative')) return 'Draft three ad creative angles and match each one to a customer problem.';
  if (title.toLowerCase().includes('budget')) return 'Split a sample campaign budget across awareness, traffic, and conversion.';
  if (title.toLowerCase().includes('career')) return 'Write one role you want and the first skill proof you will build for it.';
  return `Write three notes from "${title}" and one action you can try this week.`;
}

function readStoredLearningProgress(lessons: LessonRecord[] = lessonCatalog): LearningProgress {
  if (typeof window === 'undefined') return defaultLearningProgress;
  try {
    const stored = window.localStorage.getItem(learningStorageKey);
    if (!stored) return defaultLearningProgress;
    const parsed = JSON.parse(stored) as Partial<LearningProgress>;
    return normalizeLearningProgress(parsed, lessons);
  } catch {
    return defaultLearningProgress;
  }
}

function readStoredStudentProgress(lessons: LessonRecord[] = lessonCatalog): StudentProgressById {
  if (typeof window === 'undefined') return {};
  try {
    const stored = window.localStorage.getItem(studentProgressStorageKey);
    if (!stored) return {};
    const parsed = JSON.parse(stored) as Record<string, Partial<LearningProgress>>;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed)
        .filter(([studentId, progress]) => studentId && progress && typeof progress === 'object' && !Array.isArray(progress))
        .map(([studentId, progress]) => [studentId, normalizeLearningProgress(progress, lessons)]),
    );
  } catch {
    return {};
  }
}

function sanitizeLearningProgress(progress: LearningProgress, lessons: LessonRecord[]) {
  return normalizeLearningProgress(progress, lessons);
}

function sanitizeStudentProgressById(progressById: StudentProgressById, lessons: LessonRecord[]) {
  return Object.fromEntries(
    Object.entries(progressById).map(([studentId, progress]) => [studentId, sanitizeLearningProgress(progress, lessons)]),
  );
}

function getStudentProgress(studentId: string, progressById: StudentProgressById, lessons: LessonRecord[]) {
  return progressById[studentId] ? sanitizeLearningProgress(progressById[studentId], lessons) : normalizeLearningProgress(undefined, lessons);
}

function isSameLearningProgress(a: LearningProgress | undefined, b: LearningProgress) {
  return Boolean(
    a
      && a.currentLessonId === b.currentLessonId
      && JSON.stringify(a.completedLessonIds) === JSON.stringify(b.completedLessonIds)
      && JSON.stringify(a.watchProgressByLessonId) === JSON.stringify(b.watchProgressByLessonId),
  );
}

function isJsonEqual(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}

const firebaseConfig = {
  apiKey: 'AIzaSyDlZVwiUaDyDUzSK1V-w2ws46lTJPlwyuU',
  authDomain: 'yehtet-edu.firebaseapp.com',
  projectId: 'yehtet-edu',
  storageBucket: 'yehtet-edu.firebasestorage.app',
  messagingSenderId: '773247085634',
  appId: '1:773247085634:web:7e8bfcecc29f17726911db',
  measurementId: 'G-ZGY0ME7M3H',
};

const firestoreBaseUrl = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;
const appEnv = import.meta.env as unknown as Record<string, string | undefined>;
const supabaseConfig = {
  url: (appEnv.VITE_SUPABASE_URL || appEnv.NEXT_PUBLIC_SUPABASE_URL || 'https://thkgxaxwufjzrdaqeprr.supabase.co').replace(/\/$/, ''),
  publishableKey: appEnv.VITE_SUPABASE_PUBLISHABLE_KEY || appEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_mZOf5tErlsCmyv0kDoAwmA_o1aKlhvj',
};
const supabaseRestBaseUrl = `${supabaseConfig.url}/rest/v1`;

type JsonObject = Record<string, unknown>;

type SupabaseLessonCommentRow = {
  id?: unknown;
  lesson_id?: unknown;
  student_id?: unknown;
  student_name?: unknown;
  text?: unknown;
  created_at?: unknown;
};

type SupabaseStudentProgressRow = {
  student_id?: unknown;
  current_lesson_id?: unknown;
  completed_lesson_ids?: unknown;
  watch_progress_by_lesson_id?: unknown;
};

type FirestoreFields = Record<string, {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  arrayValue?: { values?: Array<{ stringValue?: string }> };
  mapValue?: { fields?: FirestoreFields };
}>;

function readFirestoreString(fields: FirestoreFields, key: string) {
  return fields[key]?.stringValue || '';
}

function readFirestoreNumber(fields: FirestoreFields, key: string) {
  const value = fields[key];
  const parsed = Number(value?.integerValue ?? value?.doubleValue ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function firestoreString(value: string) {
  return { stringValue: value };
}

function firestoreInteger(value: number) {
  return { integerValue: String(Math.round(value)) };
}

function isSupabaseConfigured() {
  return Boolean(supabaseConfig.url && supabaseConfig.publishableKey);
}

function getSupabaseHeaders(extra: Record<string, string> = {}) {
  return {
    apikey: supabaseConfig.publishableKey,
    Authorization: `Bearer ${supabaseConfig.publishableKey}`,
    ...extra,
  };
}

function readSupabaseString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function readSupabaseNumber(value: unknown) {
  const parsed = typeof value === 'number' ? value : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function readSupabaseStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function serializeSupabaseLessonComment(comment: LessonComment) {
  return {
    id: comment.id,
    lesson_id: comment.lessonId,
    student_id: comment.studentId,
    student_name: comment.studentName,
    text: comment.text,
    created_at: comment.createdAt,
  };
}

function parseSupabaseLessonComment(row: SupabaseLessonCommentRow): LessonComment | null {
  const id = readSupabaseString(row.id);
  const lessonId = readSupabaseString(row.lesson_id);
  const studentId = readSupabaseString(row.student_id);
  const studentName = readSupabaseString(row.student_name);
  const text = readSupabaseString(row.text);
  const createdAt = readSupabaseNumber(row.created_at);
  if (!id || !lessonId || !studentId || !studentName || !text || !createdAt) return null;
  return { id, lessonId, studentId, studentName, text, createdAt };
}

async function fetchSupabaseLessonComments() {
  if (!isSupabaseConfigured()) return [];
  try {
    const response = await fetch(`${supabaseRestBaseUrl}/lesson_comments?select=*&order=created_at.desc`, {
      headers: getSupabaseHeaders(),
    });
    if (!response.ok) return [];
    const data = await response.json() as SupabaseLessonCommentRow[];
    if (!Array.isArray(data)) return [];
    return data.map(parseSupabaseLessonComment).filter(Boolean) as LessonComment[];
  } catch {
    return [];
  }
}

async function saveLessonCommentToSupabase(comment: LessonComment) {
  if (!isSupabaseConfigured()) return;
  try {
    await fetch(`${supabaseRestBaseUrl}/lesson_comments?on_conflict=id`, {
      method: 'POST',
      headers: getSupabaseHeaders({
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      }),
      body: JSON.stringify(serializeSupabaseLessonComment(comment)),
    });
  } catch {
    // Keep local storage as the fallback if Supabase is temporarily unavailable.
  }
}

async function deleteLessonCommentFromSupabase(commentId: string) {
  if (!isSupabaseConfigured()) return;
  try {
    await fetch(`${supabaseRestBaseUrl}/lesson_comments?id=eq.${encodeURIComponent(commentId)}`, {
      method: 'DELETE',
      headers: getSupabaseHeaders({
        Prefer: 'return=minimal',
      }),
    });
  } catch {
    // Deleted ids are kept locally so removed comments do not reappear during a temporary outage.
  }
}

function serializeSupabaseLearningProgress(studentId: string, progress: LearningProgress) {
  return {
    student_id: studentId,
    current_lesson_id: progress.currentLessonId,
    completed_lesson_ids: progress.completedLessonIds,
    watch_progress_by_lesson_id: progress.watchProgressByLessonId,
    updated_at: Date.now(),
  };
}

function parseSupabaseLearningProgress(row: SupabaseStudentProgressRow, lessons: LessonRecord[]) {
  const studentId = readSupabaseString(row.student_id);
  if (!studentId) return null;
  const watchProgressValue = row.watch_progress_by_lesson_id;
  const watchProgressByLessonId = watchProgressValue && typeof watchProgressValue === 'object' && !Array.isArray(watchProgressValue)
    ? Object.fromEntries(
        Object.entries(watchProgressValue as JsonObject)
          .map(([lessonId, value]) => [lessonId, readSupabaseNumber(value)])
          .filter(([, value]) => Number.isFinite(value)),
      )
    : {};
  const progress = normalizeLearningProgress({
    completedLessonIds: readSupabaseStringArray(row.completed_lesson_ids),
    currentLessonId: readSupabaseString(row.current_lesson_id),
    watchProgressByLessonId,
  }, lessons);
  return { studentId, progress };
}

async function fetchSupabaseStudentProgress(lessons: LessonRecord[]) {
  if (!isSupabaseConfigured()) return {};
  try {
    const response = await fetch(`${supabaseRestBaseUrl}/student_progress?select=*`, {
      headers: getSupabaseHeaders(),
    });
    if (!response.ok) return {};
    const data = await response.json() as SupabaseStudentProgressRow[];
    if (!Array.isArray(data)) return {};
    return Object.fromEntries(
      data
        .map((row) => parseSupabaseLearningProgress(row, lessons))
        .filter(Boolean)
        .map((item) => [item!.studentId, item!.progress]),
    );
  } catch {
    return {};
  }
}

async function saveStudentProgressToSupabase(studentId: string, progress: LearningProgress) {
  if (!isSupabaseConfigured()) return;
  try {
    await fetch(`${supabaseRestBaseUrl}/student_progress?on_conflict=student_id`, {
      method: 'POST',
      headers: getSupabaseHeaders({
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      }),
      body: JSON.stringify(serializeSupabaseLearningProgress(studentId, progress)),
    });
  } catch {
    // Keep local storage as the fallback if Supabase is temporarily unavailable.
  }
}

function serializeLessonComment(comment: LessonComment) {
  return {
    fields: {
      id: firestoreString(comment.id),
      lessonId: firestoreString(comment.lessonId),
      studentId: firestoreString(comment.studentId),
      studentName: firestoreString(comment.studentName),
      text: firestoreString(comment.text),
      createdAt: firestoreInteger(comment.createdAt),
    },
  };
}

function parseFirestoreLessonComment(document: { name?: string; fields?: FirestoreFields }): LessonComment | null {
  const fields = document.fields || {};
  const id = readFirestoreString(fields, 'id') || document.name?.split('/').pop() || '';
  const lessonId = readFirestoreString(fields, 'lessonId');
  const studentId = readFirestoreString(fields, 'studentId');
  const studentName = readFirestoreString(fields, 'studentName');
  const text = readFirestoreString(fields, 'text');
  const createdAt = readFirestoreNumber(fields, 'createdAt');
  if (!id || !lessonId || !studentId || !studentName || !text || !createdAt) return null;
  return { id, lessonId, studentId, studentName, text, createdAt };
}

function mergeLessonComments(...commentGroups: LessonComment[][]) {
  const byId = new Map<string, LessonComment>();
  commentGroups.flat().forEach((comment) => byId.set(comment.id, comment));
  return Array.from(byId.values()).sort((a, b) => b.createdAt - a.createdAt);
}

async function fetchFirebaseLessonComments() {
  try {
    const response = await fetch(`${firestoreBaseUrl}/lessonComments?key=${firebaseConfig.apiKey}`);
    if (!response.ok) return [];
    const data = await response.json() as { documents?: Array<{ name?: string; fields?: FirestoreFields }> };
    return (data.documents || [])
      .map(parseFirestoreLessonComment)
      .filter(Boolean) as LessonComment[];
  } catch {
    return [];
  }
}

async function saveLessonCommentToFirebase(comment: LessonComment) {
  try {
    await fetch(`${firestoreBaseUrl}/lessonComments/${encodeURIComponent(comment.id)}?key=${firebaseConfig.apiKey}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serializeLessonComment(comment)),
    });
  } catch {
    // Keep local storage as the fallback if Firebase is temporarily unavailable.
  }
}

async function deleteLessonCommentFromFirebase(commentId: string) {
  try {
    await fetch(`${firestoreBaseUrl}/lessonComments/${encodeURIComponent(commentId)}?key=${firebaseConfig.apiKey}`, {
      method: 'DELETE',
    });
  } catch {
    // Deleted ids are kept locally so removed comments do not reappear during a temporary outage.
  }
}

function serializeLearningProgress(studentId: string, progress: LearningProgress) {
  const watchFields = Object.fromEntries(
    Object.entries(progress.watchProgressByLessonId).map(([lessonId, value]) => [lessonId, firestoreInteger(value)]),
  );
  return {
    fields: {
      studentId: firestoreString(studentId),
      currentLessonId: firestoreString(progress.currentLessonId),
      completedLessonIds: {
        arrayValue: {
          values: progress.completedLessonIds.map((lessonId) => firestoreString(lessonId)),
        },
      },
      watchProgressByLessonId: {
        mapValue: { fields: watchFields },
      },
    },
  };
}

function parseFirestoreLearningProgress(document: { name?: string; fields?: FirestoreFields }, lessons: LessonRecord[]) {
  const fields = document.fields || {};
  const studentId = readFirestoreString(fields, 'studentId') || document.name?.split('/').pop() || '';
  if (!studentId) return null;
  const completedLessonIds = fields.completedLessonIds?.arrayValue?.values
    ?.map((value) => value.stringValue || '')
    .filter(Boolean) || [];
  const watchProgressByLessonId = Object.fromEntries(
    Object.entries(fields.watchProgressByLessonId?.mapValue?.fields || {})
      .map(([lessonId, value]) => [lessonId, Number(value.integerValue ?? value.doubleValue ?? 0)])
      .filter(([, value]) => Number.isFinite(value)),
  );
  const progress = normalizeLearningProgress({
    completedLessonIds,
    currentLessonId: readFirestoreString(fields, 'currentLessonId'),
    watchProgressByLessonId,
  }, lessons);
  return { studentId, progress };
}

function getProgressScore(progress: LearningProgress) {
  const watchTotal = Object.values(progress.watchProgressByLessonId).reduce((total, value) => total + value, 0);
  return (progress.completedLessonIds.length * 10000) + watchTotal;
}

function mergeStudentProgress(local: StudentProgressById, cloud: StudentProgressById, lessons: LessonRecord[]) {
  const merged: StudentProgressById = {};
  const ids = new Set([...Object.keys(local), ...Object.keys(cloud)]);
  ids.forEach((studentId) => {
    const localProgress = local[studentId] ? sanitizeLearningProgress(local[studentId], lessons) : undefined;
    const cloudProgress = cloud[studentId] ? sanitizeLearningProgress(cloud[studentId], lessons) : undefined;
    if (localProgress && cloudProgress) {
      merged[studentId] = getProgressScore(localProgress) > getProgressScore(cloudProgress) ? localProgress : cloudProgress;
      return;
    }
    if (localProgress) merged[studentId] = localProgress;
    if (cloudProgress) merged[studentId] = cloudProgress;
  });
  return merged;
}

async function fetchFirebaseStudentProgress(lessons: LessonRecord[]) {
  try {
    const response = await fetch(`${firestoreBaseUrl}/studentProgress?key=${firebaseConfig.apiKey}`);
    if (!response.ok) return {};
    const data = await response.json() as { documents?: Array<{ name?: string; fields?: FirestoreFields }> };
    return Object.fromEntries(
      (data.documents || [])
        .map((document) => parseFirestoreLearningProgress(document, lessons))
        .filter(Boolean)
        .map((item) => [item!.studentId, item!.progress]),
    );
  } catch {
    return {};
  }
}

async function saveStudentProgressToFirebase(studentId: string, progress: LearningProgress) {
  try {
    await fetch(`${firestoreBaseUrl}/studentProgress/${encodeURIComponent(studentId)}?key=${firebaseConfig.apiKey}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serializeLearningProgress(studentId, progress)),
    });
  } catch {
    // Keep local storage as the fallback if Firebase is temporarily unavailable.
  }
}

function getCompletedSet(progress: LearningProgress) {
  return new Set(progress.completedLessonIds);
}

function getNextLessonId(completedLessonIds: string[], lessons: LessonRecord[] = lessonCatalog) {
  const completed = new Set(completedLessonIds);
  return lessons.find((lesson) => !completed.has(lesson.id))?.id || lessons[lessons.length - 1]?.id || '';
}

function getCurrentLesson(progress: LearningProgress, lessons: LessonRecord[] = lessonCatalog) {
  const current = lessons.find((lesson) => lesson.id === progress.currentLessonId);
  if (current && isLessonUnlocked(current, progress, lessons)) return current;
  return lessons.find((lesson) => !getCompletedSet(progress).has(lesson.id)) || lessons[0];
}

function getCourseProgressPercent(progress: LearningProgress, lessons: LessonRecord[] = lessonCatalog) {
  if (lessons.length === 0) return 0;
  return Math.round((getCompletedSet(progress).size / lessons.length) * 100);
}

function isLessonUnlocked(lesson: LessonRecord, progress: LearningProgress, lessons: LessonRecord[] = lessonCatalog) {
  const completed = getCompletedSet(progress);
  const firstIncomplete = lessons.find((item) => !completed.has(item.id)) || lessons[lessons.length - 1];
  return completed.has(lesson.id) || lesson.globalIndex <= firstIncomplete.globalIndex;
}

function getModuleLearningState(moduleIndex: number, progress: LearningProgress, lessons: LessonRecord[] = lessonCatalog) {
  const moduleLessons = lessons.filter((lesson) => lesson.moduleIndex === moduleIndex);
  const completed = getCompletedSet(progress);
  const completedCount = moduleLessons.filter((lesson) => completed.has(lesson.id)).length;
  const progressValue = moduleLessons.length ? Math.round((completedCount / moduleLessons.length) * 100) : 0;
  const unlocked = moduleLessons.some((lesson) => isLessonUnlocked(lesson, progress, lessons));
  const status = completedCount === moduleLessons.length ? 'Completed' : unlocked ? 'In progress' : 'Locked';
  return { completedCount, progressValue, status };
}

const adminStats: Array<{ label: string; value: string; icon: IconType }> = [
  { label: 'Total Students', value: '128', icon: Users },
  { label: 'Published Courses', value: '12', icon: BookOpen },
  { label: 'Pending Assignments', value: '34', icon: ClipboardCheck },
  { label: 'Avg Completion', value: '76%', icon: BarChart3 },
];

const homeStats: Array<{ label: string; value: string; icon: IconType }> = [
  { label: 'Lessons', value: '47', icon: PlayCircle },
  { label: 'Modules', value: '8+', icon: BookOpen },
  { label: 'Live Class', value: 'Weekly', icon: CalendarDays },
  { label: 'Next Course', value: 'Media Buying', icon: ArrowRight },
];

const homeBenefits: Array<{ title: string; text: string; icon: IconType }> = [
  { title: '49 structured lessons', text: 'Open your lesson list and continue from the next available video.', icon: BookOpen },
  { title: 'No skipping system', text: 'Watch the required video progress to unlock the next lesson.', icon: Lock },
  { title: 'Assignments & capstone', text: 'Download the task, finish your work, and submit it before the deadline.', icon: ClipboardCheck },
  { title: 'Next course path', text: 'Finish this course first, then continue to Digital Media Planning & Buying.', icon: Video },
];

const defaultCourseTitle = 'Digital Marketing Beginner to Professional';
const seededStudentPassword = 'yehtet3Du';

const seededStudentAccounts: Student[] = [
  { id: 'STU-SEED-001', name: 'Kaung Thant Khine', email: 'kaungthantkhine@gmail.com', password: seededStudentPassword, course: defaultCourseTitle, progress: 0, status: 'Active', lastActive: 'Not started', joined: 'Jun 13, 2026', assignments: '0 / 0 submitted', quizScore: 'Not started' },
  { id: 'STU-SEED-002', name: 'Aung Naing Win', email: 'aungnaingwin971985@gmail.com', password: seededStudentPassword, course: defaultCourseTitle, progress: 0, status: 'Active', lastActive: 'Not started', joined: 'Jun 13, 2026', assignments: '0 / 0 submitted', quizScore: 'Not started' },
  { id: 'STU-SEED-003', name: 'Mya Myat Tar Khin', email: 'myamyattarkhin.01@gmail.com', password: seededStudentPassword, course: defaultCourseTitle, progress: 0, status: 'Active', lastActive: 'Not started', joined: 'Jun 13, 2026', assignments: '0 / 0 submitted', quizScore: 'Not started' },
  { id: 'STU-SEED-004', name: 'Seint Seint YJ', email: 'seintseint.yj@gmail.com', password: seededStudentPassword, course: defaultCourseTitle, progress: 0, status: 'Active', lastActive: 'Not started', joined: 'Jun 13, 2026', assignments: '0 / 0 submitted', quizScore: 'Not started' },
  { id: 'STU-SEED-005', name: 'Train 163201', email: 'train163201@gmail.com', password: seededStudentPassword, course: defaultCourseTitle, progress: 0, status: 'Active', lastActive: 'Not started', joined: 'Jun 13, 2026', assignments: '0 / 0 submitted', quizScore: 'Not started' },
  { id: 'STU-SEED-006', name: 'Yamon Zin', email: 'yamonzin14@gmail.com', password: seededStudentPassword, course: defaultCourseTitle, progress: 0, status: 'Active', lastActive: 'Not started', joined: 'Jun 13, 2026', assignments: '0 / 0 submitted', quizScore: 'Not started' },
  { id: 'STU-SEED-007', name: 'Ye Thu Leo', email: 'yethu.leo.mm@gmail.com', password: seededStudentPassword, course: defaultCourseTitle, progress: 0, status: 'Active', lastActive: 'Not started', joined: 'Jun 13, 2026', assignments: '0 / 0 submitted', quizScore: 'Not started' },
  { id: 'STU-SEED-008', name: 'Htet Ben', email: 'htetben7@gmail.com', password: seededStudentPassword, course: defaultCourseTitle, progress: 0, status: 'Active', lastActive: 'Not started', joined: 'Jun 22, 2026', assignments: '0 / 0 submitted', quizScore: 'Not started' },
  { id: 'STU-SEED-009', name: 'Thet Paing Phyo', email: 'thetpaingphyo70@gmail.com', password: seededStudentPassword, course: defaultCourseTitle, progress: 0, status: 'Active', lastActive: 'Not started', joined: 'Jun 24, 2026', assignments: '0 / 0 submitted', quizScore: 'Not started' },
  { id: 'STU-SEED-010', name: 'Ei Khin', email: 'ei2khin@gmail.com', password: seededStudentPassword, course: defaultCourseTitle, progress: 0, status: 'Active', lastActive: 'Not started', joined: 'Jun 24, 2026', assignments: '0 / 0 submitted', quizScore: 'Not started' },
  { id: 'STU-SEED-011', name: 'Theint', email: 'theint100498@gmail.com', password: seededStudentPassword, course: defaultCourseTitle, progress: 0, status: 'Active', lastActive: 'Not started', joined: 'Jun 24, 2026', assignments: '0 / 0 submitted', quizScore: 'Not started' },
  { id: 'STU-SEED-012', name: 'Mon Kyi Phyu', email: 'monkyiphyu27@gmail.com', password: seededStudentPassword, course: defaultCourseTitle, progress: 0, status: 'Active', lastActive: 'Not started', joined: 'Jun 26, 2026', assignments: '0 / 0 submitted', quizScore: 'Not started' },
];

const demoStudents: Student[] = [
  { id: 'STU-001', name: 'Aung Min Thu', email: 'aungmin@example.com', course: defaultCourseTitle, progress: 72, status: 'Active', lastActive: 'Today, 09:30 AM', joined: 'Jan 12, 2026', assignments: '4 / 6 submitted', quizScore: '86% avg' },
  { id: 'STU-002', name: 'May Zin Htet', email: 'mayzin@example.com', course: defaultCourseTitle, progress: 38, status: 'Active', lastActive: 'Yesterday, 08:10 PM', joined: 'Jan 15, 2026', assignments: '2 / 6 submitted', quizScore: '78% avg' },
  { id: 'STU-003', name: 'Ko Lin Aung', email: 'kolin@example.com', course: 'Digital Media Planning & Buying', progress: 12, status: 'Pending', lastActive: '2 days ago', joined: 'Jan 21, 2026', assignments: '0 / 3 submitted', quizScore: 'Not started' },
  { id: 'STU-004', name: 'Thiri Mon', email: 'thiri@example.com', course: defaultCourseTitle, progress: 94, status: 'Active', lastActive: 'Today, 01:45 PM', joined: 'Dec 28, 2025', assignments: '6 / 6 submitted', quizScore: '92% avg' },
];

const defaultStudents: Student[] = [...seededStudentAccounts, ...demoStudents];

function normalizeStoredStudent(student: Partial<Student>, index: number): Student {
  return {
    id: typeof student.id === 'string' && student.id ? student.id : `STU-${String(index + 1).padStart(3, '0')}`,
    name: typeof student.name === 'string' && student.name ? student.name : 'Unnamed Student',
    email: typeof student.email === 'string' ? student.email.toLowerCase() : '',
    password: typeof student.password === 'string' ? student.password : '',
    course: typeof student.course === 'string' && student.course ? student.course : defaultCourseTitle,
    progress: typeof student.progress === 'number' ? student.progress : 0,
    status: student.status === 'Pending' ? 'Pending' : 'Active',
    lastActive: typeof student.lastActive === 'string' ? student.lastActive : 'Not started',
    joined: typeof student.joined === 'string' ? student.joined : new Date().toLocaleDateString(),
    assignments: typeof student.assignments === 'string' ? student.assignments : '0 / 0 submitted',
    quizScore: typeof student.quizScore === 'string' ? student.quizScore : 'Not started',
  };
}

function mergeSeededStudentAccounts(students: Student[]) {
  const existingEmails = new Set(students.map((student) => student.email.toLowerCase()).filter(Boolean));
  const missingSeededAccounts = seededStudentAccounts.filter((student) => !existingEmails.has(student.email.toLowerCase()));
  return [...missingSeededAccounts, ...students];
}

function readStoredStudents(): Student[] {
  if (typeof window === 'undefined') return defaultStudents;
  try {
    const stored = window.localStorage.getItem(studentStorageKey);
    if (!stored) return defaultStudents;
    const parsed = JSON.parse(stored) as Partial<Student>[];
    if (!Array.isArray(parsed)) return defaultStudents;
    return mergeSeededStudentAccounts(parsed.map(normalizeStoredStudent));
  } catch {
    return defaultStudents;
  }
}

function readStoredLessonComments(): LessonComment[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem(lessonCommentStorageKey);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as Partial<LessonComment>[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((comment) => (
        typeof comment.id === 'string'
        && typeof comment.lessonId === 'string'
        && typeof comment.studentId === 'string'
        && typeof comment.studentName === 'string'
        && typeof comment.text === 'string'
        && typeof comment.createdAt === 'number'
      ))
      .map((comment) => ({
        id: comment.id as string,
        lessonId: comment.lessonId as string,
        studentId: comment.studentId as string,
        studentName: comment.studentName as string,
        text: comment.text as string,
        createdAt: comment.createdAt as number,
      }));
  } catch {
    return [];
  }
}

function readStoredDeletedLessonCommentIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = window.localStorage.getItem(deletedLessonCommentStorageKey);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as unknown;
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string' && Boolean(id)) : [];
  } catch {
    return [];
  }
}

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
              <p className="mt-2 text-sm text-slate-400">47 lessons · 8 modules · Capstone project</p>
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
        <Metric icon={PlayCircle} label="Video lessons" value="47" detail="Vimeo + progress tracking" />
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

function StudentDashboardPage({ go, learningProgress, lessons }: { go: (v: PageName) => void; learningProgress: LearningProgress; lessons: LessonRecord[] }) {
  const currentCourse = courseCards[0];
  const currentLesson = getCurrentLesson(learningProgress, lessons);
  const overallProgress = getCourseProgressPercent(learningProgress, lessons);
  const completedCount = getCompletedSet(learningProgress).size;

  const quickActions: Array<{ icon: IconType; label: string; target: PageName }> = [
    { icon: PlayCircle, label: 'Continue learning', target: 'Lesson Player' },
    { icon: ClipboardCheck, label: 'Assignments', target: 'Assignments' },
    { icon: Video, label: 'Live class', target: 'Live Meeting' },
    { icon: Download, label: 'Resources', target: 'Resources' },
  ];

  return (
    <div className={ui.page}>
      <PageHeader
        eyebrow="Auto-enrolled course"
        title="Digital Marketing Beginner to Professional."
        description="Your account is ready. Start the first video, complete lessons in order, and keep moving through the full course path."
        actions={
          <button onClick={() => go('Lesson Player')} className={ui.btnPrimary}>
            Continue learning <ArrowRight className="h-4 w-4" />
          </button>
        }
      />

      {/* Hero progress + next lesson */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className={cx(ui.card, 'md:col-span-2')}>
          <p className={ui.eyebrow}>Current lesson</p>
          <h2 className={cx(ui.h2, 'mt-3 text-2xl sm:text-3xl')}>{currentLesson.title}</h2>
          <p className={cx(ui.bodySm, 'mt-3')}>{currentLesson.moduleTitle} · {currentLesson.moduleName} · {currentLesson.duration}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button onClick={() => go('Lesson Player')} className={ui.btnPrimary}>
              <PlayCircle className="h-4 w-4" /> Start lesson
            </button>
            <button onClick={() => go('Course Detail')} className={ui.btnGhost}>
              View curriculum
            </button>
          </div>
        </div>
        <div className={ui.card}>
          <p className={ui.eyebrow}>Course progress</p>
          <p className="mt-3 font-serif text-5xl font-bold text-white">{overallProgress}%</p>
          <div className="mt-4">
            <ProgressBar value={overallProgress} height="md" />
          </div>
          <p className={cx(ui.bodySm, 'mt-3')}>{completedCount} / {lessons.length} lessons completed</p>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <InfoCard icon={BookOpen} title={currentCourse.title} text="Automatically assigned to every student account." />
        <InfoCard icon={PlayCircle} title="One lesson at a time" text="Complete the current video to unlock the next class." />
        <InfoCard icon={CheckCircle2} title="Saved progress" text="Your current lesson and completed lessons stay saved in this browser." />
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
          {modules.map((module, moduleIndex) => (
            <ModuleListRow key={module.title} module={module} moduleIndex={moduleIndex} learningProgress={learningProgress} lessons={lessons} onOpen={() => go('Lesson Player')} />
          ))}
        </div>
      </section>

      {/* Info row */}
      <section className="grid gap-3 md:grid-cols-2">
        <InfoCard icon={CalendarDays} title="Upcoming live class" text="Saturday & Sunday · 7:00 PM – 8:30 PM" />
        <InfoCard icon={ClipboardCheck} title="Pending assignment" text="Marketing funnel worksheet — due before the next module." />
      </section>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button onClick={() => go('Live Meeting')} className={ui.btnPrimary}>
          Join meeting now
        </button>
        <p className="text-sm text-slate-400">Camera, mic, screen share, and recording are available inside the meeting room.</p>
      </div>
    </div>
  );
}

function ModuleListRow({
  module,
  moduleIndex,
  learningProgress,
  lessons,
  onOpen,
}: {
  module: (typeof modules)[number];
  moduleIndex: number;
  learningProgress: LearningProgress;
  lessons: LessonRecord[];
  onOpen: () => void;
}) {
  const moduleState = getModuleLearningState(moduleIndex, learningProgress, lessons);
  const isLocked = moduleState.status === 'Locked';
  const isCurrent = moduleState.status === 'In progress';
  const isDone = moduleState.status === 'Completed';
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
          <ProgressBar value={moduleState.progressValue} />
          <p className="mt-2 text-xs text-slate-500">{moduleState.completedCount} / {module.lessons.length} lessons · {moduleState.status}</p>
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

function LessonVideoStage({
  lesson,
  courseProgress,
  watchedPercent,
  isCompleted,
  onProgressChange,
  onComplete,
}: {
  lesson: LessonRecord;
  courseProgress: number;
  watchedPercent: number;
  isCompleted: boolean;
  onProgressChange: (percent: number) => void;
  onComplete: () => void;
}) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const progressHandlerRef = useRef(onProgressChange);
  const videoUrl = getLessonVideoUrl(lesson);
  const playerId = `lesson-player-${lesson.id}`;
  const embeddedUrl = getEmbeddableLessonUrl(videoUrl, playerId);
  const isVimeo = isVimeoLessonUrl(videoUrl);
  const requiredPercent = lesson.requiredWatchPercentage;
  const canComplete = isCompleted || watchedPercent >= requiredPercent;

  useEffect(() => {
    progressHandlerRef.current = onProgressChange;
  }, [onProgressChange]);

  useEffect(() => {
    if (!isVimeo) return;
    const targetOrigin = 'https://player.vimeo.com';
    const sendToPlayer = (method: string, value?: string) => {
      const payload = { method, value };
      iframeRef.current?.contentWindow?.postMessage(JSON.stringify(payload), targetOrigin);
      iframeRef.current?.contentWindow?.postMessage(payload, targetOrigin);
    };
    const registerProgressEvents = () => {
      sendToPlayer('addEventListener', 'timeupdate');
      sendToPlayer('addEventListener', 'playProgress');
      sendToPlayer('addEventListener', 'ended');
      sendToPlayer('addEventListener', 'finish');
    };
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== targetOrigin) return;
      const data = typeof event.data === 'string' ? safeParseEventData(event.data) : event.data;
      if (data?.player_id && data.player_id !== playerId) return;
      if (data?.event === 'ready') registerProgressEvents();
      if (data?.event === 'finish' || data?.event === 'ended') {
        progressHandlerRef.current(100);
        return;
      }
      if ((data?.event === 'timeupdate' || data?.event === 'playProgress' || data?.event === 'progress') && data.data) {
        progressHandlerRef.current(getVimeoWatchPercent(data.data));
      }
    };
    window.addEventListener('message', onMessage);
    const timers = [700, 1600, 3200].map((delay) => window.setTimeout(registerProgressEvents, delay));
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener('message', onMessage);
    };
  }, [embeddedUrl, isVimeo, playerId]);

  const trackNativeProgress = (video: HTMLVideoElement) => {
    if (!Number.isFinite(video.duration) || video.duration <= 0) return;
    onProgressChange(Math.min(100, Math.round((video.currentTime / video.duration) * 100)));
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-950">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] px-5 py-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-300 text-slate-950">
            <PlayCircle className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-white">{lesson.title}</p>
            <p className="text-xs text-slate-500">{lesson.duration} · {lesson.moduleTitle}</p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-300">{courseProgress}% course progress</span>
      </div>

      <div className="grid min-h-[340px] place-items-center bg-black p-3 sm:min-h-[430px]">
        {isVimeo ? (
          <iframe
            ref={iframeRef}
            key={lesson.id}
            src={embeddedUrl}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={`${lesson.title} video`}
            className="h-full min-h-[320px] w-full rounded-xl border-0 bg-black sm:min-h-[410px]"
          />
        ) : (
          <video
            key={lesson.id}
            controls
            controlsList="nodownload"
            className="h-full max-h-[520px] w-full rounded-xl bg-black"
            poster="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.jpg"
            onTimeUpdate={(event) => trackNativeProgress(event.currentTarget)}
            onLoadedMetadata={(event) => trackNativeProgress(event.currentTarget)}
            onEnded={() => onProgressChange(100)}
          >
            <source src={embeddedUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <p className="text-sm text-slate-400">
          {isCompleted
            ? 'Lesson completed. You can review it anytime.'
            : `Watch ${requiredPercent}% to complete. Current watch progress: ${watchedPercent}%.`}
        </p>
        <button onClick={onComplete} disabled={isCompleted || !canComplete} className={cx(ui.btnPrimary, (isCompleted || !canComplete) && 'cursor-default opacity-70')}>
          <CheckCircle2 className="h-4 w-4" /> {isCompleted ? 'Completed' : 'Complete lesson'}
        </button>
      </div>
    </div>
  );
}

function safeParseEventData(value: string) {
  try {
    return JSON.parse(value) as { event?: string; player_id?: string; data?: VimeoProgressData };
  } catch {
    return null;
  }
}

type VimeoProgressData = {
  seconds?: number;
  duration?: number;
  percent?: number;
};

function getVimeoWatchPercent(data: VimeoProgressData) {
  const rawPercent = Number(data.percent);
  if (Number.isFinite(rawPercent)) {
    const normalized = rawPercent <= 1 ? rawPercent * 100 : rawPercent;
    return Math.min(100, Math.max(0, Math.round(normalized)));
  }
  const seconds = Number(data.seconds || 0);
  const duration = Number(data.duration || 0);
  if (duration > 0) return Math.min(100, Math.max(0, Math.round((seconds / duration) * 100)));
  return 0;
}

function LessonCommentsPanel({
  lesson,
  currentStudent,
  comments,
  setComments,
  onUpdateComment,
  onDeleteComment,
}: {
  lesson: LessonRecord;
  currentStudent: Student | null;
  comments: LessonComment[];
  setComments: React.Dispatch<React.SetStateAction<LessonComment[]>>;
} & CommentMutationHandlers) {
  const [commentText, setCommentText] = useState('');
  const lessonComments = comments
    .filter((comment) => comment.lessonId === lesson.id)
    .sort((a, b) => b.createdAt - a.createdAt);

  const submitComment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = commentText.trim();
    if (!text || !currentStudent) return;
    const nextComment: LessonComment = {
      id: `comment-${Date.now()}`,
      lessonId: lesson.id,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      text,
      createdAt: Date.now(),
    };
    setComments((prev) => [nextComment, ...prev]);
    setCommentText('');
  };

  return (
    <section className={ui.cardSubtle}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className={ui.eyebrow}>Comments</p>
          <h2 className="mt-2 text-lg font-bold text-white">Ask questions under this lesson</h2>
        </div>
        <span className={ui.chipMuted}>
          <MessageCircle className="h-3.5 w-3.5" /> {lessonComments.length} comments
        </span>
      </div>

      <form onSubmit={submitComment} className="mt-5 space-y-3">
        <textarea
          value={commentText}
          onChange={(event) => setCommentText(event.target.value)}
          disabled={!currentStudent}
          rows={4}
          className="w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-emerald-300/40 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder={currentStudent ? 'Write your comment or question...' : 'Sign in as a student to comment.'}
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            {currentStudent ? `Posting as ${currentStudent.name}` : 'Only student accounts can comment.'}
          </p>
          <button type="submit" disabled={!currentStudent || !commentText.trim()} className={cx(ui.btnPrimary, (!currentStudent || !commentText.trim()) && 'cursor-not-allowed opacity-60')}>
            <Send className="h-4 w-4" /> Post comment
          </button>
        </div>
      </form>

      <div className="mt-6 space-y-3">
        {lessonComments.length > 0 ? (
          lessonComments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              canManage={currentStudent?.id === comment.studentId}
              onUpdateComment={onUpdateComment}
              onDeleteComment={onDeleteComment}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-sm text-slate-400">
            No comments yet. Be the first student to ask a question.
          </div>
        )}
      </div>
    </section>
  );
}

function formatCommentTime(value: number) {
  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function CommentCard({
  comment,
  contextLabel,
  canManage,
  onUpdateComment,
  onDeleteComment,
}: {
  comment: LessonComment;
  contextLabel?: string;
  canManage: boolean;
  onUpdateComment: (commentId: string, text: string) => void;
  onDeleteComment: (commentId: string) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(comment.text);

  useEffect(() => {
    if (!isEditing) setDraftText(comment.text);
  }, [comment.text, isEditing]);

  const saveEdit = () => {
    const text = draftText.trim();
    if (!text) return;
    onUpdateComment(comment.id, text);
    setIsEditing(false);
  };

  const deleteComment = () => {
    const confirmed = window.confirm('Delete this comment?');
    if (!confirmed) return;
    onDeleteComment(comment.id);
  };

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold text-white">{comment.studentName}</p>
          {contextLabel && <p className="mt-1 text-xs font-semibold text-emerald-300">{contextLabel}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <p className="text-[11px] text-slate-500">{formatCommentTime(comment.createdAt)}</p>
          {canManage && !isEditing && (
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setIsEditing(true)} className="grid h-8 w-8 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-300 transition hover:border-emerald-300/40 hover:text-emerald-300" title="Edit comment">
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={deleteComment} className="grid h-8 w-8 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-slate-300 transition hover:border-red-300/40 hover:text-red-300" title="Delete comment">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="mt-3 space-y-3">
          <textarea
            value={draftText}
            onChange={(event) => setDraftText(event.target.value)}
            rows={3}
            className="w-full resize-none rounded-xl border border-white/[0.08] bg-slate-950/40 px-3 py-2 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-emerald-300/40"
          />
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" onClick={() => { setDraftText(comment.text); setIsEditing(false); }} className={ui.btnGhost}>
              <X className="h-4 w-4" /> Cancel
            </button>
            <button type="button" onClick={saveEdit} disabled={!draftText.trim()} className={cx(ui.btnPrimary, !draftText.trim() && 'cursor-not-allowed opacity-60')}>
              <CheckCircle2 className="h-4 w-4" /> Save
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">{comment.text}</p>
      )}
    </div>
  );
}

function LessonPlayerPage({
  go,
  learningProgress,
  setLearningProgress,
  lessons,
  currentStudent,
  lessonComments,
  setLessonComments,
  onUpdateComment,
  onDeleteComment,
}: {
  go: (v: PageName) => void;
  learningProgress: LearningProgress;
  setLearningProgress: React.Dispatch<React.SetStateAction<LearningProgress>>;
  lessons: LessonRecord[];
  currentStudent: Student | null;
  lessonComments: LessonComment[];
  setLessonComments: React.Dispatch<React.SetStateAction<LessonComment[]>>;
} & CommentMutationHandlers) {
  const [activeLessonId, setActiveLessonId] = useState(getCurrentLesson(learningProgress, lessons).id);
  const [savedMessage, setSavedMessage] = useState('');
  const activeLesson = lessons.find((lesson) => lesson.id === activeLessonId) || getCurrentLesson(learningProgress, lessons);
  const completed = getCompletedSet(learningProgress);
  const isCompleted = completed.has(activeLesson.id);
  const courseProgress = getCourseProgressPercent(learningProgress, lessons);
  const watchedPercent = Math.max(isCompleted ? 100 : 0, learningProgress.watchProgressByLessonId[activeLesson.id] || 0);
  const previousLesson = lessons[activeLesson.globalIndex - 1];
  const nextLesson = lessons[activeLesson.globalIndex + 1];

  useEffect(() => {
    if (!lessons.some((lesson) => lesson.id === activeLessonId)) {
      setActiveLessonId(getCurrentLesson(learningProgress, lessons).id);
    }
  }, [activeLessonId, learningProgress, lessons]);

  const selectLesson = (lesson: LessonRecord) => {
    if (!isLessonUnlocked(lesson, learningProgress, lessons)) return;
    setActiveLessonId(lesson.id);
    setSavedMessage('');
    setLearningProgress((prev) => (
      prev.completedLessonIds.includes(lesson.id) ? prev : { ...prev, currentLessonId: lesson.id }
    ));
  };

  const saveWatchProgress = (percent: number) => {
    setLearningProgress((prev) => {
      const nextPercent = Math.max(prev.watchProgressByLessonId[activeLesson.id] || 0, Math.min(100, Math.max(0, Math.round(percent))));
      if (nextPercent === prev.watchProgressByLessonId[activeLesson.id]) return prev;
      return {
        ...prev,
        watchProgressByLessonId: {
          ...prev.watchProgressByLessonId,
          [activeLesson.id]: nextPercent,
        },
      };
    });
  };

  const markLessonComplete = (movePlayerToNext: boolean) => {
    const unlocked = lessons[activeLesson.globalIndex + 1];
    const nextLessonId = unlocked?.id || activeLesson.id;
    setLearningProgress((prev) => {
      const completedLessonIds = Array.from(new Set([...prev.completedLessonIds, activeLesson.id]));
      return {
        completedLessonIds,
        currentLessonId: nextLessonId,
        watchProgressByLessonId: {
          ...prev.watchProgressByLessonId,
          [activeLesson.id]: 100,
        },
      };
    });
    if (movePlayerToNext && unlocked) setActiveLessonId(unlocked.id);
    setSavedMessage(unlocked ? 'Lesson completed. Next lesson is unlocked.' : 'Course completed. Great work.');
  };

  const completeLesson = () => {
    if (watchedPercent < activeLesson.requiredWatchPercentage) {
      setSavedMessage(`Please watch at least ${activeLesson.requiredWatchPercentage}% before completing this lesson.`);
      return;
    }
    markLessonComplete(true);
  };

  useEffect(() => {
    if (!isCompleted && watchedPercent >= 100) {
      markLessonComplete(false);
    }
  }, [activeLesson.id, isCompleted, watchedPercent]);

  return (
    <div className={ui.page}>
      <div className="flex items-center justify-between gap-4">
        <BackLink go={go} to="Student Dashboard" label="Back to dashboard" />
        <span className={ui.chipMuted}>
          Lesson {activeLesson.globalIndex + 1} / {lessons.length}
        </span>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_380px] xl:gap-10">
        {/* Main */}
        <div className="space-y-8">
          <div>
            <p className={ui.eyebrow}>{activeLesson.moduleTitle} · {activeLesson.moduleName}</p>
            <h1 className={cx(ui.h2, 'mt-3')}>{activeLesson.title}</h1>
            <p className={cx(ui.bodySm, 'mt-3')}>Complete lessons in order. The next video opens only after this one is marked complete.</p>
          </div>

          <LessonVideoStage
            lesson={activeLesson}
            courseProgress={courseProgress}
            watchedPercent={watchedPercent}
            isCompleted={isCompleted}
            onProgressChange={saveWatchProgress}
            onComplete={completeLesson}
          />

          {activeLesson.resourceUrl && (
            <section className={cx(ui.cardSubtle, 'flex flex-wrap items-center justify-between gap-4')}>
              <div>
                <p className={ui.eyebrow}>Lesson file</p>
                <h2 className="mt-2 text-lg font-bold text-white">{activeLesson.resource}</h2>
              </div>
              <a href={activeLesson.resourceUrl} target="_blank" rel="noreferrer" className={ui.btnPrimary}>
                <Download className="h-4 w-4" /> File ရယူရန်
              </a>
            </section>
          )}

          {savedMessage && (
            <div className="rounded-xl border border-emerald-300/30 bg-emerald-300/5 px-4 py-3 text-sm font-medium text-emerald-200">
              {savedMessage}
            </div>
          )}

          <LessonCommentsPanel
            lesson={activeLesson}
            currentStudent={currentStudent}
            comments={lessonComments}
            setComments={setLessonComments}
            onUpdateComment={onUpdateComment}
            onDeleteComment={onDeleteComment}
          />

          <section className="grid gap-4 lg:grid-cols-3">
            <div className={ui.cardSubtle}>
              <p className={ui.eyebrow}>Outcome</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">{activeLesson.outcome}</p>
            </div>
            <div className={ui.cardSubtle}>
              <p className={ui.eyebrow}>Practice</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">{activeLesson.practice}</p>
            </div>
            <div className={ui.cardSubtle}>
              <p className={ui.eyebrow}>Resource</p>
              <p className="mt-3 text-sm leading-6 text-slate-300">{activeLesson.resource}</p>
              {activeLesson.resourceUrl && (
                <a href={activeLesson.resourceUrl} target="_blank" rel="noreferrer" className={cx(ui.btnSubtle, 'mt-4')}>
                  <ExternalLink className="h-4 w-4" /> File ရယူရန်
                </a>
              )}
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-3">
              <button onClick={() => previousLesson && selectLesson(previousLesson)} disabled={!previousLesson} className={cx(ui.btnGhost, !previousLesson && 'cursor-not-allowed opacity-50')}>
                <ArrowLeft className="h-4 w-4" /> Previous
              </button>
              <button onClick={() => nextLesson && selectLesson(nextLesson)} disabled={!nextLesson || !isLessonUnlocked(nextLesson, learningProgress, lessons)} className={cx(ui.btnPrimary, (!nextLesson || !isLessonUnlocked(nextLesson, learningProgress, lessons)) && 'cursor-not-allowed opacity-50')}>
                Next lesson <ArrowRight className="h-4 w-4" />
              </button>
            </div>
            <button onClick={() => go('Assignments')} className={ui.btnSubtle}>
              Submit assignment
            </button>
          </div>
        </div>

        {/* Sidebar — Coursera-style curriculum */}
        <aside className="space-y-3">
          <div className={ui.cardSubtle}>
            <p className={ui.eyebrow}>Course</p>
            <h2 className="mt-2 text-lg font-bold text-white">Digital Marketing Beginner to Professional</h2>
            <div className="mt-4">
              <ProgressBar value={courseProgress} height="md" />
            </div>
            <p className="mt-3 text-sm text-slate-400">{completed.size} / {lessons.length} lessons completed</p>
          </div>

          <p className={cx(ui.eyebrow, 'px-1 pt-2')}>Curriculum</p>
          {modules.map((module, index) => {
            const moduleState = getModuleLearningState(index, learningProgress, lessons);
            const isCurrent = index === activeLesson.moduleIndex;
            const moduleLessons = lessons.filter((lesson) => lesson.moduleIndex === index);
            return (
              <div
                key={module.title}
                className={cx(
                  'rounded-2xl border p-4',
                  isCurrent ? 'border-emerald-300/30 bg-emerald-300/[0.04]' : 'border-white/[0.06] bg-white/[0.02]',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">{module.title}</p>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{moduleState.status}</span>
                </div>
                <h3 className="mt-1.5 text-sm font-bold text-white">{module.name}</h3>
                <div className="mt-3">
                  <ProgressBar value={moduleState.progressValue} />
                </div>
                <div className="mt-3 space-y-1">
                  {moduleLessons.map((lesson) => {
                    const lessonCompleted = completed.has(lesson.id);
                    const lessonUnlocked = isLessonUnlocked(lesson, learningProgress, lessons);
                    const lessonActive = lesson.id === activeLesson.id;
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => selectLesson(lesson)}
                        disabled={!lessonUnlocked}
                        className={cx(
                          'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition',
                          lessonActive
                            ? 'bg-emerald-300 text-slate-950'
                            : lessonUnlocked
                            ? 'text-slate-300 hover:bg-white/[0.05] hover:text-white'
                            : 'cursor-not-allowed text-slate-600',
                        )}
                      >
                        <span className={cx('grid h-6 w-6 shrink-0 place-items-center rounded-full', lessonActive ? 'bg-slate-950/10' : lessonCompleted ? 'bg-emerald-300/10 text-emerald-300' : 'bg-white/[0.04]')}>
                          {lessonCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : lessonUnlocked ? <PlayCircle className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                        </span>
                        <span className="min-w-0 flex-1 truncate">{lesson.title}</span>
                        <span className="shrink-0 text-[10px] opacity-70">{lesson.duration}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
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
function ReportsPage({
  go,
  students,
  lessons,
  studentProgressById,
  lessonComments,
  onUpdateComment,
  onDeleteComment,
}: {
  go: (v: PageName) => void;
  students: Student[];
  lessons: LessonRecord[];
  studentProgressById: StudentProgressById;
  lessonComments: LessonComment[];
} & CommentMutationHandlers) {
  return (
    <div className={ui.page}>
      <BackLink go={go} to="Admin Panel" label="Back to admin panel" />
      <PageHeader
        eyebrow="Reports"
        title="Student progress and comments."
        description="Review which lessons students have watched, completion progress, and comments left under videos."
      />
      <StudentActivityReport
        students={students}
        lessons={lessons}
        studentProgressById={studentProgressById}
        lessonComments={lessonComments}
        onUpdateComment={onUpdateComment}
        onDeleteComment={onDeleteComment}
      />
    </div>
  );
}

// =====================================================================
// Live Meeting
// =====================================================================

function LiveMeetingPage({
  go,
  meetings,
  initialMeetingId,
}: {
  go: (v: PageName) => void;
  meetings: LiveClassMeeting[];
  initialMeetingId: string | null;
}) {
  const firstMeeting = meetings.find((meeting) => meeting.isInstant) || meetings[0] || defaultLiveMeetings[0];
  const initialMeeting = meetings.find((meeting) => meeting.id === initialMeetingId) || firstMeeting;
  const [selectedMeetingId, setSelectedMeetingId] = useState(initialMeeting.id);
  const selectedMeeting = meetings.find((meeting) => meeting.id === selectedMeetingId) || firstMeeting;
  const roomName = getJitsiRoomName(selectedMeeting);
  const jitsiURL = getJitsiMeetingUrl(selectedMeeting);

  useEffect(() => {
    if (initialMeetingId && meetings.some((meeting) => meeting.id === initialMeetingId)) {
      setSelectedMeetingId(initialMeetingId);
    }
  }, [initialMeetingId, meetings]);

  useEffect(() => {
    if (!meetings.some((meeting) => meeting.id === selectedMeetingId)) {
      setSelectedMeetingId(firstMeeting.id);
    }
  }, [firstMeeting.id, meetings, selectedMeetingId]);

  return (
    <div className={ui.page}>
      <BackLink go={go} to="Student Dashboard" label="Back to dashboard" />
      <PageHeader
        eyebrow={selectedMeeting.isInstant ? 'Instant live meeting' : 'Weekly live class'}
        title={selectedMeeting.title}
        description={`${formatMeetingWindow(selectedMeeting)} · Host: ${selectedMeeting.host}`}
        actions={
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-300/10 px-3 py-1.5 text-xs font-semibold text-emerald-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" /> {selectedMeeting.isInstant ? 'Live now' : 'Ready'}
          </span>
        }
      />

      <section className={cx(ui.card, 'overflow-hidden p-0')}>
        <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
          <div className="min-h-[520px] bg-slate-950 p-3 sm:p-4">
            <div className="h-[68vh] min-h-[480px] overflow-hidden rounded-2xl border border-white/10 bg-black">
              <iframe
                key={selectedMeeting.id}
                src={jitsiURL}
                allow="camera; microphone; display-capture; fullscreen; autoplay; clipboard-read; clipboard-write"
                allowFullScreen
                title={`${selectedMeeting.title} Jitsi meeting`}
                className="h-full w-full border-0"
              />
            </div>
          </div>

          <aside className="border-t border-white/[0.08] bg-white/[0.02] p-5 lg:border-l lg:border-t-0">
            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.06] p-4">
              <p className={ui.eyebrow}>Jitsi room</p>
              <h2 className="mt-2 break-words text-lg font-bold text-white">{roomName}</h2>
              <p className="mt-2 text-sm text-slate-400">Camera, microphone, screen share, chat, participants, and recording controls run inside Jitsi.</p>
              <a href={jitsiURL} target="_blank" rel="noreferrer" className={cx(ui.btnPrimary, 'mt-4 w-full')}>
                <ExternalLink className="h-4 w-4" /> Open in new tab
              </a>
            </div>

            <div>
              <p className={cx(ui.eyebrow, 'mt-6')}>Live schedule</p>
              <div className="mt-4 space-y-3">
                {meetings.map((meeting) => (
                  <button
                    key={meeting.id}
                    onClick={() => setSelectedMeetingId(meeting.id)}
                    className={cx(
                      'w-full rounded-2xl border p-4 text-left transition',
                      selectedMeeting.id === meeting.id ? 'border-emerald-300/40 bg-emerald-300/[0.08]' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-white">{meeting.title}</p>
                        <p className="mt-1 text-xs text-slate-400">{formatMeetingWindow(meeting)}</p>
                      </div>
                      {meeting.isInstant ? <Radio className="h-4 w-4 text-emerald-300" /> : <CalendarClock className="h-4 w-4 text-slate-500" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 border-t border-white/[0.06] pt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Recording access</p>
              <p className="mt-2 text-sm font-medium text-slate-200">{selectedMeeting.recordingAccess}</p>
              <p className="mt-2 text-xs leading-5 text-slate-500">Public Jitsi recording availability depends on the Jitsi server. For guaranteed saved recordings, use JaaS or a self-hosted Jibri setup.</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <InfoCard icon={Video} title="Multi-user video" text="All students and the admin join the same Jitsi room." />
        <InfoCard icon={Mic} title="Camera & mic" text="Jitsi handles device permissions, mute, and unmute controls." />
        <InfoCard icon={ScreenShare} title="Screen share & record" text="Screen sharing is built in. Recording depends on the Jitsi server plan." />
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
  Courses: { title: 'Course Management', description: 'Create and organize courses.', primaryAction: 'Create Course', cards: [{ title: 'Main Course', items: ['Digital Marketing Beginner to Professional', '47 lessons', '8+ modules', 'Capstone project'] }, { title: 'Next Course', items: ['Digital Media Planning & Buying', 'Planning framework', 'Buying strategy', 'Campaign workflow'] }] },
  Modules: { title: 'Module Builder', description: 'Organize course lessons into modules.', primaryAction: 'Add Module', cards: [{ title: 'Module Structure', items: ['Module title', 'Lesson order', 'Progress percentage', 'Locked or unlocked'] }, { title: 'Unlock Rules', items: ['Previous lesson required', 'Quiz pass required', 'Assignment required', 'Admin override'] }] },
  Lessons: { title: 'Lesson Manager', description: 'View the full lesson library, replace Vimeo video URLs, and control unlock behavior.', primaryAction: 'Add Lesson', cards: [{ title: 'Video Lesson', items: ['Vimeo embed URL', 'Watch progress rule', 'No skipping', 'Resume playback'] }, { title: 'Tracking', items: ['Watch time', 'Last position', 'Completed date', 'Device history'] }] },
  Quizzes: { title: 'Quiz Builder', description: 'Create lesson quizzes.', primaryAction: 'Create Quiz', cards: [{ title: 'Quiz Settings', items: ['Passing score', 'Max attempts', 'Show answers', 'Randomize questions'] }] },
  Assignments: { title: 'Assignment Review', description: 'Create assignments and review submissions.', primaryAction: 'Create Assignment', cards: [{ title: 'Submission Types', items: ['Text answer', 'File upload', 'External link', 'Google Sheet link'] }] },
  Meetings: { title: 'Live Class Meetings', description: 'Start instant classes or keep weekly Saturday and Sunday rooms ready for students.', primaryAction: 'Schedule Weekly', cards: [{ title: 'Meeting Setup', items: ['Saturday class', 'Sunday class', 'Instant room', 'Recording access'] }] },
  Reports: { title: 'Reports & Analytics', description: 'Review progress and export reports.', primaryAction: 'Export Report', cards: [{ title: 'Progress Report', items: ['Course completion', 'Lesson completion', 'Watch percentage', 'Last activity'] }] },
  Settings: { title: 'Platform Settings', description: 'Configure branding, roles, permissions, and notifications.', primaryAction: 'Save Settings', cards: [{ title: 'Branding', items: ['Ye Htet - Digital Edu', 'Logo', 'Theme color', 'Course display'] }] },
};

function AdminPanelPage({
  go,
  meetings,
  setMeetings,
  onJoinMeeting,
  lessons,
  setLessons,
  students,
  setStudents,
  studentProgressById,
  lessonComments,
  onUpdateComment,
  onDeleteComment,
}: {
  go: (v: PageName) => void;
  meetings: LiveClassMeeting[];
  setMeetings: React.Dispatch<React.SetStateAction<LiveClassMeeting[]>>;
  onJoinMeeting: (meetingId: string) => void;
  lessons: LessonRecord[];
  setLessons: React.Dispatch<React.SetStateAction<LessonRecord[]>>;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  studentProgressById: StudentProgressById;
  lessonComments: LessonComment[];
} & CommentMutationHandlers) {
  const adminMenu = ['Dashboard', 'Students', 'Courses', 'Modules', 'Lessons', 'Quizzes', 'Assignments', 'Meetings', 'Reports', 'Settings'];
  const [adminActive, setAdminActive] = useState('Dashboard');
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [savedMessage, setSavedMessage] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || defaultStudents[0].id);
  const [selectedLessonId, setSelectedLessonId] = useState(lessons[0]?.id || '');
  const [meetingTitle, setMeetingTitle] = useState('Digital Marketing Live Class');
  const [meetingDays, setMeetingDays] = useState<MeetingDay[]>(weeklyMeetingDays);
  const [meetingStartTime, setMeetingStartTime] = useState('19:00');
  const [meetingEndTime, setMeetingEndTime] = useState('20:30');
  const [meetingHost, setMeetingHost] = useState('Ye Htet');
  const [meetingRecordingAccess, setMeetingRecordingAccess] = useState<RecordingAccess>('Students after class');
  const scheduledMeetings = meetings;
  const current = adminContent[adminActive] || adminContent.Dashboard;
  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0] || defaultStudents[0];
  const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId) || lessons[0];
  const isMeetingSetupOpen = adminActive === 'Meetings' && activeAction === current.primaryAction;
  const openAction = (name: string) => { setActiveAction(name); setSavedMessage(''); };
  const isEditingAction = Boolean(activeAction?.toLowerCase().startsWith('edit'));
  const actionInitialValues: Record<string, string> | undefined =
    adminActive === 'Students' && isEditingAction
      ? {
          'Student name': selectedStudent.name,
          'Email address': selectedStudent.email,
          'Temporary password': '',
          'Assigned course': selectedStudent.course,
        }
      : adminActive === 'Lessons' && isEditingAction && selectedLesson
      ? {
          'Lesson title': selectedLesson.title,
          'Vimeo embed URL': getLessonVideoUrl(selectedLesson),
          'Required watch percentage': String(selectedLesson.requiredWatchPercentage),
          'Attached resource': selectedLesson.resource,
          'Resource file URL': selectedLesson.resourceUrl || '',
        }
      : undefined;
  const actionFieldOptions =
    adminActive === 'Students'
      ? { 'Assigned course': courseCards.map((course) => course.title) }
      : undefined;
  useEffect(() => {
    if (!lessons.some((lesson) => lesson.id === selectedLessonId)) {
      setSelectedLessonId(lessons[0]?.id || '');
    }
  }, [lessons, selectedLessonId]);
  useEffect(() => {
    if (!students.some((student) => student.id === selectedStudentId)) {
      setSelectedStudentId(students[0]?.id || defaultStudents[0].id);
    }
  }, [students, selectedStudentId]);
  const toggleMeetingDay = (day: MeetingDay) => {
    setMeetingDays((prev) => prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day]);
  };
  const saveLessonAction = (values: Record<string, string>) => {
    const title = values['Lesson title']?.trim() || selectedLesson?.title || 'Untitled lesson';
    const videoUrl = normalizeLessonVideoUrl(values['Vimeo embed URL']);
    const requiredWatchPercentage = normalizeRequiredWatchPercentage(values['Required watch percentage']);
    const resource = values['Attached resource']?.trim() || `${modules[modules.length - 1].name} resource`;
    const resourceUrl = values['Resource file URL']?.trim() || undefined;

    if (isEditingAction && selectedLesson) {
      setLessons((prev) => reindexLessons(prev.map((lesson) => (
        lesson.id === selectedLesson.id
          ? {
              ...lesson,
              title,
              videoUrl,
              requiredWatchPercentage,
              resource,
              resourceUrl,
              outcome: getLessonOutcome(title),
              practice: getLessonPractice(title),
            }
          : lesson
      ))));
      setSavedMessage(`${title} updated successfully.`);
      setActiveAction(null);
      return;
    }

    const moduleIndex = modules.length - 1;
    const module = modules[moduleIndex];
    const moduleLessonCount = lessons.filter((lesson) => lesson.moduleIndex === moduleIndex).length;
    const newLesson: LessonRecord = {
      id: `custom-${Date.now()}`,
      title,
      moduleTitle: module.title,
      moduleName: module.name,
      moduleIndex,
      lessonIndex: moduleLessonCount,
      globalIndex: lessons.length,
      duration: '12 min',
      outcome: getLessonOutcome(title),
      practice: getLessonPractice(title),
      resource,
      resourceUrl,
      videoUrl,
      requiredWatchPercentage,
    };
    setLessons((prev) => reindexLessons([...prev, newLesson]));
    setSelectedLessonId(newLesson.id);
    setSavedMessage(`${title} added successfully.`);
    setActiveAction(null);
  };
  const saveStudentAction = (values: Record<string, string>) => {
    const name = values['Student name']?.trim();
    const email = values['Email address']?.trim().toLowerCase();
    const password = values['Temporary password']?.trim();
    const course = values['Assigned course']?.trim() || 'Digital Marketing Beginner to Professional';

    if (!name || !email) {
      setSavedMessage('Please enter student name and email address.');
      return;
    }
    if (!isEditingAction && !password) {
      setSavedMessage('Please enter a temporary password for this student.');
      return;
    }

    if (isEditingAction && selectedStudent) {
      setStudents((prev) => prev.map((student) => (
        student.id === selectedStudent.id
          ? { ...student, name, email, password: password || student.password, course }
          : student
      )));
      setSavedMessage(`${name} account updated successfully.`);
      setActiveAction(null);
      return;
    }

    const newStudent: Student = {
      id: `STU-${Date.now().toString().slice(-6)}`,
      name,
      email,
      password,
      course,
      progress: 0,
      status: 'Active',
      lastActive: 'Not started',
      joined: new Date().toLocaleDateString(),
      assignments: '0 / 0 submitted',
      quizScore: 'Not started',
    };
    setStudents((prev) => [newStudent, ...prev]);
    setSelectedStudentId(newStudent.id);
    setSavedMessage(`${name} account created successfully.`);
    setActiveAction(null);
  };
  const handleAdminActionSave = (values: Record<string, string>) => {
    if (adminActive === 'Students') {
      saveStudentAction(values);
      return;
    }
    if (adminActive === 'Lessons') {
      saveLessonAction(values);
      return;
    }
    setSavedMessage(`${activeAction} saved successfully.`);
    setActiveAction(null);
  };
  const scheduleMeeting = () => {
    if (!meetingTitle || meetingDays.length === 0 || !meetingStartTime || !meetingEndTime || !meetingHost) {
      setSavedMessage('Please fill all required weekly meeting fields.');
      return;
    }
    const createdAt = Date.now();
    const newMeetings = meetingDays.map((day) => ({
      id: `weekly-${day.toLowerCase()}-${createdAt}`,
      title: meetingTitle,
      day,
      startTime: meetingStartTime,
      endTime: meetingEndTime,
      host: meetingHost,
      recordingAccess: meetingRecordingAccess,
    }));
    setMeetings((prev) => [
      ...prev.filter((meeting) => meeting.isInstant || !meetingDays.includes(meeting.day as MeetingDay)),
      ...newMeetings,
    ]);
    setSavedMessage('Weekly live classes scheduled successfully.');
    setActiveAction(null);
  };
  const startInstantMeeting = () => {
    const now = new Date();
    const instantMeeting: LiveClassMeeting = {
      id: `instant-${Date.now()}`,
      title: 'Instant Live Class',
      day: 'Instant',
      startTime: formatLocalTime(now),
      endTime: 'Open',
      host: meetingHost || 'Ye Htet',
      recordingAccess: meetingRecordingAccess,
      isInstant: true,
    };
    setMeetings((prev) => [instantMeeting, ...prev.filter((meeting) => !meeting.isInstant)]);
    setAdminActive('Meetings');
    setActiveAction(null);
    setSavedMessage('Instant live meeting is ready for students.');
    onJoinMeeting(instantMeeting.id);
    go('Live Meeting');
  };

  return (
    <div className={ui.page}>
      <div className="grid gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="space-y-1">
          <p className={cx(ui.eyebrow, 'px-3 pb-2')}>Admin panel</p>
          {adminMenu.map((item) => (
            <button
              key={item}
              onClick={() => { setAdminActive(item); setActiveAction(null); setSavedMessage(''); if (item === 'Students') setSelectedStudentId(students[0]?.id || defaultStudents[0].id); }}
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
              adminActive === 'Meetings' ? (
                <>
                  <button onClick={startInstantMeeting} className={ui.btnPrimary}>
                    <Radio className="h-4 w-4" /> Start instant class
                  </button>
                  <button onClick={() => openAction(current.primaryAction)} className={ui.btnGhost}>
                    <CalendarClock className="h-4 w-4" /> Schedule weekly
                  </button>
                </>
              ) : (
                <button onClick={() => openAction(current.primaryAction)} className={ui.btnPrimary}>
                  <Plus className="h-4 w-4" /> {current.primaryAction}
                </button>
              )
            }
          />

          {savedMessage && (
            <div className="rounded-xl border border-emerald-300/30 bg-emerald-300/5 px-4 py-3 text-sm font-medium text-emerald-200">
              {savedMessage}
            </div>
          )}

          {activeAction && adminActive !== 'Meetings' && (
            <AdminActionPanel
              // Remount the form whenever the section/action/student changes so
              // defaultValue inputs reflect the freshly selected record.
              key={`${adminActive}:${activeAction}:${selectedStudent.id}:${selectedLesson?.id || ''}`}
              section={adminActive}
              actionName={activeAction}
              initialValues={actionInitialValues}
              fieldOptions={actionFieldOptions}
              onCancel={() => setActiveAction(null)}
              onSave={handleAdminActionSave}
            />
          )}

          {adminActive === 'Students' ? (
            <StudentDirectory
              students={students}
              selectedStudent={selectedStudent}
              lessons={lessons}
              studentProgressById={studentProgressById}
              lessonComments={lessonComments}
              onUpdateComment={onUpdateComment}
              onDeleteComment={onDeleteComment}
              onSelectStudent={(id) => { setSelectedStudentId(id); setActiveAction(null); }}
              onCreateStudent={() => openAction('Add Student')}
              onEditStudent={(id) => {
                const studentToEdit = students.find((student) => student.id === id) || selectedStudent;
                setSelectedStudentId(studentToEdit.id);
                openAction(`Edit ${studentToEdit.name}`);
              }}
            />
          ) : adminActive === 'Lessons' ? (
            <LessonManagerAdmin
              lessons={lessons}
              lessonComments={lessonComments}
              selectedLesson={selectedLesson}
              selectedLessonId={selectedLessonId}
              onSelectLesson={(id) => { setSelectedLessonId(id); setActiveAction(null); setSavedMessage(''); }}
              onCreateLesson={() => openAction('Add Lesson')}
              onEditLesson={(lesson) => { setSelectedLessonId(lesson.id); openAction(`Edit ${lesson.title}`); }}
              onUpdateComment={onUpdateComment}
              onDeleteComment={onDeleteComment}
            />
          ) : adminActive === 'Reports' ? (
            <StudentActivityReport
              students={students}
              lessons={lessons}
              studentProgressById={studentProgressById}
              lessonComments={lessonComments}
              onUpdateComment={onUpdateComment}
              onDeleteComment={onDeleteComment}
            />
          ) : adminActive === 'Meetings' ? (
            <div className="space-y-6">
              {isMeetingSetupOpen && (
                <div className={ui.card}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className={ui.eyebrow}>Meeting Setup</p>
                      <h2 className={cx(ui.h3, 'mt-2')}>Schedule weekly live classes</h2>
                      <p className="mt-2 text-sm text-slate-400">Saturday and Sunday rooms stay ready for students every week.</p>
                    </div>
                    <button onClick={() => { setActiveAction(null); setSavedMessage(''); }} className={ui.btnSubtle}>Close</button>
                  </div>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="text-xs font-semibold text-slate-400">Meeting title</span>
                      <input value={meetingTitle} onChange={(e) => setMeetingTitle(e.target.value)} placeholder="Enter meeting title" className="mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-300/40" />
                    </label>
                    <div>
                      <span className="text-xs font-semibold text-slate-400">Weekly days</span>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {weeklyMeetingDays.map((day) => {
                          const active = meetingDays.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => toggleMeetingDay(day)}
                              className={cx(
                                'rounded-xl border px-4 py-3 text-sm font-bold transition',
                                active ? 'border-emerald-300/50 bg-emerald-300 text-slate-950' : 'border-white/[0.08] bg-white/[0.03] text-slate-300 hover:bg-white/[0.06]',
                              )}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <label className="block">
                      <span className="text-xs font-semibold text-slate-400">Start time</span>
                      <input value={meetingStartTime} onChange={(e) => setMeetingStartTime(e.target.value)} type="time" className="mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-300/40" />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold text-slate-400">End time</span>
                      <input value={meetingEndTime} onChange={(e) => setMeetingEndTime(e.target.value)} type="time" className="mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-300/40" />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold text-slate-400">Host</span>
                      <input value={meetingHost} onChange={(e) => setMeetingHost(e.target.value)} placeholder="Enter host name" className="mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-300/40" />
                    </label>
                    <label className="block">
                      <span className="text-xs font-semibold text-slate-400">Recording access</span>
                      <select value={meetingRecordingAccess} onChange={(e) => setMeetingRecordingAccess(e.target.value as RecordingAccess)} className="mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-emerald-300/40">
                        <option value="Students after class">Students after class</option>
                        <option value="Admin only">Admin only</option>
                        <option value="Private">Private</option>
                      </select>
                    </label>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button onClick={scheduleMeeting} className={ui.btnPrimary}>Save weekly schedule</button>
                    <button onClick={() => { setMeetingTitle('Digital Marketing Live Class'); setMeetingDays(weeklyMeetingDays); setMeetingStartTime('19:00'); setMeetingEndTime('20:30'); setMeetingHost('Ye Htet'); setMeetingRecordingAccess('Students after class'); setSavedMessage(''); setActiveAction(null); }} className={ui.btnGhost}>Cancel</button>
                  </div>
                </div>
              )}

              {scheduledMeetings.length > 0 ? (
                <div className={ui.card}>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className={ui.h3}>Scheduled live classes</h3>
                    <span className="rounded-full bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">{scheduledMeetings.length} scheduled</span>
                  </div>
                  <div className="mt-5 space-y-4">
                    {scheduledMeetings.map((meeting) => (
                      <div key={meeting.id} className="rounded-3xl border border-white/10 bg-slate-950/40 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="text-sm text-slate-400">{formatMeetingWindow(meeting)}</p>
                            <h3 className="mt-1 text-lg font-black text-white">{meeting.title}</h3>
                          </div>
                          <div className="space-y-2 text-right text-sm text-slate-300">
                            <p>Host: {meeting.host}</p>
                            <p>Recording: {meeting.recordingAccess}</p>
                            {meeting.isInstant && <p className="text-emerald-300">Live now</p>}
                            <button
                              onClick={() => { onJoinMeeting(meeting.id); go('Live Meeting'); }}
                              className={cx(ui.btnSubtle, 'mt-2')}
                            >
                              <Video className="h-4 w-4" /> Join room
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={ui.card}>
                  <p className="text-slate-400">No live classes scheduled yet. Start an instant class or save the weekly Saturday and Sunday schedule.</p>
                </div>
              )}
            </div>
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

function LessonManagerAdmin({
  lessons,
  lessonComments,
  selectedLesson,
  selectedLessonId,
  onSelectLesson,
  onCreateLesson,
  onEditLesson,
  onUpdateComment,
  onDeleteComment,
}: {
  lessons: LessonRecord[];
  lessonComments: LessonComment[];
  selectedLesson?: LessonRecord;
  selectedLessonId: string;
  onSelectLesson: (id: string) => void;
  onCreateLesson: () => void;
  onEditLesson: (lesson: LessonRecord) => void;
} & CommentMutationHandlers) {
  const selectedVideoUrl = selectedLesson ? getLessonVideoUrl(selectedLesson) : '';
  const selectedPreviewUrl = selectedLesson ? getEmbeddableLessonUrl(selectedVideoUrl, `admin-preview-${selectedLesson.id}`) : '';
  const selectedPreviewIsVimeo = selectedLesson ? isVimeoLessonUrl(selectedVideoUrl) : false;
  const selectedLessonComments = selectedLesson
    ? lessonComments.filter((comment) => comment.lessonId === selectedLesson.id).sort((a, b) => b.createdAt - a.createdAt)
    : [];

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
      <section className={ui.card}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className={ui.eyebrow}>Course lesson library</p>
            <h2 className={cx(ui.h3, 'mt-2')}>{lessons.length} lessons</h2>
          </div>
          <button onClick={onCreateLesson} className={ui.btnPrimary}>
            <Plus className="h-4 w-4" /> Add lesson
          </button>
        </div>

        <div className="max-h-[720px] space-y-6 overflow-y-auto pr-1">
          {modules.map((module, moduleIndex) => {
            const moduleLessons = lessons.filter((lesson) => lesson.moduleIndex === moduleIndex);
            return (
              <div key={module.title} className="border-t border-white/[0.06] pt-5 first:border-t-0 first:pt-0">
                <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-300">{module.title}</p>
                    <h3 className="mt-1 text-base font-bold text-white">{module.name}</h3>
                  </div>
                  <span className={ui.chipMuted}>{moduleLessons.length} lessons</span>
                </div>

                <div className="space-y-2">
                  {moduleLessons.map((lesson) => {
                    const isSelected = lesson.id === selectedLessonId;
                    const commentCount = lessonComments.filter((comment) => comment.lessonId === lesson.id).length;
                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => onSelectLesson(lesson.id)}
                        aria-pressed={isSelected}
                        className={cx(
                          'group flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition',
                          isSelected
                            ? 'border-emerald-300/40 bg-emerald-300/[0.07]'
                            : 'border-white/[0.06] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.05]',
                        )}
                      >
                        <span
                          className={cx(
                            'grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-bold',
                            isSelected ? 'bg-emerald-300 text-slate-950' : 'bg-white/[0.04] text-emerald-300',
                          )}
                        >
                          {lesson.globalIndex + 1}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold text-white">{lesson.title}</span>
                          <span className="mt-1 block truncate text-xs text-slate-500">{lesson.duration} · {lesson.resource}</span>
                        </span>
                        {commentCount > 0 && (
                          <span className={cx('inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold', isSelected ? 'bg-slate-950/10 text-slate-950' : 'bg-emerald-300/10 text-emerald-300')}>
                            <MessageCircle className="h-3 w-3" /> {commentCount}
                          </span>
                        )}
                        <span className={cx('text-xs font-semibold', isSelected ? 'text-emerald-300' : 'text-slate-500 group-hover:text-slate-300')}>
                          View
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <aside className={cx(ui.card, 'self-start xl:sticky xl:top-28')}>
        {selectedLesson ? (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className={ui.eyebrow}>Lesson preview</p>
                <h2 className={cx(ui.h2, 'mt-2 text-2xl sm:text-2xl')}>{selectedLesson.title}</h2>
                <p className={cx(ui.bodySm, 'mt-2')}>
                  Lesson {selectedLesson.globalIndex + 1} · {selectedLesson.moduleTitle} · {selectedLesson.duration}
                </p>
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-300/10 text-emerald-300">
                <PlayCircle className="h-5 w-5" />
              </span>
            </div>

            <div className="mt-5 overflow-hidden rounded-2xl border border-white/[0.08] bg-slate-950">
              <div className="aspect-video bg-black p-2">
                {selectedPreviewIsVimeo ? (
                  <iframe
                    src={selectedPreviewUrl}
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title={`${selectedLesson.title} admin preview`}
                    className="h-full w-full rounded-xl border-0 bg-black"
                  />
                ) : (
                  <video
                    controls
                    className="h-full w-full rounded-xl bg-black"
                    poster="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.jpg"
                  >
                    <source src={selectedPreviewUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
            </div>

            <div className="mt-5 space-y-2">
              <LessonMetaField label="Module" value={selectedLesson.moduleName} />
              <LessonMetaField label="Video URL" value={selectedVideoUrl} mono />
              <LessonMetaField label="Required watch" value={`${selectedLesson.requiredWatchPercentage}%`} />
              <LessonMetaField label="Unlock rule" value="Previous lesson must be completed" />
              <LessonMetaField label="Resource" value={selectedLesson.resource} />
              {selectedLesson.resourceUrl && <LessonMetaField label="Resource URL" value={selectedLesson.resourceUrl} mono />}
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                <p className={ui.eyebrow}>Outcome</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{selectedLesson.outcome}</p>
              </div>
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                <p className={ui.eyebrow}>Practice</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{selectedLesson.practice}</p>
              </div>
            </div>

            <div className="mt-6 border-t border-white/[0.06] pt-5">
              <div className="flex items-center justify-between gap-3">
                <p className={ui.eyebrow}>Lesson comments</p>
                <span className={ui.chipMuted}>{selectedLessonComments.length} comments</span>
              </div>
              <div className="mt-4 max-h-[280px] space-y-2 overflow-y-auto pr-1">
                {selectedLessonComments.length > 0 ? (
                  selectedLessonComments.map((comment) => (
                    <CommentCard
                      key={comment.id}
                      comment={comment}
                      canManage
                      onUpdateComment={onUpdateComment}
                      onDeleteComment={onDeleteComment}
                    />
                  ))
                ) : (
                  <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3 text-sm text-slate-400">
                    No comments for this lesson yet.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => onEditLesson(selectedLesson)} className={ui.btnPrimary}>
                <UploadCloud className="h-4 w-4" /> Replace video URL
              </button>
              <button onClick={() => onEditLesson(selectedLesson)} className={ui.btnGhost}>
                <BookOpen className="h-4 w-4" /> Edit lesson
              </button>
            </div>
          </>
        ) : (
          <div className="text-sm text-slate-400">No lessons found yet. Add your first lesson to start building the course.</div>
        )}
      </aside>
    </div>
  );
}

function LessonMetaField({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className={cx('mt-1 break-words text-sm font-medium text-slate-200', mono && 'font-mono text-xs leading-5')}>{value}</p>
    </div>
  );
}

function StudentDirectory({
  students,
  selectedStudent,
  lessons,
  studentProgressById,
  lessonComments,
  onSelectStudent,
  onCreateStudent,
  onEditStudent,
  onUpdateComment,
  onDeleteComment,
}: {
  students: Student[];
  selectedStudent: Student;
  lessons: LessonRecord[];
  studentProgressById: StudentProgressById;
  lessonComments: LessonComment[];
  onSelectStudent: (id: string) => void;
  onCreateStudent: () => void;
  onEditStudent: (id: string) => void;
} & CommentMutationHandlers) {
  const selectedProgress = getStudentProgress(selectedStudent.id, studentProgressById, lessons);
  const selectedProgressPercent = getCourseProgressPercent(selectedProgress, lessons);
  const selectedComments = lessonComments.filter((comment) => comment.studentId === selectedStudent.id);
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
          <table className="min-w-[860px] w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] uppercase tracking-[0.14em] text-slate-500">
                <th className="py-3 pr-4 font-medium">Student</th>
                <th className="py-3 pr-4 font-medium">Progress</th>
                <th className="py-3 pr-4 font-medium">Comments</th>
                <th className="py-3 pr-4 font-medium">Status</th>
                <th className="py-3 pr-4 font-medium">Last active</th>
                <th className="py-3 pr-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const isSelected = student.id === selectedStudent.id;
                const progress = getStudentProgress(student.id, studentProgressById, lessons);
                const progressPercent = getCourseProgressPercent(progress, lessons);
                const commentCount = lessonComments.filter((comment) => comment.studentId === student.id).length;
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
                        <div className="w-20"><ProgressBar value={progressPercent} /></div>
                        <span className="text-xs font-medium text-slate-400">{progressPercent}%</span>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-slate-400">{commentCount}</td>
                    <td className="py-4 pr-4">
                      <span className={cx('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', student.status === 'Active' ? 'bg-emerald-300/15 text-emerald-300' : 'bg-amber-300/15 text-amber-300')}>
                        {student.status}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-slate-400">{student.lastActive}</td>
                    <td className="py-4 pr-4">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onEditStudent(student.id);
                        }}
                        className={ui.btnSubtle}
                      >
                        Edit
                      </button>
                    </td>
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
          <button onClick={() => onEditStudent(selectedStudent.id)} className={ui.btnSubtle}>Edit</button>
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
            <p className="text-sm font-bold text-white">{selectedProgressPercent}%</p>
          </div>
          <div className="mt-2">
            <ProgressBar value={selectedProgressPercent} height="md" />
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {getCompletedSet(selectedProgress).size} / {lessons.length} lessons completed · {selectedComments.length} comments
          </p>
        </div>

        <StudentActivityDetail
          student={selectedStudent}
          lessons={lessons}
          progress={selectedProgress}
          comments={selectedComments}
          onUpdateComment={onUpdateComment}
          onDeleteComment={onDeleteComment}
        />
      </aside>
    </div>
  );
}

function StudentActivityDetail({
  student,
  lessons,
  progress,
  comments,
  onUpdateComment,
  onDeleteComment,
}: {
  student: Student;
  lessons: LessonRecord[];
  progress: LearningProgress;
  comments: LessonComment[];
} & CommentMutationHandlers) {
  const completed = getCompletedSet(progress);
  const lessonTitleById = new Map(lessons.map((lesson) => [lesson.id, lesson.title]));
  const activeLessons = lessons.filter((lesson) => completed.has(lesson.id) || (progress.watchProgressByLessonId[lesson.id] || 0) > 0);
  const recentComments = [...comments].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="mt-6 space-y-6 border-t border-white/[0.06] pt-6">
      <section>
        <div className="flex items-center justify-between gap-3">
          <p className={ui.eyebrow}>Lesson activity</p>
          <span className={ui.chipMuted}>{activeLessons.length} started</span>
        </div>
        <div className="mt-4 max-h-[280px] space-y-2 overflow-y-auto pr-1">
          {activeLessons.length > 0 ? (
            activeLessons.map((lesson) => {
              const watchPercent = completed.has(lesson.id) ? 100 : progress.watchProgressByLessonId[lesson.id] || 0;
              const status = completed.has(lesson.id) ? 'Completed' : 'Watching';
              return (
                <div key={lesson.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 flex-1 text-sm font-medium text-white">{lesson.title}</p>
                    <span className={cx('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold', status === 'Completed' ? 'bg-emerald-300/15 text-emerald-300' : 'bg-amber-300/15 text-amber-300')}>
                      {status}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1"><ProgressBar value={watchPercent} /></div>
                    <span className="text-xs font-medium text-slate-400">{watchPercent}%</span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3 text-sm text-slate-400">
              {student.name} has not started any lesson yet.
            </p>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between gap-3">
          <p className={ui.eyebrow}>Comments</p>
          <span className={ui.chipMuted}>{recentComments.length} total</span>
        </div>
        <div className="mt-4 max-h-[260px] space-y-2 overflow-y-auto pr-1">
          {recentComments.length > 0 ? (
            recentComments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                contextLabel={lessonTitleById.get(comment.lessonId) || 'Unknown lesson'}
                canManage
                onUpdateComment={onUpdateComment}
                onDeleteComment={onDeleteComment}
              />
            ))
          ) : (
            <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3 text-sm text-slate-400">
              No comments from this student yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function StudentActivityReport({
  students,
  lessons,
  studentProgressById,
  lessonComments,
  onUpdateComment,
  onDeleteComment,
}: {
  students: Student[];
  lessons: LessonRecord[];
  studentProgressById: StudentProgressById;
  lessonComments: LessonComment[];
} & CommentMutationHandlers) {
  const lessonTitleById = new Map(lessons.map((lesson) => [lesson.id, lesson.title]));
  const progressRows = students.map((student) => {
    const progress = getStudentProgress(student.id, studentProgressById, lessons);
    return {
      student,
      progress,
      progressPercent: getCourseProgressPercent(progress, lessons),
      completedCount: getCompletedSet(progress).size,
      commentCount: lessonComments.filter((comment) => comment.studentId === student.id).length,
      currentLesson: getCurrentLesson(progress, lessons),
    };
  });
  const averageProgress = progressRows.length
    ? Math.round(progressRows.reduce((total, row) => total + row.progressPercent, 0) / progressRows.length)
    : 0;
  const latestComments = [...lessonComments].sort((a, b) => b.createdAt - a.createdAt).slice(0, 8);
  const commentsByLesson = lessons
    .map((lesson) => ({
      lesson,
      comments: lessonComments
        .filter((comment) => comment.lessonId === lesson.id)
        .sort((a, b) => b.createdAt - a.createdAt),
    }))
    .filter((item) => item.comments.length > 0);

  return (
    <div className="space-y-6">
      <section className="grid gap-3 md:grid-cols-3">
        <ActivityMetric label="Average progress" value={`${averageProgress}%`} />
        <ActivityMetric label="Completed lessons" value={`${progressRows.reduce((total, row) => total + row.completedCount, 0)}`} />
        <ActivityMetric label="Student comments" value={`${lessonComments.length}`} />
      </section>

      <section className={ui.card}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className={ui.eyebrow}>Student progress</p>
            <h2 className={cx(ui.h3, 'mt-2')}>Lesson watch report</h2>
          </div>
          <span className={ui.chipMuted}>{lessons.length} lessons</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[820px] w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] uppercase tracking-[0.14em] text-slate-500">
                <th className="py-3 pr-4 font-medium">Student</th>
                <th className="py-3 pr-4 font-medium">Progress</th>
                <th className="py-3 pr-4 font-medium">Completed</th>
                <th className="py-3 pr-4 font-medium">Current lesson</th>
                <th className="py-3 pr-4 font-medium">Comments</th>
              </tr>
            </thead>
            <tbody>
              {progressRows.map((row) => (
                <tr key={row.student.id} className="border-b border-white/[0.04]">
                  <td className="py-4 pr-4">
                    <p className="font-medium text-white">{row.student.name}</p>
                    <p className="text-xs text-slate-500">{row.student.email}</p>
                  </td>
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24"><ProgressBar value={row.progressPercent} /></div>
                      <span className="text-xs font-medium text-slate-400">{row.progressPercent}%</span>
                    </div>
                  </td>
                  <td className="py-4 pr-4 text-slate-300">{row.completedCount} / {lessons.length}</td>
                  <td className="max-w-[260px] truncate py-4 pr-4 text-slate-400">{row.currentLesson?.title || 'Not started'}</td>
                  <td className="py-4 pr-4 text-slate-300">{row.commentCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={ui.card}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className={ui.eyebrow}>Latest comments</p>
            <h2 className={cx(ui.h3, 'mt-2')}>Student questions and notes</h2>
          </div>
          <span className={ui.chipMuted}>{latestComments.length} recent</span>
        </div>
        <div className="space-y-3">
          {latestComments.length > 0 ? (
            latestComments.map((comment) => (
              <CommentCard
                key={comment.id}
                comment={comment}
                contextLabel={lessonTitleById.get(comment.lessonId) || 'Unknown lesson'}
                canManage
                onUpdateComment={onUpdateComment}
                onDeleteComment={onDeleteComment}
              />
            ))
          ) : (
            <p className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-sm text-slate-400">
              No student comments yet.
            </p>
          )}
        </div>
      </section>

      <section className={ui.card}>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className={ui.eyebrow}>Comments by lesson</p>
            <h2 className={cx(ui.h3, 'mt-2')}>Video-specific comments</h2>
          </div>
          <span className={ui.chipMuted}>{commentsByLesson.length} lessons</span>
        </div>
        <div className="space-y-4">
          {commentsByLesson.length > 0 ? (
            commentsByLesson.map(({ lesson, comments }) => (
              <div key={lesson.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Lesson {lesson.globalIndex + 1}</p>
                    <h3 className="mt-1 text-base font-bold text-white">{lesson.title}</h3>
                  </div>
                  <span className={ui.chipMuted}>{comments.length} comments</span>
                </div>
                <div className="mt-4 space-y-2">
                  {comments.map((comment) => (
                    <CommentCard
                      key={comment.id}
                      comment={comment}
                      canManage
                      onUpdateComment={onUpdateComment}
                      onDeleteComment={onDeleteComment}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-sm text-slate-400">
              No lesson-specific comments yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function ActivityMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className={ui.cardSubtle}>
      <p className="font-serif text-3xl font-bold text-white">{value}</p>
      <p className="mt-1 text-sm font-semibold text-slate-400">{label}</p>
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
  fieldOptions,
  onCancel,
  onSave,
}: {
  section: string;
  actionName: string;
  initialValues?: Record<string, string>;
  fieldOptions?: Record<string, string[]>;
  onCancel: () => void;
  onSave: (values: Record<string, string>) => void;
}) {
  const fields =
    ({
      Students: ['Student name', 'Email address', 'Temporary password', 'Assigned course'],
      Courses: ['Course title', 'Level', 'Short description', 'Publish status'],
      Modules: ['Module title', 'Course', 'Sort order', 'Unlock rule'],
      Lessons: ['Lesson title', 'Vimeo embed URL', 'Required watch percentage', 'Attached resource', 'Resource file URL'],
      Quizzes: ['Quiz title', 'Passing score', 'Max attempts', 'Question type'],
      Assignments: ['Assignment title', 'Due date', 'Submission type', 'Unlock behavior'],
      Meetings: ['Meeting title', 'Date and time', 'Host', 'Recording access'],
      Reports: ['Report type', 'Date range', 'Student group', 'Export format'],
      Settings: ['Platform name', 'Theme color', 'Default pass score', 'Default watch percentage'],
      Dashboard: ['Student name', 'Email address', 'Assigned course', 'Access expiry date'],
    } as Record<string, string[]>)[section] || ['Title', 'Description', 'Status', 'Owner'];

  const isEditing = actionName.toLowerCase().startsWith('edit');
  const submitLabel = isEditing ? 'Save changes' : section === 'Students' ? 'Create account' : section === 'Lessons' ? 'Add lesson' : 'Save preview';
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const values = Object.fromEntries(fields.map((field) => [field, String(data.get(field) || '')]));
    onSave(values);
  };

  return (
    <form onSubmit={handleSubmit} className={cx(ui.card, 'border-emerald-300/20')}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className={ui.eyebrow}>{isEditing ? 'Edit' : 'Create'}</p>
          <h2 className={cx(ui.h3, 'mt-2')}>{actionName}</h2>
        </div>
        <button type="button" onClick={onCancel} className={ui.btnSubtle}>Close</button>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {fields.map((field) => {
          const isPassword = field.toLowerCase().includes('password');
          const preset = initialValues?.[field] ?? '';
          const options = fieldOptions?.[field];
          return (
            <label key={field} className="block">
              <span className="text-xs font-semibold text-slate-400">{field}</span>
              {options ? (
                <select
                  name={field}
                  defaultValue={preset || options[0]}
                  className="mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none focus:border-emerald-300/40"
                >
                  {options.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <input
                  name={field}
                  type={isPassword ? 'password' : 'text'}
                  defaultValue={preset}
                  className="mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-300/40"
                  placeholder={
                    isEditing && isPassword
                      ? 'Leave blank to keep current'
                      : `Enter ${field.toLowerCase()}`
                  }
                />
              )}
            </label>
          );
        })}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="submit" className={ui.btnPrimary}>
          {submitLabel}
        </button>
        <button type="button" onClick={onCancel} className={ui.btnGhost}>Cancel</button>
      </div>
    </form>
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

function LoginPage({ login }: { login: (request: LoginRequest) => LoginResult }) {
  const [loginRole, setLoginRole] = useState<'student' | 'admin'>('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const submitLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = login({ role: loginRole, username, password });
    setMessage(result.message || '');
  };

  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <div className="mb-6 flex justify-center">
            <LogoMark size="md" />
          </div>
          <h1 className="font-serif text-3xl font-bold leading-tight text-white sm:text-4xl">
            Sign in to your learning space
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            Use the account assigned to you.
          </p>
        </div>

        <form onSubmit={submitLogin} className={cx(ui.card, 'space-y-5')}>
          <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-1">
            {(['student', 'admin'] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => { setLoginRole(item); setMessage(''); }}
                className={cx(
                  'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold capitalize transition',
                  loginRole === item ? 'bg-emerald-300 text-slate-950' : 'text-slate-400 hover:bg-white/[0.05] hover:text-white',
                )}
              >
                {item === 'student' ? <GraduationCap className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                {item}
              </button>
            ))}
          </div>

          <label className="block">
            <span className="text-xs font-semibold text-slate-400">Email / Username</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              type="email"
              autoComplete="username"
              className="mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-300/40"
              placeholder="Enter your email"
            />
          </label>

          <label className="block">
            <span className="text-xs font-semibold text-slate-400">Password</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete="current-password"
              className="mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-300/40"
              placeholder="Enter password"
            />
          </label>

          {message && (
            <div className="rounded-xl border border-amber-300/30 bg-amber-300/5 px-4 py-3 text-sm font-medium text-amber-200">
              {message}
            </div>
          )}

          <button type="submit" className={cx(ui.btnPrimary, 'w-full')}>
            Sign in <ArrowRight className="h-4 w-4" />
          </button>

          <p className="text-center text-xs leading-5 text-slate-500">
            Student access is available only after the admin creates the account.
          </p>
        </form>
      </div>
    </div>
  );
}

// =====================================================================
// Root App
// =====================================================================

export default function App() {
  const [active, setActive] = useState<PageName>(() => getNextPage(readHashPage(), false, null));
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<Role>(null);
  const [liveMeetings, setLiveMeetings] = useState<LiveClassMeeting[]>(() => readStoredMeetings());
  const [activeMeetingId, setActiveMeetingId] = useState<string | null>(null);
  const [lessons, setLessons] = useState<LessonRecord[]>(() => readStoredLessons());
  const [students, setStudents] = useState<Student[]>(() => readStoredStudents());
  const [currentStudentId, setCurrentStudentId] = useState<string | null>(null);
  const [lessonComments, setLessonComments] = useState<LessonComment[]>(() => readStoredLessonComments());
  const [deletedLessonCommentIds, setDeletedLessonCommentIds] = useState<string[]>(() => readStoredDeletedLessonCommentIds());
  const [studentProgressById, setStudentProgressById] = useState<StudentProgressById>(() => readStoredStudentProgress(lessons));
  const [learningProgress, setLearningProgress] = useState<LearningProgress>(() => readStoredLearningProgress(lessons));
  const currentStudent = students.find((student) => student.id === currentStudentId) || null;

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

  useEffect(() => {
    window.localStorage.setItem(meetingStorageKey, JSON.stringify(liveMeetings));
  }, [liveMeetings]);

  useEffect(() => {
    window.localStorage.setItem(studentStorageKey, JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    window.localStorage.setItem(deletedLessonCommentStorageKey, JSON.stringify(deletedLessonCommentIds));
  }, [deletedLessonCommentIds]);

  useEffect(() => {
    let mounted = true;
    const syncStoredActivity = async () => {
      const localComments = readStoredLessonComments();
      const localProgressById = readStoredStudentProgress(lessons);
      const [firebaseComments, firebaseProgressById, supabaseComments, supabaseProgressById] = await Promise.all([
        fetchFirebaseLessonComments(),
        fetchFirebaseStudentProgress(lessons),
        fetchSupabaseLessonComments(),
        fetchSupabaseStudentProgress(lessons),
      ]);
      if (!mounted) return;
      const deletedIds = new Set(deletedLessonCommentIds);
      const nextComments = mergeLessonComments(localComments, firebaseComments, supabaseComments)
        .filter((comment) => !deletedIds.has(comment.id));
      const nextProgressById = mergeStudentProgress(
        mergeStudentProgress(localProgressById, firebaseProgressById, lessons),
        supabaseProgressById,
        lessons,
      );
      setLessonComments((prev) => (isJsonEqual(prev, nextComments) ? prev : nextComments));
      setStudentProgressById((prev) => (isJsonEqual(prev, nextProgressById) ? prev : nextProgressById));
    };
    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === lessonCommentStorageKey
        || event.key === deletedLessonCommentStorageKey
        || event.key === studentProgressStorageKey
        || event.key === null
      ) {
        if (event.key === deletedLessonCommentStorageKey || event.key === null) {
          setDeletedLessonCommentIds(readStoredDeletedLessonCommentIds());
        }
        void syncStoredActivity();
      }
    };
    const handleVisibilityChange = () => {
      if (!document.hidden) void syncStoredActivity();
    };
    void syncStoredActivity();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', syncStoredActivity);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    const timer = window.setInterval(syncStoredActivity, 5000);
    return () => {
      mounted = false;
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', syncStoredActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.clearInterval(timer);
    };
  }, [deletedLessonCommentIds, lessons]);

  useEffect(() => {
    window.localStorage.setItem(lessonCommentStorageKey, JSON.stringify(lessonComments));
    lessonComments.forEach((comment) => {
      void saveLessonCommentToFirebase(comment);
      void saveLessonCommentToSupabase(comment);
    });
  }, [lessonComments]);

  useEffect(() => {
    window.localStorage.setItem(studentProgressStorageKey, JSON.stringify(studentProgressById));
    Object.entries(studentProgressById).forEach(([studentId, progress]) => {
      void saveStudentProgressToFirebase(studentId, progress);
      void saveStudentProgressToSupabase(studentId, progress);
    });
  }, [studentProgressById]);

  useEffect(() => {
    window.localStorage.setItem(lessonStorageKey, JSON.stringify(lessons));
    setLearningProgress((prev) => sanitizeLearningProgress(prev, lessons));
    setStudentProgressById((prev) => sanitizeStudentProgressById(prev, lessons));
  }, [lessons]);

  useEffect(() => {
    window.localStorage.setItem(learningStorageKey, JSON.stringify(learningProgress));
    if (!currentStudentId) return;
    const sanitized = sanitizeLearningProgress(learningProgress, lessons);
    setStudentProgressById((prev) => (
      isSameLearningProgress(prev[currentStudentId], sanitized)
        ? prev
        : { ...prev, [currentStudentId]: sanitized }
    ));
  }, [learningProgress, currentStudentId, lessons]);

  const updateLessonComment = (commentId: string, text: string) => {
    const nextText = text.trim();
    if (!nextText) return;
    setLessonComments((prev) => prev.map((comment) => (
      comment.id === commentId ? { ...comment, text: nextText } : comment
    )));
  };

  const deleteLessonComment = (commentId: string) => {
    setDeletedLessonCommentIds((prev) => (prev.includes(commentId) ? prev : [...prev, commentId]));
    setLessonComments((prev) => prev.filter((comment) => comment.id !== commentId));
    void deleteLessonCommentFromFirebase(commentId);
    void deleteLessonCommentFromSupabase(commentId);
  };

  const go = (page: PageName) => {
    const next = getNextPage(page, isLoggedIn, role);
    setActive(next);
  };

  const login = ({ role: loginRole, username, password }: LoginRequest): LoginResult => {
    const normalizedUsername = username.trim().toLowerCase();
    if (!normalizedUsername || !password) {
      return { ok: false, message: 'Please enter username and password.' };
    }

    if (
      loginRole === 'admin'
      && normalizedUsername === serverAuthCredentials.admin.username
      && password === serverAuthCredentials.admin.password
    ) {
      setIsLoggedIn(true);
      setRole('admin');
      setCurrentStudentId(null);
      setActive('Admin Panel');
      return { ok: true };
    }

    if (loginRole === 'student') {
      const student = students.find((item) => item.email.toLowerCase() === normalizedUsername && item.password === password && item.status === 'Active');
      if (student) {
        setLearningProgress(studentProgressById[student.id] || readStoredLearningProgress(lessons));
        setIsLoggedIn(true);
        setRole('student');
        setCurrentStudentId(student.id);
        setActive('Student Dashboard');
        return { ok: true };
      }
      return { ok: false, message: 'Student account not found. Please ask admin to create or activate your account.' };
    }

    return { ok: false, message: 'Invalid admin username or password.' };
  };

  const logout = () => {
    setIsLoggedIn(false);
    setRole(null);
    setCurrentStudentId(null);
    setActive('Home');
  };

  return (
    <Shell active={active} go={go} isLoggedIn={isLoggedIn} role={role} onLogout={logout}>
      {active === 'Home' && <HomePage go={go} />}
      {active === 'Courses' && <CoursesPage go={go} />}
      {active === 'Learning Path' && <LearningPathPage go={go} />}
      {active === 'Course Detail' && <CourseDetailPage go={go} />}
      {active === 'Admin Panel' && <AdminPanelPage go={go} meetings={liveMeetings} setMeetings={setLiveMeetings} onJoinMeeting={setActiveMeetingId} lessons={lessons} setLessons={setLessons} students={students} setStudents={setStudents} studentProgressById={studentProgressById} lessonComments={lessonComments} onUpdateComment={updateLessonComment} onDeleteComment={deleteLessonComment} />}
      {active === 'Student Dashboard' && <StudentDashboardPage go={go} learningProgress={learningProgress} lessons={lessons} />}
      {active === 'Lesson Player' && <LessonPlayerPage go={go} learningProgress={learningProgress} setLearningProgress={setLearningProgress} lessons={lessons} currentStudent={currentStudent} lessonComments={lessonComments} setLessonComments={setLessonComments} onUpdateComment={updateLessonComment} onDeleteComment={deleteLessonComment} />}
      {active === 'Quiz' && <QuizPage go={go} />}
      {active === 'Assignments' && <AssignmentsPage go={go} />}
      {active === 'Resources' && <ResourcesPage go={go} />}
      {active === 'Reports' && <ReportsPage go={go} students={students} lessons={lessons} studentProgressById={studentProgressById} lessonComments={lessonComments} onUpdateComment={updateLessonComment} onDeleteComment={deleteLessonComment} />}
      {active === 'Live Meeting' && <LiveMeetingPage go={go} meetings={liveMeetings} initialMeetingId={activeMeetingId} />}
      {active === 'Login' && <LoginPage login={login} />}
    </Shell>
  );
}
