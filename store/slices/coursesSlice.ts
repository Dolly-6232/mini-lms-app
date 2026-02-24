import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { apiService } from '../../services/api';
import { storageService } from '../../services/storage';
import { Course } from '../../types';

interface CoursesState {
  courses: Course[];
  bookmarks: string[];
  searchQuery: string;
  searchHistory: string[];
  recentlyViewed: string[];
  userPreferences: Record<string, any>;
  isLoading: boolean;
  error: string | null;
}

const initialState: CoursesState = {
  courses: [],
  bookmarks: [],
  searchQuery: '',
  searchHistory: [],
  recentlyViewed: [],
  userPreferences: {},
  isLoading: false,
  error: null,
};

// Async thunks
export const loadCoursesAsync = createAsyncThunk(
  'courses/loadCourses',
  async (_, { rejectWithValue }) => {
    try {
      // First try to load from cache
      const cachedData = await storageService.getCachedCourses();
      const now = Date.now();
      
      // Use cache if it's less than 5 minutes old
      if (cachedData && (now - cachedData.timestamp) < 5 * 60 * 1000) {
        console.log('Using cached courses');
        return cachedData.courses;
      }
      
      // Otherwise fetch from API
      console.log('Fetching courses from API');
      const coursesResponse = await apiService.getCourses();
      
      if (!coursesResponse.success || !coursesResponse.data) {
        throw new Error('Failed to fetch courses');
      }

      const courses = coursesResponse.data;

      // Cache the courses
      await storageService.cacheCourses(courses);
      
      return courses;
    } catch (error) {
      console.error('Courses loading error:', error);
      return rejectWithValue('Failed to load courses');
    }
  }
);

export const loadBookmarksAsync = createAsyncThunk(
  'courses/loadBookmarks',
  async (_, { rejectWithValue }) => {
    try {
      const bookmarks = await storageService.getBookmarks();
      return bookmarks;
    } catch (error) {
      return rejectWithValue('Failed to load bookmarks');
    }
  }
);

export const toggleBookmarkAsync = createAsyncThunk(
  'courses/toggleBookmark',
  async (courseId: string, { rejectWithValue }) => {
    try {
      const bookmarks = await storageService.getBookmarks();
      const isBookmarked = bookmarks.includes(courseId);
      
      let newBookmarks: string[];
      if (isBookmarked) {
        newBookmarks = await storageService.removeBookmark(courseId);
      } else {
        newBookmarks = await storageService.addBookmark(courseId);
      }
      
      // Add to recently viewed
      await storageService.addRecentlyViewed(courseId);
      
      return { courseId, isBookmarked: !isBookmarked, bookmarks: newBookmarks };
    } catch (error) {
      return rejectWithValue('Failed to update bookmark');
    }
  }
);

export const enrollCourseAsync = createAsyncThunk(
  'courses/enrollCourse',
  async (courseId: string, { rejectWithValue }) => {
    try {
      await apiService.enrollCourse(courseId);
      
      // Track enrollment action
      await storageService.trackUserAction('course_enrolled', { courseId });
      
      // Add to recently viewed
      await storageService.addRecentlyViewed(courseId);
      
      return courseId;
    } catch (error) {
      await storageService.trackUserAction('enrollment_failed', { courseId });
      return rejectWithValue('Failed to enroll in course');
    }
  }
);

export const searchCoursesAsync = createAsyncThunk(
  'courses/search',
  async (searchTerm: string, { rejectWithValue }) => {
    try {
      // Save search history
      await storageService.saveSearchHistory(searchTerm);
      
      // Track search action
      await storageService.trackUserAction('course_search', { searchTerm });
      
      return searchTerm;
    } catch (error) {
      return rejectWithValue('Failed to save search');
    }
  }
);

export const loadUserPreferencesAsync = createAsyncThunk(
  'courses/loadUserPreferences',
  async (_, { rejectWithValue }) => {
    try {
      const preferences = await storageService.getUserPreferences();
      return preferences;
    } catch (error) {
      return rejectWithValue('Failed to load user preferences');
    }
  }
);

export const updateUserPreferencesAsync = createAsyncThunk(
  'courses/updateUserPreferences',
  async (preferences: Record<string, any>, { rejectWithValue }) => {
    try {
      await storageService.setUserPreferences(preferences);
      await storageService.trackUserAction('preferences_updated', preferences);
      return preferences;
    } catch (error) {
      return rejectWithValue('Failed to update user preferences');
    }
  }
);

