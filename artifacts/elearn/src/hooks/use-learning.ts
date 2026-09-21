import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listMyEnrollments } from '@workspace/api-client-react';
import type { Enrollment } from '@workspace/api-client-react';
import { useAuth } from '@/hooks/use-auth';

/**
 * The signed-in user's enrollments. Disabled while anonymous.
 * Scalar-first reads (see use-catalog): never narrow the query object.
 */
export function useMyEnrollments(): {
  enrollments: Enrollment[];
  enrolledCourseIds: Set<string>;
  isLoading: boolean;
  refetch: () => void;
} {
  const { status } = useAuth();
  const query = useQuery<Enrollment[], Error>({
    queryKey: ['me', 'enrollments'],
    queryFn: () => listMyEnrollments(),
    enabled: status === 'authed',
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
  const data = query.data;
  const isError = query.isError;
  const isPending = query.isPending;
  return useMemo(() => {
    const enrollments = isError || !data ? [] : data.filter((e) => e.status === 'active');
    const enrolledCourseIds = new Set(
      enrollments.map((e) => e.courseId).filter((id): id is string => !!id),
    );
    return {
      enrollments,
      enrolledCourseIds,
      isLoading: status === 'authed' && isPending,
      refetch: () => {
        void query.refetch();
      },
    };
  }, [data, isError, isPending, status, query]);
}
