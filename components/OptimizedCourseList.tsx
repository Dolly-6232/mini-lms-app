import React, { useCallback, useMemo } from 'react';
import { View, Text, RefreshControl, ActivityIndicator } from 'react-native';
import { LegendList } from '@legendapp/list';
import { CourseCard } from './CourseCard';
import { createStyles, colors, spacing, fontSize } from '@/utils/styles';

const styles = createStyles({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: fontSize.base,
    color: colors.gray[600],
    textAlign: 'center' as const,
  },
});

interface OptimizedCourseListProps {
  courses: any[];
  refreshing: boolean;
  onRefresh: () => void;
  onCoursePress: (course: any) => void;
  onBookmark: (courseId: string) => void;
  searchQuery?: string;
}

const OptimizedCourseListComponent: React.FC<OptimizedCourseListProps> = ({
  courses,
  refreshing,
  onRefresh,
  onCoursePress,
  onBookmark,
  searchQuery = '',
}) => {
  const handleBookmark = useCallback((courseId: string) => {
    onBookmark(courseId);
  }, [onBookmark]);

  const renderItem = useCallback(({ item }: { item: any }) => {
    return (
      <CourseCard
        course={item}
        onPress={onCoursePress}
        onBookmark={handleBookmark}
      />
    );
  }, [onCoursePress, handleBookmark]);

  const keyExtractor = useCallback((item: any) => {
    return item.id;
  }, []);

  const estimatedItemSize = useMemo(() => {
    // Estimate height based on content
    return 250; // Approximate height of course card
  }, []);

  if (refreshing && courses.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={{ marginTop: spacing.md, color: colors.gray[600] }}>
          Loading courses...
        </Text>
      </View>
    );
  }

  if (courses.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {searchQuery 
            ? `No courses found for "${searchQuery}"` 
            : 'No courses available'
          }
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LegendList
        data={courses}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        estimatedItemSize={estimatedItemSize}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary[600]]}
            tintColor={colors.primary[600]}
          />
        }
        recycleItems={true}
        numColumns={1}
        contentContainerStyle={{
          padding: spacing.md,
        }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export const OptimizedCourseList = React.memo(OptimizedCourseListComponent);
