import { borderRadius, colors, createStyles, fontSize, spacing } from '@/utils/styles';
import { Image } from 'expo-image';
import React, { memo } from 'react';
import {
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const styles = createStyles({
  courseCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden' as const,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  courseImage: {
    width: '100%' as const,
    height: 150,
    backgroundColor: colors.gray[200],
  },
  courseContent: {
    padding: spacing.md,
  },
  courseTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600' as const,
    color: colors.gray[900],
    marginBottom: spacing.sm,
  },
  courseInstructor: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    marginBottom: spacing.sm,
  },
  courseDescription: {
    fontSize: fontSize.sm,
    color: colors.gray[700],
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  courseFooter: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  coursePrice: {
    fontSize: fontSize.lg,
    fontWeight: 'bold' as const,
    color: colors.primary[600],
  },
  bookmarkButton: {
    padding: spacing.sm,
  },
});

interface CourseCardProps {
  course: any;
  onPress: (course: any) => void;
  onBookmark: (courseId: string) => void;
}

const CourseCardComponent: React.FC<CourseCardProps> = ({ course, onPress, onBookmark }) => {
  return (
    <TouchableOpacity
      style={styles.courseCard}
      onPress={() => onPress(course)}
    >
      <Image
        source={{ uri: course.thumbnail }}
        style={styles.courseImage}
        contentFit="cover"
        placeholder={`https://picsum.photos/400/200?random=${course.id}`}
        placeholderContentFit="cover"
      />
      <View style={styles.courseContent}>
        <Text style={styles.courseTitle} numberOfLines={2}>
          {course.title || 'Course Title'}
        </Text>
        <Text style={styles.courseInstructor}>
          by {course.instructor?.name || 'Instructor'}
        </Text>
        <Text style={styles.courseDescription} numberOfLines={3}>
          {course.description || 'Course description goes here...'}
        </Text>
        <View style={styles.courseFooter}>
          <Text style={styles.coursePrice}>
            ${course.price || '99'}
          </Text>
          <TouchableOpacity
            style={styles.bookmarkButton}
            onPress={() => onBookmark(course.id)}
          >
            <Text style={{ fontSize: 20 }}>
              {course.isBookmarked ? '🔖' : '📚'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const CourseCard = memo(CourseCardComponent, (prevProps, nextProps) => {
  return (
    prevProps.course.id === nextProps.course.id &&
    prevProps.course.isBookmarked === nextProps.course.isBookmarked &&
    prevProps.course.isEnrolled === nextProps.course.isEnrolled
  );
});
