const API_BASE_URL = 'http://localhost/iot_equipment_system/api'; 

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

export interface ListUsersResponse {
  success: boolean;
  message: string;
  data: { users: User[] };
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

export interface Equipment {
  id: number;
  name: string;
  description?: string;
  category: string;
  image_url?: string;
  quantity_total: number;
  quantity_available: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface ListEquipmentResponse {
  success: boolean;
  message: string;
  data: { equipment: Equipment[] };
}

export interface EquipmentMutationResponse {
  success: boolean;
  message: string;
  data: { equipment: Equipment };
}

export interface BorrowRequest {
  id: number;
  user_id: number;
  fullname: string;
  student_id: string;
  request_date: string;
  borrow_date: string;
  return_date: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  notes?: string;
  created_at: string;
  updated_at: string;
  items: BorrowRequestItem[];
}

export interface BorrowRequestItem {
  id: number;
  equipment_id: number;
  equipment_name: string;
  category: string;
  quantity_requested: number;
  quantity_approved: number;
}

export interface CreateBorrowRequestData {
  user_id: number;
  borrow_date: string;
  return_date: string;
  notes?: string;
  items: Array<{
    equipment_id: number;
    quantity: number;
  }>;
}

export interface ListBorrowRequestsResponse {
  success: boolean;
  message: string;
  data: { requests: BorrowRequest[] };
}

export interface BorrowRequestResponse {
  success: boolean;
  message: string;
  data: { request: BorrowRequest };
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
   * Equipment APIs
   */
  async listEquipment(): Promise<ListEquipmentResponse> {
    return this.request<ListEquipmentResponse>('/equipment.php', { method: 'GET' });
  }

  async createEquipment(payload: Partial<Equipment>): Promise<EquipmentMutationResponse> {
    return this.request<EquipmentMutationResponse>('/equipment.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateEquipment(id: number, payload: Partial<Equipment>): Promise<EquipmentMutationResponse> {
    return this.request<EquipmentMutationResponse>('/equipment.php', {
      method: 'PUT',
      body: JSON.stringify({ id, ...payload }),
    });
  }

  async deleteEquipment(id: number): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/equipment.php', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
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
   * List Users
   */
  async listUsers(): Promise<ListUsersResponse> {
    return this.request<ListUsersResponse>('/users.php', {
      method: 'GET',
    });
  }

  /**
   * Create User (admin)
   */
  async createUser(payload: RegisterRequest & { role?: string; status?: string; }): Promise<RegisterResponse> {
    return this.request<RegisterResponse>('/users.php', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  /**
   * Update User (admin)
   */
  async updateUser(id: number, payload: Partial<RegisterRequest> & { role?: string; status?: string; }): Promise<RegisterResponse> {
    return this.request<RegisterResponse>('/users.php', {
      method: 'PUT',
      body: JSON.stringify({ id, ...payload }),
    });
  }

  /**
   * Delete User (admin)
   */
  async deleteUser(id: number): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/users.php', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  }

  /**
   * Borrow Request APIs
   */
  async listBorrowRequests(): Promise<ListBorrowRequestsResponse> {
    return this.request<ListBorrowRequestsResponse>('/borrow_requests.php', {
      method: 'GET',
    });
  }

  async createBorrowRequest(data: CreateBorrowRequestData): Promise<BorrowRequestResponse> {
    return this.request<BorrowRequestResponse>('/borrow_requests.php', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBorrowRequest(id: number, data: Partial<CreateBorrowRequestData>): Promise<BorrowRequestResponse> {
    return this.request<BorrowRequestResponse>('/borrow_requests.php', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    });
  }

  async deleteBorrowRequest(id: number): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>('/borrow_requests.php', {
      method: 'DELETE',
      body: JSON.stringify({ id }),
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
