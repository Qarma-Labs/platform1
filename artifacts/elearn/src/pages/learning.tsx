import { Link } from 'wouter';
import { ArrowRight, BookOpen } from 'lucide-react';
import type { Enrollment } from '@workspace/api-client-react';
import { useAuth } from '@/hooks/use-auth';
import { Footer, Header } from '@/components/site-chrome';
import { useCourses } from '@/hooks/use-catalog';
import { useMyEnrollments } from '@/hooks/use-learning';
import { mockCourses } from '@/lib/mock-catalog';
import { artFor, type Course } from '@/lib/catalog';

export default function LearningPage() {
  const { status } = useAuth();
  const { enrollments, isLoading: enrollmentsLoading } = useMyEnrollments();
  const { courses: catalog } = useCourses({ limit: 100 }, mockCourses);

  if (status === 'loading' || enrollmentsLoading) {
    return (
      <div className="app-shell">
      <Header />
        <main>
          <section className="container-wide">
            <p data-testid="status-learning-loading">Loading your learning…</p>
          </section>
        </main>
      <Footer />
      </div>
    );
  }

  if (status !== 'authed') {
    return (
      <div className="app-shell">
      <Header />
        <main>
          <section className="container-wide">
            <p className="eyebrow">My learning</p>
            <h1 className="display">Log in to see your courses.</h1>
            <Link href="/login?next=/learning" className="button button-primary" data-testid="link-learning-login">
              Log in <ArrowRight size={16} />
            </Link>
          </section>
        </main>
      <Footer />
      </div>
    );
  }

  const byId = new Map<string, Course>();
  for (const c of catalog) {
    if (c.id) byId.set(c.id, c);
  }

  return (
    <div className="app-shell">
      <Header />
      <main>
        <section className="container-wide">
          <p className="eyebrow">My learning</p>
          <h1 className="display">Keep going.</h1>
          {enrollments.length === 0 ? (
            <div className="empty-state" data-testid="status-no-enrollments">
              <BookOpen size={26} />
              <h3>No enrollments yet.</h3>
              <p>When you enroll in a course, it will live here.</p>
              <Link href="/courses" className="button button-ghost" data-testid="link-browse-courses">
                Browse courses
              </Link>
            </div>
          ) : (
            <div className="course-grid" data-testid="list-enrollments">
              {enrollments.map((e) => (
                <EnrollmentCard
                  key={e.id ?? e.courseId}
                  enrollment={e}
                  course={e.courseId ? byId.get(e.courseId) : undefined}
                />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}

function EnrollmentCard({ enrollment, course }: { enrollment: Enrollment; course: Course | undefined }) {
  const title = course?.title ?? 'Course';
  const slug = course?.slug;
  const art = artFor(slug ?? '');
  return (
    <div className="course-card" data-testid={`card-enrollment-${enrollment.courseId}`}>
      <div className={`course-art art-${art.image}`}>
        <span className="art-mark">{art.mark}</span>
        <h3>{title}</h3>
      </div>
      <div className="course-body">
        <p className="course-description">
          Enrolled
          {enrollment.createdAt ? ` on ${new Date(enrollment.createdAt).toLocaleDateString('en-TZ')}` : ''}.
          {course ? ` Taught by ${course.instructor}.` : ''}
        </p>
        <div className="course-footer">
          <span className="rating">Enrolled</span>
          {slug && (
            <Link
              href={`/courses/${slug}`}
              className="button button-ghost button-small"
              data-testid={`link-continue-${slug}`}
            >
              Continue <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
