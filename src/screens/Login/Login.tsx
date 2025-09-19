import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { User, Lock, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export const Login = (): JSX.Element => {
  const [formData, setFormData] = useState<{ studentId: string; password: string }>(
    { studentId: "", password: "" }
  );
  const [errors, setErrors] = useState<{ studentId?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();


  const validateStudentId = (studentId: string): boolean => {
    const pattern = /^s\d{13}$/;
    return pattern.test(studentId);
  };

  const handleChange = (field: "studentId" | "password", value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === "studentId") {
      if (value && !validateStudentId(value)) {
        setErrors(prev => ({ ...prev, studentId: "รูปแบบรหัสนักศึกษาไม่ถูกต้อง (s + รหัส 13 หลัก)" }));
      } else {
        setErrors(prev => ({ ...prev, studentId: undefined }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    
    try {
      // Validate before submit
      if (!validateStudentId(formData.studentId)) {
        setErrors(prev => ({ ...prev, studentId: "รูปแบบรหัสนักศึกษาไม่ถูกต้อง (s + รหัส 13 หลัก)" }));
        return;
      }
      
      if (!formData.password) {
        setErrors(prev => ({ ...prev, general: "กรุณากรอกรหัสผ่าน" }));
        return;
      }
      
      // Call login API
      await login(formData.studentId, formData.password);
      
      // Redirect to dashboard on success
      navigate('/dashboard');
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      // จัดการข้อความ error ตามสถานการณ์
      let errorMessage = error.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";
      
      // ถ้าเป็น network error
      if (error.message === 'Failed to fetch') {
        errorMessage = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต";
      }
      
      setErrors(prev => ({ 
        ...prev, 
        general: errorMessage
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex items-center justify-between gap-12">
       
        <div className="hidden lg:flex flex-col items-center justify-center flex-1 space-y-8">
          <div className="relative">
            <img 
              src="/images/logo.png" 
              alt="IoT System Logo" 
              className="w-180 h-180 object-contain"
            />
          </div>
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">
              <span className="text-[#0EA5E9]">ระบบบริการยืม-</span>
              <span className="text-gray-700">คืนอุปกรณ์วิชา IoT</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-md">
              เข้าสู่ระบบเพื่อจัดการยืม-คืนอุปกรณ์สำหรับวิชา IoT
            </p>
          </div>
        </div>

     
        <div className="w-full max-w-md">
          <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0 rounded-2xl overflow-hidden">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-700 mb-2">เข้าสู่ระบบ</h2>
                <p className="text-gray-600">กรอกรหัสนักศึกษาและรหัสผ่านของคุณ</p>
              </div>

              <form 
                className="space-y-6" 
                onSubmit={handleSubmit}
              >
                <div 
                  className="space-y-2"
                >
                  <Label htmlFor="studentId" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <User className="w-4 h-4 text-[#0EA5E9]" /> รหัสนักศึกษา
                  </Label>
                  <Input
                    id="studentId"
                    type="text"
                    placeholder="s6706021410192"
                    value={formData.studentId}
                    onChange={e => handleChange("studentId", e.target.value)}
                    className={`w-full h-12 pl-4 pr-4 bg-white border-2 rounded-xl focus:ring-0 transition-colors duration-200 placeholder:text-gray-400 ${
                      errors.studentId 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-gray-200 focus:border-[#0EA5E9]'
                    }`}
                  />
                  {errors.studentId && (
                    <p className="text-red-500 text-sm mt-1">{errors.studentId}</p>
                  )}
                </div>

                <div 
                  className="space-y-2"
                >
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#0EA5E9]" /> รหัสผ่าน
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="กรอกรหัสผ่าน"
                    value={formData.password}
                    onChange={e => handleChange("password", e.target.value)}
                    className="w-full h-12 pl-4 pr-4 bg-white border-2 border-gray-200 rounded-xl focus:border-[#0EA5E9] focus:ring-0 transition-colors duration-200 placeholder:text-gray-400"
                  />
                </div>

                {errors.general && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                    <p className="mb-2">{errors.general}</p>
                    {errors.general === "โปรดสร้างบัญชีของท่าน" && (
                      <Link
                        to="/signup"
                        className="text-[#0EA5E9] hover:text-[#0284C7] font-semibold hover:underline transition-colors text-sm"
                      >
                        คลิกที่นี่เพื่อสมัครสมาชิก
                      </Link>
                    )}
                  </div>
                )}

                <div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] hover:from-[#0284C7] hover:to-[#0369A1] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        กำลังเข้าสู่ระบบ...
                      </>
                    ) : (
                      'เข้าสู่ระบบ'
                    )}
                  </Button>
                </div>

                <div 
                  className="flex items-center justify-center space-x-2 text-sm text-gray-600 pt-4"
                >
                  <span>ยังไม่มีบัญชี?</span>
                  <Link
                    to="/signup"
                    className="text-[#0EA5E9] hover:text-[#0284C7] font-semibold hover:underline transition-colors"
                  >
                    สมัครสมาชิก
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};