import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutAsync } from '@/store/slices/authSlice';
import { borderRadius, colors, createStyles, fontSize, spacing } from '@/utils/styles';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const fallbackImage = require("../../assets/images/download.jpg");

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
  content: {
    padding: spacing.lg,
  },
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center' as const,
    marginBottom: spacing.lg,
    elevation: 8,
    shadowColor: colors.primary[300],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  avatarContainer: {
    position: 'relative' as const,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.gray[200],
  },
  avatarEditButton: {
    position: 'absolute' as const,
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary[600],
    width: 30 as number,
    height: 30 as number,
    borderRadius: 15,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderWidth: 2,
    borderColor: colors.white,
  },
  avatarEditButtonText: {
    color: colors.white,
    fontSize: fontSize.sm,
    fontWeight: 'bold' as const,
  },
  userName: {
    fontSize: fontSize.xl,
    fontWeight: 'bold' as const,
    color: colors.gray[900],
    marginBottom: spacing.sm,
  },
  userEmail: {
    fontSize: fontSize.base,
    color: colors.gray[600],
    marginBottom: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    width: '100%' as const,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  statItem: {
    alignItems: 'center' as const,
  },
  statValue: {
    fontSize: fontSize['2xl'],
    fontWeight: 'bold' as const,
    color: colors.primary[600],
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.gray[600],
  },
  section: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600' as const,
    color: colors.gray[900],
    marginBottom: spacing.md,
  },
  menuItem: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  menuItemText: {
    fontSize: fontSize.base,
    color: colors.gray[700],
  },
  logoutButton: {
    backgroundColor: colors.error,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center' as const,
  },
  logoutButtonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: '600' as const,
  },
});

export default function ProfileScreen() {
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const user = useAppSelector((state: any) => state.auth.user) as any;

  const handleImagePicker = async () => {
    try {
      setIsUpdatingAvatar(true);
      
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to update your profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const selectedImage = result.assets[0];
        setAvatarUri(selectedImage.uri);
        Alert.alert('Success', 'Profile picture updated successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile picture. Please try again.');
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => dispatch(logoutAsync()) },
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: spacing.xl }}>
          User data not available
        </Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[colors.primary[50], colors.gray[50]]}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
        </View>

      <View style={styles.content}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
           <Image
              source={avatarUri ? { uri: avatarUri } : (user.avatar ? fallbackImage:{ uri: user.avatar } )}
              style={[
                styles.avatar,
                avatarUri && {
                  borderWidth: 3,
                  borderColor: colors.primary[600],
                }
              ]}
            />          
            <TouchableOpacity
              style={styles.avatarEditButton}
              onPress={handleImagePicker}
              disabled={isUpdatingAvatar}
            >
              <Text style={styles.avatarEditButtonText}>
                {isUpdatingAvatar ? '...' : '📷'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.enrolledCourses || 0}</Text>
              <Text style={styles.statLabel}>Enrolled</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.completedCourses || 0}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.progress || 0}%</Text>
              <Text style={styles.statLabel}>Progress</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.menuItem}>
            <Text style={styles.menuItemText}>Edit Profile</Text>
            <Text style={{ fontSize: 16 }}>→</Text>
          </View>
          <View style={styles.menuItem}>
            <Text style={styles.menuItemText}>Notification Preferences</Text>
            <Text style={{ fontSize: 16 }}>→</Text>
          </View>
          <View style={styles.menuItem}>
            <Text style={styles.menuItemText}>Privacy Settings</Text>
            <Text style={{ fontSize: 16 }}>→</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.menuItem}>
            <Text style={styles.menuItemText}>Help Center</Text>
            <Text style={{ fontSize: 16 }}>→</Text>
          </View>
          <View style={styles.menuItem}>
            <Text style={styles.menuItemText}>Contact Support</Text>
            <Text style={{ fontSize: 16 }}>→</Text>
          </View>
          <View style={styles.menuItem}>
            <Text style={styles.menuItemText}>About</Text>
            <Text style={{ fontSize: 16 }}>→</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </LinearGradient>
  );
}