const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateCourse: (state, action: PayloadAction<{ id: string; updates: Partial<Course> }>) => {
      const course = state.courses.find(c => c.id === action.payload.id);
      if (course) {
        Object.assign(course, action.payload.updates);
      }
    },
    setSearchHistory: (state, action: PayloadAction<string[]>) => {
      state.searchHistory = action.payload;
    },
    addSearchTerm: (state, action: PayloadAction<string>) => {
      if (!state.searchHistory.includes(action.payload)) {
        state.searchHistory = [action.payload, ...state.searchHistory].slice(0, 9);
      }
    },
    setRecentlyViewed: (state, action: PayloadAction<string[]>) => {
      state.recentlyViewed = action.payload;
    },
    addUserRecentlyViewed: (state, action: PayloadAction<string>) => {
      if (!state.recentlyViewed.includes(action.payload)) {
        state.recentlyViewed = [action.payload, ...state.recentlyViewed.slice(0, 19)];
      }
    },
    setUserPreferences: (state, action: PayloadAction<Record<string, any>>) => {
      state.userPreferences = action.payload;
    },
    updateUserPreferences: (state, action: PayloadAction<Partial<Record<string, any>>>) => {
      state.userPreferences = { ...state.userPreferences, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      // Load courses
      .addCase(loadCoursesAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadCoursesAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courses = action.payload;
        state.error = null;
      })
      .addCase(loadCoursesAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Load bookmarks
      .addCase(loadBookmarksAsync.fulfilled, (state, action) => {
        state.bookmarks = action.payload;
      })
      
      // Toggle bookmark
      .addCase(toggleBookmarkAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(toggleBookmarkAsync.fulfilled, (state, action) => {
        const { courseId, isBookmarked, bookmarks } = action.payload;
        state.bookmarks = bookmarks;
        
        const course = state.courses.find(c => c.id === courseId);
        if (course) {
          course.isBookmarked = isBookmarked;
        }
      })
      .addCase(toggleBookmarkAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Enroll course
      .addCase(enrollCourseAsync.pending, (state) => {
        state.error = null;
      })
      .addCase(enrollCourseAsync.fulfilled, (state, action) => {
        const course = state.courses.find(c => c.id === action.payload);
        if (course) {
          course.isEnrolled = true;
        }
      })
      .addCase(enrollCourseAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Search courses
      .addCase(searchCoursesAsync.fulfilled, (state, action) => {
        // Search term is handled by setSearchQuery reducer
        state.error = null;
      })
      .addCase(searchCoursesAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Load user preferences
      .addCase(loadUserPreferencesAsync.fulfilled, (state, action) => {
        state.userPreferences = action.payload;
      })
      .addCase(loadUserPreferencesAsync.rejected, (state, action) => {
        console.error('Failed to load user preferences:', action.payload);
      })
      
      // Update user preferences
      .addCase(updateUserPreferencesAsync.fulfilled, (state, action) => {
        state.userPreferences = action.payload;
      })
      .addCase(updateUserPreferencesAsync.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { 
  setSearchQuery, 
  clearError, 
  updateCourse,
  setSearchHistory,
  addSearchTerm,
  setRecentlyViewed,
  addUserRecentlyViewed,
  setUserPreferences,
  updateUserPreferences,
} = coursesSlice.actions;

// Selectors
export const selectCourses = (state: { courses: CoursesState }) => state.courses.courses;
export const selectBookmarks = (state: { courses: CoursesState }) => state.courses.bookmarks;
export const selectSearchQuery = (state: { courses: CoursesState }) => state.courses.searchQuery;
export const selectSearchHistory = (state: { courses: CoursesState }) => state.courses.searchHistory;
export const selectRecentlyViewed = (state: { courses: CoursesState }) => state.courses.recentlyViewed;
export const selectUserPreferences = (state: { courses: CoursesState }) => state.courses.userPreferences;
export const selectCoursesLoading = (state: { courses: CoursesState }) => state.courses.isLoading;
export const selectCoursesError = (state: { courses: CoursesState }) => state.courses.error;

// Memoized selectors
export const selectFilteredCourses = (state: { courses: CoursesState }) => {
  const { courses, searchQuery } = state.courses;
  
  if (!searchQuery.trim()) {
    return courses;
  }
  
  const lowercaseQuery = searchQuery.toLowerCase();
  return courses.filter(
    course =>
      course.title.toLowerCase().includes(lowercaseQuery) ||
      course.description.toLowerCase().includes(lowercaseQuery) ||
      course.instructor.name.toLowerCase().includes(lowercaseQuery) ||
      course.category.toLowerCase().includes(lowercaseQuery)
  );
};

export const selectBookmarkedCourses = (state: { courses: CoursesState }) => {
  const { courses, bookmarks } = state.courses;
  return courses.filter(course => bookmarks.includes(course.id));
};

export default coursesSlice.reducer;
                                                                                                                                                  