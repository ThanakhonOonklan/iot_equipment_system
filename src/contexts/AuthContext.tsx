import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, User } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (studentId: string, password: string) => Promise<void>;
  register: (userData: {
    fullname: string;
    email: string;
    student_id: string;
    password: string;
    confirm_password: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ตรวจสอบสถานะการ login เมื่อ component mount
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        if (apiService.isLoggedIn()) {
          const currentUser = apiService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        apiService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (studentId: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await apiService.login({ student_id: studentId, password });
      
      if (response.success) {
        const { user, token, login_time } = response.data;
        apiService.setUserData(user, token, login_time);
        setUser(user);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    fullname: string;
    email: string;
    student_id: string;
    password: string;
    confirm_password: string;
  }): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await apiService.register(userData);
      
      if (response.success) {
        // หลังจากสมัครสำเร็จ สามารถ login อัตโนมัติได้
        await login(userData.student_id, userData.password);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    apiService.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isLoggedIn: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
