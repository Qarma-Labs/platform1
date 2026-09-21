import type {
  CourseDetail as ApiCourseDetail,
  CourseSummary,
} from '@workspace/api-client-react';

export type CourseType = 'workshop' | 'ai';
export type Lesson = { title: string; duration: string; freePreview: boolean };
export type Section = { title: string; lessons: Lesson[] };
export type Course = {
  /** Backend GUID; absent on bundled mock entries. */
  id?: string;
  slug: string;
  title: string;
  type: CourseType;
  description: string;
  instructor: string;
  instructorRole: string;
  duration: string;
  level: string;
  /** Major units (e.g. whole TZS) for display. */
  price: number;
  rating: number;
  students: number;
  image: string;
  mark: string;
  sections: Section[];
};

/** Backend stores money in minor units (cents); TZS displays in shillings. */
export function minorToMajor(minor: number): number {
  return Math.round(minor / 100);
}

/** Format major units (whole TZS) for display. */
export function money(valueMajor: number): string {
  return `TZS ${valueMajor.toLocaleString('en-TZ')}`;
}

function uiType(apiType: string, tags: string[]): CourseType {
  if (apiType === 'workshop') return 'workshop';
  // Self-paced courses currently run on the AI track (see tags).
  if (apiType === 'self_paced' || tags.includes('ai')) return 'ai';
  return 'workshop';
}

function levelLabel(level: string): string {
  if (level === 'beginner') return 'Starter';
  if (level === 'advanced') return 'Advanced';
  if (level === 'intermediate') return 'Intermediate';
  return level;
}

function lessonDuration(durationSec: number): string {
  const totalMin = Math.max(1, Math.round(durationSec / 60));
  if (totalMin < 60) return `${totalMin} min`;
  return `${Math.floor(totalMin / 60)}h ${totalMin % 60}m`;
}

function totalDuration(sections: { lessons: { durationSec: number }[] }[]): string {
  const totalSec = sections.reduce(
    (sum, s) => sum + s.lessons.reduce((l, x) => l + x.durationSec, 0),
    0,
  );
  const totalMin = Math.round(totalSec / 60);
  if (totalMin < 60) return `${totalMin}m`;
  return `${Math.floor(totalMin / 60)}h ${totalMin % 60}m`;
}

const ART: Record<string, { image: string; mark: string }> = {
  'sell-on-instagram': { image: 'coral', mark: '01' },
  'ai-for-real-work': { image: 'teal', mark: 'AI' },
  'phone-photography': { image: 'gold', mark: '02' },
  'design-with-canva': { image: 'ink', mark: '03' },
  'no-code-website-weekend': { image: 'code', mark: '04' },
  'ai-for-content-creators': { image: 'teal', mark: 'AI' },
};

export function artFor(slug: string): { image: string; mark: string } {
  return ART[slug] ?? { image: 'ink', mark: '•' };
}

function ratingOf(value: number | string): number {
  const n = typeof value === 'string' ? Number.parseFloat(value) : value;
  return Number.isFinite(n) ? n : 0;
}

/** List shape → card shape (no curriculum on summaries). */
export function toUiCourse(s: CourseSummary): Course {
  const art = artFor(s.slug);
  return {
    id: s.id,
    slug: s.slug,
    title: s.title,
    type: uiType(s.type, s.tags),
    description: s.subtitle ?? '',
    instructor: s.instructorName,
    instructorRole: '',
    duration: '',
    level: levelLabel(s.level),
    price: minorToMajor(s.price),
    rating: ratingOf(s.ratingAvg),
    students: s.enrollmentCount,
    image: art.image,
    mark: art.mark,
    sections: [],
  };
}

/** Detail shape → full page shape, curriculum included. */
export function toUiCourseDetail(d: ApiCourseDetail): Course {
  const art = artFor(d.slug);
  const sections: Section[] = d.curriculum.map((s) => ({
    title: s.title,
    lessons: s.lessons.map((l) => ({
      title: l.title,
      duration: lessonDuration(l.durationSec),
      freePreview: l.isPreview,
    })),
  }));
  return {
    id: d.id,
    slug: d.slug,
    title: d.title,
    type: uiType(d.type, d.tags),
    description: d.description ?? d.subtitle ?? '',
    instructor: d.instructorName,
    instructorRole: '',
    duration: totalDuration(d.curriculum),
    level: levelLabel(d.level),
    price: minorToMajor(d.price),
    rating: ratingOf(d.ratingAvg),
    students: d.enrollmentCount,
    image: art.image,
    mark: art.mark,
    sections,
  };
}
