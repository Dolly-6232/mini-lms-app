export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  token?: string;
  enrolledCourses: number;
  completedCourses: number;
  progress: number;
}

export interface Instructor {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  instructor: Instructor;
  price: number;
  category: string;
  duration: string;
  level: string;
  enrolledCount: number;
  rating: number;
  isBookmarked?: boolean;
  isEnrolled?: boolean;
  images?: string[]; // Additional images from API
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AppState {
  auth: AuthState;
  courses: Course[];
  bookmarks: string[];
  searchQuery: string;
  isOffline: boolean;
  error: string | null;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface LoginCredentials {
  name: string;
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}
