/**
 * API Service สำหรับเชื่อมต่อกับ PHP Backend
 * API Service for connecting to PHP Backend
 */

const API_BASE_URL = 'http://localhost/project/api'; 

export interface LoginRequest {
  student_id: string;
  password: string;
}

export interface RegisterRequest {
  fullname: string;
  email: string;
  student_id: string;
  password: string;
  confirm_password: string;
}

export interface User {
  id: number;
  student_id: string;
  email: string;
  fullname: string;
  role: string;
  status: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
    login_time: string;
    session_expires: string;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    message: string;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: any;
}

class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * ส่ง HTTP Request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const config = { ...defaultOptions, ...options };

    try {
      const response = await fetch(url, config);
      
      // ตรวจสอบว่า response เป็น JSON หรือไม่
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
      }
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      
      // ถ้าเป็น network error หรือ fetch error
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต');
      }
      
      throw error;
    }
  }

  /**
   * Login API
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/login.php', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  /**
   * Register API
   */
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    return this.request<RegisterResponse>('/register.php', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  /**
   * Logout (ลบข้อมูลจาก localStorage)
   */
  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('login_time');
  }

  /**
   * ตรวจสอบว่ามีข้อมูลผู้ใช้ใน localStorage หรือไม่
   */
  isLoggedIn(): boolean {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    return !!(user && token);
  }

  /**
   * ดึงข้อมูลผู้ใช้จาก localStorage
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * เก็บข้อมูลผู้ใช้ใน localStorage
   */
  setUserData(user: User, token: string, loginTime: string): void {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    localStorage.setItem('login_time', loginTime);
  }
}

// สร้าง instance ของ ApiService
export const apiService = new ApiService();

// Export default
export default apiService;
