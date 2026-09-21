import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getCourse,
  getGetCourseQueryKey,
  useListCourses,
  type GetCourseQueryError,
  type GetCourseQueryResult,
} from '@workspace/api-client-react';
import type { ListCoursesParams } from '@workspace/api-client-react';
import {
  toUiCourse,
  toUiCourseDetail,
  type Course,
} from '@/lib/catalog';

export type CatalogSource = 'api' | 'mock';

/**
 * Course list from the API with transparent fallback to the bundled mock
 * catalog when the API is unreachable or still empty. While the first
 * request is in flight the mocks keep the page instant; errors and empty
 * results also fall back so pages never go blank in dev.
 */
export function useCourses(
  params: ListCoursesParams | undefined,
  fallback: Course[],
): { courses: Course[]; source: CatalogSource; isLoading: boolean } {
  const query = useListCourses(params, {
    query: { staleTime: 60_000, retry: 1, refetchOnWindowFocus: false },
  });
  return useMemo(() => {
    const items = query.data?.items;
    const useMock =
      query.isError || (query.isSuccess && (items?.length ?? 0) === 0);
    if (useMock) return { courses: fallback, source: 'mock' as const, isLoading: false };
    return {
      courses: items ? items.map(toUiCourse) : fallback,
      source: 'api' as const,
      isLoading: query.isPending,
    };
  }, [query.data, query.isError, query.isPending, query.isSuccess, fallback]);
}

/** Single course detail from the API, mock fallback by slug. */
export function useCourseDetail(
  slug: string | undefined,
  fallback: Course | undefined,
): { course: Course | undefined; source: CatalogSource; isLoading: boolean } {
  const detailSlug = slug ?? '';
  const query = useQuery<GetCourseQueryResult, GetCourseQueryError>({
    queryKey: getGetCourseQueryKey(detailSlug),
    queryFn: ({ signal }) => getCourse(detailSlug, { signal }),
    enabled: !!slug,
    staleTime: 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
  return useMemo(() => {
    // Read scalars first and never narrow the `query` object itself:
    // narrowing it by `.data`/`.isSuccess` collapses the result union.
    const data = query.data;
    const isError = query.isError;
    const isSuccess = query.isSuccess;
    const isPending = query.isPending;
    if (data)
      return { course: toUiCourseDetail(data), source: 'api' as const, isLoading: false };
    if (isError || (isSuccess && !data))
      return { course: fallback, source: 'mock' as const, isLoading: false };
    return { course: fallback, source: 'api' as const, isLoading: isPending };
  }, [query.data, query.isError, query.isSuccess, query.isPending, fallback]);
}
