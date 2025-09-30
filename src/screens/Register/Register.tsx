import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Eye, EyeOff, User, Mail, IdCard, Lock, Loader2 } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import apiService from "../../services/api";
import Swal from 'sweetalert2';

const formFields = [
  {
    id: "fullname",
    label: "ชื่อ-นามสกุล",
    type: "text",
    icon: User,
    placeholder: "กรอกชื่อ-นามสกุล"
  },
  {
    id: "email",
    label: "อีเมล",
    type: "email",
    icon: Mail,
    placeholder: "กรอกอีเมล"
  },
  {
    id: "studentId",
    label: "รหัสนักศึกษา",
    type: "text",
    icon: IdCard,
    placeholder: "s6706021410192"
  },
  {
    id: "password",
    label: "รหัสผ่าน",
    type: "password",
    icon: Lock,
    placeholder: "กรอกรหัสผ่าน"
  },
  {
    id: "confirmPassword",
    label: "ยืนยันรหัสผ่าน",
    type: "password",
    icon: Lock,
    placeholder: "ยืนยันรหัสผ่าน"
  },
];

export const SignUp = (): JSX.Element => {
  const [showPassword, setShowPassword] = useState<{ [key: string]: boolean }>({});
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [errors, setErrors] = useState<{ [key: string]: string | undefined }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register: _unusedRegister } = useAuth();
  const navigate = useNavigate();


  const togglePasswordVisibility = (fieldId: string) => {
    setShowPassword(prev => ({
      ...prev,
      [fieldId]: !prev[fieldId]
    }));
  };

  const validateStudentId = (studentId: string): boolean => {
    const pattern = /^s\d{13}$/;
    return pattern.test(studentId);
  };

  const validateEmail = (email: string): boolean => {
    const pattern = /^s\d{13}@kmutnb\.ac\.th$/;
    return pattern.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));

    // Validate email
    if (fieldId === "email") {
      if (value && !validateEmail(value)) {
        setErrors(prev => ({ ...prev, email: "รูปแบบอีเมลไม่ถูกต้อง (s + รหัส 13 หลัก + @kmutnb.ac.th)" }));
      } else {
        setErrors(prev => ({ ...prev, email: undefined }));
      }
    }

    // Validate student ID
    if (fieldId === "studentId") {
      if (value && !validateStudentId(value)) {
        setErrors(prev => ({ ...prev, studentId: "รูปแบบรหัสนักศึกษาไม่ถูกต้อง (s + รหัส 13 หลัก)" }));
      } else {
        setErrors(prev => ({ ...prev, studentId: undefined }));
      }
    }

    // Validate password
    if (fieldId === "password") {
      if (value && !validatePassword(value)) {
        setErrors(prev => ({ ...prev, password: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" }));
      } else {
        setErrors(prev => ({ ...prev, password: undefined }));
      }
    }

    // Validate confirm password
    if (fieldId === "confirmPassword") {
      if (value && value !== formData.password) {
        setErrors(prev => ({ ...prev, confirmPassword: "รหัสผ่านไม่ตรงกัน" }));
      } else {
        setErrors(prev => ({ ...prev, confirmPassword: undefined }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    
    try {
      // Validate all fields
      const newErrors: { [key: string]: string } = {};
      
      if (!formData.fullname) {
        newErrors.fullname = "กรุณากรอกชื่อ-นามสกุล";
      }
      
      if (!validateEmail(formData.email)) {
        newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง (s + รหัส 13 หลัก + @kmutnb.ac.th)";
      }
      
      if (!validateStudentId(formData.studentId)) {
        newErrors.studentId = "รูปแบบรหัสนักศึกษาไม่ถูกต้อง (s + รหัส 13 หลัก)";
      }
      
      if (!validatePassword(formData.password)) {
        newErrors.password = "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "รหัสผ่านไม่ตรงกัน";
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      
      // ส่งคำขอสมัครไปยัง pending_registrations (ไม่สร้างผู้ใช้จริง)
      await apiService.createPendingRegistration({
        fullname: formData.fullname,
        email: formData.email,
        student_id: formData.studentId,
        password: formData.password,
        role: 'user'
      });

      // แจ้งเตือนและไปหน้า login
      await Swal.fire({
        title: 'สมัครสมาชิกสำเร็จ',
        text: 'โปรดรอเจ้าหน้าที่อนุมัติ ก่อนเข้าสู่ระบบ',
        icon: 'success',
        confirmButtonText: 'ไปหน้าเข้าสู่ระบบ',
        confirmButtonColor: '#0EA5E9'
      });
      navigate('/login', { replace: true });
      
    } catch (error: any) {
      console.error('Register error:', error);
      setErrors(prev => ({ 
        ...prev, 
        general: error.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก" 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-3">
      <div className="w-full max-w-4xl flex items-center justify-between gap-8">
       
        <div className="hidden lg:flex flex-col items-center justify-center flex-1 space-y-6">
          <div className="relative">
            <img 
              src="/images/logo.png" 
              alt="IoT System Logo" 
              className="w-64 h-64 object-contain"
            />
          </div>
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">
              <span className="text-[#0EA5E9]">ระบบบริการยืม-</span>
              <span className="text-gray-700">คืนอุปกรณ์วิชา IoT</span>
            </h1>
            <p className="text-base text-gray-600 max-w-sm">
              เข้าสู่ระบบเพื่อจัดการยืม-คืนอุปกรณ์สำหรับวิชา IoT
            </p>
          </div>
        </div>

        <div className="w-full max-w-sm">
          <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 rounded-xl overflow-hidden">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-700 mb-1">สมัครสมาชิก</h2>
                <p className="text-gray-600 text-sm">กรอกข้อมูลของคุณ</p>
              </div>

              <form 
                className="space-y-5"
                onSubmit={handleSubmit}
              >
                {formFields.map((field) => {
                  const Icon = field.icon;
                  const isPassword = field.type === "password";
                  const showPass = showPassword[field.id];
                  
                  return (
                    <div 
                      key={field.id} 
                      className="space-y-1.5"
                    >
                      <Label 
                        htmlFor={field.id}
                        className="text-xs font-semibold text-gray-700 flex items-center gap-2"
                      >
                        <Icon className="w-4 h-4 text-[#0EA5E9]" />
                        {field.label}
                      </Label>
                      <div className="relative">
                        <Input
                          id={field.id}
                          type={isPassword ? (showPass ? "text" : "password") : field.type}
                          placeholder={field.placeholder}
                          value={formData[field.id] || ""}
                          onChange={(e) => handleInputChange(field.id, e.target.value)}
                          className={`w-full h-10 pl-3 pr-10 bg-white border rounded-lg focus:ring-0 transition-colors duration-200 placeholder:text-gray-400 ${
                            errors[field.id] 
                              ? 'border-red-500 focus:border-red-500' 
                              : 'border-gray-300 focus:border-[#0EA5E9]'
                          }`}
                        />
                        {isPassword && (
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(field.id)}
                            className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {showPass ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                      {errors[field.id] && (
                        <p className="text-red-500 text-xs mt-1">{errors[field.id]}</p>
                      )}
                    </div>
                  );
                })}

                {errors.general && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                    {errors.general}
                  </div>
                )}

                <div>
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-10 bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] hover:from-[#0284C7] hover:to-[#0369A1] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        กำลังสมัครสมาชิก...
                      </>
                    ) : (
                      'ลงทะเบียน'
                    )}
                  </Button>
                </div>

                <div 
                  className="flex items-center justify-center space-x-2 text-xs text-gray-600 pt-3"
                >
                  <span>คุณมีบัญชีอยู่แล้วใช่มั้ย?</span>
                  <Link
                    to="/login"
                    className="text-[#0EA5E9] hover:text-[#0284C7] font-semibold hover:underline transition-colors"
                  >
                    เข้าสู่ระบบ
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