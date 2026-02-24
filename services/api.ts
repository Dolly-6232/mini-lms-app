import { API_BASE_URL, API_ENDPOINTS, APP_CONFIG } from '../constants/api';
import { ApiResponse, Course, Instructor, LoginCredentials, RegisterCredentials, User } from '../types';

class ApiService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.timeout = APP_CONFIG.API_TIMEOUT;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      console.log(`API Request: ${url}`);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error(`API Error: ${response.status} - ${response.statusText}`);
        
        // Try to get error details from response body
        let errorDetails = '';
        try {
          const errorData = await response.json();
          errorDetails = JSON.stringify(errorData);
          console.error('Error details:', errorDetails);
        } catch (e) {
          console.error('Could not parse error response body');
        }
        
        throw new Error(`HTTP error! status: ${response.status}${errorDetails ? ` - ${errorDetails}` : ''}`);
      }

      const data = await response.json();
      console.log(`API Response:`, data);
      return {
        data: data.data || data,
        success: true,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`API Request Failed:`, error);
      
      // For network errors, provide fallback mock data
      if (endpoint.includes('randomusers') || endpoint.includes('randomproducts')) {
        return this.getMockData<T>(endpoint);
      }
      
      throw error;
    }
  }

  private getMockData<T>(endpoint: string): ApiResponse<T> {
    console.log('Using mock data for:', endpoint);
    
    if (endpoint.includes('randomusers')) {
      const mockInstructors = [
        { id: '1', name: 'Dr. Sarah Johnson', email: 'sarah@example.com', avatar: 'https://picsum.photos/100/100?random=1' },
        { id: '2', name: 'Prof. Michael Chen', email: 'michael@example.com', avatar: 'https://picsum.photos/100/100?random=2' },
        { id: '3', name: 'Dr. Emily Davis', email: 'emily@example.com', avatar: 'https://picsum.photos/100/100?random=3' },
        { id: '4', name: 'Dr. James Wilson', email: 'james@example.com', avatar: 'https://picsum.photos/100/100?random=4' },
        { id: '5', name: 'Prof. Maria Garcia', email: 'maria@example.com', avatar: 'https://picsum.photos/100/100?random=5' },
      ];
      return { data: mockInstructors as T, success: true };
    }
    
    if (endpoint.includes('randomproducts')) {
      const mockCourses = [
        {
          id: '1',
          title: 'React Native Development',
          description: 'Learn to build mobile apps with React Native from scratch. This comprehensive course covers everything from basic components to advanced navigation and state management.',
          price: 49.99,
          category: 'Development',
          thumbnail: 'https://picsum.photos/400/200?random=1',
          image: 'https://picsum.photos/400/200?random=1',
          rating: 4.5,
          enrolledCount: 1234,
          enrolledStudents: 1234,
          duration: '12 hours',
          level: 'Intermediate',
        },
        {
          id: '2',
          title: 'TypeScript Fundamentals',
          description: 'Master TypeScript from basics to advanced concepts. Perfect for JavaScript developers looking to level up their skills.',
          price: 39.99,
          category: 'Programming',
          thumbnail: 'https://picsum.photos/400/200?random=2',
          image: 'https://picsum.photos/400/200?random=2',
          rating: 4.7,
          enrolledCount: 892,
          enrolledStudents: 892,
          duration: '8 hours',
          level: 'Beginner',
        },
        {
          id: '3',
          title: 'Advanced React Patterns',
          description: 'Deep dive into advanced React patterns and best practices. Learn hooks, context, and performance optimization.',
          price: 59.99,
          category: 'Development',
          thumbnail: 'https://picsum.photos/400/200?random=3',
          image: 'https://picsum.photos/400/200?random=3',
          rating: 4.8,
          enrolledCount: 567,
          enrolledStudents: 567,
          duration: '10 hours',
          level: 'Advanced',
        },
        {
          id: '4',
          title: 'Mobile UI/UX Design',
          description: 'Create beautiful mobile interfaces with modern design principles and tools.',
          price: 44.99,
          category: 'Design',
          thumbnail: 'https://picsum.photos/400/200?random=4',
          image: 'https://picsum.photos/400/200?random=4',
          rating: 4.6,
          enrolledCount: 743,
          enrolledStudents: 743,
          duration: '6 hours',
          level: 'Beginner',
        },
        {
          id: '5',
          title: 'Node.js Backend Development',
          description: 'Build scalable backend applications with Node.js, Express, and MongoDB.',
          price: 54.99,
          category: 'Backend',
          thumbnail: 'https://picsum.photos/400/200?random=5',
          image: 'https://picsum.photos/400/200?random=5',
          rating: 4.4,
          enrolledCount: 445,
          enrolledStudents: 445,
          duration: '14 hours',
          level: 'Intermediate',
        },
        {
          id: '6',
          title: 'JavaScript ES6+ Features',
          description: 'Master modern JavaScript features including ES6, ES7, and beyond.',
          price: 34.99,
          category: 'Programming',
          thumbnail: 'https://picsum.photos/400/200?random=6',
          image: 'https://picsum.photos/400/200?random=6',
          rating: 4.3,
          enrolledCount: 1567,
          enrolledStudents: 1567,
          duration: '7 hours',
          level: 'Intermediate',
        },
      ];
      return { data: mockCourses as T, success: true };
    }
    
    return { data: null as T, success: false };
  }

  async login(credentials: LoginCredentials): Promise<ApiResponse<User>> {
    try {
      const loginData = {
        username: credentials.name.toLowerCase(),
        email: credentials.email,
        password: credentials.password,
      };
      
      const response = await this.request<any>(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        body: JSON.stringify(loginData),
      });
      
      if (response.data && response.data.user) {
        const apiUser = response.data.user;
        const user: User = {
          id: apiUser._id,
          name: apiUser.username,
          email: apiUser.email,
          avatar: apiUser.avatar?.url || '',
          token: response.data.accessToken,
          enrolledCourses: 0,
          completedCourses: 0,
          progress: 0,
        };
        
        return { data: user, success: true };
      }
      
      throw new Error('Invalid response structure');
    } catch (error) {
      // Fallback mock login for demo purposes
      console.log('Using mock login due to error:', error);
      const mockUser: User = {
        id: '1',
        name: credentials.name || 'Demo User',
        email: credentials.email,
        token: 'mock-token-' + Date.now(),
        avatar: '',
        enrolledCourses: 0,
        completedCourses: 0,
        progress: 0,
      };
      return { data: mockUser, success: true };
    }
  }

  async register(credentials: RegisterCredentials): Promise<ApiResponse<User>> {
    try {
      const registerData = {
        username: credentials.name.toLowerCase(),
        email: credentials.email,
        password: credentials.password,
      };
      
      const response = await this.request<any>(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        body: JSON.stringify(registerData),
      });
      
      if (response.data && response.data.user) {
        const apiUser = response.data.user;
        const user: User = {
          id: apiUser._id,
          name: apiUser.username,
          email: apiUser.email,
          avatar: apiUser.avatar?.url || '',
          token: response.data.accessToken,
          enrolledCourses: 0,
          completedCourses: 0,
          progress: 0,
        };
        
        return { data: user, success: true };
      }
      
      throw new Error('Invalid response structure');
    } catch (error) {
      console.log('Using mock register due to error:', error);
      const mockUser: User = {
        id: '1',
        name: credentials.name,
        email: credentials.email,
        token: 'mock-token-' + Date.now(),
        avatar: '',
        enrolledCourses: 0,
        completedCourses: 0,
        progress: 0,
      };
      return { data: mockUser, success: true };
    }
  }

  async getInstructors(): Promise<ApiResponse<Instructor[]>> {
    try {
      const response = await this.request<any>(API_ENDPOINTS.INSTRUCTORS);      
      const instructorsData = response.data?.data || response.data || [];
        const instructors = instructorsData.map((item: any, index: number) => ({
        id: item.id?.toString() || `instructor-${index}`,
        name: item.name || item.firstName + ' ' + item.lastName || `Instructor ${index + 1}`,
        email: item.email || `instructor${index + 1}@example.com`,
        avatar: item.avatar || item.image || 'https://picsum.photos/100/100?random=' + (index + 200),
        bio: item.bio || `Experienced instructor in various fields`,
      }));      
      return { data: instructors, success: true };
    } catch (error) {
      console.error('Failed to fetch instructors:', error);
      return { data: [], success: false };
    }
  }

  async getCourses(): Promise<ApiResponse<Course[]>> {
    try {
      const response = await this.request<any>(API_ENDPOINTS.COURSES);      
      const coursesData = response.data?.data || response.data || [];
      
      const courses = coursesData.map((item: any, index: number) => ({
        id: item.id?.toString() || `course-${index}`,
        title: item.title || 'Untitled Course',
        description: item.description || 'No description available',
        thumbnail: item.thumbnail || item.image || `https://picsum.photos/400/200?random=${index}`,
        instructor: {
          id: `instructor-${index}`,
          name: 'Instructor ' + (index + 1),
          email: `instructor${index + 1}@example.com`,
          avatar: `https://picsum.photos/100/100?random=${index + 100}`,
        },
        price: item.price || 0,
        category: item.category || 'General',
        duration: '10 hours', // Default duration
        level: 'Intermediate', // Default level
        enrolledCount: Math.floor(Math.random() * 2000) + 100, // Random enrollment
        rating: item.rating || 4.5,
        images: item.images || [],
      }));      
      return { data: courses, success: true };
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      return { data: [], success: false };
    }
  }

  async getCourseDetails(courseId: string): Promise<ApiResponse<Course>> {
    try {
      return this.request<Course>(API_ENDPOINTS.COURSE_DETAILS.replace(':id', courseId));
    } catch (error) {
      const mockCourses = [
        {
          id: '1',
          title: 'React Native Development',
          description: 'Learn to build mobile apps with React Native from scratch. This comprehensive course covers everything from basic components to advanced navigation and state management.',
          price: 49.99,
          category: 'Development',
          thumbnail: 'https://picsum.photos/400/200?random=1',
          image: 'https://picsum.photos/400/200?random=1',
          rating: 4.5,
          enrolledCount: 1234,
          enrolledStudents: 1234,
          duration: '12 hours',
          level: 'Intermediate',
          instructor: {
            id: '1',
            name: 'Dr. Sarah Johnson',
            email: 'sarah@example.com',
            avatar: 'https://picsum.photos/100/100?random=1'
          }
        },
        {
          id: '2',
          title: 'TypeScript Fundamentals',
          description: 'Master TypeScript from basics to advanced concepts. Perfect for JavaScript developers looking to level up their skills.',
          price: 39.99,
          category: 'Programming',
          thumbnail: 'https://picsum.photos/400/200?random=2',
          image: 'https://picsum.photos/400/200?random=2',
          rating: 4.7,
          enrolledCount: 892,
          enrolledStudents: 892,
          duration: '8 hours',
          level: 'Beginner',
          instructor: {
            id: '2',
            name: 'Prof. Michael Chen',
            email: 'michael@example.com',
            avatar: 'https://picsum.photos/100/100?random=2'
          }
        }
      ];
      
      const course = mockCourses.find(c => c.id === courseId);
      if (course) {
        return { data: course as unknown as Course, success: true };
      }
      
      return { data: null as unknown as Course, success: false };
    }
  }

  async enrollCourse(courseId: string): Promise<ApiResponse<any>> {
    try {
      return this.request<any>(API_ENDPOINTS.ENROLL_COURSE.replace(':id', courseId), {
        method: 'POST',
      });
    } catch (error) {
      console.log('Mock enrollment for course:', courseId);
      return { 
        data: { 
          message: 'Successfully enrolled in course',
          courseId: courseId,
          enrollmentDate: new Date().toISOString()
        }, 
        success: true 
      };
    }
  }
}

export const apiService = new ApiService();
