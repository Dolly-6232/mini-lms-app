import { OptimizedCourseList } from '@/components/OptimizedCourseList';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleBookmarkAsync } from '@/store/slices/coursesSlice';
import { colors, createStyles, fontSize, spacing } from '@/utils/styles';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Text,
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
});

export default function BookmarksScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state: any) => state.auth) as any;
  const bookmarkedCourses = useAppSelector((state: any) => {
    const { courses, bookmarks } = state.courses;
    return (courses || []).filter((course: any) => (bookmarks || []).includes(course.id));
  });

  useEffect(() => {
    // Courses are loaded in the tabs layout
  }, []);

  const handleCoursePress = (course: any) => {
    router.push(`/course/${course.id}` as any);
  };

  const handleBookmark = (courseId: string) => {
    dispatch(toggleBookmarkAsync(courseId));
  };

  if (authState.isLoading) {
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
        <Text style={styles.title}>My Bookmarks</Text>
      </View>

      <OptimizedCourseList
        courses={bookmarkedCourses}
        refreshing={false}
        onRefresh={() => {}}
        onCoursePress={handleCoursePress}
        onBookmark={handleBookmark}
      />
    </LinearGradient>
  );
}
