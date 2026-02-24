import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { clearError, loginAsync, registerAsync } from '@/store/slices/authSlice';
import { borderRadius, colors, createStyles, fontSize, spacing } from '@/utils/styles';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity
} from 'react-native';

const styles = createStyles({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center' as const,
    padding: spacing.lg,
  },
  title: {
    fontSize: fontSize['3xl'],
    fontWeight: 'bold' as const,
    color: colors.gray[900],
    textAlign: 'center' as const,
    marginBottom: spacing.xl,
  },
  subtitle: {
    fontSize: fontSize.lg,
    color: colors.gray[600],
    textAlign: 'center' as const,
    marginBottom: spacing.xl,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.base,
    marginBottom: spacing.md,
    backgroundColor: colors.white,
  },
  inputFocused: {
    borderColor: colors.primary[600],
    borderWidth: 2,
  },
  button: {
    backgroundColor: colors.primary[600],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center' as const,
    marginBottom: spacing.md,
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSize.base,
    fontWeight: '600' as const,
  },
  toggleText: {
    color: colors.primary[600],
    textAlign: 'center' as const,
    fontSize: fontSize.sm,
  },
  errorText: {
    color: colors.error,
    fontSize: fontSize.sm,
    textAlign: 'center' as const,
    marginBottom: spacing.md,
  },
  toggleButton: {
    marginTop: spacing.md,
  },
  toggleButtonText: {
    color: colors.primary[600],
    textAlign: 'center' as const,
    fontSize: fontSize.sm,
  },
});

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inputFocus, setInputFocus] = useState('');

  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);

  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, router]);

  React.useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('⚠️ Validation Error', 'Please fill in all required fields');
      return;
    }

    if (!isLogin && !name.trim()) {
      Alert.alert('⚠️ Validation Error', 'Please enter your name for registration');
      return;
    }
    
    try {
      if (isLogin) {
        await dispatch(loginAsync({ name: username, email, password })).unwrap();
      } else {
        await dispatch(registerAsync({ name, email, password })).unwrap();
      }
    } catch (error: any) {
      if (error.message?.includes('User does not exist')) {
        Alert.alert(
          '🔍 Account Not Found',
          'No account found with this email. Would you like to:\n\n• Create a new account\n• Try a different email\n• Check your email spelling',
          [
            { text: 'Create Account', style: 'default', onPress: () => setIsLogin(false) },
            { text: 'Try Again', style: 'cancel', onPress: () => {} }
          ]
        );
      } else if (error.message?.includes('Username must be lowercase') || error.message?.includes('status: 422')) {
        if (error.message?.includes('Username is required')) {
          Alert.alert('⚠️ Username Required', 'Please enter a username to continue.');
        } else if (error.message?.includes('at least 3 characters')) {
          Alert.alert('⚠️ Username Too Short', 'Username must be at least 3 characters long.');
        } else {
          const lowercaseUsername = username.toLowerCase();
          setUsername(lowercaseUsername);
          Alert.alert('✅ Username Fixed', 'We converted your username to lowercase. Please try again.');
        }
      } else if (error.message?.includes('Received data is not valid')) {
        Alert.alert('🚫 Server Error', 'Server is experiencing issues. Please try again later.');
      } else {
        Alert.alert('❌ Authentication Failed', 'An unexpected error occurred. Please try again.');
      }
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setUsername('');
    setName('');
    setEmail('');
    setPassword('');
  };

  return (
    <LinearGradient
      colors={[colors.primary[100], colors.gray[50]]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        style={styles.innerContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.title}>
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </Text>
        <Text style={styles.subtitle}>
          {isLogin
            ? 'Sign in to continue your learning journey'
            : 'Join us and start learning today'}
        </Text>

        {error && <Text style={styles.errorText}>{error}</Text>}

        {!isLogin && (
          <TextInput
            style={[
              styles.input,
              inputFocus === 'name' && styles.inputFocused,
            ]}
            placeholder="Name"
            value={name}
            onChangeText={setName}
            onFocus={() => setInputFocus('name')}
            onBlur={() => setInputFocus('')}
            autoCapitalize="words"
            editable={!isLoading}
          />
        )}

        <TextInput
          style={[
            styles.input,
            inputFocus === 'email' && styles.inputFocused,
          ]}
          placeholder="Email Address"
          value={email}
          onChangeText={setEmail}
          onFocus={() => setInputFocus('email')}
          onBlur={() => setInputFocus('')}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isLoading}
        />

        <TextInput
          style={[
            styles.input,
            inputFocus === 'password' && styles.inputFocused,
          ]}
          placeholder="Password"
          value={password}
          onChangeText={(text) => setPassword(text)}
          onFocus={() => setInputFocus('password')}
          onBlur={() => setInputFocus('')}
          secureTextEntry
          editable={!isLoading}
        />

        <TouchableOpacity
          style={[styles.button, isLoading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, isLoading && { opacity: 0.7 }]}
          onPress={toggleMode}
          disabled={isLoading}
        >
          <Text style={styles.toggleButtonText}>
            {isLogin ? 'Create New Account' : 'Already have an account? Sign In'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
    </LinearGradient>
  );
}
