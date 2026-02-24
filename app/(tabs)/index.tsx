import { OptimizedCourseList } from '@/components/OptimizedCourseList';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loadCoursesAsync, setSearchQuery, toggleBookmarkAsync } from '@/store/slices/coursesSlice';
import { borderRadius, colors, createStyles, fontSize, spacing } from '@/utils/styles';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Text,
  TextInput,
  View
} from 'react-native';

const styles = createStyles({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: 'bold' as const,
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.base,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  errorText: {
    fontSize: fontSize.base,
    color: colors.error,
    textAlign: 'center' as const,
    margin: spacing.lg,
  },
});

export default function CoursesScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const coursesState = useAppSelector((state: any) => state.courses) as any;
  const authState = useAppSelector((state: any) => state.auth) as any;
  
  const filteredCourses = React.useMemo(() => {
    const { courses, searchQuery } = coursesState;
    if (!searchQuery?.trim()) {
      return courses || [];
    }
    
    const lowercaseQuery = searchQuery.toLowerCase();
    return (courses || []).filter(
      (course: any) =>
        course.title?.toLowerCase().includes(lowercaseQuery) ||
        course.description?.toLowerCase().includes(lowercaseQuery) ||
        course.instructor?.name?.toLowerCase().includes(lowercaseQuery) ||
        course.category?.toLowerCase().includes(lowercaseQuery)
    );
  }, [coursesState.courses, coursesState.searchQuery]);
  
  const isLoading = coursesState.isLoading || false;
  const error = coursesState.error;
  const searchQuery = coursesState.searchQuery || '';

  useEffect(() => {
    // Courses are loaded in the tabs layout, but we can reload if needed
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(loadCoursesAsync()).unwrap();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const handleCoursePress = (course: any) => {
    router.push(`/course/${course.id}` as any);
  };

  const handleBookmark = (courseId: string) => {
    dispatch(toggleBookmarkAsync(courseId));
  };

  const handleSearch = (query: string) => {
    dispatch(setSearchQuery(query));
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[colors.primary[50], colors.gray[50]]}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Discover Courses</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search courses, instructors..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <OptimizedCourseList
          courses={filteredCourses}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onCoursePress={handleCoursePress}
          onBookmark={handleBookmark}
          searchQuery={searchQuery}
        />
      )}
    </LinearGradient>
  );
}
