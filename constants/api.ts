export const API_BASE_URL = 'https://api.freeapi.app';

export const API_ENDPOINTS = {
  // User endpoints
  LOGIN: '/api/v1/users/login',
  REGISTER: '/api/v1/users/register',
  PROFILE: '/api/v1/users/profile',
  
  // Mock data endpoints
  INSTRUCTORS: '/api/v1/public/randomusers',
  COURSES: '/api/v1/public/randomproducts',
  
  // Course endpoints
  COURSES_LIST: '/api/v1/courses',
  COURSE_DETAILS: '/api/v1/courses/:id',
  ENROLL_COURSE: '/api/v1/courses/:id/enroll',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  BOOKMARKS: 'bookmarked_courses',
  USER_PREFERENCES: 'user_preferences',
  LAST_LOGIN: 'last_login',
} as const;

export const APP_CONFIG = {
  MAX_BOOKMARK_NOTIFICATIONS: 5,
  INACTIVE_REMINDER_HOURS: 24,
  API_TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
} as const;
