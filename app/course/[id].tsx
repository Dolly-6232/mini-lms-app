import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { enrollCourseAsync, selectBookmarks, selectCourses, toggleBookmarkAsync } from '@/store/slices/coursesSlice';
import { borderRadius, colors, createStyles, fontSize, spacing } from '@/utils/styles';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const styles = createStyles({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  courseImage: {
    width: '100%' as const,
    height: 250,
    backgroundColor: colors.gray[200],
  },
  content: {
    padding: spacing.lg,
  },
  courseTitle: {
    fontSize: fontSize['2xl'],
    fontWeight: 'bold' as const,
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  instructorInfo: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: spacing.lg,
  },
  instructorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.gray[200],
    marginRight: spacing.md,
  },
  instructorDetails: {
    flex: 1,
  },
  instructorName: {
    fontSize: fontSize.base,
    fontWeight: '600' as const,
    color: colors.gray[900],
    marginBottom: spacing.xs / 2,
  },
  instructorTitle: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600' as const,
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  description: {
    fontSize: fontSize.base,
    color: colors.gray[700],
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  courseMeta: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    marginBottom: spacing.lg,
  },
  metaItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginRight: spacing.lg,
    marginBottom: spacing.sm,
  },
  metaText: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
    marginLeft: spacing.xs / 2,
  },
  priceContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  price: {
    fontSize: fontSize['2xl'],
    fontWeight: 'bold' as const,
    color: colors.primary[600],
  },
  enrollButton: {
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  enrolledButton: {
    backgroundColor: colors.success,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: '600' as const,
  },
  bookmarkButton: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary[600],
    marginLeft: spacing.md,
  },
  bookmarkButtonText: {
    color: colors.primary[600],
    fontSize: fontSize.base,
    fontWeight: '600' as const,
  },
  bookmarkedButtonText: {
    color: colors.success,
    fontSize: fontSize.base,
    fontWeight: '600' as const,
  },
  actionButtons: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    marginBottom: spacing.lg,
  },
  viewContentButton: {
    backgroundColor: colors.gray[700],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center' as const,
    flex: 1,
    marginRight: spacing.sm,
  },
  viewContentButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: '600' as const,
  },
});

export default function CourseDetailsScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const dispatch = useAppDispatch();
  
  const courses = useAppSelector(selectCourses);
  const bookmarks = useAppSelector(selectBookmarks);

  const courseId = Array.isArray(id) ? id[0] : id;
  const course = courses.find(c => c.id === courseId);

  useEffect(() => {
    // Simulate loading course details
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleEnroll = async () => {
    if (!course) return;

    try {
      console.log('Enrolling in course:', course.id);
      await dispatch(enrollCourseAsync(course.id)).unwrap();
      
      Alert.alert(
        '🎉 Enrollment Successful!', 
        `You have been successfully enrolled in "${course.title || 'this course'}"!\n\nYou can now access all course materials and start learning.`,
        [
          { 
            text: 'Start Learning', 
            style: 'default',
            onPress: () => console.log('Navigate to course content')
          },
          { 
            text: 'Browse More Courses', 
            style: 'cancel',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error: any) {
      console.log('Enrollment error:', error);
      
      Alert.alert(
        '❌ Enrollment Failed',
        'We couldn\'t enroll you in this course at the moment. This might be because:\n\n• The course is full\n• Server is experiencing issues\n• Network connection problem\n\nPlease try again in a few moments.',
        [
          { 
            text: 'Try Again', 
            style: 'default',
            onPress: () => handleEnroll() // Retry enrollment
          },
          { 
            text: 'Cancel', 
            style: 'cancel'
          }
        ]
      );
    }
  };

  const handleBookmark = () => {
    if (!course) return;
    dispatch(toggleBookmarkAsync(course.id));
  };

  const handleViewContent = () => {
    if (!course) return;
    router.push('/webview' as any);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  if (!course) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ fontSize: fontSize.base, color: colors.gray[600] }}>
          Course not found
        </Text>
      </View>
    );
  }

  const isBookmarked = bookmarks.includes(course.id);

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: course.thumbnail }}
        style={styles.courseImage}
        contentFit="cover"
        placeholder={`https://picsum.photos/400/250?random=${course.id}`}
      />

      <View style={styles.content}>
        <Text style={styles.courseTitle}>{course.title || 'Course Title'}</Text>

        <View style={styles.instructorInfo}>
          <Image
            source={{ uri: course.instructor?.avatar || `https://picsum.photos/50/50?random=${course.id}` }}
            style={styles.instructorAvatar}
          />
          <View style={styles.instructorDetails}>
            <Text style={styles.instructorName}>{course.instructor?.name || 'Instructor'}</Text>
            <Text style={styles.instructorTitle}>Expert Instructor</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this course</Text>
          <Text style={styles.description}>
            {course.description || 'This is a comprehensive course designed to help you master new skills and advance your career. You will learn from industry experts through hands-on projects and real-world applications.'}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Course Details</Text>
          <View style={styles.courseMeta}>
            <View style={styles.metaItem}>
              <Text style={styles.metaText}>⏱️ {course.duration || '8 hours'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaText}>📊 {course.level || 'Intermediate'}</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaText}>👥 {course.enrolledCount || 1234} enrolled</Text>
            </View>
            <View style={styles.metaItem}>
              <Text style={styles.metaText}>⭐ {course.rating || '4.8'} rating</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.viewContentButton}
            onPress={handleViewContent}
          >
            <Text style={styles.viewContentButtonText}>View Content</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.bookmarkButton,
              isBookmarked && { borderColor: colors.success }
            ]}
            onPress={handleBookmark}
          >
            <Text style={[
              styles.bookmarkButtonText,
              isBookmarked && styles.bookmarkedButtonText
            ]}>
              {isBookmarked ? '🔖 Bookmarked' : '📚 Bookmark'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>${course.price || '99'}</Text>
          <TouchableOpacity
            style={[
              styles.enrollButton,
              course.isEnrolled && styles.enrolledButton
            ]}
            onPress={handleEnroll}
            disabled={course.isEnrolled}
          >
            <Text style={styles.buttonText}>
              {course.isEnrolled ? '✓ Enrolled' : 'Enroll Now'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
